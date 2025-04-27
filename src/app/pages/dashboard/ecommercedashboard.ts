import {Component} from '@angular/core';
import {StatsWidget} from '@/pages/dashboard/components/statswidget';
import {UniqueVisitorWidget} from '@/pages/dashboard/components/uniquevisitorwidget';
import {TransactionHistoryWidget} from '@/pages/dashboard/components/transactionhistorywidget';
import {CountryDistributionsWidget} from '@/pages/dashboard/components/countrydistributionswidget';
import {MonthlyRevenueWidget} from '@/pages/dashboard/components/monthlyrevenuewidget';
import {YearlyWinWidget} from '@/pages/dashboard/components/yearlywinwidget';
import {WeeklyNewCustomersWidget} from '@/pages/dashboard/components/weeklynewcustomerswidget';
import {WeeklyTargetWidget} from '@/pages/dashboard/components/weeklytargetwidget';
import {TopCustomersWidget} from '@/pages/dashboard/components/topcustomerswidget';
import {CustomerService} from '@/pages/service/customer.service';

@Component({
    selector: 'app-ecommerce-dashboard',
    standalone: true,
    imports: [StatsWidget, UniqueVisitorWidget, TransactionHistoryWidget, CountryDistributionsWidget, MonthlyRevenueWidget, YearlyWinWidget, WeeklyNewCustomersWidget, WeeklyTargetWidget, TopCustomersWidget],
    providers: [CustomerService],
    template: `<div class="grid grid-cols-12 gap-8">
        <stats-widget />

        <div class="col-span-12 xl:col-span-8">
            <unique-visitor-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
            <transaction-history-widget />
        </div>

        <div class="col-span-12 xl:col-span-4">
            <country-distributions-widget />
        </div>

        <div class="col-span-12 xl:col-span-8">
            <monthly-revenue-widget />
        </div>

        <div class="col-span-12">
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
        </div>
    </div>`
})
export class EcommerceDashboard {}
