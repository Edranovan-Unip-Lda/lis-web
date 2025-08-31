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