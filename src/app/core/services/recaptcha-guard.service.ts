import { RecaptchaAction } from '@/core/models/enums';
import { inject, Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { defer, Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

/**
 * Raised when grecaptcha itself could not mint a token, so no request ever reached the backend. Distinct from an
 * API rejection: the fix is on the user's side (blocker, filtered network), not ours.
 */
export class RecaptchaClientError extends Error {
    constructor(readonly reason?: unknown) {
        super(
            'Não foi possível concluir a verificação de segurança no seu navegador. Desative bloqueadores de ' +
            'anúncios ou extensões de privacidade, verifique a sua ligação à Internet e tente novamente.'
        );
        this.name = 'RecaptchaClientError';
    }
}

/**
 * Single entry point for reCAPTCHA v3 tokens.
 *
 * <p>It exists because {@link ReCaptchaV3Service#execute} on its own has two sharp edges that bit staging: calls
 * made before api.js loads are queued in an internal backlog and simply <em>never emit</em> if the script is
 * blocked (spinner forever, no error), and a failure surfaces with no context anywhere.
 */
@Injectable({ providedIn: 'root' })
export class RecaptchaGuardService {
    /** Long enough for a slow link, short enough that a blocked script does not look like a hung form. */
    private static readonly EXECUTE_TIMEOUT_MS = 8000;

    private readonly recaptcha = inject(ReCaptchaV3Service);

    /**
     * Mint a token for `action`. Fails with a {@link RecaptchaClientError} carrying a message ready to display.
     * Deliberately does NOT retry a backend rejection — that is a verdict, not a glitch; only the local mint is
     * retried, once, since api.js can lose a race with a slow network on first paint.
     */
    execute(action: RecaptchaAction): Observable<string> {
        // defer() is load-bearing, not style: ReCaptchaV3Service.execute() kicks off the mint immediately and
        // hands back a Subject. Retrying that observable directly just resubscribes to a subject that will never
        // emit again — the retry silently becomes a second dead wait. Deferring makes the source cold, so a
        // resubscribe genuinely asks grecaptcha for a new token.
        return defer(() => this.recaptcha.execute(action)).pipe(
            timeout(RecaptchaGuardService.EXECUTE_TIMEOUT_MS),
            retry({ count: 1, delay: () => timer(500) }),
            catchError((err) => {
                Sentry.captureException(err, { tags: { recaptchaAction: action, recaptchaStage: 'execute' } });
                return throwError(() => new RecaptchaClientError(err));
            })
        );
    }

    /**
     * Message for any failure of a captcha-gated call. Backend rejections already arrive as a Portuguese string
     * (httpErrorInterceptor flattens the API's ErrorDetail.message), so those pass straight through.
     */
    messageFor(err: unknown): string {
        if (err instanceof RecaptchaClientError) return err.message;
        if (typeof err === 'string' && err.trim()) return err;
        return 'Falha na verificação de segurança. Atualize a página e tente novamente.';
    }
}
