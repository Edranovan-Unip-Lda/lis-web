import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';
import { Observable } from 'rxjs';
import { bindTranslator } from './translate-ref';

export const SUPPORTED_LANGS = ['pt', 'tet', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

/** Preserved across `localStorage.clear()` on login (see AuthenticationService.setSession). */
export const LANG_STORAGE_KEY = 'lis:lang';
const DEFAULT_LANG: Lang = 'pt';

/** Angular locale ids registered in main.ts (`tet` is our own clone of `pt`). */
const NG_LOCALE: Record<Lang, string> = { pt: 'pt', tet: 'tet', en: 'en' };
/** ngx-extended-pdf-viewer has no Tetum bundle. */
const PDF_LOCALE: Record<Lang, string> = { pt: 'pt-PT', tet: 'pt-PT', en: 'en-US' };

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly translate = inject(TranslateService);
    private readonly primeng = inject(PrimeNG);

    private readonly _lang = signal<Lang>(DEFAULT_LANG);
    readonly lang = this._lang.asReadonly();
    readonly ngLocale = computed(() => NG_LOCALE[this._lang()]);
    readonly pdfLocale = computed(() => PDF_LOCALE[this._lang()]);

    constructor() {
        bindTranslator((key, params) => {
            this._lang();
            return this.translate.instant(key, params);
        });
        // Every path that changes language (switcher, init) funnels through onLangChange, so side effects live here.
        this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(({ lang }) => {
            this._lang.set(lang as Lang);
            document.documentElement.lang = lang;
            document.title = this.translate.instant('app.title');
            this.primeng.setTranslation(this.translate.instant('primeng'));
        });
    }

    /** Resolves once the stored (or default) language is loaded — awaited by the app initializer. */
    init(): Observable<unknown> {
        this.translate.setFallbackLang(DEFAULT_LANG);
        return this.translate.use(this.stored());
    }

    use(lang: Lang): void {
        if (lang === this._lang()) return;
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch {
            /* private mode / blocked storage: the switch still applies for this session */
        }
        this.translate.use(lang).subscribe();
    }

    instant(key: string, params?: Record<string, unknown>): string {
        return this.translate.instant(key, params);
    }

    private stored(): Lang {
        try {
            const v = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
            if (v && SUPPORTED_LANGS.includes(v)) return v;
        } catch {
            /* fall through to default */
        }
        return DEFAULT_LANG;
    }
}
