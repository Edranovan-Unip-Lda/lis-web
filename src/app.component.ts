import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TestingBannerComponent} from '@/layout/components/testing-banner';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, TestingBannerComponent],
    template: `<app-testing-banner></app-testing-banner><router-outlet></router-outlet>`
})
export class AppComponent {}
