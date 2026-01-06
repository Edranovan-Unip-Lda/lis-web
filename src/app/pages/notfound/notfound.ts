import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {LayoutService} from '@/layout/service/layout.service';
import {RippleModule} from 'primeng/ripple';
import {AppConfigurator} from "@/layout/components/app.configurator";

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, ButtonModule, RippleModule],
    template: ` <div [class]="'min-h-screen ' + (layoutService.isDarkTheme() ? 'layout-dark' : 'layout-light')" style="background: var(--surface-ground)">
        <div
            class="exception-container min-h-screen flex items-center justify-center flex-col bg-auto md:bg-contain bg-no-repeat"
            style="box-sizing: border-box; background: var(--exception-pages-image); background-repeat: no-repeat; background-size: contain"
        >
            <div class="text-center flex items-center justify-center flex-col" style="margin-top: -200px; box-sizing: border-box">
                <h1 class="text-blue-500 mb-0" style="font-size: 140px; font-weight: 900; text-shadow: 0px 0px 50px rgba(#0f8bfd, 0.2)">404</h1>
                <h3 class="text-blue-700" style="font-size: 80px; font-weight: 900; margin-top: -90px; margin-bottom: 50px">not found</h3>
                <p class="text-3xl" style="max-width: 320px">A página que você está procurando não existe</p>
                <button pButton pRipple type="button" label="Voltar para o início" style="margin-top: 50px" [routerLink]="['/']"></button>
            </div>
            <div class="absolute items-center flex" style="bottom: 60px">
                 <div class="flex items-end justify-end bottom-0 pb-8">
            <div class="flex items-center pr-6 mr-6 border-r border-surface-200">
                <h4>
                    Ministério de Comércio e Indústria
                </h4>
            </div>
            <span class="text-sm">Copyright 2025</span>
        </div>
            </div>
        </div>
    </div>`
})
export class Notfound {
    layoutService = inject(LayoutService);
}
