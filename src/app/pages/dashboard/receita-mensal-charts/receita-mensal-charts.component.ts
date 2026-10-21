import { LanguageService, LocalizedCurrencyPipe } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { chartLang, monthNames, onLangChange } from '../chart-i18n';
import { Receita } from '@/core/models/entities.model';

import { Component, inject, Input, SimpleChanges } from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';

@Component({
  standalone: true,
  selector: 'app-receita-mensal-charts',
  imports: [LocalizedCurrencyPipe, HighchartsChartComponent, TranslatePipe],
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
  private i18n = inject(LanguageService);

  constructor() {
    onLangChange(this.i18n, () => this.updateChart());
  }

  get isIndustrial(): boolean {
    return this.categoria === 'INDUSTRIAL';
  }

  get resolvedTitle(): string {
    return this.title ?? this.i18n.instant(this.isIndustrial ? 'dashboard.receita.titleIndustrial' : 'dashboard.receita.titleComercial');
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
      lang: chartLang(this.i18n),
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
        // API sends English short month names; the series are always Jan..Dec, so use the active locale's
        categories: this.receita.categories?.length === 12 ? monthNames(this.i18n, 'MMM') : this.receita.categories,
        crosshair: true,
        accessibility: {
          description: this.i18n.instant('dashboard.chart.months'),
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
          name: this.i18n.instant('dashboard.receita.cadastro'),
          data: this.isIndustrial ? this.receita.industrialCadastro : this.receita.comercialCadastro,
          color: this.isIndustrial ? '#F59E0B' : (documentStyle.getPropertyValue('--primary-color') || '#3B82F6'),
        },
        {
          type: 'column',
          name: this.i18n.instant('dashboard.receita.licenca'),
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
