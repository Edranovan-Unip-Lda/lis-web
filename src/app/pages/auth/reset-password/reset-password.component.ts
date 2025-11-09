import { AuthenticationService } from "@/core/services";
import { mustMatch } from "@/core/validators/must-match";
import { Component, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Button } from "primeng/button";
import { Fluid } from "primeng/fluid";
import { IconField } from "primeng/iconfield";
import { Message } from "primeng/message";
import { Password } from "primeng/password";

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, Fluid, Message, IconField, Password, Button, RouterLink],
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
    form!: FormGroup;
    loading = false;
    isSuccess = false;
    isTokenvalid = false;
    token!: string;
    doLogin = false;
    messages = signal<any[]>([]);
    uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
    ) { }

    ngOnInit(): void {
        this.form = this._fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(4)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(4)]],
        },
            {
                validators: mustMatch('newPassword', 'confirmPassword')
            }
        );

        // this.token = this.route.snapshot.data['tokenResolve'];
        this.token = this.route.snapshot.queryParamMap.get('t') || '';

        if (!this.token || !this.uuidRegex.test(this.token)) {
            this.isTokenvalid = true;
            this.messages.set([
                { severity: 'error', content: 'Token inválido ou expirado!' },
            ]);
        }

    }

    submit(form: FormGroup): void {
        this.loading = true;
        this.messages.set([]);
        const data = form.value;
        data.token = this.token;

        this.authService.resetPassword(data).subscribe({
            next: response => {
                this.loading = false;
                this.messages.set([
                    { severity: 'success', content: 'Palavra-passe redefinida com sucesso' },
                ]);
                this.isSuccess = true;
            },
            error: error => {
                this.loading = false;
                this.isSuccess = false;
                this.messages.set([
                    { severity: 'error', content: error },
                ]);
                this.form.reset();
            }
        });
    }
}