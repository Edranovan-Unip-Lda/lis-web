import { Empresa } from '@/core/models/entities.model';
import { AplicanteType } from '@/core/models/enums';
import { DataMasterService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { ReportService } from '@/core/services/report.service';
import { applicationTypesOptions, caraterizacaEstabelecimentoOptions, categoryTpesOptions, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEstabelecimentoOptions, tipoPedidoVitoriaAll } from '@/core/utils/global-function';
import { DatePipe, formatDate } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { Paginator } from 'primeng/paginator';
import { Select, SelectFilterEvent } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-licencas-certificados',
  imports: [ReactiveFormsModule, Select, Button, DatePipe, TableModule, Message, Paginator, DatePicker],
  templateUrl: './licencas-certificados.component.html',
  styleUrl: './licencas-certificados.component.scss',
  providers: [MessageService]
})
export class LicencasCertificadosComponent {
  reportForm!: FormGroup;
  tipoAplicante!: AplicanteType;
  applicationTypesOpts = applicationTypesOptions;
  applicanteTypeFormControl = new FormControl<AplicanteType | null>(null, Validators.required);
  listaEmpresa = [];
  isPdfGenerating = false;

  // Geral
  listaCategoria = categoryTpesOptions;
  listaMunicipios = [];
  listaPostosAdministrativos = [];
  listaSucos = [];
  listaSucosAux = [];
  listaClasseAtividade: any[] = [];

  // Inscrição e Cadastro
  listaQuantoAtividade = quantoAtividadeoptions;
  listaTipoEstabelecimento = tipoEstabelecimentoOptions;
  listaCaraterizacaoEstabelecimento = caraterizacaEstabelecimentoOptions;
  listaRisco = nivelRiscoOptions;
  listaTipoAto = tipoAtoOptions;

  // Licenca de Atividade
  listaTipoVistoria = tipoPedidoVitoriaAll;

  data: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
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
    this.listaEmpresa = this.route.snapshot.data['listaEmpresa'].content.map((e: any) => ({ name: e.nome, value: e.id }));
    this.listaMunicipios = this.route.snapshot.data['listaMunicipios']._embedded.municipios.map((m: any) => ({ name: m.nome, value: m.id }));
    this.listaPostosAdministrativos = this.route.snapshot.data['listaPostosAdministrativos']._embedded.postos.map((p: any) => ({ name: p.nome, value: p.id }));
    this.listaSucos = this.route.snapshot.data['listaSucos']._embedded.sucos.map((s: any) => ({ name: s.nome, value: s.id }));
    this.listaSucosAux = [...this.listaSucos];
    this.listaClasseAtividade = this.route.snapshot.data['classeAtividadeResolver']._embedded.classeAtividade;

    this.applicanteTypeFormControl.valueChanges.subscribe((value) => {
      if (value) {
        this.tipoAplicante = value as AplicanteType;
        this.initForm(this.tipoAplicante);
      } else {
        this.tipoAplicante = undefined as any;
      }
    });

