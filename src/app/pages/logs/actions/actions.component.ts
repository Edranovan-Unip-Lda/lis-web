import { AuditFilterRequest, JaversEntry } from '@/core/models/entities.model';
import { AuditService } from '@/core/services';
import { listaAuditEntity, listaAuditType } from '@/core/utils/global-function';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { debounceTime, finalize, Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-actions',
  imports: [TableModule, Tag, DatePipe, Toast, Paginator, FloatLabel, DatePicker, ReactiveFormsModule, Select, InputText, SelectButton],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
  providers: [MessageService]
})
export class ActionsComponent implements OnInit, OnDestroy {
  data: JaversEntry[] = [];
  dataIsFetching = false;
  page = 0;
  first = 0;
  size = 50;
  totalData = 0;
  columns: string[] = ['Autor', 'Data', 'Entidade', 'ID', 'Tipo', 'Versão', 'Propriedades Alteradas'];
  entityOpts = listaAuditEntity;
  typeOpts = listaAuditType;

  presetOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Ontem', value: 'yesterday' },
    { label: 'Últimos 30 Dias', value: 'lastmonth' },
    { label: 'Todos', value: 'all' },
    { label: 'Personalizado', value: 'custom' },
  ];

  filterForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private service: AuditService,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      datePreset: ['lastmonth'],
      rangeDateTime: [null],
      author: [null],
      entity: [null],
      type: [null],
    });
  }

  ngOnInit() {
    // Apply the default preset immediately instead of showing unfiltered resolver data
    const response = this.route.snapshot.data['allActivities'];
    this.parseResponse(response);


    // Preset selection (today / yesterday / 1month / all)
    this.filterForm.get('datePreset')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(preset => {
        this.page = 0;
        this.first = 0;
        if (preset !== 'custom') {
          this.fetchDataByFilter(preset);
        }
      });

    // Custom date range — only trigger when both dates are picked
    this.filterForm.get('rangeDateTime')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((range: Date[] | null) => {
        if (this.filterForm.get('datePreset')?.value !== 'custom') return;
        const [start, end] = range ?? [];
        if (start && end) {
          this.page = 0;
          this.first = 0;
          this.fetchDataByFilter(undefined, range);
        }
      });

    // Author field with debounce
    this.filterForm.get('author')!.valueChanges
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe((author) => {
        if (author && author.length < 3) return;
        this.page = 0;
        this.first = 0;
        this.fetchDataByFilter(undefined, undefined, author);
      });

    // Entity & type selects — immediate
    this.filterForm.get('entity')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((entity) => {
        this.page = 0;
        this.first = 0;
        this.fetchDataByFilter(undefined, undefined, undefined, entity);
      });

    this.filterForm.get('type')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.page = 0;
        this.first = 0;
        this.fetchDataByFilter(undefined, undefined, undefined, undefined, type);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: any) {
    this.page = event.page;
    this.first = event.first;
    this.size = event.rows;
    this.fetchDataByFilter();
  }

  extractEntityName(entity: string): string {
    return entity?.split('.')?.pop() ?? entity;
  }

  private parseResponse(response: any): void {
    try {
      this.data = typeof response.content === 'string'
        ? JSON.parse(response.content)
        : (Array.isArray(response.content) ? response.content : []);
    } catch {
      this.data = [];
    }
    this.totalData = response.totalElements ?? this.totalData;
  }

  typeSeverity(type: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (type) {
      case 'INITIAL': return 'success';
      case 'UPDATE': return 'warn';
      case 'TERMINAL': return 'danger';
      default: return 'secondary';
    }
  }

  typeLabel(type: string): string {
    switch (type) {
      case 'INITIAL': return 'CRIAÇÃO';
      case 'UPDATE': return 'ALTERAÇÃO';
      default: return type;
    }
  }

  private fetchDataByFilter(datePreset?: string, rangeDateTime?: any, author?: string, entity?: string, type?: string) {
    const form = this.filterForm.value;
    datePreset = datePreset ?? form.datePreset;
    rangeDateTime = rangeDateTime ?? form.rangeDateTime;
    author = author !== undefined ? author : form.author;
    entity = entity !== undefined ? entity : form.entity;
    type = type !== undefined ? type : form.type;

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (datePreset === 'custom') {
      const [start, end] = Array.isArray(rangeDateTime) ? rangeDateTime : [];
      const endD = end ? new Date(end) : undefined;
      if (endD) endD.setUTCHours(23, 59, 59, 999);
      startDate = start ? new Date(start).toISOString() : undefined;
      endDate = endD ? endD.toISOString() : undefined;
    } else if (datePreset && datePreset !== 'all') {
      ({ startDate, endDate } = this.getPresetRange(datePreset));
    }

    const formData: AuditFilterRequest = {
      page: this.page,
      size: this.size,
      startDate,
      endDate,
      author: author ?? undefined,
      entity: entity ?? undefined,
      type: (type ?? undefined) as any,
    };

    this.dataIsFetching = true;
    this.service.filterActions(formData)
      .pipe(finalize(() => this.dataIsFetching = false))
      .subscribe({
        next: (response: any) => {
          this.parseResponse(response);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: err });
        },
      });
  }

  private getPresetRange(preset: string): { startDate: string; endDate: string } {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case 'lastmonth':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
    }

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
}
