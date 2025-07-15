import { AuthenticationService } from '@/core/services';
import { OtpSessionService } from '@/core/services/otp-session.service';
import { AppConfigurator } from "@/layout/components/app.configurator";
import { LayoutService } from '@/layout/service/layout.service';
import { CommonModule } from "@angular/common";
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Fluid } from 'primeng/fluid';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, InputIcon, IconField, Fluid, ReactiveFormsModule, MessageModule],
    templateUrl: './login.html',
    providers: [MessageService]
})
export class Login {
    layoutService = inject(LayoutService);
    password!: string;
    loginForm: FormGroup;
    loading = false;
    erroMessage: string | undefined;

    constructor(
        private _fb: FormBuilder,
        private authService: AuthenticationService,
        private router: Router,
        private messageService: MessageService,
        private otpSessionService: OtpSessionService,
    ) {
        this.loginForm = this._fb.group({
            username: new FormControl(null, [Validators.required]),
            password: new FormControl(null, [Validators.required])
        });
    }

    /**
  * Authenticates the user by sending a request to the server with the given form data.
  * If the authentication is successful, it redirects the user to the OTP route session.
  * If the authentication fails, it displays an error message.
  *
  * @param form The form data containing the username and password.
  */
    login(form: FormGroup): void {
        this.erroMessage = undefined;
        this.loading = true;
        this.authService.authServer(form.value).subscribe({
            next: response => {
                this.loginForm.reset();

                // Redirect to OTP route session
                this.otpSessionService.createSession(response.username);
                this.loading = false;
                this.router.navigate(['/auth/verification'],
                    {
                        queryParams: { u: response.username },
                        state: { email: response.email }
                    }).then();
            },
            error: err => {
                this.loginForm.reset();
                this.loading = false;
                this.erroMessage = err;
            },
            complete: () => this.loading = false
        });
    }
}
