import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-suco-list',
  imports: [TableModule, Button, InputIcon, IconField, InputText, Popover],
  templateUrl: './suco-list.component.html',
  styleUrl: './suco-list.component.scss'
})
export class SucoListComponent {
  data: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.data = this.route.snapshot.data['sucoResolve']._embedded.sucos;
    this.totalData = this.route.snapshot.data['sucoResolve'].totalElements;
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
