import { Receita } from '@/core/models/entities.model';
import { CurrencyPipe } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';

@Component({
  standalone: true,
  selector: 'app-receita-mensal-charts',
  imports: [HighchartsChartComponent, CurrencyPipe],
  templateUrl: './receita-mensal-charts.component.html',
  styleUrl: './receita-mensal-charts.component.scss',
})
export class ReceitaMensalChartsComponent {
  chartOptions!: Highcharts.Options;
  @Input() receita!: Receita;
  /** Which category this chart shows: a dedicated Comercial or Industrial breakdown (Cadastro vs Licença). */
  @Input() categoria: 'COMERCIAL' | 'INDUSTRIAL' = 'COMERCIAL';
  @Input() title?: string;

  updateFlag = false;

  get isIndustrial(): boolean {
    return this.categoria === 'INDUSTRIAL';
  }

  get resolvedTitle(): string {
    return this.title ?? `Receita ${this.isIndustrial ? 'Industrial' : 'Comercial'} por Mês (Cadastro vs Licença)`;
  }

  /** Category-scoped annual totals for the KPI row. */
  get totalCadastro(): number {
    return this.isIndustrial ? this.receita.totalIndustrialCadastro : this.receita.totalComercialCadastro;
  }
  get totalLicenca(): number {
    return this.isIndustrial ? this.receita.totalIndustrialAtividade : this.receita.totalComercialAtividade;
  }
  get totalCategoria(): number {
    return this.isIndustrial ? this.receita.totalIndustrial : this.receita.totalComercial;
  }

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['receita'] || changes['categoria']) && this.receita) {
      this.updateChart();
    }
  }

  private initChart() {
    const documentStyle = getComputedStyle(document.documentElement);

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      credits: { enabled: false },
      legend: {
        itemStyle: {
          color: '#e5e7eb',
          fontWeight: 'bold',
          fontSize: '14px',
        },
        itemHoverStyle: {
          color: '#60a5fa',
        },
      },
      xAxis: {
        categories: this.receita.categories,
        crosshair: true,
        accessibility: {
          description: 'Meses',
        },
        labels: {
          style: {
            color: '#9ca3af',
          },
        },
        lineColor: '#334155',
        tickColor: '#334155',
      },
      yAxis: {
        gridLineColor: '#1e293b',
        min: 0,
        title: {
          text: 'Total',
        },
        labels: {
          style: {
            color: '#9ca3af',
          },
        },
      },
      exporting: {
        enabled: true,
        chartOptions: {
          chart: {
            backgroundColor: 'transparent',
          },
        },
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen', 'separator', 'downloadPNG',
              'downloadSVG', 'downloadPDF', 'separator', 'downloadXLS'
            ],
          },
        },
        showExportInProgress: true,
      },
      navigation: {
        buttonOptions: {
          align: 'right',
          verticalAlign: 'top',
          y: 0,
        },
      },
      plotOptions: {
        column: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            color: '#e5e7eb',
          },
        },
      },
      // Two grouped columns per month — Cadastro and Licença — for this chart's category.
      series: [
        {
          type: 'column',
          name: 'Cadastro',
          data: this.isIndustrial ? this.receita.industrialCadastro : this.receita.comercialCadastro,
          color: this.isIndustrial ? '#F59E0B' : (documentStyle.getPropertyValue('--primary-color') || '#3B82F6'),
        },
        {
          type: 'column',
          name: 'Licença',
          data: this.isIndustrial ? this.receita.industrialAtividade : this.receita.comercialAtividade,
          color: this.isIndustrial ? '#FC6161' : '#60A5FA',
        },
      ] as Highcharts.SeriesOptionsType[],
    };
  }

  private updateChart() {
    if (!this.receita) {
      return;
    }
    this.updateFlag = false;
    this.initChart();
    // Toggle updateFlag to trigger Highcharts update (known blank/stale-render gotcha)
    setTimeout(() => this.updateFlag = true, 0);
  }
}
