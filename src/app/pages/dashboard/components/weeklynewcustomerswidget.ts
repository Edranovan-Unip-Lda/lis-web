import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';

@Component({
    selector: 'weekly-new-customers-widget',
    standalone: true,
    imports: [FormsModule, SelectModule, ChartModule],
    template: `<div class="card widget-customer-graph">
        <div class="header">
            <div class="flex justify-between leading-loose">
                <span>Weekly New Customers</span>
                <p-select [options]="customerYear" [(ngModel)]="selectedCustomerYear" optionLabel="name" (onChange)="changeCustomerChart($event); customer.refresh()" />
            </div>
            <p class="text-sm text-surface-500 dark:text-surface-400">Number of new customer are listed by weekly</p>
        </div>

        <div class="content grid grid-cols-12 gap-4 p-nogutter mt-4">
            <div class="col-span-12 md:col-span-6 grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-4 flex items-center">
                    <h2 class="mb-0">{{ customerMax }}</h2>
                    <p class="ml-2 text-surface-500 dark:text-surface-400 text-sm leading-none">MAX</p>
                </div>
                <div class="col-span-12 md:col-span-4 flex items-center">
                    <h2 class="mb-0">{{ customerMin }}</h2>
                    <p class="ml-2 text-surface-500 dark:text-surface-400 text-sm leading-none">MIN</p>
                </div>
                <div class="col-span-12 md:col-span-4 flex items-center">
                    <h2 class="mb-0" style="color: #fc6161">
                        {{ customerAvg }}
                    </h2>
                    <p class="ml-2 text-surface-500 dark:text-surface-400 text-sm leading-none">AVARAGE</p>
                </div>
            </div>
        </div>

        <p-chart #customer height="426" type="bar" [data]="customerChart" [options]="customerChartOptions" id="customer-chart"></p-chart>
    </div>`
})
export class WeeklyNewCustomersWidget implements OnInit {
    layoutService = inject(LayoutService);

    selectedCustomerYear: any;

    customerChart: any;

    customerChartOptions: any;

    customerYear = [
        { name: '2025', code: '0' },
        { name: '2024', code: '1' }
    ];

    customerMax = '1232';

    customerMin = '284';

    customerAvg = '875';

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

        this.customerChart = {
            labels: ['January', 'March', 'May', 'Agust', 'October', 'December'],
            datasets: [
                {
                    data: [10, 25, 48, 35, 54, 70],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [18, 35, 23, 30, 59, 65],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [20, 47, 46, 46, 61, 70],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [17, 34, 18, 48, 67, 68],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-600'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [9, 37, 47, 50, 60, 62],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [8, 48, 40, 52, 72, 75],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [10, 18, 50, 47, 63, 80],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [20, 36, 39, 58, 59, 85],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [30, 45, 35, 50, 54, 81],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [28, 35, 52, 56, 60, 77],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [40, 40, 38, 45, 68, 86],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-600'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [50, 23, 27, 34, 65, 90],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [29, 27, 29, 42, 55, 84],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [10, 37, 47, 29, 59, 80],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [10, 54, 42, 38, 63, 83],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [25, 44, 50, 56, 65, 92],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [30, 43, 48, 45, 73, 78],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                },
                {
                    data: [29, 47, 54, 60, 77, 86],
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    hoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    fill: true,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                }
            ]
        };

