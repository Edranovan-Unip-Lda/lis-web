import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {LayoutService} from '@/layout/service/layout.service';
import {AppConfigurator} from "@/layout/components/app.configurator";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-access',
    standalone: true,
    imports: [ButtonModule, RouterModule, RippleModule, AppConfigurator, TranslatePipe],
    template: ` <div [class]="'exception-body min-h-screen ' + (layoutService.isDarkTheme() ? 'layout-dark' : 'layout-light')" style="background: var(--surface-ground)">
        <div
            class="exception-container min-h-screen flex items-center justify-center flex-col bg-auto md:bg-contain !bg-no-repeat"
            [style]="{
                background: 'var(--exception-pages-image)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                boxSizing: 'border-box'
            }"
        >
            <div class="exception-panel text-center flex items-center justify-center flex-col" style="margin-top: -200px; box-sizing: border-box">
                <h1 class="text-blue-500 mb-0" style="font-size: 140px; font-weight: 900; text-shadow: 0px 0px 50px rgba(#0f8bfd, 0.2)">{{ 'auth.access.title' | translate }}</h1>
                <h3 class="text-blue-700" style="font-size: 80px; font-weight: 900; margin-top: -90px; margin-bottom: 50px">{{ 'auth.access.subtitle' | translate }}</h3>
                <p class="text-3xl" style="max-width: 320px">{{ 'auth.access.message' | translate }}</p>
                <button pButton pRipple type="button" [routerLink]="['/']" style="margin-top: 50px">{{ 'auth.common.goHome' | translate }}</button>
            </div>
            <div class="exception-footer absolute items-center flex" style="bottom: 60px">
                <img src="/images/logo-{{ layoutService.isDarkTheme() ? 'light' : 'dark' }}.png" class="exception-logo" style="width: 34px" alt="loog" />
                <img src="/images/appname-{{ layoutService.isDarkTheme() ? 'light' : 'dark' }}.png" class="exception-appname ml-4" style="width: 72px" alt="logo" />
            </div>
        </div>
    </div>
    <app-configurator [simple]="true"/>`
})
export class AccessDenied {
    layoutService = inject(LayoutService);
}
