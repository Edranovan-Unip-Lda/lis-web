import { Status } from '@/core/models/enums';
import { UserService } from '@/core/services';
import { mustMatch } from '@/core/validators/must-match';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-new-password',
    standalone: true,
    imports: [CommonModule, InputTextModule, ButtonModule, RouterModule, ReactiveFormsModule, Fluid, RippleModule, MessageModule],
    templateUrl: './activation.component.html',
    providers: [MessageService]
})
export class ActivationComponent {
    activationForm: FormGroup;
    loading = false;
    token: string;
    doLogin = false;
    messages = signal<any[]>([]);
    notification: any;

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private userService: UserService,
    ) {
        this.activationForm = this._fb.group({
            password: ['', [Validators.required, Validators.minLength(4)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(4)]],
            status: [Status.active],
        },
            {
                validators: mustMatch('password', 'confirmPassword')
            }
        );

        this.token = this.route.snapshot.data['tokenResolve'];
        this.activateUser(this.activationForm);
    }

    activateUser(form: FormGroup): void {
        this.loading = true;
        const data = form.value;
        data.jwtSession = this.token;
        this.userService.activate(this.token, data).subscribe({
            next: response => {
                this.loading = false;
                this.setNotification();
            },
            error: error => {
                console.log(error);
                this.loading = false;
                this.setNotification(true, error);
                this.activationForm.reset();
            },
            complete: () => this.activationForm.reset()
        });
    }


    setNotification(error?: boolean, errorMessage?: string): void {
        if (error) {
            this.notification = {} as Notification;
            this.notification.icon = 'bi bi-exclamation-triangle';
            this.notification.state = 'error';
            this.notification.message = errorMessage || `Ocorreu um erro ao ativar a sua conta. Por favor, tente novamente mais tarde ou contacte o suporte técnico.`;
        } else {
            this.notification = {} as Notification;
            this.notification.icon = 'bi bi-check2-circle'
            this.notification.state = 'success';
            this.notification.message = `O seu email foi verificado e a sua conta está agora ativa. Já pode iniciar sessão e começar a utilizar o sistema.`;
        }
    }
}
