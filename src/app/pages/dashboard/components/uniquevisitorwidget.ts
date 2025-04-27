import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SelectModule} from 'primeng/select';
import {ChartModule} from 'primeng/chart';
import {LayoutService} from '@/layout/service/layout.service';
import {debounceTime, Subscription} from 'rxjs';

@Component({
    selector: 'unique-visitor-widget',
    standalone: true,
    imports: [FormsModule, SelectModule, ChartModule],
    template: `<div class="card widget-visitor-graph">
        <div class="card-header leading-loose">
            <span>Unique Visitor Graph</span>
            <p-select [options]="visitorYear" [(ngModel)]="selectedVisitorYear" optionLabel="name" (onChange)="changeVisitorChart($event); visitor.refresh()"></p-select>
        </div>

        <div class="graph-content grid grid-cols-12 gap-4 mt-6">
            <div class="col-span-12 md:col-span-6">
                <div class="text-3xl font-semibold">{{ growth }}</div>
                <div class="font-semibold my-4">MRR GROWTH</div>
                <p class="text-surface-500 dark:text-surface-400">
                    Measure how fast you’re growing mothly recurring revenue.
                    <a href="#" class="text-primary hover:text-primary-400 duration-200">Learn more</a>
                </p>
            </div>
            <div class="col-span-12 md:col-span-6">
                <div class="text-3xl font-semibold">{{ avgCustomer }}</div>
                <div class="font-semibold my-4">AVG. MRR/CUSTOMER</div>
                <p class="text-surface-500 dark:text-surface-400">
                    The revenue generated per account on a monthly or yearly basis.
                    <a href="#" class="text-primary hover:text-primary-400 duration-200">Learn more</a>
                </p>
            </div>
        </div>

        <div class="graph">
            <div class="text-xl font-semibold mt-6">Revenue</div>

            <p-chart #visitor type="bar" height="380" [data]="visitorChart" [options]="visitorChartOptions" id="visitor-chart"></p-chart>
        </div>
    </div>`
})
export class UniqueVisitorWidget implements OnInit, OnDestroy{
    layoutService = inject(LayoutService);

    growth = '$620,076';

    avgCustomer = '$1,120';

    visitorYear: any = [
        { name: '2025', code: '0' },
        { name: '2024', code: '1' }
    ];

    visitorChart: any;

    visitorChartOptions: any;

    selectedVisitorYear: any =  { name: '2025', code: '0' };

    subscription!: Subscription;

    constructor() {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.visitorChart = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Plan',
                    data: [630, 630, 695, 695, 695, 760, 760, 760, 840, 840, 840, 840],
                    borderColor: ['#FC6161'],
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'transparent',
                    type: 'line',
                    fill: false,
                    barPercentage: 0.5,
                    stepped: true
                },
                {
                    label: 'Growth actual',
                    data: [600, 671, 660, 665, 700, 610, 810, 790, 710, 860, 810, 780],
                    backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                    fill: true,
                    barPercentage: 0.5
                }
            ]
        };

        this.visitorChartOptions = {
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: textColor
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            hover: {
                mode: 'index'
            },
            scales: {
                y: {
                    ticks: {
                        color: textColor
                    },
                    min: 500,
                    max: 900,
                    grid: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    barPercentage: 0.5,
                    grid: {
                        display: false
                    }
                }
            }
        };

        this.selectedVisitorYear = this.visitorYear[0];
    }

    changeVisitorChart(event: any) {
        const dataSet1 = [
            [630, 630, 695, 695, 695, 760, 760, 760, 840, 840, 840, 840],
            [600, 671, 660, 665, 700, 610, 810, 790, 710, 860, 810, 780]
        ];
        const dataSet2 = [
            [580, 580, 620, 620, 620, 680, 680, 680, 730, 730, 730, 730],
            [550, 592, 600, 605, 630, 649, 660, 690, 710, 720, 730, 780]
        ];

        if (event.value.code === '1') {
            this.growth = '$581,259';
            this.avgCustomer = '$973';
            this.visitorChart.datasets[0].data = dataSet2[parseInt('0')];
            this.visitorChart.datasets[1].data = dataSet2[parseInt('1')];
        } else {
            this.growth = '$620,076';
            this.avgCustomer = '$1,120';
            this.visitorChart.datasets[0].data = dataSet1[parseInt('0')];
            this.visitorChart.datasets[1].data = dataSet1[parseInt('1')];
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
