import { Aplicante } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-application-list',
  imports: [TableModule, InputTextModule, ProgressBarModule, ButtonModule, IconField, InputIcon, RouterModule, TagModule, StatusSeverityPipe, StatusIconPipe, RouterLink, Tooltip, TitleCasePipe, DatePipe],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent {
  applications: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  currentRole: any;
  roleAdmin = Role.admin;
  roleClient = Role.client;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: EmpresaService,
    private authService: AuthenticationService,
  ) {
    this.currentRole = this.authService.currentRole.name;

    this.applications = this.route.snapshot.data['applicationPage'].content;
    this.totalData = this.route.snapshot.data['applicationPage'].totalElements;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  toDetail(aplicante: Aplicante) {
    this.router.navigate(['/application', aplicante.id], {
      queryParams: {
        categoria: aplicante.categoria,
        tipo: aplicante.tipo
      }
    });
  }
}
