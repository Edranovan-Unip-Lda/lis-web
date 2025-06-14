import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusIcon', standalone: true, })
export class StatusIconPipe implements PipeTransform {
    statusIconMap: Record<string, string> = {
        active: 'bi bi-fw bi-shield-check',
        disabled: 'bi bi-fw bi-ban',
        pending: 'bi bi-fw bi-pause-circle',
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
    };

    transform(status: string): Severity {
        return this.statusSeverityMap[status] || 'info';
    }
}