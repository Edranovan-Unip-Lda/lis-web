import { isDevMode } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

/** Returns the key itself; in dev, warns once per key so gaps surface without flooding the console. */
export class LisMissingTranslationHandler implements MissingTranslationHandler {
    private readonly seen = new Set<string>();

    handle({ key, translateService }: MissingTranslationHandlerParams): string {
        if (isDevMode() && !this.seen.has(key)) {
            this.seen.add(key);
            console.warn(`[i18n] missing "${key}" (${translateService.getCurrentLang()})`);
        }
        return key;
    }
}
