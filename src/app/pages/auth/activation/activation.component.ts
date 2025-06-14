import { Status } from '@/core/models/enums';
import { UserService } from '@/core/services';
import { mustMatch } from '@/core/validators/must-match';
import { AppConfigurator } from '@/layout/components/app.configurator';
import { LayoutService } from '@/layout/service/layout.service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-new-password',
    standalone: true,
    imports: [CommonModule, IconField, InputIcon, InputTextModule, ButtonModule, RouterModule, ReactiveFormsModule, Fluid, RippleModule, AppConfigurator, MessageModule],
    templateUrl: './activation.component.html',
    providers: [MessageService]
})
export class ActivationComponent {
    layoutService = inject(LayoutService);
    activationForm: FormGroup;
    loading = false;
    token: string;
    doLogin = false;
    messages = signal<any[]>([]);

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private userService: UserService,
        private messageService: MessageService,
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
    }

    activateUser(form: FormGroup): void {
        this.loading = true;
        const data = form.value;
        data.jwtSession = this.token;
        this.userService.activate(this.token, data).subscribe({
            next: response => {
                this.loading = false;
                this.addMessage(true, response.message);
            },
            error: error => {
                this.loading = false;
                this.addMessage(false, error);
                this.activationForm.reset();
            },
            complete: () => this.activationForm.reset()
        });
    }

    addMessage(isSuccess: boolean, detail: string) {
        if (isSuccess) {
            this.messages.set([
                { severity: 'success', content: detail, icon: 'pi pi-check-circle' },
            ]);
        } else {
            this.messages.set([
                { severity: 'error', content: detail, icon: 'pi pi-times-circle' },
            ]);
        }
    }
}
