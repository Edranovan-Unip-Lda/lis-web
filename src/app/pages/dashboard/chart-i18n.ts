import { LanguageService } from '@/core/i18n';
import { TipoEmpresa } from '@/core/models/enums';
import { formatDate } from '@angular/common';
import { effect, untracked } from '@angular/core';
import type * as Highcharts from 'highcharts';

// Fixed series/point names the dashboard API emits in Portuguese (DashboardService) → translation keys.
const FIXED_LABELS: Record<string, string> = {
    Ativos: 'dashboard.series.ativos',
    Expirados: 'dashboard.series.expirados',
    Desconhecido: 'dashboard.series.unknown',
    'Licenças por Município': 'dashboard.series.licencasMunicipio',
    'Certificados por Município': 'dashboard.series.certificadosMunicipio',
    Comercial: 'enum.Categoria.COMERCIAL',
    Industrial: 'enum.Categoria.INDUSTRIAL'
};
const TIPO_EMPRESA = new Set<string>(Object.values(TipoEmpresa));

/** Display label for an API series/point name; master data (municipios, sociedades) passes through untouched. */
export function seriesLabel(i18n: LanguageService, name: string): string {
    const key = FIXED_LABELS[name] ?? (TIPO_EMPRESA.has(name) ? `enum.TipoEmpresa.${name}` : null);
    return key ? i18n.instant(key) : name;
}

/** Month names from the active Angular locale (`tet` is registered in main.ts). */
export function monthNames(i18n: LanguageService, format: 'MMM' | 'MMMM'): string[] {
    const locale = i18n.ngLocale();
    return Array.from({ length: 12 }, (_, m) => formatDate(new Date(2000, m, 1), format, locale));
}

/** Per-chart Highcharts `lang` (v12 merges it on chart.update, so the export menu follows a language switch). */
export function chartLang(i18n: LanguageService): Highcharts.LangOptions {
    const k = (key: string) => i18n.instant(`dashboard.chart.${key}`);
    return {
        contextButtonTitle: k('contextButtonTitle'),
        viewFullscreen: k('viewFullscreen'),
        exitFullscreen: k('exitFullscreen'),
        downloadPNG: k('downloadPNG'),
        downloadSVG: k('downloadSVG'),
        downloadPDF: k('downloadPDF'),
        downloadXLS: k('downloadXLS'),
        zoomIn: k('zoomIn'),
        zoomOut: k('zoomOut'),
        loading: i18n.instant('common.loading'),
        months: monthNames(i18n, 'MMMM'),
        shortMonths: monthNames(i18n, 'MMM')
    } as Highcharts.LangOptions;
}

/**
 * Runs `rebuild` whenever the UI language changes (not on the initial value — ngOnInit builds the first chart).
 * Must be called in an injection context (constructor / field initializer).
 */
export function onLangChange(i18n: LanguageService, rebuild: () => void): void {
    let prev = i18n.lang();
    effect(() => {
        const lang = i18n.lang();
        if (lang !== prev) {
            prev = lang;
            untracked(rebuild);
        }
    });
}
