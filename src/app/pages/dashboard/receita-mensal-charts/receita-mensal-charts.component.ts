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
  @Input() title = 'Receita por Mês (Comercial / Industrial → Cadastro / Licença)';

  updateFlag = false;

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receita'] && !changes['receita'].firstChange && this.receita) {
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
          stacking: 'normal',
          borderWidth: 0,
        },
      },
      tooltip: {
        shared: false,
      },
      // Two stacks per month — Comercial and Industrial — each split into Cadastro/Licença.
      series: [
        {
          type: 'column',
          name: 'Comercial · Cadastro',
          stack: 'comercial',
          data: this.receita.comercialCadastro,
          color: documentStyle.getPropertyValue('--primary-color') || '#3B82F6',
        },
        {
          type: 'column',
          name: 'Comercial · Licença',
          stack: 'comercial',
          data: this.receita.comercialAtividade,
          color: '#60A5FA',
        },
        {
          type: 'column',
          name: 'Industrial · Cadastro',
          stack: 'industrial',
          data: this.receita.industrialCadastro,
          color: '#F59E0B',
        },
        {
          type: 'column',
          name: 'Industrial · Licença',
          stack: 'industrial',
          data: this.receita.industrialAtividade,
          color: '#FC6161',
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
