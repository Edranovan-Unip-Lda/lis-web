import { Aplicante } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AplicanteService, AuthenticationService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-application-list',
  imports: [TableModule, Paginator, InputText, Button, IconField, InputIcon, RouterModule, Tag, StatusSeverityPipe, StatusIconPipe, Tooltip, UpperCasePipe, DatePipe, Toast, ConfirmDialog],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  applications: any[] = [];
  applicationsCached: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  currentRole: any;
  roleAdmin = Role.admin;
  roleClient = Role.client;
  private searchSubject = new Subject<string>();
  private searchSubscription: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: EmpresaService,
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private aplicanteService: AplicanteService,
  ) {
    this.currentRole = this.authService.currentRole.name;

    this.applications = this.route.snapshot.data['applicationPage'].content;
    this.applicationsCached = this.applications;

    if (this.authService.currentRole.name === Role.manager || this.authService.currentRole.name === Role.chief || this.authService.currentRole.name === Role.staff) {
      this.applications = this.applications.filter(item => item.categoria === this.authService.currentUserValue.direcao.nome);
    }

    this.totalData = this.route.snapshot.data['applicationPage'].totalElements;
  }

  ngOnInit(): void {
    this.setupSearch();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length >= 3) {
          this.dataIsFetching = true;
          if (this.authService.currentRole.name === Role.client) {
            const empresaId = this.authService.currentUserValue.empresa.id;
            return this.service.searchAplicanteById(empresaId, query).pipe(
              catchError(error => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: error
                });
                return of(this.applicationsCached);
              })
            );
          } else {
            return this.aplicanteService.search(query).pipe(
              catchError(error => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: error
                });
                return of(this.applicationsCached);
              })
            );
          }

        } else if (query.length === 0) {
          this.dataIsFetching = true;
          return of(this.applicationsCached);
        }
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.applications = result;

        if (this.authService.currentRole.name === Role.manager ||
          this.authService.currentRole.name === Role.chief ||
          this.authService.currentRole.name === Role.staff) {
          this.applications = this.applications.filter(
            item => item.categoria === this.authService.currentUserValue.direcao.nome
          );
        }
      }
      this.dataIsFetching = false;
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    console.log(query);

    this.searchSubject.next(query);
  }

  toDetail(aplicante: Aplicante) {
    const user = this.authService.currentUserValue;

    if (user.role.name === Role.client) {
      this.router.navigate([`/application/${aplicante.tipo.toLowerCase()}`, aplicante.id], {
        // this.router.navigate([`/application`, aplicante.id], {
        queryParams: {
          categoria: aplicante.categoria,
          tipo: aplicante.tipo
        }
      });
    } else {
      if (aplicante.estado === 'APROVADO') {
        this.router.navigate(['/gestor/application', aplicante.id], {
          queryParams: {
            categoria: aplicante.categoria,
            tipo: aplicante.tipo
          }
        });
      } else {
        this.router.navigate(['/gestor/application/task', aplicante.id], {
          queryParams: {
            categoria: aplicante.categoria,
            tipo: aplicante.tipo
          }
        });
      }

    }

  }

  delete(aplicante: Aplicante) {
    const empresaId = this.authService.currentUserValue.empresa.id;

    this.confirmationService.confirm({
      message: 'Quer apagar este aplicante?',
      header: 'Zona de risco',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
        icon: 'pi pi-times'
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
        icon: 'pi pi-check'
      },

      accept: () => {
        this.service.deleteApicante(empresaId, aplicante.id).subscribe({
          next: () => {
            this.applications = this.applications.filter(item => item.id !== aplicante.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Aplicante removido com sucesso'
            });
          },
          error: error => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Ocorreu um erro ao remover o aplicante'
            });
          },
        });
      },
    });
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.size = event.rows;
    this.getData(this.page, this.size);
  }

  private getData(page: number, size: number): void {
    if (this.authService.currentRole.name === Role.client) {
      const empresaId = this.authService.currentUserValue.empresa.id;
      this.service.getAplicantesPage(empresaId, page, size).subscribe({
        next: response => {
          this.applications = response.content;
          this.totalData = response.totalElements;
          this.dataIsFetching = false;
        },
        error: err => {
          this.dataIsFetching = false;
        },
      });
    } else {
      this.aplicanteService.getPage(page, size).subscribe({
        next: response => {
          this.applications = response.content;
          this.totalData = response.totalElements;
          this.dataIsFetching = false;
        },
        error: err => {
          this.dataIsFetching = false;
        },
      });
    }
  }
}
