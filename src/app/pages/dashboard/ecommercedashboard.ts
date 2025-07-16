import { CountryDistributionsWidget } from '@/pages/dashboard/components/countrydistributionswidget';
import { MonthlyRevenueWidget } from '@/pages/dashboard/components/monthlyrevenuewidget';
import { StatsWidget } from '@/pages/dashboard/components/statswidget';
import { TransactionHistoryWidget } from '@/pages/dashboard/components/transactionhistorywidget';
import { UniqueVisitorWidget } from '@/pages/dashboard/components/uniquevisitorwidget';
import { CustomerService } from '@/pages/service/customer.service';
import { Component } from '@angular/core';

@Component({
    selector: 'app-ecommerce-dashboard',
    standalone: true,
    imports: [StatsWidget, UniqueVisitorWidget, CountryDistributionsWidget, MonthlyRevenueWidget],
    providers: [CustomerService],
    template: `<div class="grid grid-cols-12 gap-8">
        <stats-widget />

        <div class="col-span-12 xl:col-span-8">
            <unique-visitor-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
             <country-distributions-widget />
        </div>

        <!--<div class="col-span-12 xl:col-span-4">
            <country-distributions-widget />
        </div>-->

        <div class="col-span-12">
            <monthly-revenue-widget />
        </div>

        <!--<div class="col-span-12">
            <yearly-win-widget />
        </div>

        <div class="col-span-12 xl:col-span-8">
            <weekly-new-customers-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
            <weekly-target-widget />
        </div>

        <div class="col-span-12 widget-customer-carousel">
            <top-customers-widget />
        </div>-->
    </div>`
})
export class EcommerceDashboard { }
