import { AuthenticationService } from '@/core/services';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';
import { Toast } from 'primeng/toast';

@Component({
    standalone: true,
    selector: 'app-forgot-password',
    imports: [IconField, InputIcon, InputText, Button, Ripple, Fluid, RouterLink, ReactiveFormsModule, Message],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPassword {
    email: FormControl = new FormControl(null, [Validators.required, Validators.email]);
    loading = false;
    messages = signal<any[]>([]);

    constructor(
        private authService: AuthenticationService,
    ) { }

    submit() {
        this.messages.set([]);
        this.loading = true;
        if (this.email.valid) {
            this.authService.sendForgotPasswordEmail(this.email.value!).subscribe({
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
            })
        } else {
            this.email.markAsTouched();
            this.loading = false;
        }
    }

}
