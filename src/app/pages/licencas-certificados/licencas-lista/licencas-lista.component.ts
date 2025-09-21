import { AplicanteType, Categoria } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService, EmpresaService } from '@/core/services';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-licencas-lista',
  imports: [DatePipe, UpperCasePipe, TableModule, Button, Tag, InputIcon, IconField, InputText, StatusSeverityPipe, StatusIconPipe, Paginator, RouterLink],
  templateUrl: './licencas-lista.component.html',
  styleUrl: './licencas-lista.component.scss'
})
export class LicencasListaComponent {
  dataList: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  categoria!: Categoria;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private empresaService: EmpresaService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.dataList = this.route.snapshot.data['licencaListResolver'].content;
    this.totalData = this.route.snapshot.data['licencaListResolver'].totalElements;
    this.categoria = this.route.snapshot.data['categoria'];
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.size = event.rows;
    this.getData(this.page, this.size);
  }

  getData(page: number, size: number): void {
    this.empresaService.getPageCertificados(this.authService.currentUserValue.empresa.id, this.categoria, AplicanteType.licenca, page, size).subscribe({
      next: data => {
        this.dataList = data.content;
        this.totalData = data.totalElements;
        this.dataIsFetching = false;
      },
      error: err => {
        this.dataIsFetching = false;
      },
    });
  }

  toDetail(aplicanteId: number): void {
    this.router.navigate([`/${aplicanteId}`]);
  }

  getState(dataValidade: string) {
    let date = new Date(dataValidade);
    let now = new Date();
    if (date < now) {
      return 'expirado';
    } else {
      return 'ativo';
    }
  }
}
