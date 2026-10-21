import { i18nOptions, LanguageService, LocalizedDatePipe } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { AuditFilterRequest, JaversEntry } from '@/core/models/entities.model';
import { AuditService } from '@/core/services';
import { AuditEntity } from '@/core/models/enums';
import { listaAuditEntity, listaAuditType } from '@/core/utils/global-function';

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
  imports: [LocalizedDatePipe, TableModule, Tag, Toast, Paginator, FloatLabel, DatePicker, ReactiveFormsModule, Select, InputText, SelectButton, TranslatePipe],
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
  // Translation keys, resolved in the template
  columns: string[] = ['logs.col.author', 'common.date', 'logs.col.entity', 'logs.col.id', 'logs.col.type', 'logs.col.version', 'logs.col.changedProperties'];
  entityOpts = i18nOptions('logs.entity', listaAuditEntity.map((o) => ({ value: o.value })));
  typeOpts = listaAuditType;

  presetOptions = i18nOptions('logs.preset', [
    { value: 'today' },
    { value: 'yesterday' },
    { value: 'lastmonth' },
    { value: 'all' },
    { value: 'custom' },
  ], 'label');

  filterForm: FormGroup;
  private destroy$ = new Subject<void>();
  private i18n = inject(LanguageService);
  private static readonly KNOWN_ENTITIES = new Set<string>(Object.values(AuditEntity));

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

  /** Known audited entities get a translated name; anything else falls back to the raw class name. */
  entityLabel(entity: string): string {
    const name = this.extractEntityName(entity);
    return ActionsComponent.KNOWN_ENTITIES.has(name) ? this.i18n.instant(`logs.entity.${name}`) : name;
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
      case 'INITIAL':
      case 'UPDATE':
      case 'TERMINAL':
        return this.i18n.instant(`logs.type.${type}`);
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
          this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: err });
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
