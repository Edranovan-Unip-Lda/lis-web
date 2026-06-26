import { RecaptchaAction } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha-2';
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
    imports: [IconField, InputIcon, InputText, Button, Ripple, Fluid, RouterLink, ReactiveFormsModule, Message, RecaptchaV3Module],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPassword {
    email: FormControl = new FormControl(null, [Validators.required, Validators.email]);
    loading = false;
    messages = signal<any[]>([]);

    constructor(
        private authService: AuthenticationService,
        private recaptchaV3Service: ReCaptchaV3Service,
    ) { }

    submit() {
        this.messages.set([]);
        if (!this.email.valid) {
            this.email.markAsTouched();
            return;
        }
        this.loading = true;
        // #22: obtain a reCAPTCHA v3 token, then request the reset email.
        this.recaptchaV3Service.execute(RecaptchaAction.forgotPassword).subscribe({
            next: (token) => this.requestReset(token),
            error: () => {
                this.loading = false;
                this.messages.set([{ severity: 'error', content: 'Falha na verificação reCAPTCHA. Tente novamente.' }]);
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
