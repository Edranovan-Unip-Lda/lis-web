import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Each language becomes its own content-hashed lazy chunk: cache-busted on every deploy (files under public/
// are served unhashed) and fetched outside HttpClient, so the auth/error interceptor never sees it.
const LOADERS: Record<string, () => Promise<{ default: object }>> = {
    pt: () => import('../../../i18n/pt.json'),
    tet: () => import('../../../i18n/tet.json'),
    en: () => import('../../../i18n/en.json')
};

export class LazyTranslateLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<TranslationObject> {
        return from((LOADERS[lang] ?? LOADERS['pt'])()).pipe(map((m) => m.default as TranslationObject));
    }
}
