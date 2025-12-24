import { BarChartDto, CategoryDistributionDto, Kpis, LicensesPerMonthDto, MapDataDto } from '@/core/models/entities.model';
import { DashboardService } from '@/core/services';
import { StatsWidget } from '@/pages/dashboard/components/statswidget';
import { CustomerService } from '@/pages/service/customer.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { providePartialHighcharts } from 'highcharts-angular';
import { Select } from 'primeng/select';
import { CertificadoLicencaCategoriaChartsComponent } from './certificado-licenca-categoria-charts/certificado-licenca-categoria-charts.component';
import { CertificadoLicencaEstadoComponent } from './certificado-licenca-estado/certificado-licenca-estado.component';
import { CertificadoLicencaMunicipioPieComponent } from './certificado-licenca-municipio-pie/certificado-licenca-municipio-pie.component';
import { EmpresaMapComponent } from './empresa-map/empresa-map.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [FormsModule, Select, StatsWidget, EmpresaMapComponent, CertificadoLicencaCategoriaChartsComponent, CertificadoLicencaMunicipioPieComponent, CertificadoLicencaEstadoComponent],
    providers: [CustomerService, providePartialHighcharts({ modules: () => [import('highcharts/esm/modules/map')] })],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    kpisData!: Kpis;
    licensesPerMonth!: LicensesPerMonthDto;
    licensesByMunicipio!: BarChartDto;
    licensesStatusPerMonth!: CategoryDistributionDto;

    certificatesPerMonth!: LicensesPerMonthDto;
    certificatesByMunicipio!: BarChartDto;
    certificatesStatusPerMonth!: CategoryDistributionDto;

    empresasByMunicipio!: MapDataDto;
    empresasBySociedadeComercial!: CategoryDistributionDto;
    empresasByTipoEmpresa!: CategoryDistributionDto;

    yearCtrl = {
        name: new Date().getFullYear().toString(),
        code: '0'
    }

    visitorYear: any = (() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 2025; i--) {
            years.push({ name: i.toString(), code: (currentYear - i).toString() });
        }
        return years;
    })();


    constructor(
        private route: ActivatedRoute,
        private service: DashboardService
    ) { }

    ngOnInit(): void {
        const dashboardData = this.route.snapshot.data['dashboardResolver'];
        this.kpisData = dashboardData.kpis;
        this.licensesPerMonth = dashboardData.licensesPerMonth;
        this.licensesByMunicipio = dashboardData.licensesByMunicipio;
        this.licensesStatusPerMonth = dashboardData.licensesStatusPerMonth;
        this.certificatesPerMonth = dashboardData.certificatesPerMonth;
        this.certificatesByMunicipio = dashboardData.certificatesByMunicipio;
        this.certificatesStatusPerMonth = dashboardData.certificatesStatusPerMonth;
        this.empresasByMunicipio = dashboardData.empresasByMunicipio;
        this.empresasBySociedadeComercial = dashboardData.empresasBySociedadeComercial;
        this.empresasByTipoEmpresa = dashboardData.empresasByTipoEmpresa;
    }

    yearChange(value: any) {
        if (!value || !value.code) {
            return;
        }
        this.service.getData(+value.name).subscribe({
            next: (dashboardData) => {
                this.licensesPerMonth = dashboardData.licensesPerMonth;
                this.licensesByMunicipio = dashboardData.licensesByMunicipio;
                this.licensesStatusPerMonth = dashboardData.licensesStatusPerMonth;
                this.certificatesPerMonth = dashboardData.certificatesPerMonth;
                this.certificatesByMunicipio = dashboardData.certificatesByMunicipio;
                this.certificatesStatusPerMonth = dashboardData.certificatesStatusPerMonth;
            }
        });
    }
}
