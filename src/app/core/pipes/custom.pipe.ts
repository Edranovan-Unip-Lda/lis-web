import { Pipe, PipeTransform } from '@angular/core';

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
    };

    transform(status: string): Severity {
        return this.statusSeverityMap[status] || 'info';
    }
}

@Pipe({
    name: 'booleanPipe',
    standalone: true,
})
export class BooleanPipe implements PipeTransform {
    transform(value: boolean) {
        return value ? 'SIM' : 'NÃO'
    }
}

@Pipe({
    name: 'timeAgo',
    standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | Date): string {
        if (!value) return '';

        const date = typeof value === 'string' ? new Date(value) : value;
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 0) return 'agora mesmo';

        const intervals: { [key: string]: number } = {
            ano: 31536000,
            mês: 2592000,
            semana: 604800,
            dia: 86400,
            hora: 3600,
            minuto: 60,
            segundo: 1
        };

        // Less than 10 seconds
        if (seconds < 10) {
            return 'agora mesmo';
        }

        // Less than 1 minute
        if (seconds < 60) {
            return 'há alguns segundos';
        }

        // 1 minute
        if (seconds < 120) {
            return 'há 1 minuto';
        }

        // Less than 1 hour
        if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `há ${minutes} minutos`;
        }

        // 1 hour
        if (seconds < 7200) {
            return 'há 1 hora';
        }

        // Less than 1 day
        if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return `há ${hours} horas`;
        }

        // 1 day
        if (seconds < 172800) {
            return 'ontem';
        }

        // Less than 1 week
        if (seconds < 604800) {
            const days = Math.floor(seconds / 86400);
            return `há ${days} dias`;
        }

        // 1 week
        if (seconds < 1209600) {
            return 'há 1 semana';
        }

        // Less than 1 month
        if (seconds < 2592000) {
            const weeks = Math.floor(seconds / 604800);
            return `há ${weeks} semanas`;
        }

        // 1 month
        if (seconds < 5184000) {
            return 'há 1 mês';
        }

        // Less than 1 year
        if (seconds < 31536000) {
            const months = Math.floor(seconds / 2592000);
            return `há ${months} meses`;
        }

        // 1 year or more
        const years = Math.floor(seconds / 31536000);
        return years === 1 ? 'há 1 ano' : `há ${years} anos`;
    }
}