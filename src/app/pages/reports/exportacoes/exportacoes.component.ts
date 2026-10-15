import { LocalizedDatePipe, LocalizedNumberPipe } from '@/core/i18n';
import { Exportacao, ExportacaoService, ExportacaoStatus } from '@/core/services/exportacao.service';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Paginator } from 'primeng/paginator';
import { ProgressBar } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { EMPTY, Subject, timer } from 'rxjs';
import { catchError, startWith, switchMap, takeWhile } from 'rxjs/operators';

const POLL_MS = 3000;
const ACTIVE: ExportacaoStatus[] = ['QUEUED', 'RUNNING'];
const SEVERITY: Record<ExportacaoStatus, 'secondary' | 'info' | 'success' | 'danger' | 'warn'> = {
  QUEUED: 'secondary', RUNNING: 'info', COMPLETED: 'success', FAILED: 'danger', EXPIRED: 'warn'
};
// Filter fields summarized by name; anything else non-empty is folded into a "+N" chip.
const DATE_RANGES = [['dataEmissaoFrom', 'dataEmissaoTo', 'reports.licencasCertificados.periodoEmissao'],
                     ['dataValidadeFrom', 'dataValidadeTo', 'reports.licencasCertificados.periodoValidade']] as const;

@Component({
  selector: 'app-exportacoes',
  imports: [LocalizedDatePipe, LocalizedNumberPipe, TableModule, Paginator, Tag, ProgressBar, Button, Tooltip, Message, TranslatePipe],
  templateUrl: './exportacoes.component.html',
})
export class ExportacoesComponent implements OnInit {
  private exportacaoService = inject(ExportacaoService);
  private destroyRef = inject(DestroyRef);
  private refresh$ = new Subject<void>();

  jobs = signal<Exportacao[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  page = 0;
  size = 20;

  ngOnInit(): void {
    // Poll while any visible job is queued/running; the inclusive takeWhile emits the final (settled) state and
    // stops. A page change or retry restarts the cycle through refresh$.
    this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => timer(0, POLL_MS).pipe(
        switchMap(() => this.exportacaoService.listMine(this.page, this.size).pipe(
          catchError(err => {
            console.error('Error loading exports:', err);
            this.loading.set(false);
            return EMPTY;
          }))),
        takeWhile(res => (res?.content ?? []).some((j: Exportacao) => ACTIVE.includes(j.status)), true))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: res => {
        this.jobs.set(res?.content ?? []);
        this.totalRecords.set(res?.totalElements ?? 0);
        this.loading.set(false);
      },
      error: err => console.error('Export polling stopped:', err)
    });
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.size = event.rows;
    this.loading.set(true);
    this.refresh$.next();
  }

  refresh(): void {
    this.refresh$.next();
  }

  isActive(job: Exportacao): boolean {
    return ACTIVE.includes(job.status);
  }

  severity(status: ExportacaoStatus) {
    return SEVERITY[status];
  }

  percent(job: Exportacao): number {
    return job.total > 0 ? Math.floor((job.processed / job.total) * 100) : 0;
  }

  downloadUrl(job: Exportacao): string {
    return this.exportacaoService.downloadUrl(job.id);
  }

  sizeMb(bytes: number | null): number {
    return (bytes ?? 0) / (1024 * 1024);
  }

  /** Chips for the filter: categoria, date ranges, then a count of the remaining non-empty fields. */
  filterSummary(filtro: Record<string, any> | null): { key: string; value?: string; params?: any }[] {
    const f = filtro ?? {};
    const chips: { key: string; value?: string; params?: any }[] = [];
    const used = new Set<string>(['categoria']);
    if (f['categoria']) chips.push({ key: 'enum.Categoria.' + f['categoria'] });
    for (const [from, to, label] of DATE_RANGES) {
      used.add(from).add(to);
      if (f[from] || f[to]) chips.push({ key: label, value: `${f[from] ?? '…'} → ${f[to] ?? '…'}` });
    }
    const others = Object.entries(f).filter(([k, v]) => !used.has(k) && v != null && v !== '').length;
    if (others > 0) chips.push({ key: 'reports.exportacoes.moreFilters', params: { n: others } });
    return chips;
  }
}
