import { Receita } from '@/core/models/entities.model';
import { DashboardService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';

interface ReceitaRow {
  mes: string;
  comercialCadastro: number;
  comercialAtividade: number;
  industrialCadastro: number;
  industrialAtividade: number;
  total: number;
}

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [FormsModule, Select, Button, TableModule, Message, CurrencyPipe],
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

  selectedYear = new Date().getFullYear();
  receita?: Receita;
  rows: ReceitaRow[] = [];
  dataIsFetching = false;
  messages = signal<any[]>([]);

  constructor(
    private dashboardService: DashboardService,
    private exportService: ExportService,
  ) { }

  ngOnInit() {
    this.loadReceitas();
  }

  onYearChange() {
    this.loadReceitas();
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
}
