import { Receita, ReceitaEmpresa, ReceitaPagamento } from '@/core/models/entities.model';
import { DashboardService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
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

interface ReceitaRow {
  mes: string;
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
  imports: [
    FormsModule, Select, Button, TableModule, Message, CurrencyPipe, DatePipe,
    Tabs, TabList, Tab, TabPanels, TabPanel, IconField, InputIcon, InputText
  ],
  templateUrl: './receitas.component.html',
  styleUrl: './receitas.component.scss',
})
export class ReceitasComponent {
  private destroyRef = inject(DestroyRef);

  yearOptions: { name: string; value: number }[] = (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 2025; i--) {
      years.push({ name: i.toString(), value: i });
    }
    return years;
  })();

  monthOptions: { name: string; value: number | null }[] = [
    { name: 'Todos', value: null },
    { name: 'Janeiro', value: 1 }, { name: 'Fevereiro', value: 2 }, { name: 'Março', value: 3 },
    { name: 'Abril', value: 4 }, { name: 'Maio', value: 5 }, { name: 'Junho', value: 6 },
    { name: 'Julho', value: 7 }, { name: 'Agosto', value: 8 }, { name: 'Setembro', value: 9 },
    { name: 'Outubro', value: 10 }, { name: 'Novembro', value: 11 }, { name: 'Dezembro', value: 12 },
  ];

  categoriaOptions = [
    { name: 'Todas', value: 'TODAS' },
    { name: 'Comercial', value: 'COMERCIAL' },
    { name: 'Industrial', value: 'INDUSTRIAL' },
  ];

  tipoOptions = [
    { name: 'Todos', value: 'TODOS' },
    { name: 'Cadastro', value: 'CADASTRO' },
    { name: 'Licença', value: 'ATIVIDADE' },
  ];

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
  /** 1 (empresa) + visible value columns + 1 (total) — for the expansion row colspan. */
  get visibleColumnCount(): number {
    const perCategoria = (this.showCadastro ? 1 : 0) + (this.showLicenca ? 1 : 0);
    return 2 + perCategoria * ((this.showComercial ? 1 : 0) + (this.showIndustrial ? 1 : 0)) + 1;
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

  /** Recompute view rows from the raw payments so cells, totals, and footer respect every active filter. */
  applyEmpresaFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    this.empresaRows = this.empresas
      .filter(e => !term || e.nome?.toLowerCase().includes(term) || e.nif?.toLowerCase().includes(term))
      .map(e => {
        const pagamentos = (e.pagamentos ?? []).filter(p =>
          (this.selectedCategoria === 'TODAS' || p.categoria === this.selectedCategoria) &&
          (this.selectedTipo === 'TODOS' || p.tipo === this.selectedTipo)
        );
        const row: EmpresaRow = {
          empresaId: e.empresaId, nome: e.nome, nif: e.nif,
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
    const mappedData = this.rows.map((r) => ({
      'Mês': r.mes,
      'Comercial - Cadastro': r.comercialCadastro,
      'Comercial - Licença': r.comercialAtividade,
      'Industrial - Cadastro': r.industrialCadastro,
      'Industrial - Licença': r.industrialAtividade,
      'Total': r.total,
    }));
    // Append the annual totals footer row.
    mappedData.push({
      'Mês': 'TOTAL',
      'Comercial - Cadastro': this.receita.totalComercialCadastro,
      'Comercial - Licença': this.receita.totalComercialAtividade,
      'Industrial - Cadastro': this.receita.totalIndustrialCadastro,
      'Industrial - Licença': this.receita.totalIndustrialAtividade,
      'Total': this.receita.totalGeral,
    });
    const fileName = `Relatório de Receitas_${this.selectedYear}_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcel(mappedData, fileName);
  }

  /** Two sheets — per-company summary + flat payment rows — both respecting the active filters. */
  exportEmpresasToExcel(): void {
    if (this.empresaRows.length === 0) {
      return;
    }
    const datePipe = new DatePipe('pt-PT');

    const resumo: any[] = this.empresaRows.map(r => ({
      'Empresa': r.nome,
      'NIF': r.nif,
      'Comercial - Cadastro': r.comercialCadastro,
      'Comercial - Licença': r.comercialAtividade,
      'Industrial - Cadastro': r.industrialCadastro,
      'Industrial - Licença': r.industrialAtividade,
      'Total': r.total,
    }));
    resumo.push({
      'Empresa': 'TOTAL', 'NIF': '',
      'Comercial - Cadastro': this.empresaFooter.comercialCadastro,
      'Comercial - Licença': this.empresaFooter.comercialAtividade,
      'Industrial - Cadastro': this.empresaFooter.industrialCadastro,
      'Industrial - Licença': this.empresaFooter.industrialAtividade,
      'Total': this.empresaFooter.total,
    });

    const pagamentos = this.empresaRows.flatMap(r => r.pagamentos.map(p => ({
      'Empresa': r.nome,
      'NIF': r.nif,
      'Fatura': p.faturaId,
      'Data Pagamento': datePipe.transform(p.dataPagamento, 'dd/MM/yyyy'),
      'Categoria': p.categoria === 'INDUSTRIAL' ? 'Industrial' : 'Comercial',
      'Tipo': p.tipo === 'CADASTRO' ? 'Cadastro' : 'Licença',
      'Valor': p.valor,
    })));

    const periodo = this.selectedMonth != null ? `${this.selectedYear}-${this.selectedMonth}` : `${this.selectedYear}`;
    const fileName = `Relatório de Receitas por Empresa_${periodo}_${datePipe.transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcelSheets([
      { name: 'Resumo por empresa', data: resumo },
      { name: 'Pagamentos', data: pagamentos },
    ], fileName);
  }

  private buildRows(receita: Receita): ReceitaRow[] {
    return receita.categories.map((mes, i) => {
      const comercialCadastro = receita.comercialCadastro[i] ?? 0;
      const comercialAtividade = receita.comercialAtividade[i] ?? 0;
      const industrialCadastro = receita.industrialCadastro[i] ?? 0;
      const industrialAtividade = receita.industrialAtividade[i] ?? 0;
      return {
        mes,
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
      this.messages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'Não existem dados disponíveis para o relatório selecionado.' }]);
    } else {
      this.messages.set([]);
    }
  }

  private addEmpresaEmptyMessage(): void {
    if (this.empresaRows.length === 0) {
      this.empresaMessages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'Não existem pagamentos para os filtros selecionados.' }]);
    } else {
      this.empresaMessages.set([]);
    }
  }
}
