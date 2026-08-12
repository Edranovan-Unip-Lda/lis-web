import { Aplicante } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { ReportService } from '@/core/services/report.service';
import { aplicanteStatusOptions, applicationTypesOptions, categoryTpesOptions } from '@/core/utils/global-function';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { Paginator } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-aplicante',
  imports: [ReactiveFormsModule, Select, Button, DatePipe, TableModule, Message, Paginator, DatePicker, Tag, UpperCasePipe, StatusIconPipe, StatusSeverityPipe],
  templateUrl: './aplicante.component.html',
  styleUrl: './aplicante.component.scss'
})
export class AplicanteComponent {
  reportForm!: FormGroup;
  listaEmpresa = [];
  listaTipoAplicante = applicationTypesOptions;
  listaCategoriaAplicante = categoryTpesOptions;
  listaEstadoAplicante = aplicanteStatusOptions;
  data: any[] = [];
  page = 0;
  first = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  messages = signal<any[]>([]);
  isPdfGenerating = false;

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private exportService: ExportService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.listaEmpresa = this.route.snapshot.data['listaEmpresa'].content.map((e: any) => ({ name: e.nome, value: e.id }));

    // Offer only the caller's own Direcao. Left unselected on purpose: the backend fills a null categoria in
    // with the caller's Direcao, and pre-selecting it would make the "fill at least one field" guard never fire.
    // categoryTpesOptions is a shared constant — assign a filtered copy, never mutate it.
    const user = this.authService.currentUserValue;
    if (user?.role?.name !== Role.admin && user?.direcao?.nome) {
      this.listaCategoriaAplicante = categoryTpesOptions.filter((o: any) => o.value === user.direcao.nome);
    }
  }

  onSubmit() {
    this.dataIsFetching = true;
    // A new filter always starts at page 1 — otherwise re-running a filter after paging queries page N of a
    // result set that may not have N pages.
    this.page = 0;
    this.first = 0;

    this.reportService.getAplicanteReport(this.buildFilter(), this.page, this.size).subscribe({
      next: (response) => {
        this.data = response.content;
        this.totalData = response.totalElements;
        this.dataIsFetching = false;
        this.addEmptyMessage();
      },
      error: (error) => {
        this.dataIsFetching = false;
        console.error('Error fetching report:', error);
      }
    });
  }

  isFormEmpty(form: FormGroup): boolean {
    return Object.values(form.value)
      .every(v => !v || (typeof v === 'string' && v.trim() === ''));
  }

  clearFilter(): void {
    this.reportForm.reset();
    this.data = [];
    this.messages.set([]);
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.first = event.first;
    this.size = event.rows;
    this.getPaginationData(this.page, this.size);
  }

  exportToExcel(): void {
    const mappedData = this.data.map((item: Aplicante) => ({
      'Empresa': item.empresa.nome,
      'Nº da Aplicante': item.numero,
      'Categoria': item.categoria,
      'Tipo de Aplicante': item.tipo,
      'Estado': item.estado,
      'Data de Aprovação': new DatePipe('pt-PT').transform(item.updatedAt, 'dd/MM/yyyy_HH:mm:ss') || 'N/A',
    }));
    const fileName = `Relatório do Aplicante_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcel(mappedData, fileName);

  }

  initForm() {
    this.reportForm = this._fb.group({
      tipo: [null],
      categoria: [null],
      estado: [null],
      empresaId: [null],
      updatedAtRange: [null],
    });
  }

  generatePDF(divId: string) {
    this.isPdfGenerating = true;
    const fileName = `Relatório de Aplicante_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toPdf(divId, fileName)
      .then(() => {
        this.isPdfGenerating = false;
      })
      .catch(() => {
        this.isPdfGenerating = false;
      });
  }

  /** Form value -> report filter: the date picker gives a range, the API wants two bounds. */
  private buildFilter(): any {
    const formData = { ...this.reportForm.value };

    if (formData.updatedAtRange != null) {
      const startDate = new Date(formData.updatedAtRange[0]);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(formData.updatedAtRange[1]);
      endDate.setHours(23, 59, 59, 999);

      formData.updatedAtFrom = startDate;
      formData.updatedAtTo = endDate;
      delete formData.updatedAtRange;
    }

    return formData;
  }

  private getPaginationData(page: number, size: number): void {
    // Was calling getEmpresaReport with the raw form value: page 2 replaced the aplicante rows with empresa
    // rows and dropped the date range entirely.
    this.reportService.getAplicanteReport(this.buildFilter(), page, size).subscribe({
      next: (response) => {
        this.data = response.content;
        this.totalData = response.totalElements;
        this.dataIsFetching = false;
      },
      error: (error) => {
        this.dataIsFetching = false;
        console.error('Error fetching paginated data:', error);
      }
    });
  }

  private addEmptyMessage(): void {
    this.messages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'Não existem dados disponíveis para o relatório selecionado.' }]);
  }
}
