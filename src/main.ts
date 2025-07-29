import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import * as Sentry from "@sentry/angular";
import { environment } from './environments/environment';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localePt);
Sentry.init({
    dsn: "https://6d5671d893fc0124d76b46b392cf69c9@o4509671470006272.ingest.de.sentry.io/4509671475249232",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    environment: environment.sentryEnv
});


bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
