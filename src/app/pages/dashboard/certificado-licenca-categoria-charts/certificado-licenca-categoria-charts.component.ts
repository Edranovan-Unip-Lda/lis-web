import { LicensesPerMonthDto } from '@/core/models/entities.model';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { LanguageService } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { chartLang, monthNames, onLangChange, seriesLabel } from '../chart-i18n';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent, } from 'highcharts-angular';

@Component({
  standalone: true,
  selector: 'app-certificado-licenca-categoria-charts',
  imports: [HighchartsChartComponent, TranslatePipe],
  templateUrl: './certificado-licenca-categoria-charts.component.html',
  styleUrl: './certificado-licenca-categoria-charts.component.scss',
})
export class CertificadoLicencaCategoriaChartsComponent {
  chartOptions!: Highcharts.Options;
  @Input() licensesPerMonth!: LicensesPerMonthDto;
  @Input() title!: string;

  totalComercial = 0;
  totalIndustrial = 0;
  updateFlag: boolean = false;
  private i18n = inject(LanguageService);

  constructor() {
    onLangChange(this.i18n, () => this.licensesPerMonth && this.updateChart());
  }

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['licensesPerMonth'] && !changes['licensesPerMonth'].firstChange && this.licensesPerMonth) {
      this.updateChart();
    }
  }

  initChart() {
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
        // Define default style for each legend item.
        itemStyle: {
          color: '#e5e7eb',  // Text color for the legend
          fontWeight: 'bold',
          fontSize: '14px',
        },
        itemHoverStyle: {
          color: '#60a5fa'
        }
      },
      xAxis: {
        categories: monthNames(this.i18n, 'MMMM'),
        crosshair: true,
        accessibility: {
          description: this.i18n.instant('dashboard.chart.months')
        },
        labels: {
          style: {
            color: '#9ca3af'
          }
        },
        lineColor: '#334155',
        tickColor: '#334155'
      },
      yAxis: {
        gridLineColor: '#1e293b',
        min: 0,
        title: {
          text: this.i18n.instant('dashboard.chart.total')
        },
        labels: {
          style: {
            color: '#9ca3af'
          }
        }
      },
      exporting: {
        enabled: true,
        chartOptions: {
          chart: {
            backgroundColor: 'transparent'
          }
        },
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen', 'separator', 'downloadPNG',
              'downloadSVG', 'downloadPDF', 'separator', 'downloadXLS'
            ]
          }
        },
        showExportInProgress: true,
      },
      navigation: {
        buttonOptions: {
          align: 'right',
          verticalAlign: 'top',
          y: 0
        },
      },
      plotOptions: {
        column: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            color: '#e5e7eb'
          }
        },
        line: {
          dataLabels: {
            enabled: true,
            color: '#e5e7eb'
          },
          marker: {
            enabled: true,
            radius: 4
          }
        }
      },
      // Display names translated on a copy; updateChart() matches the raw API names
      series: this.licensesPerMonth.series.map((s) => ({ ...s, name: seriesLabel(this.i18n, s.name) })) as Highcharts.SeriesOptionsType[]

    };
  }

  private updateChart() {
    const documentStyle = getComputedStyle(document.documentElement);

    if (this.licensesPerMonth) {
      this.licensesPerMonth.series.forEach((s) => {
        switch (s.name) {
          case 'Comercial':
            s.type = 'line';
            s.color = '#FC6161';
            this.totalComercial = s.data.reduce((a, b) => (a as number) + (b as number), 0);
            break;
          case 'Industrial':
            s.type = 'column';
            s.color = documentStyle.getPropertyValue('--primary-color');
            this.totalIndustrial = s.data.reduce((a, b) => (a as number) + (b as number), 0);
            break;
        }
      });
    }

    this.updateFlag = false;
    this.initChart();
    // Toggle updateFlag to trigger Highcharts update
    setTimeout(() => this.updateFlag = true, 0);
  }
}
