import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './language.service';

// LOCALE_ID is fixed at bootstrap, so Angular's own pipes can't follow a runtime language switch. These impure
// wrappers delegate to one Angular pipe instance per locale and memoize on (input, args, locale), so the cost per
// change-detection pass is a few identity checks.
abstract class LocalizedPipe<P> {
    protected readonly i18n = inject(LanguageService);
    private readonly pipes = new Map<string, P>();
    private lastKey: unknown[] = [];
    private lastValue: string | null = null;

    protected abstract create(locale: string): P;
    protected abstract format(pipe: P, value: any, args: any[]): string | null;

    protected memo(value: any, args: any[]): string | null {
        const locale = this.i18n.ngLocale();
        const key = [value, locale, ...args];
        if (key.length === this.lastKey.length && key.every((k, i) => k === this.lastKey[i])) return this.lastValue;
        let pipe = this.pipes.get(locale);
        if (!pipe) this.pipes.set(locale, (pipe = this.create(locale)));
        this.lastKey = key;
        return (this.lastValue = this.format(pipe, value, args));
    }
}

@Pipe({ name: 'ldate', standalone: true, pure: false })
export class LocalizedDatePipe extends LocalizedPipe<DatePipe> implements PipeTransform {
    protected create = (locale: string) => new DatePipe(locale);
    protected format = (p: DatePipe, v: any, a: any[]) => p.transform(v, a[0], a[1], a[2]);
    transform(value: any, format?: string, timezone?: string, locale?: string): string | null {
        return this.memo(value, [format, timezone, locale]);
    }
}

@Pipe({ name: 'lcurrency', standalone: true, pure: false })
export class LocalizedCurrencyPipe extends LocalizedPipe<CurrencyPipe> implements PipeTransform {
    protected create = (locale: string) => new CurrencyPipe(locale, 'USD');
    protected format = (p: CurrencyPipe, v: any, a: any[]) => p.transform(v, a[0], a[1], a[2], a[3]);
    transform(value: any, currencyCode?: string, display?: string | boolean, digitsInfo?: string, locale?: string): string | null {
        return this.memo(value, [currencyCode, display, digitsInfo, locale]);
    }
}

@Pipe({ name: 'lnumber', standalone: true, pure: false })
export class LocalizedNumberPipe extends LocalizedPipe<DecimalPipe> implements PipeTransform {
    protected create = (locale: string) => new DecimalPipe(locale);
    protected format = (p: DecimalPipe, v: any, a: any[]) => p.transform(v, a[0], a[1]);
    transform(value: any, digitsInfo?: string, locale?: string): string | null {
        return this.memo(value, [digitsInfo, locale]);
    }
}

export const LOCALIZED_PIPES = [LocalizedDatePipe, LocalizedCurrencyPipe, LocalizedNumberPipe] as const;
