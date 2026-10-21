import { i18nOptions, LanguageService, LocalizedCurrencyPipe, LocalizedDatePipe } from '@/core/i18n';
import { Receita, ReceitaEmpresa, ReceitaPagamento } from '@/core/models/entities.model';
import { DashboardService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslatePipe } from '@ngx-translate/core';

interface ReceitaRow {
  /** 1-12 (the API's month labels are English abbreviations; the label is translated client-side). */
  mes: number;
  comercialCadastro: number;
  comercialAtividade: number;
  industrialCadastro: number;
  industrialAtividade: number;
  total: number;
}

/** Per-company view row: the 4 cells recomputed from the payments that survive the active filters. */
interface EmpresaRow {
  empresaId: number;
  nome: string;
  nif: string;
  sociedadeComercial: string | null;
  comercialCadastro: number;
  comercialAtividade: number;
  industrialCadastro: number;
  industrialAtividade: number;
  total: number;
  pagamentos: ReceitaPagamento[];
}

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [LocalizedCurrencyPipe, LocalizedDatePipe,
    FormsModule, Select, Button, TableModule, Message,
    Tabs, TabList, Tab, TabPanels, TabPanel, IconField, InputIcon, InputText, TranslatePipe
  ],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.scss',
})
export class ReceitasComponent {
  private destroyRef = inject(DestroyRef);
  private i18n = inject(LanguageService);

