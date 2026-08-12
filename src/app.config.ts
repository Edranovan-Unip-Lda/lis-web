import { httpErrorInterceptor } from '@/core/security/http-error.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import * as Sentry from "@sentry/angular";
import { provideHighcharts } from 'highcharts-angular';
import { RECAPTCHA_BASE_URL, RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha-2';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } }
        }),
        {
            provide: ErrorHandler,
            useValue: Sentry.createErrorHandler(),
        },
        {
            provide: Sentry.TraceService,
            deps: [Router],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => { },
            deps: [Sentry.TraceService],
            multi: true,
        },
        { provide: LOCALE_ID, useValue: 'pt' },
        provideHighcharts({
            // MUST be the ESM core: the lazy modules below (and the dashboard map module) are ESM and
            // register themselves onto 'highcharts/esm/highcharts'. Loading the UMD 'highcharts' build here
            // gives a different instance, so those modules silently don't attach — that's why the map
            // (mapChart series) rendered blank while built-in chart types still worked.
            instance: () => import('highcharts/esm/highcharts').then(m => m.default),
            // Include Highcharts additional modules (e.g., exporting, accessibility) or custom themes
            modules: () => {
                return [
                    import('highcharts/esm/modules/accessibility'),
                    import('highcharts/esm/modules/exporting')
                ]
            }
        }),
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },
        // NEW: load api.js from recaptcha.net instead of google.com. Same site keys, same API — it is Google's
        // own alternative host for networks that filter google.com, and a failed script load is one of the ways
        // grecaptcha ends up handing the backend an error token (`browser-error`) instead of a real one.
        // Note this must be the FULL script URL, not an origin: the library does `new URL(baseUrl)` and only
        // appends render/onload/trustedtypes. The loader is a static singleton, so this is fixed at first load —
        // there is no runtime fallback between the two hosts.
        { provide: RECAPTCHA_BASE_URL, useValue: 'https://www.recaptcha.net/recaptcha/api.js' },
        // NEW: ReCaptchaV3Service is not providedIn:'root' — RecaptchaV3Module is providers-only and used to be
        // pulled in per component. RecaptchaGuardService is root-scoped, so the module must be hoisted here or
        // the guard resolves against an injector that has never seen it.
        importProvidersFrom(RecaptchaV3Module),
    ]
};
