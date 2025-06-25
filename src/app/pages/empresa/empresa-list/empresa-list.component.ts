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
  selector: 'app-empresa-list',
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule, InputIconModule, IconField, InputTextModule],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss'
})
export class EmpresaListComponent {
  applications: any[] = [
    {
      id: 1,
      nome: 'Empresa A',
      sede: 'Dili',
      nif: '123456789',
      numeruRegisto: 'REG123',
      telemovel: '+351912345678',
      telefone: '+351213456789',
      email: 'B4gYt@example.com',
      gerente: 'Joaquim',
      status: 'ativo',
      createdAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      nome: 'Empresa B',
      sede: 'Aileu',
      nif: '987654321',
      numeruRegisto: 'REG456',
      telemovel: '+351912345678',
      telefone: '+351213456789',
      email: 'B4gYt@example.com',
      gerente: 'Joaquim',
      status: 'ativo',
      createdAt: new Date('2023-01-01'),
    }
  ];

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
