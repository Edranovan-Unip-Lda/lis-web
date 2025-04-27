import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { LayoutService } from '@/layout/service/layout.service';
import { Fluid } from 'primeng/fluid';
import { AppConfigurator } from "@/layout/components/app.configurator";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, InputIcon, IconField, Fluid, AppConfigurator],
    templateUrl: './login.html',
})
export class Login {
    layoutService = inject(LayoutService);
}
