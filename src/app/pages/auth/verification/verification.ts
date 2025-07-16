import { Role } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { LayoutService } from '@/layout/service/layout.service';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { InputOtp } from 'primeng/inputotp';
import { MessagesModule } from 'primeng/messages';
import { Ripple } from 'primeng/ripple';

@Component({
    selector: 'app-verification',
    standalone: true,
    imports: [Ripple, RouterModule, Fluid, InputOtp, MessagesModule, Button, ReactiveFormsModule],
    templateUrl: './verification.component.html',
    providers: [MessageService]
})
export class Verification {
    layoutService = inject(LayoutService);
    value: string = '';
    password!: string;
    otpLoading = false;
    username!: string;
    otpInput = new FormControl('', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]);
    otpSessionActive = true;
    timeLeft = signal(0);
    activateResendBtn = computed(() => {
        const totalSessionTime = 3 * 60 * 1000; // 180,000 ms
        const elapsedTime = totalSessionTime - this.timeLeft();
        return elapsedTime >= 30000;
    });
    email!: string;

    constructor(
        private router: Router,
        private messageService: MessageService,
        private authService: AuthenticationService,
        private route: ActivatedRoute,
    ) {
        this.route.queryParamMap.subscribe(params => this.username = params.get('u') ?? '');
        this.email = this.router.getCurrentNavigation()?.extras.state?.['email'] ?? '';
    }

    focusOnNext(inputEl: InputNumber) {
        inputEl.input.nativeElement.focus();
    }

    /**
  * Validate the OTP sent by the server. If the OTP is valid, navigate to the
  * admin dashboard and reset the login form. If the OTP is invalid, clear the
  * OTP input and show an error message.
  * @param otp The OTP to be validated.
  */
    validateOTP(input: FormControl): void {
        this.messageService.clear();
        this.otpLoading = true;

        this.authService.validateOTP(this.username, input.value).subscribe({
            next: response => {
                switch (response.role.name) {
                    case Role.admin:
                    case Role.staff:
                        this.otpSessionActive = true;
                        setTimeout(() => {
                            this.otpLoading = false;
                            this.router.navigate(['/dashboard']);
                        }, 1000);
                        break;
                    case Role.client:
                        this.router.navigate(['/home']).then(() => {
                            this.otpLoading = false;
                        });
                        break;
                }
            },
            error: err => {
                this.otpInput.reset();
                this.messageService.add({ severity: 'error', summary: '', detail: err });
                this.otpLoading = false;
            },
        });
    }

    maskEmail(email: string): string {
        const [username, domain] = email.split('@');
        if (username.length <= 2) {
            return `${username[0]}***@${domain}`;
        }
        const visible = username.slice(0, 2);
        return `${visible}***@${domain}`;
    }

}