  yearOptions: { name: string; value: number }[] = (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 2025; i--) {
      years.push({ name: i.toString(), value: i });
    }
    return years;
  })();

  // Option labels resolve on access (i18nOptions), so they follow a language switch.
  monthOptions = i18nOptions<number | null>('reports.receitas.months', [
    { value: null, key: 'all' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1 })),
  ]);

  categoriaOptions = i18nOptions('reports.receitas.categoria', [
    { value: 'TODAS' }, { value: 'COMERCIAL' }, { value: 'INDUSTRIAL' },
  ]);

  tipoOptions = i18nOptions('reports.receitas.tipo', [
    { value: 'TODOS' }, { value: 'CADASTRO' }, { value: 'ATIVIDADE' },
  ]);

  /** Sentinel for companies with no sociedade comercial on record (null can't distinguish "all" from "none"). */
  static readonly SEM_SOCIEDADE = '__SEM_SOCIEDADE__';
  readonly semSociedade = ReceitasComponent.SEM_SOCIEDADE;

  activeTab = 0;
  selectedYear = new Date().getFullYear();

  // --- Tab 1: monthly summary (unchanged behavior) ---
  receita?: Receita;
  rows: ReceitaRow[] = [];
  dataIsFetching = false;
  messages = signal<any[]>([]);

  // --- Tab 2: per-company breakdown ---
  selectedMonth: number | null = null;
  searchTerm = '';
  selectedCategoria: 'TODAS' | 'COMERCIAL' | 'INDUSTRIAL' = 'TODAS';
  selectedTipo: 'TODOS' | 'CADASTRO' | 'ATIVIDADE' = 'TODOS';
  selectedSociedade: string | null = null; // null = todas
  /** Derived from the loaded data — master data isn't fetched separately, only values actually present are offered. */
  sociedadeOptions: { name: string; value: string | null }[] = i18nOptions<string | null>('reports.receitas.sociedade', [{ value: null, key: 'all' }]);
  empresas: ReceitaEmpresa[] = [];
  empresaRows: EmpresaRow[] = [];
  empresasFetching = false;
  empresasLoaded = false;
  empresaMessages = signal<any[]>([]);
  empresaFooter = { comercialCadastro: 0, comercialAtividade: 0, industrialCadastro: 0, industrialAtividade: 0, total: 0 };

  constructor(
    private dashboardService: DashboardService,
    private exportService: ExportService,
  ) { }

  ngOnInit() {
    this.loadReceitas();
  }

  onTabChange(value: string | number) {
    this.activeTab = Number(value);
    if (this.activeTab === 1 && !this.empresasLoaded && !this.empresasFetching) {
      this.loadEmpresas();
    }
  }

  onYearChange() {
    this.loadReceitas();
    this.empresasLoaded = false;
    if (this.activeTab === 1) {
      this.loadEmpresas();
    }
  }

  get showComercial(): boolean {
    return this.selectedCategoria !== 'INDUSTRIAL';
  }
  get showIndustrial(): boolean {
    return this.selectedCategoria !== 'COMERCIAL';
  }
  get showCadastro(): boolean {
    return this.selectedTipo !== 'ATIVIDADE';
  }
  get showLicenca(): boolean {
    return this.selectedTipo !== 'CADASTRO';
  }
  /** 1 (expander) + empresa + sociedade comercial + visible value columns + 1 (total) — for the expansion row colspan. */
  get visibleColumnCount(): number {
    const perCategoria = (this.showCadastro ? 1 : 0) + (this.showLicenca ? 1 : 0);
    return 3 + perCategoria * ((this.showComercial ? 1 : 0) + (this.showIndustrial ? 1 : 0)) + 1;
  }

  loadReceitas() {
    if (!this.selectedYear) {
      return;
    }
    this.dataIsFetching = true;
    this.dashboardService.getReceitas(this.selectedYear)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (receita) => {
          this.receita = receita;
          this.rows = this.buildRows(receita);
          this.dataIsFetching = false;
          this.addEmptyMessage();
        },
        error: (error) => {
          this.dataIsFetching = false;
          this.receita = undefined;
          this.rows = [];
          console.error('Error fetching receitas report:', error);
        },
      });
  }

  loadEmpresas() {
    if (!this.selectedYear) {
      return;
    }
    this.empresasFetching = true;
    this.dashboardService.getReceitasPorEmpresa(this.selectedYear, this.selectedMonth ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (empresas) => {
          this.empresas = empresas ?? [];
          this.empresasLoaded = true;
          this.empresasFetching = false;
          this.buildSociedadeOptions();
          this.applyEmpresaFilters();
        },
        error: (error) => {
          this.empresasFetching = false;
          this.empresas = [];
          this.empresaRows = [];
          console.error('Error fetching receitas por empresa:', error);
        },
      });
  }

  onMonthChange() {
    // Month narrows the server query so summary and payments stay consistent with the period.
    this.loadEmpresas();
  }

  /**
   * Build the sociedade comercial options from the loaded companies (distinct, alphabetical), plus an entry for
   * companies with none. Clears a selection that no longer exists in the new period's data.
   */
  private buildSociedadeOptions(): void {
    const nomes = [...new Set(
      this.empresas.map(e => e.sociedadeComercial).filter((s): s is string => !!s && s.trim().length > 0)
    )].sort((a, b) => a.localeCompare(b, 'pt'));

    const options: { name: string; value: string | null }[] = i18nOptions<string | null>('reports.receitas.sociedade', [{ value: null, key: 'all' }]);
    options.push(...nomes.map(n => ({ name: n, value: n })));
    if (this.empresas.some(e => !e.sociedadeComercial || e.sociedadeComercial.trim().length === 0)) {
      options.push(...i18nOptions<string | null>('reports.receitas.sociedade', [{ value: this.semSociedade, key: 'none' }]));
    }
    this.sociedadeOptions = options;

    if (this.selectedSociedade != null && !options.some(o => o.value === this.selectedSociedade)) {
      this.selectedSociedade = null;
    }
  }

  private matchesSociedade(e: ReceitaEmpresa): boolean {
    if (this.selectedSociedade == null) return true;
    const has = !!e.sociedadeComercial && e.sociedadeComercial.trim().length > 0;
    return this.selectedSociedade === this.semSociedade ? !has : e.sociedadeComercial === this.selectedSociedade;
  }

  /** Recompute view rows from the raw payments so cells, totals, and footer respect every active filter. */
  applyEmpresaFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    this.empresaRows = this.empresas
      .filter(e => !term || e.nome?.toLowerCase().includes(term) || e.nif?.toLowerCase().includes(term)
        || e.sociedadeComercial?.toLowerCase().includes(term))
      .filter(e => this.matchesSociedade(e))
      .map(e => {
        const pagamentos = (e.pagamentos ?? []).filter(p =>
          (this.selectedCategoria === 'TODAS' || p.categoria === this.selectedCategoria) &&
          (this.selectedTipo === 'TODOS' || p.tipo === this.selectedTipo)
        );
        const row: EmpresaRow = {
          empresaId: e.empresaId, nome: e.nome, nif: e.nif, sociedadeComercial: e.sociedadeComercial,
          comercialCadastro: 0, comercialAtividade: 0, industrialCadastro: 0, industrialAtividade: 0,
          total: 0, pagamentos,
        };
        for (const p of pagamentos) {
          const industrial = p.categoria === 'INDUSTRIAL';
          const cadastro = p.tipo === 'CADASTRO';
          if (industrial) {
            if (cadastro) row.industrialCadastro += p.valor; else row.industrialAtividade += p.valor;
          } else {
            if (cadastro) row.comercialCadastro += p.valor; else row.comercialAtividade += p.valor;
          }
          row.total += p.valor;
        }
        return row;
      })
      .filter(r => r.pagamentos.length > 0);

    this.empresaFooter = this.empresaRows.reduce((acc, r) => ({
      comercialCadastro: acc.comercialCadastro + r.comercialCadastro,
      comercialAtividade: acc.comercialAtividade + r.comercialAtividade,
      industrialCadastro: acc.industrialCadastro + r.industrialCadastro,
      industrialAtividade: acc.industrialAtividade + r.industrialAtividade,
      total: acc.total + r.total,
    }), { comercialCadastro: 0, comercialAtividade: 0, industrialCadastro: 0, industrialAtividade: 0, total: 0 });

    this.addEmpresaEmptyMessage();
  }

  exportToExcel(): void {
    if (!this.receita) {
      return;
    }
    const h = this.exportHeaders();
    const mappedData: any[] = this.rows.map((r) => ({
      [h.mes]: this.monthLabel(r.mes),
      [h.comCad]: r.comercialCadastro,
      [h.comAtv]: r.comercialAtividade,
      [h.indCad]: r.industrialCadastro,
      [h.indAtv]: r.industrialAtividade,
      [h.total]: r.total,
    }));
    // Append the annual totals footer row.
    mappedData.push({
      [h.mes]: h.totalUpper,
      [h.comCad]: this.receita.totalComercialCadastro,
      [h.comAtv]: this.receita.totalComercialAtividade,
      [h.indCad]: this.receita.totalIndustrialCadastro,
      [h.indAtv]: this.receita.totalIndustrialAtividade,
      [h.total]: this.receita.totalGeral,
    });
    const fileName = `${this.i18n.instant('reports.receitas.fileName')}_${this.selectedYear}_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcel(mappedData, fileName);
  }

  /** Two sheets — per-company summary + flat payment rows — both respecting the active filters. */
  exportEmpresasToExcel(): void {
    if (this.empresaRows.length === 0) {
      return;
    }
    const datePipe = new DatePipe('pt-PT');
    const h = this.exportHeaders();

    const resumo: any[] = this.empresaRows.map(r => ({
      [h.empresa]: r.nome,
      'NIF': r.nif,
      [h.sociedade]: r.sociedadeComercial ?? '',
      [h.comCad]: r.comercialCadastro,
      [h.comAtv]: r.comercialAtividade,
      [h.indCad]: r.industrialCadastro,
      [h.indAtv]: r.industrialAtividade,
      [h.total]: r.total,
    }));
    resumo.push({
      [h.empresa]: h.totalUpper, 'NIF': '', [h.sociedade]: '',
      [h.comCad]: this.empresaFooter.comercialCadastro,
      [h.comAtv]: this.empresaFooter.comercialAtividade,
      [h.indCad]: this.empresaFooter.industrialCadastro,
      [h.indAtv]: this.empresaFooter.industrialAtividade,
      [h.total]: this.empresaFooter.total,
    });

    const pagamentos = this.empresaRows.flatMap(r => r.pagamentos.map(p => ({
      [h.empresa]: r.nome,
      'NIF': r.nif,
      [h.sociedade]: r.sociedadeComercial ?? '',
      [h.fatura]: p.faturaId,
      [h.dataPagamento]: datePipe.transform(p.dataPagamento, 'dd/MM/yyyy'),
      [h.categoria]: p.categoria === 'INDUSTRIAL' ? h.industrial : h.comercial,
      [h.tipo]: p.tipo === 'CADASTRO' ? h.cadastro : h.licenca,
      [h.valor]: p.valor,
    })));

    const periodo = this.selectedMonth != null ? `${this.selectedYear}-${this.selectedMonth}` : `${this.selectedYear}`;
    const fileName = `${this.i18n.instant('reports.receitas.fileNameEmpresa')}_${periodo}_${datePipe.transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcelSheets([
      { name: this.i18n.instant('reports.receitas.sheetResumo'), data: resumo },
      { name: this.i18n.instant('reports.receitas.sheetPagamentos'), data: pagamentos },
    ], fileName);
  }

  monthLabel(mes: number): string {
    return this.i18n.instant(`reports.receitas.months.${mes}`);
  }

  /** Column headers for the Excel exports, resolved in the current language at export time. */
  private exportHeaders() {
    const t = (key: string) => this.i18n.instant(key);
    const comercial = t('reports.receitas.categoria.COMERCIAL');
    const industrial = t('reports.receitas.categoria.INDUSTRIAL');
    const cadastro = t('reports.receitas.cadastro');
    const licenca = t('reports.receitas.licenca');
    return {
      comercial, industrial, cadastro, licenca,
      mes: t('reports.receitas.mes'),
      empresa: t('reports.common.empresa'),
      sociedade: t('reports.common.sociedadeComercial'),
      comCad: `${comercial} - ${cadastro}`,
      comAtv: `${comercial} - ${licenca}`,
      indCad: `${industrial} - ${cadastro}`,
      indAtv: `${industrial} - ${licenca}`,
      total: t('reports.receitas.total'),
      totalUpper: t('reports.receitas.totalUpper'),
      fatura: t('reports.receitas.fatura'),
      dataPagamento: t('reports.receitas.dataPagamento'),
      categoria: t('reports.common.categoria'),
      tipo: t('reports.common.tipo'),
      valor: t('reports.receitas.valor'),
    };
  }

  private buildRows(receita: Receita): ReceitaRow[] {
    return receita.categories.map((_, i) => {
      const comercialCadastro = receita.comercialCadastro[i] ?? 0;
      const comercialAtividade = receita.comercialAtividade[i] ?? 0;
      const industrialCadastro = receita.industrialCadastro[i] ?? 0;
      const industrialAtividade = receita.industrialAtividade[i] ?? 0;
      return {
        mes: i + 1,
        comercialCadastro,
        comercialAtividade,
        industrialCadastro,
        industrialAtividade,
        total: comercialCadastro + comercialAtividade + industrialCadastro + industrialAtividade,
      };
    });
  }

  private addEmptyMessage(): void {
    if (this.rows.length === 0) {
      this.messages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'reports.common.noData' }]);
    } else {
      this.messages.set([]);
    }
  }

  private addEmpresaEmptyMessage(): void {
    if (this.empresaRows.length === 0) {
      this.empresaMessages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'reports.receitas.noPayments' }]);
    } else {
      this.empresaMessages.set([]);
    }
  }
}
