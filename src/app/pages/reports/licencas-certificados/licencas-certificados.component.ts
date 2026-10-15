import { LanguageService, LocalizedDatePipe } from '@/core/i18n';
import { Empresa } from '@/core/models/entities.model';
import { AplicanteType } from '@/core/models/enums';
import { AuthenticationService, DataMasterService } from '@/core/services';
import { ExportService } from '@/core/services/export.service';
import { ExportacaoService } from '@/core/services/exportacao.service';
import { ReportService } from '@/core/services/report.service';
import { applicationTypesOptions, caraterizacaEstabelecimentoOptions, categoryTpesOptions, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEstabelecimentoOptions, tipoPedidoVitoriaAll } from '@/core/utils/global-function';
import { DatePipe, formatDate } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { Paginator } from 'primeng/paginator';
import { Select, SelectFilterEvent } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-licencas-certificados',
  imports: [LocalizedDatePipe, ReactiveFormsModule, Select, Button, TableModule, Message, Paginator, DatePicker, TranslatePipe, ConfirmDialog, Toast],
  templateUrl: './licencas-certificados.component.html',
  styleUrl: './licencas-certificados.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class LicencasCertificadosComponent {
  reportForm!: FormGroup;
  tipoAplicante!: AplicanteType;
  applicationTypesOpts = applicationTypesOptions;
  applicanteTypeFormControl = new FormControl<AplicanteType | null>(null, Validators.required);
  listaEmpresa = [];
  isPdfGenerating = false;
  isExporting = false;
  private lastFilter: any = null;
  private lastFilterTipo!: AplicanteType;

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
  private i18n = inject(LanguageService);
  private exportacaoService = inject(ExportacaoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private exportService: ExportService,
    private dataMasterService: DataMasterService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.listaEmpresa = this.route.snapshot.data['listaEmpresa'].content.map((e: any) => ({ name: e.nome, value: e.id }));
    this.listaMunicipios = (this.route.snapshot.data['listaMunicipios']?._embedded?.municipios ?? []).map((m: any) => ({ name: m.nome, value: m.id }));
    this.listaPostosAdministrativos = (this.route.snapshot.data['listaPostosAdministrativos']?._embedded?.postos ?? []).map((p: any) => ({ name: p.nome, value: p.id }));
    this.listaSucos = (this.route.snapshot.data['listaSucos']?._embedded?.sucos ?? []).map((s: any) => ({ name: s.nome, value: s.id }));
    this.listaSucosAux = [...this.listaSucos];
    this.listaClasseAtividade = (this.route.snapshot.data['classeAtividadeResolver']?._embedded?.classeAtividade ?? []);

    this.applicanteTypeFormControl.valueChanges.subscribe((value) => {
      if (value) {
        this.tipoAplicante = value as AplicanteType;
        this.initForm(this.tipoAplicante);
      } else {
        this.tipoAplicante = undefined as any;
      }
    });

    // Offer only the caller's own Direcao. Set here rather than in initForm — this is the p-select's options
    // array, not a form control, so it survives the rebuild initForm does on every aplicante-type change. Left
    // unselected on purpose: the backend fills a null categoria in with the caller's Direcao, and pre-selecting
    // it would make isFormEmpty() never fire. categoryTpesOptions is shared — filter a copy, never mutate it.
    const user = this.authService.currentUserValue;
    if (!this.authService.seesAllCategorias && user?.direcao?.nome) {
      this.listaCategoria = categoryTpesOptions.filter((o: any) => o.value === user.direcao.nome);
    }

    this.setupSucoSearch();
  }


  onSubmit(categoria: string): void {
    this.dataIsFetching = true;
    this.messages.set([]);

    if (this.isFormEmpty(this.reportForm)) {
      this.dataIsFetching = false;
      this.messages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'reports.licencasCertificados.fillOne' }]);
      return;
    }

    // Remembered so the ZIP export targets exactly the rows on screen, even if the form was edited since.
    this.lastFilter = this.buildFilter();
    this.lastFilterTipo = categoria as AplicanteType;
    const request$ = categoria === AplicanteType.cadastro
      ? this.reportService.getCertificadoInscricaoReport(this.lastFilter, this.page, this.size)
      : this.reportService.getCertficadoLicencaAtividadeReport(this.lastFilter, this.page, this.size);
    request$.subscribe({
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

  /**
   * The report filter body, shared by the report query and the bulk PDF export so both always select the same
   * certificates. Date ranges become yyyy-MM-dd bounds in local time (formatDate, not toISOString, which shifts
   * a day east of UTC).
   */
  private buildFilter(): any {
    const { dataValidadeRange, dataEmissaoRange, ...filter } = this.reportForm.value;
    const day = (d: Date) => formatDate(d, 'yyyy-MM-dd', 'en-US');
    if (dataValidadeRange?.[0]) {
      filter.dataValidadeFrom = day(dataValidadeRange[0]);
      filter.dataValidadeTo = day(dataValidadeRange[1] ?? dataValidadeRange[0]);
    }
    if (dataEmissaoRange?.[0]) {
      filter.dataEmissaoFrom = day(dataEmissaoRange[0]);
      filter.dataEmissaoTo = day(dataEmissaoRange[1] ?? dataEmissaoRange[0]);
    }
    return filter;
  }

  /** Queue a background job that zips every matching certificate's own PDF, then go watch it on Exportações. */
  exportZip(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: this.i18n.instant('common.confirm'),
      icon: 'pi pi-file-export',
      message: this.i18n.instant('reports.exportacoes.confirm', { n: this.totalData }),
      acceptLabel: this.i18n.instant('reports.exportacoes.confirmAccept'),
      rejectLabel: this.i18n.instant('common.cancel'),
      rejectButtonProps: { label: this.i18n.instant('common.cancel'), severity: 'secondary', outlined: true },
      acceptButtonProps: { label: this.i18n.instant('reports.exportacoes.confirmAccept') },
      accept: () => {
        this.isExporting = true;
        this.exportacaoService.create(this.lastFilterTipo, this.lastFilter).subscribe({
          next: () => {
            this.isExporting = false;
            this.router.navigate(['/relatorios/exportacoes']);
          },
          error: (message) => {
            this.isExporting = false;
            this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: message });
          }
        });
      }
    });
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
    // Re-run the active certificate query — this used to call getEmpresaReport, replacing certificate rows
    // with empresa rows from page 2 on.
    this.onSubmit(this.tipoAplicante);
  }

  exportToExcel(): void {
    const h = (key: string) => this.i18n.instant(key);
    const mappedData = this.data.map((item: any) => ({
      [h('reports.common.empresa')]: item.sociedadeComercial,
      [h('reports.licencasCertificados.numero')]: item.pedidoInscricaoCadastro ? item.pedidoInscricaoCadastro.aplicante.numero : item.pedidoLicencaAtividade.aplicante.numero,
      [h('reports.common.sede')]: `${item.sede.local} - ${item.sede.aldeia.nome}, ${item.sede.aldeia.suco.nome}, ${item.sede.aldeia.suco.postoAdministrativo.nome}, ${item.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
      [h('reports.licencasCertificados.dataValidade')]: new DatePipe('pt-PT').transform(item.dataValidade, 'dd/MM/yyyy') || 'N/A',
      [h('reports.licencasCertificados.dataEmissao')]: new DatePipe('pt-PT').transform(item.dataEmissao, 'dd/MM/yyyy') || 'N/A',
    }));
    const fileName = `${h('reports.licencasCertificados.fileName')}_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
    this.exportService.toExcel(mappedData, fileName);

  }

  generatePDF(divId: string) {
    this.isPdfGenerating = true;
    const fileName = `${this.i18n.instant('reports.licencasCertificados.fileName')}_${new DatePipe('pt-PT').transform(new Date(), 'ddMMyyyy_HHmmss')}`;
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
          this.listaSucos = (response?._embedded?.sucos ?? []).map((s: any) => ({ name: s.nome, value: s.id }));
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

  private addEmptyMessage(): void {
    this.messages.set([{ icon: 'pi pi-info-circle', size: 'large', severity: 'info', content: 'reports.common.noData' }]);
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
