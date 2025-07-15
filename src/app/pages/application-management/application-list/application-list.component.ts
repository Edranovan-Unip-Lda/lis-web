import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { EmpresaService } from '@/core/services/empresa.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-application-list',
  imports: [CommonModule, TableModule, InputTextModule, ProgressBarModule, ButtonModule, IconField, InputIcon, RouterModule, TagModule, StatusSeverityPipe, StatusIconPipe, PopoverModule],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent {
  applications: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;

  constructor(
    private route: ActivatedRoute,
    private service: EmpresaService,
  ) {
    console.log(this.route.snapshot.data['applicationPage']);

    this.applications = this.route.snapshot.data['applicationPage'].content;
    this.totalData = this.route.snapshot.data['applicationPage'].totalElements;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
