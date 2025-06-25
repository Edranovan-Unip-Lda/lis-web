import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-licencas-lista',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule, InputIconModule, IconField, InputTextModule, StatusSeverityPipe, StatusIconPipe],
  templateUrl: './licencas-lista.component.html',
  styleUrl: './licencas-lista.component.scss'
})
export class LicencasListaComponent {
  dataList: any[] = [
    {
      numero: '883293',
      sociedade: 'Empresa A lda',
      numeroRegistoComercial: '73293',
      nif: '123456789',
      sede: 'Dili',
      validade: new Date(),
      estado: 'ativo'
    },
    {
      numero: '23773',
      sociedade: 'Empresa B lda',
      numeroRegistoComercial: '00329',
      sede: 'Aileu',
      nif: '00323929',
      validade: new Date(),
      estado: 'expirado'
    }
  ];

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
