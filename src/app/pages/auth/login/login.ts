import { AuthenticationService } from '@/core/services';
import { OtpSessionService } from '@/core/services/otp-session.service';
import { LayoutService } from '@/layout/service/layout.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Password } from 'primeng/password';
import { Ripple } from 'primeng/ripple';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [Button, InputText, RouterLink, Ripple, InputIcon, IconField, Fluid, ReactiveFormsModule, MessageModule, Password],
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
