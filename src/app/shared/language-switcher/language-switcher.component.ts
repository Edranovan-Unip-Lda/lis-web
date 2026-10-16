import { Lang, LanguageService, SUPPORTED_LANGS } from '@/core/i18n';
import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

/** Language picker shared by the topbar (authenticated) and the auth layout (public pages). */
@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [ButtonModule, MenuModule, TranslatePipe],
    template: `
        <p-button
            icon="pi pi-language"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            [ariaLabel]="'language.label' | translate"
            (onClick)="menu.toggle($event)"
        />
        <p-menu #menu [model]="items()" [popup]="true" appendTo="body" />
    `
})
export class LanguageSwitcherComponent {
    protected readonly i18n = inject(LanguageService);

    // Language names are shown in their own language (never translated), so a lost user can find theirs.
    protected readonly items = computed<MenuItem[]>(() =>
        SUPPORTED_LANGS.map((lang: Lang) => ({
            label: NATIVE_NAMES[lang],
            icon: lang === this.i18n.lang() ? 'pi pi-check' : 'pi pi-fw',
            command: () => this.i18n.use(lang)
        }))
    );
}

const NATIVE_NAMES: Record<Lang, string> = { pt: 'Português', tet: 'Tetun', en: 'English' };
