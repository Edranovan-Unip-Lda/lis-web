import { EmpresaService } from '@/core/services/empresa.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-empresa-list',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule, InputIconModule, IconField, InputTextModule, PopoverModule],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss'
})
export class EmpresaListComponent {
  data: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;

  constructor(
    private route: ActivatedRoute,
    private service: EmpresaService,
  ) {
    this.data = this.route.snapshot.data['empresaPage'].content;
    this.totalData = this.route.snapshot.data['empresaPage'].totalElements;
  }


  getData(page: number, size: number): void {
    this.service.getPage(page, size).subscribe({
      next: response => {
        this.data = response.content;
        this.totalData = response.totalElements;
        this.dataIsFetching = false;
      },
      error: err => {
        this.dataIsFetching = false;
      },
    });
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.size = event.rows;
    this.getData(this.page, this.size);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
