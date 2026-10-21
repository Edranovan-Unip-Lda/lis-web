import { LanguageService, LocalizedDatePipe } from '@/core/i18n';
import { Role } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { Tooltip } from "primeng/tooltip";
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-empresa-list',
  imports: [LocalizedDatePipe, TableModule, Paginator, Button, InputIcon, IconField, InputText, RouterLink, Tooltip, ConfirmDialog, Toast, TranslatePipe],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class EmpresaListComponent implements OnInit, OnDestroy {
  data: any[] = [];
  dataCached: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  private searchSubject = new Subject<string>();
  private searchSubscription: any;
  deleteLoading = false;
  currentRole!: Role;
  private i18n = inject(LanguageService);

  constructor(
    private route: ActivatedRoute,
    private service: EmpresaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.data = this.route.snapshot.data['empresaPage'].content;
    this.dataCached = this.data;
    this.totalData = this.route.snapshot.data['empresaPage'].totalElements;

    this.currentRole = this.authService.currentRole.name as Role;
    
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
          return this.service.search(query).pipe(
            catchError(error => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: this.i18n.instant('toast.error'),
                detail: this.i18n.instant('empresa.list.searchError')
              });
              return of(this.dataCached);
            })
          );
        } else if (query.length === 0) {
          this.dataIsFetching = true;
          return of(this.dataCached);
        }
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.data = result;
      }
      this.dataIsFetching = false;
    });
  }


  getData(page: number, size: number): void {
    this.service.getPage(page, size).subscribe({
      next: response => {
        this.data = response.content;
        this.totalData = response.totalElements;
        this.dataIsFetching = false;
      },
      error: err => {
        this.dataIsFetching = false;
      },
    });
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.size = event.rows;
    this.getData(this.page, this.size);
  }

  onGlobalFilter(table: Table, event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  delete(username: string, event: Event): void {
    this.messageService.clear();

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.i18n.instant('empresa.list.confirmDelete'),
      header: this.i18n.instant('empresa.common.confirmation'),
      icon: 'pi pi-info-circle',
      rejectLabel: this.i18n.instant('common.cancel'),
      rejectButtonProps: {
        label: this.i18n.instant('common.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.i18n.instant('common.delete'),
        severity: 'danger',
      },

      accept: () => {
        this.deleteLoading = true;
        this.service.deleteByUsername(username).subscribe({
          next: () => {
            this.deleteLoading = false;
            this.messageService.add({ severity: 'info', summary: this.i18n.instant('toast.confirmed'), detail: this.i18n.instant('empresa.list.deleted') });
            this.data = this.data.filter(item => item.utilizador.username !== username);
            this.dataCached = this.dataCached.filter(item => item.utilizador.username !== username);
            this.totalData--;
          },
          error: (err) => {
            this.deleteLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: this.i18n.instant('toast.error'),
              detail: err || this.i18n.instant('empresa.list.deleteError')
            });
          }
        });

      },
    });
  }
}
