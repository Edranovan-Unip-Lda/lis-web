import { AplicanteType } from '@/core/models/enums';
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
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';

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

  // Geral
  listaCategoria = categoryTpesOptions;
  listaMunicipios = [];
  listaPostosAdministrativos = [];
  listaSucos = [];
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

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private exportService: ExportService,
  ) { }

  ngOnInit() {
    this.listaEmpresa = this.route.snapshot.data['listaEmpresa'].content.map((e: any) => ({ name: e.nome, value: e.id }));
    this.listaMunicipios = this.route.snapshot.data['listaMunicipios']._embedded.municipios.map((m: any) => ({ name: m.nome, value: m.id }));
    this.listaPostosAdministrativos = this.route.snapshot.data['listaPostosAdministrativos']._embedded.postos.map((p: any) => ({ name: p.nome, value: p.id }));
    this.listaSucos = this.route.snapshot.data['listaSucos']._embedded.sucos.map((s: any) => ({ name: s.nome, value: s.id }));
    this.listaClasseAtividade = this.route.snapshot.data['classeAtividadeResolver']._embedded.classeAtividade;

    this.applicanteTypeFormControl.valueChanges.subscribe((value) => {
      if (value) {
        this.tipoAplicante = value as AplicanteType;
        this.initForm(this.tipoAplicante);
      } else {
        this.tipoAplicante = undefined as any;
      }
    });
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
    // this.reportService.getEmpresaReport(this.reportForm.value).subscribe({
    //   next: (response) => {
    //     const mappedData = response.content.map((item: Empresa) => ({
    //       'Empresa': item.nome,
    //       'Email': item.email,
    //       'Local': `${item.sede.local} - ${item.sede.aldeia.nome}, ${item.sede.aldeia.suco.nome}, ${item.sede.aldeia.suco.postoAdministrativo.nome}, ${item.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
    //       'Tipo de Propriedade': item.tipoPropriedade,
    //       'Tipo de Empresa': item.tipoEmpresa,
    //       'Sociedade Comercial': item.sociedadeComercial?.nome || 'N/A',
    //       'Gerente': item.gerente?.nome || 'N/A',
    //       'Telefone do Gerente': item.gerente?.telefone || 'N/A',
    //       'Data de Criação': new DatePipe('pt-PT').transform(item.createdAt, 'dd/MM/yyyy') || 'N/A',
    //     }));
    //     const fileName = `Relatório de Empresas_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    //     this.exportService.toExcel(mappedData, fileName);
    //   },
    //   error: (error) => {
    //     console.error('Error fetching data for export:', error);
    //   }
    // });

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
