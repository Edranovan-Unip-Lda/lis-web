import { MapDataDto, MapDataPointDto } from '@/core/models/entities.model';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { HighchartsChartComponent, providePartialHighcharts } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highmaps';


@Component({
  selector: 'app-empresa-map',
  imports: [HighchartsChartComponent],
  templateUrl: './empresa-map.component.html',
  styleUrl: './empresa-map.component.scss',
  providers: [providePartialHighcharts({ modules: () => [import('highcharts/esm/modules/map')] })],
})
export class EmpresaMapComponent {
  title = 'Empresas Registadas no Sistema — Distribuição Geográfica';
  @Input() data!: MapDataDto;
  @Output() municipioSelected = new EventEmitter<any>();
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title: { text: 'Loading map…' },
    series: []
  };

  private readonly sociedadeComercial = 'empresas_sociedade_comercial';
  private readonly tipoEmpresa = 'empresas_tipo_empresa';


  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.http.get<any>('/maps/tl-all.topo.json').subscribe((topology) => {
      this.chartOptions = {
        chart: {
          map: topology as any,
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
          pointFormat: '<b>{point.name}</b><br/>Value: <b>{point.value}</b>'
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
              click: (event) => this.municipioSelected.emit(event.point.name)
            }
          },
          data: this.convertToMapSeries(this.data.data),
          name: 'Número de Empresas',
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
    });
  }

  // Convert backend data to Highcharts map format
  convertToMapSeries(mapData: MapDataPointDto[]): any[] {
    return mapData.map(point => ({
      'hc-key': point.code,
      name: point.name,
      value: point.value,
      code: point.code
    }));
  }

}
