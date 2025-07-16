import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-aldeia-list',
  imports: [TableModule, Button, InputIcon, IconField, InputText, Popover],
  templateUrl: './aldeia-list.component.html',
  styleUrl: './aldeia-list.component.scss'
})
export class AldeiaListComponent {
data: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.data = this.route.snapshot.data['aldeiaResolve']._embedded.aldeias;
    this.totalData = this.route.snapshot.data['aldeiaResolve'].totalElements;
    console.log(this.data);
    
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
