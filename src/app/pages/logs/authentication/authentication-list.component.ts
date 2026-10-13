import { LanguageService, LocalizedDatePipe } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { LoginActivity } from '@/core/models/entities.model';
import { StatusIconPipe, StatusSeverityPipe, StatusLabelPipe } from '@/core/pipes/custom.pipe';
import { AuditService } from '@/core/services/audit.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Paginator } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-authentication-list',
  standalone: true,
  imports: [StatusLabelPipe, LocalizedDatePipe,
    TableModule, Tag, StatusSeverityPipe, StatusIconPipe, Toast, Paginator, FloatLabel, DatePicker, ReactiveFormsModule, TranslatePipe
  ],
  templateUrl: './authentication-list.component.html',
  styleUrl: './authentication-list.component.scss',
  providers: [MessageService]
})
export class AuthenticationListComponent implements OnInit, OnDestroy {
  data: LoginActivity[] = [];
  dataCached: LoginActivity[] = [];
  dataIsFetching = false;
  page = 0;
  size = 50;
  totalData = 0;
  // Translation keys, resolved in the template
  columns: string[] = ['logs.auth.user', 'logs.auth.timestamp', 'logs.auth.outcome', 'logs.auth.ipAddress', 'logs.auth.deviceType'];

  filterForm: FormGroup;
  private destroy$ = new Subject<void>();
  private i18n = inject(LanguageService);

  constructor(
    private route: ActivatedRoute,
    private service: AuditService,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      rangeDateTime: [[new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]]
    });
  }

  ngOnInit() {
    this.data = this.route.snapshot.data['loginActivities'].content;
    this.totalData = this.route.snapshot.data['loginActivities'].totalElements;
    this.dataCached = this.data;

    this.filterForm.get('rangeDateTime')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((range: Date[] | null) => {
        this.onDateRangeChange(range);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDateRangeChange(range: Date[] | null) {
    if (!range) {
      this.page = 0;
      this.fetchData();
      return;
    }

    const [start, end] = range;
    if (start && end) {
      this.page = 0;
      const plusOneDay = new Date(end);
      plusOneDay.setDate(plusOneDay.getDate() + 1);
      this.fetchData(start, plusOneDay);
    }
  }

  onPageChange(event: any) {
    this.page = event.page;
    this.size = event.rows;
    const range: Date[] | null = this.filterForm.get('rangeDateTime')!.value;
    const [start, end] = range ?? [];
    this.fetchData(start, end);
  }

  onGlobalFilter(event: any) { }

  private fetchData(startDateTime?: Date, endDateTime?: Date) {
    this.dataIsFetching = true;
    this.service.getLoginActivities(this.page, this.size, startDateTime, endDateTime)
      .pipe(finalize(() => this.dataIsFetching = false))
      .subscribe({
        next: (response) => {
          this.data = response.content;
          this.dataCached = this.data;
          this.totalData = response.totalElements;
        },
        error: (err) => {
          console.error('Erro ao buscar dados da API:', err);
          this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: this.i18n.instant('logs.fetchError') });
        },
      });
  }
}