    this.setupSucoSearch();
  }


  onSubmit(categoria: string): void {
    this.dataIsFetching = true;
    this.messages.set([]);

    if (this.isFormEmpty(this.reportForm)) {
      this.dataIsFetching = false;
      this.messages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'Por favor, preencha pelo menos um campo para gerar o relatório.' }]);
      return;
    }

    switch (categoria) {
      case 'CADASTRO':
        const formDataCadastro = { ...this.reportForm.value };

        if (formDataCadastro.dataValidadeRange != null) {
          const startDateValidade = formatDate(formDataCadastro.dataValidadeRange[0], 'yyyy-MM-dd', 'en-US');  //new Date(formDataCadastro.dataValidadeRange[0]).toISOString().slice(0, 10);
          const endDateValidade = formatDate(formDataCadastro.dataValidadeRange[1], 'yyyy-MM-dd', 'en-US'); //new Date(formDataCadastro.dataValidadeRange[1]).toISOString().slice(0, 10);

          formDataCadastro.dataValidadeFrom = startDateValidade;
          formDataCadastro.dataValidadeTo = endDateValidade;
          delete formDataCadastro.dataValidadeRange;
        }

        if (formDataCadastro.dataEmissaoRange != null) {
          const startDateEmissao = formatDate(formDataCadastro.dataEmissaoRange[0], 'yyyy-MM-dd', 'en-US');
          const endDateEmissao = formatDate(formDataCadastro.dataEmissaoRange[1], 'yyyy-MM-dd', 'en-US');

          formDataCadastro.dataEmissaoFrom = startDateEmissao;
          formDataCadastro.dataEmissaoTo = endDateEmissao;
          delete formDataCadastro.dataEmissaoRange;
        }

        this.reportService.getCertificadoInscricaoReport(formDataCadastro, this.page, this.size).subscribe({
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
        break;
      case 'ATIVIDADE':
        const formDataAtividade = { ...this.reportForm.value };

        if (formDataAtividade.dataValidadeRange != null) {
          const startDateValidade = formatDate(formDataAtividade.dataValidadeRange[0], 'yyyy-MM-dd', 'en-US'); //new Date(formDataAtividade.dataValidadeRange[0]).toISOString().slice(0, 10);
          const endDateValidade = formatDate(formDataAtividade.dataValidadeRange[1], 'yyyy-MM-dd', 'en-US'); //new Date(formDataAtividade.dataValidadeRange[1]).toISOString().slice(0, 10);

          formDataAtividade.dataValidadeFrom = startDateValidade;
          formDataAtividade.dataValidadeTo = endDateValidade;
          delete formDataAtividade.dataValidadeRange;
        }

        if (formDataAtividade.dataEmissaoRange != null) {
          const startDateEmissao = new Date(formDataAtividade.dataEmissaoRange[0]).toISOString().slice(0, 10);
          const endDateEmissao = new Date(formDataAtividade.dataEmissaoRange[1]).toISOString().slice(0, 10);

          formDataAtividade.dataEmissaoFrom = startDateEmissao;
          formDataAtividade.dataEmissaoTo = endDateEmissao;
          delete formDataAtividade.dataEmissaoRange;
        }

        this.reportService.getCertficadoLicencaAtividadeReport(formDataAtividade, this.page, this.size).subscribe({
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
        break;
    }
  }

  isFormEmpty(form: FormGroup): boolean {
    return Object.values(form.value)
      .every(v => !v || (typeof v === 'string' && v.trim() === '')) && this.applicanteTypeFormControl.value == null;
  }

  clearFilter(): void {
    this.applicanteTypeFormControl.reset();

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
    const mappedData = this.data.map((item: any) => ({
      'Empresa': item.sociedadeComercial,
      'Nº': item.pedidoInscricaoCadastro ? item.pedidoInscricaoCadastro.aplicante.numero : item.pedidoLicencaAtividade.aplicante.numero,
      'Sede': `${item.sede.local} - ${item.sede.aldeia.nome}, ${item.sede.aldeia.suco.nome}, ${item.sede.aldeia.suco.postoAdministrativo.nome}, ${item.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
      'Data de Validade': new DatePipe('pt-PT').transform(item.dataValidade, 'dd/MM/yyyy') || 'N/A',
      'Data de Emissão': new DatePipe('pt-PT').transform(item.dataEmissao, 'dd/MM/yyyy') || 'N/A',
    }));
    const fileName = `Relatório de LicencasECertificados_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcel(mappedData, fileName);

  }

  generatePDF(divId: string) {
    this.isPdfGenerating = true;
    const fileName = `Relatório de LicencasECertificados_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toPdf(divId, fileName)
      .then(() => {
        this.isPdfGenerating = false;
      })
      .catch(() => {
        this.isPdfGenerating = false;
      });
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

  private initForm(tipo: AplicanteType) {
    switch (tipo) {
      case AplicanteType.cadastro:
        this.reportForm = this._fb.group({
          categoria: [null],
          empresaId: [null],
          tipoEstabelecimento: [null],
          caraterizacaoEstabelecimento: [null],
          risco: [null],
          ato: [null],
          classeAtividadeId: [null],
          dataValidadeRange: [null],
          dataEmissaoRange: [null],
          municipioId: [null],
          postoAdministrativoId: [null],
          sucoId: [null]
        });
        break;

      case AplicanteType.licenca:
        this.reportForm = this._fb.group({
          categoria: [null],
          empresaId: [null],
          municipioId: [null],
          postoAdministrativoId: [null],
          sucoId: [null],
          risco: [null],
          dataValidadeRange: [null],
          dataEmissaoRange: [null],
          classeAtividadeId: [null],
          tipoVistoria: [null],
          tipoEstabelecimento: [null],
          atividade: [null],
          tipoAtividade: [null]
        });
        break;
    }
  }
}
