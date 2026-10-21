import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import type * as Highcharts from 'highcharts';
import { CategoryDistributionDto } from '@/core/models/entities.model';
import { randomColors } from '@/core/utils/global-function';
import { LanguageService } from '@/core/i18n';
import { onLangChange, seriesLabel } from '../chart-i18n';

@Component({
  standalone: true,
  selector: 'app-certificado-licenca-municipio-pie',
  imports: [HighchartsChartComponent],
  templateUrl: './certificado-licenca-municipio-pie.component.html',
  styleUrl: './certificado-licenca-municipio-pie.component.scss'
})
export class CertificadoLicencaMunicipioPieComponent implements OnChanges {
  chartOptions!: Highcharts.Options;
  updateFlag: boolean = false;
  @Input() data!: CategoryDistributionDto;
  @Input() title!: string;
  @Input() chartType!: string;
  itemColors: string[] = [];
  chartColors: string[] = [];
  municipioColors = randomColors;
  private i18n = inject(LanguageService);

  constructor() {
    onLangChange(this.i18n, () => this.data && this.updateChart());
  }

  label(name: string): string {
    return seriesLabel(this.i18n, name);
  }

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // title is a translated string from the parent, so it changes on a language switch
    const changed = ['data', 'title'].some((k) => changes[k] && !changes[k].firstChange);
    if (changed && this.data) {
      this.updateChart();
    }
  }

  initChart() {
    this.chartOptions = {
      colors: this.chartColors,
      title: {
        text: '',
        style: {
          color: '#212529',
        }
      },
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
      },
      legend: {
        enabled: true,
        // Define default style for each legend item.
        itemStyle: {
          color: '#e5e7eb',  // Text color for the legend
          fontWeight: 'bold',
          fontSize: '10px'
        },
        // Define style when hovering over a legend item.
        itemHoverStyle: {
          color: '#60a5fa'
        }
      },
      plotOptions: {
        pie: {
          innerSize: '10%',
          borderRadius: 8,
          borderWidth: 0.5,
          showInLegend: true,
        },
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: [
            {
              enabled: true,
              format: '{point.name} <br> {point.y}',
              style: {
                fontSize: '1.0em',
                textOutline: 'none',
                opacity: 0.7,
                color: '#ffffff'
              },
            }
          ],
          showInLegend: true,
        },
      },
      series: [
        {
          type: 'pie',
          name: this.title,
          // Translate display names only; colors are keyed by the raw API name (generateColors)
          data: this.data.series.map((p) => ({ ...p, name: this.label(p.name) }))
        },
      ]
    }
  }

  private updateChart(): void {
    this.updateFlag = false;
    this.chartColors = [];
    this.itemColors = [];
    this.generateColors();
    this.initChart();

    // Toggle updateFlag to trigger Highcharts update
    setTimeout(() => this.updateFlag = true, 0);
  }

  private generateColors() {
    // Default color for unknown municipios
    const defaultColor = { bg: 'rgb(107, 114, 128)', shadow: 'rgba(107, 114, 128, 0.3)' }; // gray-500

    this.data.series.forEach((item) => {
      const colorSet = this.municipioColors[item.name] || defaultColor;
      this.chartColors.push(colorSet.bg);
      this.itemColors.push(`background-color: ${colorSet.bg}; box-shadow: 0px 0px 10px ${colorSet.shadow}`);
    });
  }
}
