import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-certificados-lista',
  imports: [Popover, RouterLink, DatePipe, TitleCasePipe, TableModule, Button, Tag, InputIcon, IconField, InputText, StatusSeverityPipe, StatusIconPipe],
  templateUrl: './certificados-lista.component.html',
  styleUrl: './certificados-lista.component.scss'
})
export class CertificadosListaComponent {
  dataList: any[] = [
    {
      numero: '883293',
      sociedade: 'Empresa A lda',
      numeroRegistoComercial: '73293',
      sede: 'Dili',
      validade: new Date(),
      estado: 'ativo'
    },
    {
      numero: '23773',
      sociedade: 'Empresa B lda',
      numeroRegistoComercial: '00329',
      sede: 'Aileu',
      validade: new Date(),
      estado: 'expirado'
    }
  ];

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
