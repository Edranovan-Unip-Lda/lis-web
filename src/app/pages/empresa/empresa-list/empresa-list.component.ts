import { EmpresaService } from '@/core/services/empresa.service';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-empresa-list',
  imports: [TableModule, Paginator, Button, InputIcon, IconField, InputText, RouterLink, DatePipe],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss',
  providers: [MessageService]
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

  constructor(
    private route: ActivatedRoute,
    private service: EmpresaService,
    private messageService: MessageService
  ) {
    this.data = this.route.snapshot.data['empresaPage'].content;
    this.dataCached = this.data;
    this.totalData = this.route.snapshot.data['empresaPage'].totalElements;
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
          return this.service.search(query).pipe(
            catchError(error => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Ocorreu um erro ao pesquisar'
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
}
