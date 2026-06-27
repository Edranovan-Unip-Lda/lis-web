import { BarChartDto, CategoryDistributionDto } from '@/core/models/entities.model';
import { randomColors } from '@/core/utils/global-function';
import { Component, Input, SimpleChanges } from '@angular/core';
import type * as Highcharts from 'highcharts';
import { HighchartsChartComponent, } from 'highcharts-angular';

@Component({
  standalone: true,
  selector: 'app-certificado-licenca-estado',
  imports: [HighchartsChartComponent],
  templateUrl: './certificado-licenca-estado.component.html',
  styleUrl: './certificado-licenca-estado.component.scss'
})
export class CertificadoLicencaEstadoComponent {
  chartOptions!: Highcharts.Options;
  updateFlag = false;
  @Input() data!: BarChartDto;
  @Input() title!: string;

  ngOnInit() {
    this.updateChart();
  }

  // Without this the chart is built once and never reacts to the year-filter changing `data`
  // (the highcharts-angular directive only re-applies options when [update] is toggled).
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange && this.data) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.updateFlag = false;
    this.initChart();
    setTimeout(() => this.updateFlag = true, 0);
  }

  initChart() {
    this.chartOptions = {
      colors: ['#34c38f', '#f46a6a'],
      chart: {
        type: 'line',
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
        categories: ['Aileu', 'Ainaro', 'Atauro', 'Baucau', 'Bobonaro', 'Cova Lima', 'Dili', 'Ermera', 'Lautem', 'Liquiça', 'Manatuto', 'Manufahi', 'Oecusse', 'Viqueque'],
        crosshair: true,
        accessibility: {
          description: 'Meses'
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
          text: 'Total Credit'
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
      series: this.data.series as any,
    };
  }
}