        this.customerChartOptions = {
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: textColor
                    },
                    display: false
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };

        this.selectedCustomerYear = this.customerYear[0];
    }

    changeCustomerChart(event: any) {
        const dataSet1 = [
            [10, 25, 48, 35, 54, 70],
            [18, 35, 23, 30, 59, 65],
            [20, 47, 46, 46, 61, 70],
            [17, 34, 18, 48, 67, 68],
            [9, 37, 47, 50, 60, 62],
            [8, 48, 40, 52, 72, 75],
            [10, 18, 50, 47, 63, 80],
            [20, 36, 39, 58, 59, 85],
            [30, 45, 35, 50, 54, 81],
            [28, 35, 52, 56, 60, 77],
            [40, 40, 38, 45, 68, 86],
            [50, 23, 27, 34, 65, 90],
            [29, 27, 29, 42, 55, 84],
            [10, 37, 47, 29, 59, 80],
            [10, 54, 42, 38, 63, 83],
            [25, 44, 50, 56, 65, 92],
            [30, 43, 48, 45, 73, 78],
            [29, 47, 54, 60, 77, 86]
        ];
        const dataSet2 = [
            [10, 25, 48, 35, 54, 70],
            [20, 47, 46, 46, 61, 70],
            [17, 34, 18, 48, 67, 68],
            [50, 23, 27, 34, 65, 90],
            [8, 48, 40, 52, 72, 75],
            [9, 37, 47, 50, 60, 62],
            [10, 18, 50, 47, 63, 80],
            [30, 45, 35, 50, 54, 81],
            [10, 37, 47, 29, 59, 80],
            [28, 35, 52, 56, 60, 77],
            [25, 44, 50, 56, 65, 92],
            [18, 35, 23, 30, 59, 65],
            [20, 36, 39, 58, 59, 85],
            [29, 27, 29, 42, 55, 84],
            [40, 40, 38, 45, 68, 86],
            [30, 43, 48, 45, 73, 78],
            [10, 54, 42, 38, 63, 83],
            [29, 47, 54, 60, 77, 86]
        ];

        if (event.value.code === '1') {
            this.customerAvg = '621';
            this.customerMin = '198';
            this.customerMax = '957';
            this.customerChart.datasets[0].data = dataSet2[parseInt('0')];
            this.customerChart.datasets[1].data = dataSet2[parseInt('1')];
            this.customerChart.datasets[2].data = dataSet2[parseInt('2')];
            this.customerChart.datasets[3].data = dataSet2[parseInt('3')];
            this.customerChart.datasets[4].data = dataSet2[parseInt('4')];
            this.customerChart.datasets[5].data = dataSet2[parseInt('5')];
            this.customerChart.datasets[6].data = dataSet2[parseInt('6')];
            this.customerChart.datasets[7].data = dataSet2[parseInt('7')];
            this.customerChart.datasets[8].data = dataSet2[parseInt('8')];
            this.customerChart.datasets[9].data = dataSet2[parseInt('9')];
            this.customerChart.datasets[10].data = dataSet2[parseInt('10')];
            this.customerChart.datasets[11].data = dataSet2[parseInt('11')];
            this.customerChart.datasets[12].data = dataSet2[parseInt('12')];
            this.customerChart.datasets[13].data = dataSet2[parseInt('13')];
            this.customerChart.datasets[14].data = dataSet2[parseInt('14')];
            this.customerChart.datasets[15].data = dataSet2[parseInt('15')];
            this.customerChart.datasets[16].data = dataSet2[parseInt('16')];
            this.customerChart.datasets[17].data = dataSet2[parseInt('17')];
        } else {
            this.customerAvg = '875';
            this.customerMin = '284';
            this.customerMax = '1232';
            this.customerChart.datasets[0].data = dataSet1[parseInt('0')];
            this.customerChart.datasets[1].data = dataSet1[parseInt('1')];
            this.customerChart.datasets[2].data = dataSet1[parseInt('2')];
            this.customerChart.datasets[3].data = dataSet1[parseInt('3')];
            this.customerChart.datasets[4].data = dataSet1[parseInt('4')];
            this.customerChart.datasets[5].data = dataSet1[parseInt('5')];
            this.customerChart.datasets[6].data = dataSet1[parseInt('6')];
            this.customerChart.datasets[7].data = dataSet1[parseInt('7')];
            this.customerChart.datasets[8].data = dataSet1[parseInt('8')];
            this.customerChart.datasets[9].data = dataSet1[parseInt('9')];
            this.customerChart.datasets[10].data = dataSet1[parseInt('10')];
            this.customerChart.datasets[11].data = dataSet1[parseInt('11')];
            this.customerChart.datasets[12].data = dataSet1[parseInt('12')];
            this.customerChart.datasets[13].data = dataSet1[parseInt('13')];
            this.customerChart.datasets[14].data = dataSet1[parseInt('14')];
            this.customerChart.datasets[15].data = dataSet1[parseInt('15')];
            this.customerChart.datasets[16].data = dataSet1[parseInt('16')];
            this.customerChart.datasets[17].data = dataSet1[parseInt('17')];
        }
    }
}
