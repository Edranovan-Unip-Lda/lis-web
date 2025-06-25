import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-application-list',
  imports: [CommonModule, TableModule, InputTextModule, ProgressBarModule, ButtonModule, IconField, InputIcon, RouterModule, TagModule, StatusSeverityPipe, StatusIconPipe],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent {
  applications: any[] = [
    {
      numero: 'APP001',
      nomeEmpresa: 'Empresa A lda',
      criadoEm: new Date(),
      estado: 'esboco',
      categoria: 'Industrial'
    },
     {
      numero: 'APP002',
      nomeEmpresa: 'Empresa B lda',
      criadoEm: new Date(),
      estado: 'sucesso',
      categoria: 'Comercial'
    }
  ];

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
