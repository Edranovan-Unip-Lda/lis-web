import { LicensesPerMonthDto } from '@/core/models/entities.model';
import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartComponent, } from 'highcharts-angular';

@Component({
  standalone: true,
  selector: 'app-certificado-licenca-categoria-charts',
  imports: [HighchartsChartComponent],
  templateUrl: './certificado-licenca-categoria-charts.component.html',
  styleUrl: './certificado-licenca-categoria-charts.component.scss',
})
export class CertificadoLicencaCategoriaChartsComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions!: Highcharts.Options;
  @Input() licensesPerMonth!: LicensesPerMonthDto;
  @Input() title!: string;

  totalComercial = 0;
  totalIndustrial = 0;

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    if (this.licensesPerMonth) {
      this.licensesPerMonth.series.map((s) => {
        switch (s.name) {
          case 'Comercial':
            s.type = 'line';
            s.color = '#FC6161'
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

    this.initChart();
  }

  initChart() {
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
        categories: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
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
      series: this.licensesPerMonth.series as Highcharts.SeriesOptionsType[]

    };
  }

}
