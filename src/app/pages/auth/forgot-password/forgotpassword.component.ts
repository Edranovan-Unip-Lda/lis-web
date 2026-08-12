import { RecaptchaAction } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecaptchaGuardService } from '@/core/services/recaptcha-guard.service';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
    standalone: true,
    selector: 'app-forgot-password',
    // CHANGED: RecaptchaV3Module dropped — it only ever contributed providers, now hoisted to root in app.config.
    imports: [IconField, InputIcon, InputText, Button, Ripple, Fluid, RouterLink, ReactiveFormsModule, Message],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPassword {
    email: FormControl = new FormControl(null, [Validators.required, Validators.email]);
    loading = false;
    messages = signal<any[]>([]);

    constructor(
        private authService: AuthenticationService,
        private recaptchaGuard: RecaptchaGuardService,
    ) { }

    submit() {
        this.messages.set([]);
        if (!this.email.valid) {
            this.email.markAsTouched();
            return;
        }
        this.loading = true;
        // #22: obtain a reCAPTCHA v3 token, then request the reset email.
        this.recaptchaGuard.execute(RecaptchaAction.forgotPassword).subscribe({
            next: (token) => this.requestReset(token),
            // CHANGED: the guard bounds a hung mint and reports the cause instead of one catch-all string.
            error: (err) => {
                this.loading = false;
                this.messages.set([{ severity: 'error', content: this.recaptchaGuard.messageFor(err) }]);
            }
        });
    }

    private requestReset(recaptchaToken: string) {
        this.authService.sendForgotPasswordEmail(this.email.value!, recaptchaToken).subscribe({
            next: () => {
                this.loading = false;
                this.messages.set([
                    { severity: 'success', content: 'Email de redefinição de palavra-passe enviado com sucesso.' },
                ]);
                this.email.reset();
            },
            error: (err) => {
                this.messages.set([
                    { severity: 'error', content: err },
                ]);
                this.loading = false;
                this.email.reset();
            }
        });
    }

}
