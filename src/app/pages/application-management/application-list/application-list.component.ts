import { Aplicante } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AplicanteService, AuthenticationService, UserService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

/** Which paged endpoint this list instance talks to — set per route via `data.listMode`. */
type ListMode = 'client' | 'gestor' | 'task';

@Component({
  selector: 'app-application-list',
  imports: [TableModule, Paginator, InputText, Button, IconField, InputIcon, RouterModule, Tag, StatusSeverityPipe, StatusIconPipe, Tooltip, UpperCasePipe, DatePipe, Toast, ConfirmDialog],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ApplicationListComponent implements OnInit {
  applications: any[] = [];
  page = 0;
  first = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  currentRole: any;
  roleAdmin = Role.admin;
  roleClient = Role.client;
  private sortField?: string;
  private sortOrder = -1;
  private q = '';
  private listMode: ListMode;
  // The resolver already supplied page 1; p-table fires onLazyLoad once on init, which we must not turn into
  // a duplicate request.
  private initialized = false;
  private searchSubject = new Subject<string>();
  private fetchTrigger = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: EmpresaService,
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private aplicanteService: AplicanteService,
    private userService: UserService,
    private destroyRef: DestroyRef,
  ) {
    this.currentRole = this.authService.currentRole.name;
    this.listMode = (this.route.snapshot.data['listMode'] ?? 'gestor') as ListMode;

    // No client-side direcao filter here: the backend already scopes every list by direcao/ownership, and
    // filtering a fetched page locally silently dropped rows while the paginator still counted them.
    const resolved = this.route.snapshot.data['applicationPage'];
    this.applications = resolved?.content ?? [];
    this.totalData = resolved?.totalElements ?? 0;
  }

  ngOnInit(): void {
    this.setupSearch();
    this.setupFetch();
  }

  /**
   * Every page/search/sort fetch goes through one switchMap'd stream, so an in-flight request is cancelled when
   * a newer one starts — a slow page-2 response can never land on top of fresher search results.
   */
  private setupFetch(): void {
    this.fetchTrigger.pipe(
      tap(() => this.dataIsFetching = true),
      switchMap(() => {
        const sort = this.sortField ? `${this.sortField},${this.sortOrder === 1 ? 'asc' : 'desc'}` : undefined;
        return this.request(sort).pipe(
          catchError(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Ocorreu um erro ao obter a lista de aplicantes'
            });
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(response => {
      if (response) {
        this.applications = response.content ?? [];
        this.totalData = response.totalElements ?? 0;
      }
      this.dataIsFetching = false;
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      // Below the 3-char threshold the query is dropped rather than ignored, so deleting back to 1-2 characters
      // returns to the unfiltered list instead of leaving stale search results on screen.
      map(raw => raw.trim().length >= 3 ? raw.trim() : ''),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(query => {
      this.q = query;
      this.resetPage();
      this.getData();
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  // Sorting is server-side: the table only reports which column was clicked, the fetch does the ordering.
  onLazyLoad(event: any): void {
    if (!this.initialized) {
      this.initialized = true;
      return;
    }
    if (!event.sortField) return;

    this.sortField = event.sortField;
    this.sortOrder = event.sortOrder ?? -1;
    this.resetPage();
    this.getData();
  }

  private resetPage(): void {
    this.page = 0;
    this.first = 0;
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
      if (aplicante.estado === 'APROVADO' || user.role.name === Role.admin) {
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

        if (this.roleAdmin === this.authService.currentRole.name) {
          this.aplicanteService.deleteById(aplicante.id).subscribe({
            next: () => {
              // Refetch rather than splice locally: with server-side paging, dropping a row in memory leaves the
              // page one short and totalData off by one.
              this.getData();
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
        } else {
          const empresaId = this.authService.currentUserValue.empresa.id;
          this.service.deleteApicante(empresaId, aplicante.id).subscribe({
            next: () => {
              // Refetch rather than splice locally: with server-side paging, dropping a row in memory leaves the
              // page one short and totalData off by one.
              this.getData();
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
        }

      },
    });
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.first = event.first;
    this.size = event.rows;
    this.getData();
  }

  /** Page, search and sort all travel to the server together, so the paginator always describes what's on screen. */
  private getData(): void {
    this.fetchTrigger.next();
  }

  // Route-driven, not role-driven: a chief on /gestor/application/task must keep querying the task endpoint when
  // paging, otherwise page 2 silently swaps in the whole back-office dataset.
  private request(sort?: string): Observable<any> {
    const user = this.authService.currentUserValue;
    // Null right after a forced logout/redirect — don't fire a request we can't scope.
    if (!user) return of(null);

    const empresaId = user.empresa?.id;

    switch (this.listMode) {
      case 'client':
        // /application/list is reachable by back-office roles too, and they have no empresa. Mirror
        // getPageAplicanteOrByEmpresaIdResolver: company-scoped only for an actual client.
        if (user.role?.name === Role.client && empresaId) {
          return this.service.getAplicantesPage(empresaId, this.page, this.size, this.q, sort);
        }
        return this.aplicanteService.getPage(this.page, this.size, this.q, sort);
      case 'task':
        // Mirrors the role switch in getPageAplicanteByUsernameResolver.
        return user.role?.name === Role.staff
          ? this.userService.getPaginationAtribuidoAplicante(user.username, this.page, this.size, this.q, sort)
          : this.userService.getPaginationAssignedAplicante(user.username, this.page, this.size, this.q, sort);
      default:
        return this.aplicanteService.getPage(this.page, this.size, this.q, sort);
    }
  }
}
