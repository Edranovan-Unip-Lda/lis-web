import { AplicanteType, Categoria } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService, EmpresaService, UserService } from '@/core/services';
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
  selector: 'app-certificados-lista',
  imports: [Paginator, DatePipe, UpperCasePipe, TableModule, Button, Tag, InputIcon, IconField, InputText, StatusSeverityPipe, StatusIconPipe, RouterLink],
  templateUrl: './certificados-lista.component.html',
  styleUrl: './certificados-lista.component.scss'
})
export class CertificadosListaComponent {
  dataList: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  categoria!: Categoria;
  // Which paged endpoint to call: the back-office list ('gestor') or the company's own ('client').
  private listMode: 'gestor' | 'client' = 'client';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private empresaService: EmpresaService,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.dataList = this.route.snapshot.data['licencaListResolver'].content;
    this.totalData = this.route.snapshot.data['licencaListResolver'].totalElements;
    this.categoria = this.route.snapshot.data['categoria'];
    this.listMode = this.route.snapshot.data['listMode'] ?? 'client';
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
    // Mirrors the resolver: staff page through /users/{id}/certificados (they have no empresa), a company
    // through /empresas/{id}/certificados. Note the two services take their args in a different order.
    const user = this.authService.currentUserValue;
    if (!user) {
      this.dataIsFetching = false;
      return;
    }

    const request$ = this.listMode === 'gestor'
      ? this.userService.getPageCertificados(user.id, AplicanteType.cadastro, this.categoria, page, size)
      : this.empresaService.getPageCertificados(user.empresa?.id, this.categoria, AplicanteType.cadastro, page, size);

    request$.subscribe({
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
    this.router.navigateByUrl(`/licencas-certificados/certificados/${aplicanteId}`);
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
