import { MapDataDto, MapDataPointDto } from '@/core/models/entities.model';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LanguageService } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { chartLang, onLangChange } from '../chart-i18n';

import { HighchartsChartComponent, providePartialHighcharts } from 'highcharts-angular';
import type * as Highcharts from 'highcharts';


@Component({
  selector: 'app-empresa-map',
  imports: [HighchartsChartComponent, TranslatePipe],
  templateUrl: './empresa-map.component.html',
  styleUrl: './empresa-map.component.scss',
  providers: [providePartialHighcharts({ modules: () => [import('highcharts/esm/modules/map')] })],
})
export class EmpresaMapComponent {
  @Input() data!: MapDataDto;
  @Output() municipioSelected = new EventEmitter<number>();
  // Left undefined until the topology + data are both ready. The highcharts-angular directive builds
  // the chart exactly once (~500ms after the element mounts) and does NOT react to a later options
  // change unless [update] is toggled — so we keep the <highcharts-chart> out of the DOM (@if in the
  // template) until options are complete, guaranteeing the map is created in one shot with topology + data.
  chartOptions?: Highcharts.Options;
  // Toggled to push rebuilt (re-translated) options into the already-created map
  updateFlag = false;
  private topology?: any;
  private i18n = inject(LanguageService);

  private readonly sociedadeComercial = 'empresas_sociedade_comercial';
  private readonly tipoEmpresa = 'empresas_tipo_empresa';


  constructor(
    private http: HttpClient,
  ) {
    onLangChange(this.i18n, () => {
      if (!this.topology) return;
      this.updateFlag = false;
      this.buildOptions();
      setTimeout(() => this.updateFlag = true, 0);
    });
  }

  ngOnInit(): void {
    this.http.get<any>('/maps/tl-all.topo.json').subscribe({
      error: (err) => console.error('Failed to load map topology', err),
      next: (topology) => {
        this.topology = topology;
        this.buildOptions();
      }
    });
  }

  private buildOptions(): void {
    this.chartOptions = {
      lang: chartLang(this.i18n),
      chart: {
        map: this.topology,
        backgroundColor: 'transparent',
      },
      title: {
        text: ''
      },
      credits: { enabled: false },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: 'bottom',
          theme: {
            fill: '#111827',
            stroke: '#374151',
            'stroke-width': 1,
            style: { color: '#E5E7EB' },
            states: {
              hover: { fill: '#1F2937', style: { color: '#FFFFFF' } },
              select: { fill: '#0B1220', style: { color: '#FFFFFF' } }
            }
          }
        }
      },

      legend: {
        enabled: true,
        backgroundColor: 'transparent',
        itemStyle: { color: '#D1D5DB' },
        itemHoverStyle: { color: '#FFFFFF' }
      },

      colorAxis: {
        min: 0,
        // Elegant dark-mode ramp
        stops: [
          [0.0, '#0B1220'], // very dark
          [0.5, '#1F2A44'], // muted mid
          [1.0, '#60A5FA']  // soft accent
        ],
        labels: { style: { color: '#9CA3AF' } }
      },

      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.95)',
        borderColor: '#374151',
        style: { color: '#E5E7EB' },
        pointFormat: `<b>{point.name}</b><br/>${this.i18n.instant('dashboard.map.value')}: <b>{point.value}</b>`
      },

      plotOptions: {
        series: {
          cursor: 'pointer',
          borderColor: '#374151',
          borderWidth: 1,
          allowPointSelect: true,
          states: {
            select: {
              color: '#ff9800'
            }
          }
        },
        map: {
          states: {
            hover: {
              borderColor: '#93C5FD',
              borderWidth: 1,
              color: '#2B3B63'
            }
          }
        }
      },

      series: [{
        type: 'map',
        point: {
          events: {
            // Emit the id, not the label — labels differ from master-data names (e.g. Oecusse vs "Oecusse - RAEOA").
            click: (event) => this.municipioSelected.emit((event.point.options as any).municipioId)
          }
        },
        data: this.convertToMapSeries(this.data.data),
        name: this.i18n.instant('dashboard.map.seriesName'),
        states: { hover: { color: '#BADA55' } },
        dataLabels: {
          enabled: true,
          format: '{point.name} - {point.value}',
          style: {
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '700'
          }
        }
      }]
    };
  }

  // Convert backend data to Highcharts map format
  convertToMapSeries(mapData: MapDataPointDto[]): any[] {
    return mapData.map(point => ({
      'hc-key': point.code,
      municipioId: point.municipioId,
      name: point.name,
      value: point.value,
      code: point.code
    }));
  }

}
