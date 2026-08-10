import { Role } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { OtpSessionService } from '@/core/services/otp-session.service';
import { LayoutService } from '@/layout/service/layout.service';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputOtp } from 'primeng/inputotp';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';
import { interval } from 'rxjs';

/** Drives both the box collapse animation and which feedback the screen shows. */
type AnimState = 'idle' | 'loading' | 'success' | 'error' | 'expired' | 'blocked';

/** How long the error result stays on screen before the boxes fly back in. */
const ERROR_HOLD_MS = 1400;
/** How long the success check stays on screen before navigating away. */
const SUCCESS_HOLD_MS = 1000;

@Component({
    selector: 'app-verification',
    standalone: true,
    imports: [Ripple, RouterLink, InputOtp, Message, Button, ReactiveFormsModule],
    templateUrl: './verification.component.html',
    styleUrls: ['./verification.component.scss']
})
export class Verification {
    layoutService = inject(LayoutService);
    private otpSessionService = inject(OtpSessionService);

    username!: string;
    email!: string;
    /** Single-use login-transaction token from /authenticate; the OTP endpoints reject calls without it. */
    private loginToken!: string;
    otpInput = new FormControl('', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]);

    animState = signal<AnimState>('idle');
    feedbackMessage = signal<string | null>(null);
    timeLeft = signal(0);
    timeDisplay = computed(() => {
        const totalSeconds = Math.ceil(this.timeLeft() / 1000);
        return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
    });
    /** Terminal states: the code is dead (timed out or burned) and only a fresh login can continue. */
    isTerminal = computed(() => this.animState() === 'expired' || this.animState() === 'blocked');

    constructor(
        private router: Router,
        private authService: AuthenticationService,
        private route: ActivatedRoute,
    ) {
        this.route.queryParamMap
            .pipe(takeUntilDestroyed())
            .subscribe(params => this.username = params.get('u') ?? '');
        // BUG-WEB-3: keep the redirect separate from the assignment — the old `?? navigateByUrl(...)` stored a
        // Promise in this.email, which then broke maskEmail().split('@'). (getCurrentNavigation() is also null on a
        // hard refresh, so email is simply absent then → redirect.)
        const navState = this.router.getCurrentNavigation()?.extras.state;
        const email = navState?.['email'];
        const loginToken = navState?.['loginToken'];
        // Like email, the loginToken only survives the in-app navigation from the login page — a hard
        // refresh loses it, and without it the backend rejects OTP validation, so restart the login.
        if (email && loginToken) {
            this.email = email;
            this.loginToken = loginToken;
        } else {
            this.router.navigateByUrl('/auth/login');
        }

        this.timeLeft.set(this.otpSessionService.getRemainingTime());
        // The localStorage expiry is the source of truth rather than a decremented counter, so the countdown
        // stays honest across a refresh or a sleeping tab.
        interval(1000)
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.timeLeft.set(this.otpSessionService.getRemainingTime());
                if (this.timeLeft() <= 0 && this.animState() === 'idle') {
                    this.expire();
                }
            });
    }

    /**
     * Validate the OTP sent by the server. On success the boxes resolve to a check and the user is routed by
     * role; on failure the error is shown inline and the boxes return so the code can be retyped.
     */
    validateOTP(input: FormControl): void {
        if (this.animState() !== 'idle') return;

        this.animState.set('loading');
        this.feedbackMessage.set(null);

        this.authService.validateOTP(this.username, input.value, this.loginToken).subscribe({
            next: response => {
                this.animState.set('success');
                this.feedbackMessage.set('Código validado com sucesso!');
                const target = response.role.name === Role.client ? '/home' : '/dashboard';
                setTimeout(() => this.router.navigate([target]), SUCCESS_HOLD_MS);
            },
            error: err => {
                this.animState.set('error');
                this.feedbackMessage.set(err || 'Código inválido. Tente novamente.');
                // Mirrors the BLOCKED message thrown in lis-api UserServices.getJWTByOTP — the interceptor
                // only surfaces message strings, so the burned-OTP signal rides in the wording.
                const isBlocked = typeof err === 'string' && err.includes('número máximo');
                // Same idiom for the other terminal case: an administrator turned 2FA off while this screen was
                // open, so the OTP endpoints now reject outright. Mirrors OTP_GLOBALLY_DISABLED in lis-api.
                const otpDisabled = typeof err === 'string' && err.includes('duas etapas foi desativada');
                setTimeout(() => {
                    this.otpInput.reset();
                    if (isBlocked || otpDisabled) {
                        this.animState.set('blocked');
                        this.otpInput.disable();
                    // The countdown can run out while the request is in flight; expiry wins over a retry.
                    } else if (this.otpSessionService.getRemainingTime() <= 0) {
                        this.expire();
                    } else {
                        this.animState.set('idle');
                        this.feedbackMessage.set(null);
                    }
                }, ERROR_HOLD_MS);
            },
        });
    }

    private expire(): void {
        this.animState.set('expired');
        this.otpInput.disable();
        this.feedbackMessage.set('O código expirou. Por favor, inicie sessão novamente para receber um novo código.');
    }

    maskEmail(email: string): string {
        if (!email || !email.includes('@')) return ''; // BUG-WEB-3: guard against missing email
        const [username, domain] = email.split('@');
        if (username.length <= 2) {
            return `${username[0]}***@${domain}`;
        }
        const visible = username.slice(0, 2);
        return `${visible}***@${domain}`;
    }

}
