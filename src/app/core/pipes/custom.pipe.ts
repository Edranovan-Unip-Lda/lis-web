import { Pipe, PipeTransform } from '@angular/core';
import { t } from '../i18n/translate-ref';

@Pipe({ name: 'statusIcon', standalone: true, })
export class StatusIconPipe implements PipeTransform {
    statusIconMap: Record<string, string> = {
        active: 'bi bi-fw bi-shield-check',
        disabled: 'bi bi-fw bi-ban',
        pending: 'bi bi-fw bi-pause-circle',
        sucesso: 'bi bi-fw bi-shield-check',
        SUBMETIDO: 'bi bi-fw bi-shield-check',
        rejeitado: 'bi bi-fw bi-ban',
        esboco: 'bi bi-fw bi-pause-circle',
        ativo: 'bi bi-fw bi-shield-check',
        expirado: 'bi bi-fw bi-ban',
        EM_CURSO: 'bi bi-fw bi-hourglass-split',
        REJEITADO: 'bi bi-fw bi-ban',
        REVISAO: 'bi bi-fw bi-chat-text',
        APROVADO: 'bi bi-fw bi-check2-circle',
        DEVOLVIDO: 'bi bi-fw bi-arrow-counterclockwise',
        SUSPENDE: 'bi bi-fw bi-pause-circle',
    };

    transform(status: string): string {
        return this.statusIconMap[status] || '';
    }
}



export type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

@Pipe({
    name: 'statusSeverity',
    standalone: true,
})
export class StatusSeverityPipe implements PipeTransform {
    private readonly statusSeverityMap: Record<string, Severity> = {
        active: 'success',
        disabled: 'danger',
        pending: 'warn',
        sucesso: 'success',
        rejeitado: 'danger',
        esboco: 'warn',
        ativo: 'success',
        expirado: 'danger',
        PAGA: 'success',
        SUBMETIDO: 'success',
        EMITIDA: 'success',
        REJEITADO: 'danger',
        REVISAO: 'warn',
        APROVADO: 'success',
        DEVOLVIDO: 'warn',
        SUSPENDE: 'warn',
        SUCCESS: 'success',
        FAILURE: 'danger',
    };

    transform(status: string): Severity {
        return this.statusSeverityMap[status] || 'info';
    }
}

@Pipe({
    name: 'booleanPipe',
    standalone: true,
    pure: false,
})
export class BooleanPipe implements PipeTransform {
    transform(value: boolean) {
        return t(value ? 'common.yes' : 'common.no');
    }
}

// Impure so the text follows a language switch (and keeps ageing while the view stays open).
@Pipe({
    name: 'timeAgo',
    standalone: true,
    pure: false,
})
export class TimeAgoPipe implements PipeTransform {
    // [upper bound in seconds, key, divisor for {{n}}] — first match wins.
    private static readonly STEPS: [number, string, number][] = [
        [10, 'justNow', 0],
        [60, 'fewSeconds', 0],
        [120, 'minute', 0],
        [3600, 'minutes', 60],
        [7200, 'hour', 0],
        [86400, 'hours', 3600],
        [172800, 'yesterday', 0],
        [604800, 'days', 86400],
        [1209600, 'week', 0],
        [2592000, 'weeks', 604800],
        [5184000, 'month', 0],
        [31536000, 'months', 2592000],
    ];

    transform(value: string | Date): string {
        if (!value) return '';

        const date = typeof value === 'string' ? new Date(value) : value;
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

        if (seconds < 0) return t('common.timeAgo.justNow');

        const step = TimeAgoPipe.STEPS.find(([max]) => seconds < max);
        if (step) {
            const [, key, div] = step;
            return t(`common.timeAgo.${key}`, div ? { n: Math.floor(seconds / div) } : undefined);
        }

        const years = Math.floor(seconds / 31536000);
        return years === 1 ? t('common.timeAgo.year') : t('common.timeAgo.years', { n: years });
    }
}


/** Display label for any status code (aplicante/pedido/fatura/user/login); unknown codes render as-is. */
@Pipe({
    name: 'statusLabel',
    standalone: true,
    pure: false,
})
export class StatusLabelPipe implements PipeTransform {
    transform(status: string | null | undefined): string {
        if (!status) return '';
        const key = `status.${status}`;
        const label = t(key);
        return label === key ? status : label;
    }
}
