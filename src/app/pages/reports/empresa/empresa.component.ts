import { Empresa } from '@/core/models/entities.model';
import { DataMasterService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { ReportService } from '@/core/services/report.service';
import { tipoEmpresaOptions, tipoPropriedadeOptions } from '@/core/utils/global-function';
import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Paginator } from 'primeng/paginator';
import { Select, SelectFilterEvent } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-empresa',
  imports: [ReactiveFormsModule, Select, Button, DatePipe, TableModule, Message, Paginator, NgxPrintModule],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss',
  providers: [MessageService]
})
export class EmpresaComponent {
  reportForm!: FormGroup;
  listaSociedadeComercial = [];
  listaTipoPropriedade = tipoPropriedadeOptions;
  listaTipoEmpresa = tipoEmpresaOptions;
  listaMunicipios = [];
  listaPostosAdministrativos = [];
  listaSucos = [];
  listaSucosAux = [];
  data: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  isPdfGenerating = false;
  messages = signal<any[]>([]);
  private sucoSearchSubject = new Subject<string>();
  sucoIsLoading = false;


  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private exportService: ExportService,
    private dataMasterService: DataMasterService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.listaSociedadeComercial = this.route.snapshot.data['listaSociedadeComercial']._embedded.sociedadeComercial.map((s: any) => ({ name: s.nome, value: s.id }));
    this.listaMunicipios = this.route.snapshot.data['listaMunicipios']._embedded.municipios.map((m: any) => ({ name: m.nome, value: m.id }));
    this.listaPostosAdministrativos = this.route.snapshot.data['listaPostosAdministrativos']._embedded.postos.map((p: any) => ({ name: p.nome, value: p.id }));
    this.listaSucos = this.route.snapshot.data['listaSucos']._embedded.sucos.map((s: any) => ({ name: s.nome, value: s.id }));
    this.listaSucosAux = [...this.listaSucos];
    this.setupSucoSearch();
  }

  setupSucoSearch(): void {
    this.sucoSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.length >= 3) {
          this.sucoIsLoading = true;
          return this.dataMasterService.searchSucosByNome(query).pipe(
            catchError(error => {
              console.error('Error searching sucos:', error);
              this.sucoIsLoading = false;
              return of(null);
            })
          );
        } else {
          this.sucoIsLoading = false;
          return of(null);
        }
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.listaSucos = response._embedded.sucos.map((s: any) => ({ name: s.nome, value: s.id }));
        } else {
          this.listaSucos = [...this.listaSucosAux];
        }
        this.sucoIsLoading = false;
      }
    });
  }

  onSubmit() {
    this.dataIsFetching = true;
    this.reportService.getEmpresaReport(this.reportForm.value, this.page, this.size).subscribe({
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
    this.size = event.rows;
    this.getPaginationData(this.page, this.size);
  }

  exportToExcel(): void {
    const mappedData = this.data.map((item: Empresa) => ({
      'Empresa': item.nome,
      'Email': item.email,
      'Local': `${item.sede.local} - ${item.sede.aldeia.nome}, ${item.sede.aldeia.suco.nome}, ${item.sede.aldeia.suco.postoAdministrativo.nome}, ${item.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
      'Tipo de Propriedade': item.tipoPropriedade,
      'Tipo de Empresa': item.tipoEmpresa,
      'Sociedade Comercial': item.sociedadeComercial?.nome || 'N/A',
      'Gerente': item.gerente?.nome || 'N/A',
      'Telefone do Gerente': item.gerente?.telefone || 'N/A',
      'Data de Criação': new DatePipe('pt-PT').transform(item.createdAt, 'dd/MM/yyyy') || 'N/A',
    }));
    const fileName = `Relatório de Empresas_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcel(mappedData, fileName);
  }

  sucoFilter(event: SelectFilterEvent): void {
    const query = event.filter?.trim().toLowerCase() || '';
    this.sucoSearchSubject.next(query);
  }

  private getPaginationData(page: number, size: number): void {
    this.reportService.getEmpresaReport(this.reportForm.value, page, size).subscribe({
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

  initForm() {
    this.reportForm = this._fb.group({
      tipoPropriedade: [null],
      tipoEmpresa: [null],
      sociedadeComercialId: [null],
      municipioId: [null],
      postoAdministrativoId: [null],
      sucoId: [null]
    });
  }

  generatePDF(divId: string) {
    this.isPdfGenerating = true;
    const fileName = `Relatório de Empresas_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toPdf(divId, fileName)
      .then(() => {
        this.isPdfGenerating = false;
      })
      .catch(() => {
        this.isPdfGenerating = false;
      });
  }
}
