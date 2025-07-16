import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-municipio-list',
  imports: [TableModule, Button, InputIconModule, IconField, InputTextModule, PopoverModule],
  templateUrl: './municipio-list.component.html',
  styleUrl: './municipio-list.component.scss'
})
export class MunicipioListComponent {
  data: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.data = this.route.snapshot.data['municipioResolve']._embedded.municipios;
    console.log(this.route.snapshot.data['municipioResolve']);
    
    this.totalData = this.route.snapshot.data['municipioResolve'].totalElements;
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
