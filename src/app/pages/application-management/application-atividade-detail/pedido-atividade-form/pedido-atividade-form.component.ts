import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Documento, Empresa, Gerente, PedidoAtividadeLicenca, Representante } from '@/core/models/entities.model';
import { Categoria, PedidoStatus } from '@/core/models/enums';
import { AuthenticationService, EmpresaService, FileUploadService } from '@/core/services';
import { AplicanteService } from '@/core/services/aplicante.service';
import { DataMasterService } from '@/core/services/data-master.service';
import { DocumentosService } from '@/core/services/documentos.service';
import { formatDateForLocalDate, mapToAtividadeEconomica, mapToIdAndNome, maxFileSizeUpload, pedidoLicencaDocumentsFields, stateOptions, tipoArrendadorOptions, tipoDocumentoOptions, tipoPedidoAtividadeComercialOptions, tipoPedidoAtividadeIndustrialOptions } from '@/core/utils/global-function';
import { pedidoAtividadeWithFilesValidator } from '@/core/validators/must-match';
import { Component, DestroyRef, inject, Input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { Select, SelectFilterEvent } from 'primeng/select';
import { SelectButton, SelectButtonChangeEvent } from 'primeng/selectbutton';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { finalize, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pedido-atividade-form',
  imports: [ReactiveFormsModule, Select, SelectButton, InputText, Button, Toast, FileUpload, DatePicker, InputGroup, InputGroupAddon, InputNumber, ProgressBar, Tag],
  templateUrl: './pedido-atividade-form.component.html',
  styleUrl: './pedido-atividade-form.component.scss',
  providers: [MessageService]
})
export class PedidoAtividadeFormComponent {
  @Input() aplicanteData!: Aplicante;
  requestForm!: FormGroup;
  tipoPedidoAtividadeComercialOpts = tipoPedidoAtividadeComercialOptions;
  tipoPedidoAtividadeIndustrialOpts = tipoPedidoAtividadeIndustrialOptions;
  @Input() listaAldeia: any[] = [];
  @Input() listaClasseAtividade: any[] = [];
  @Input() disabledAllForm!: boolean;
  originalAldeias: any[] = [];
  listaAldeiaEmpresa: any[] = [];
  listaAldeiaRepresentante: any[] = [];
  listaAldeiaGerente: any[] = [];
  listaAldeiaArrendador: any[] = [];
  isNew = false;
  isLoading = false;
  draftLoading = false;

  // Exposed for the template Rascunho tag.
  PedidoStatus = PedidoStatus;
  private destroyRef = inject(DestroyRef);
  uploadedDocs: any[] = [];
  uploadURLDocs = signal(`${environment.apiUrl}/documentos`);
  maxFileSize = maxFileSizeUpload;
  loadingUploadButtons = new Set<String>();
  // Keyed by file.id (unique) — NOT file.nome, which collides when two docs share a name.
  loadingDownloadButtons = new Set<number>();
  loadingRemoveButtons = new Set<number>();
  showcontratoArrendamentoForm = false;
  showArrendadorForm = false;
  tipoDocumentoOpts = tipoDocumentoOptions;
  tipoArrendadorOpts = tipoArrendadorOptions;
  pedidoLicencaDocumentsFields = pedidoLicencaDocumentsFields;

  stateOpts = stateOptions;
  dataSent = output<any>();
  invalidRequiredFields: string[] = [];

  constructor(
    private _fb: FormBuilder,
    private dataMasterService: DataMasterService,
    private aplicanteService: AplicanteService,
    private messageService: MessageService,
    private documentoService: DocumentosService,
    private authService: AuthenticationService,
    private empresaService: EmpresaService,
    private fileUploadService: FileUploadService,
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.copyAldeiaList(this.listaAldeia);

    this.empresaService.getAplicanteByEmpresaIdAndAplicanteId(this.aplicanteData.empresa.id, this.aplicanteData.id).subscribe({
      next: (aplicante: Aplicante) => {
        this.aplicanteData = aplicante;

        if (this.aplicanteData.pedidoLicencaAtividade) {
          this.mapRequestFormData(this.aplicanteData.pedidoLicencaAtividade);
          if (this.disabledAllForm) {
            this.requestForm.disable();
          }
        } else {
          this.isNew = true;
          this.mapFormEmpresa(this.aplicanteData.empresa);
        }
      }
    });



    this.uploadURLDocs.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);
    if (this.disabledAllForm) {
      this.requestForm.disable();
    }


    const contratoArrendamentoCtrl = this.requestForm.get('contratoArrendamento');
    const arrendadorGroup = this.requestForm.get('arrendador') as FormGroup;
    const tipoCtrl = arrendadorGroup.get('tipo');
    const nomeCtrl = arrendadorGroup.get('nome');
    const tipoDocumentoCtrl = arrendadorGroup.get('tipoDocumento');
    const numeroDocumentoCtrl = arrendadorGroup.get('numeroDocumento');


    // 🔹 When contratoArrendamento changes — toggle the arrendador field validators.
    // Visibility of the subform is driven by documentoPropriedade === false (see
    // documentoPropriedadeOnChange / mapRequestFormData), so it's always on-screen
    // whenever a contract makes these fields required — no hidden-required lockout.
    contratoArrendamentoCtrl?.valueChanges.subscribe((value) => {
      const arrendadorGroup = this.requestForm.get('arrendador') as FormGroup;
      this.setArrendadorValidators(arrendadorGroup, value === true);
    });

    // 🔹 When tipo changes (to control nome requirement)
    tipoCtrl?.valueChanges.subscribe((tipoValue) => {
      if (contratoArrendamentoCtrl?.value === true) {
        if (tipoValue === 'Estado') {
          nomeCtrl?.clearValidators();
          tipoDocumentoCtrl?.clearValidators();
          numeroDocumentoCtrl?.clearValidators();
        } else {
          nomeCtrl?.setValidators([Validators.required]);
          tipoDocumentoCtrl?.setValidators([Validators.required]);
          numeroDocumentoCtrl?.setValidators([Validators.required]);
        }
        nomeCtrl?.updateValueAndValidity({ emitEvent: false });
        tipoDocumentoCtrl?.updateValueAndValidity({ emitEvent: false });
        numeroDocumentoCtrl?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }


  save(form: FormGroup): void {
    this.isLoading = true;
    let formData = this.mapFormData(form, false);

    this.aplicanteService.savePedidoAtividade(this.aplicanteData.id, formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.requestForm.get('id')?.setValue(res.id);
        this.aplicanteData.pedidoLicencaAtividade = res;
        this.isNew = false;
        this.addMessages(true, true);
        this.dataSent.emit(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.handleSubmitError(err, true);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  update(form: FormGroup): void {
    this.isLoading = true;

    let formData = this.mapFormData(form, false);

    this.aplicanteService.updatePedidoAtividade(this.aplicanteData.id, this.aplicanteData.pedidoLicencaAtividade.id, formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.requestForm.get('id')?.setValue(res.id);
        this.aplicanteData.pedidoLicencaAtividade = res;
        this.isNew = false;
        this.addMessages(true, false);
        this.dataSent.emit(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.handleSubmitError(err, false);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Null-safe draft save (EM_CURSO): tolerates a partial form, does NOT require form.valid.
  // Creates when no pedido exists yet, otherwise updates. Emits so the parent refreshes its gate.
  saveDraft(form: FormGroup): void {
    this.draftLoading = true;
    const formData = this.mapFormData(form, true);

    if (this.isNew) {
      this.aplicanteService.savePedidoAtividade(this.aplicanteData.id, formData, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.requestForm.get('id')?.setValue(res.id);
          this.aplicanteData.pedidoLicencaAtividade = res;
          this.isNew = false;
          this.addMessages(true, true);
          this.dataSent.emit(res);
        },
        error: (err) => this.handleSubmitError(err, true),
        complete: () => this.draftLoading = false
      });
    } else {
      this.aplicanteService.updatePedidoAtividade(this.aplicanteData.id, this.aplicanteData.pedidoLicencaAtividade.id, formData, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.requestForm.get('id')?.setValue(res.id);
          this.aplicanteData.pedidoLicencaAtividade = res;
          this.addMessages(true, false);
          this.dataSent.emit(res);
        },
        error: (err) => this.handleSubmitError(err, false),
        complete: () => this.draftLoading = false
      });
    }
  }

  get pedidoIsDraft(): boolean {
    return this.aplicanteData?.pedidoLicencaAtividade?.status === PedidoStatus.emCurso;
  }

  // 400 from draft=false submit → server returns a Portuguese message listing missing fields; surface it.
  private handleSubmitError(error: any, isNew: boolean): void {
    const serverMessage = error?.error?.message;
    if (error?.status === 400 && serverMessage) {
      this.messageService.add({ severity: 'error', summary: 'Erro de validação', detail: serverMessage });
    } else {
      this.addMessages(false, isNew, error);
    }
  }

  aldeiaOnChange(event: any, controlName: string): void {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.requestForm.get(controlName)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.requestForm.get('empresaSede')?.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  aldeiaNestedOnChange(event: any, parentControlName: string, childControlName: string): void {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.requestForm.get(parentControlName)?.get(childControlName)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.requestForm.get(parentControlName)?.get(childControlName)?.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  aldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaEmpresa = (resp?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaEmpresa = [...this.originalAldeias];
    }
  }

  representanteAldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaRepresentante = (resp?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaRepresentante = [...this.originalAldeias];
    }
  }

  gerenteAldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaGerente = (resp?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaGerente = [...this.originalAldeias];
    }
  }

  arrendadorAldeiaFilter(event: SelectFilterEvent): void {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaArrendador = (resp?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaArrendador = [...this.originalAldeias];
    }
  }


  onPanelHide() {
    this.listaAldeia = [...this.originalAldeias];
  }

  tipoAtividadeChange(event: any): void {
    this.requestForm.get('risco')?.setValue(event.value.tipoRisco);
  }

  atividadePrincipalChange(event: any): void {
    if (event.value) {
      this.requestForm.get('classeAtividadeCodigo')?.patchValue(event.value.descricao);

      this.requestForm.get('tipoAtividadeCodigo')?.setValue(event.value.grupoAtividade.descricao);
      this.requestForm.get('tipoAtividade')?.setValue(event.value.grupoAtividade.codigo);
      this.requestForm.get('risco')?.setValue(event.value.tipoRisco);
    } else {
      this.requestForm.get('classeAtividadeCodigo')?.reset();
      this.requestForm.get('tipoAtividadeCodigo')?.reset();
      this.requestForm.get('tipoAtividade')?.reset();
      this.requestForm.get('risco')?.reset();
    }
  }

  classeAtividadeFilter(event: SelectFilterEvent) {
    const query = event.filter?.replace(/\s/g, '').replace(/\D/g, '');

    if (query && query.length >= 2) {
      this.dataMasterService.searchClasseByCodigo(query).subscribe({
        next: resp => {
          this.listaClasseAtividade = mapToAtividadeEconomica((resp?._embedded?.classeAtividade ?? []));
        }
      });
    }
  }

  tipoPedidoOpts(categoria: Categoria): any[] {
    return categoria === Categoria.comercial ? tipoPedidoAtividadeComercialOptions : tipoPedidoAtividadeIndustrialOptions;
  }

  documentoPropriedadeOnChange(event: SelectButtonChangeEvent): void {
    const needsContrato = event.value === false;
    // NAO → reveal the whole rental path (contrato upload + Arrendador block).
    this.showcontratoArrendamentoForm = needsContrato;
    this.showArrendadorForm = needsContrato;

    if (!needsContrato) {
      // true (owns the property) or cleared → no rental path. Clear contrato so its
      // required validators — and the Arrendador subform (via valueChanges) — stop
      // blocking Save. Resetting contratoArrendamento cascades through the subscription.
      this.requestForm.get('contratoArrendamento')?.reset();
      this.requestForm.get('contratoArrendamentoFile')?.reset();
      this.requestForm.get('arrendador')?.reset();
    }
  }

  // Routes through HttpClient (interceptor adds auth + CSRF) instead of PrimeNG's native XHR.
  onUploadDocs(event: any, field?: string, uploader?: FileUpload): void {
    if (field) this.loadingUploadButtons.add(field);
    this.fileUploadService.upload<Documento[]>(this.uploadURLDocs(), event.files, 'post', 'files')
      .pipe(finalize(() => {
        if (field) this.loadingUploadButtons.delete(field);
        uploader?.clear();
      }))
      .subscribe({
        next: (uploadedFiles) => {
          if (uploadedFiles && uploadedFiles.length > 0) {
            if (field) {
              const file = uploadedFiles[0];
              file.coluna = field;
              uploadedFiles.forEach(doc => { doc.coluna = field; });
              this.requestForm.get(field)?.setValue(true); // Set true if file is uploaded
              this.requestForm.get(`${field}File`)?.setValue(file);
              this.requestForm.get(`${field}File`)?.updateValueAndValidity();
            }
            this.uploadedDocs = [...this.uploadedDocs, ...uploadedFiles];
          }
          this.messageService.add({
            severity: 'info',
            summary: 'Sucesso',
            detail: 'Arquivos carregado com sucesso!'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha no carregamento do arquivo!'
          });
        }
      });
  }

  getFileByField(field: string): Documento {
    return this.uploadedDocs.find(doc => doc.coluna === field) || null;
  }


  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.id);
    this.documentoService.downloadById(file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.nome;
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'info',
          summary: 'Sucesso',
          detail: 'Arquivo descarregado com sucesso!'
        });
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
        this.loadingDownloadButtons.delete(file.id);
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.id);
      }
    });
  }

  removeDoc(file: Documento) {
    const index = this.uploadedDocs.indexOf(file);
    if (index === -1) return;

    if (!file.id) {
      // Local (not yet persisted) file — remove synchronously, no spinner needed.
      this.uploadedDocs.splice(index, 1);
      this.requestForm.get(`${file.coluna}File`)?.setValue(null);
      this.requestForm.get(`${file.coluna}File`)?.updateValueAndValidity();
      return;
    }

    this.loadingRemoveButtons.add(file.id);
    this.documentoService.deleteById(file.id).subscribe({
      next: () => {
        this.uploadedDocs.splice(index, 1);
        this.messageService.add({
          severity: 'info',
          summary: 'Sucesso',
          detail: 'Arquivo foi removido com sucesso!'
        });
        this.loadingRemoveButtons.delete(file.id);
      },
      error: error => {
        this.loadingRemoveButtons.delete(file.id);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no removero arquivo!'
        });
      },
    });
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  private initForm(): void {
    this.requestForm = this._fb.group({
      id: [null],
      tipo: [null, [Validators.required]],
      nomeEmpresa: new FormControl({ value: null, disabled: true }),
      empresaNumeroRegistoComercial: new FormControl({ value: null, disabled: true }),
      empresaSede: this._fb.group({
        id: [null],
        local: new FormControl({ value: null, disabled: true }),
        aldeia: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      classeAtividade: [null, [Validators.required]],
      classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      tipoAtividade: new FormControl({ value: null, disabled: true }),
      tipoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      risco: new FormControl({ value: null, disabled: true }),
      estatutoSociedadeComercial: [null, [Validators.required]],
      empresaNif: new FormControl({ value: null, disabled: true }),
      representante: this.initPersonForm(),
      gerente: this.initPersonForm(),
      planta: [null],
      plantaFile: [null],
      documentoPropriedade: [null],
      documentoPropriedadeFile: [null],
      documentoImovel: [null],
      documentoImovelFile: [null],
      contratoArrendamento: [null],
      contratoArrendamentoFile: [null],
      planoEmergencia: [null],
      planoEmergenciaFile: [null],
      estudoAmbiental: [null],
      estudoAmbientalFile: [null],
      provasMOPFile: [null],
      provasANLAFile: [null],
      numEmpregosCriados: new FormControl({ value: this.aplicanteData.empresa.totalTrabalhadores, disabled: true }),
      numEmpregadosCriar: [null, [Validators.required, Validators.min(1)]],
      arrendador: this._fb.group({
        id: [null],
        tipo: [null],
        nome: [null],
        endereco: this._fb.group({
          id: [null],
          local: [null],
          aldeia: [null],
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
        tipoDocumento: [null],
        numeroDocumento: [null],
        areaTotalTerreno: [null],
        areaTotalConstrucao: [null],
        dataInicio: [null],
        dataFim: [null],
        valorRendaMensal: [null],
      }),
    }, {
      validators: [pedidoAtividadeWithFilesValidator()]
    });
  }

  private copyAldeiaList(aldeias: Aldeia[]) {
    const copy = () => [...aldeias];
    [
      this.originalAldeias,
      this.listaAldeiaEmpresa,
      this.listaAldeiaRepresentante,
      this.listaAldeiaGerente,
      this.listaAldeiaArrendador,
    ] = [copy(), copy(), copy(), copy(), copy()];
  }

  private mapRequestFormData(request: PedidoAtividadeLicenca) {
    this.requestForm.patchValue({
      ...request,
      tipoAtividade: request.classeAtividade.grupoAtividade.codigo,
      tipoAtividadeCodigo: request.classeAtividade.grupoAtividade.descricao,
      classeAtividade: {
        id: request.classeAtividade.id,
        codigo: request.classeAtividade.codigo,
        descricao: request.classeAtividade.descricao,
        tipoRisco: request.classeAtividade.tipoRisco,
        grupoAtividade: {
          id: request.classeAtividade.grupoAtividade.id,
          codigo: request.classeAtividade.grupoAtividade.codigo,
          descricao: request.classeAtividade.grupoAtividade.descricao,
        }
      },
      classeAtividadeCodigo: request.classeAtividade.descricao,
      arrendador: {
        ...request.arrendador,
        dataInicio: request.arrendador?.dataInicio ? new Date(request.arrendador.dataInicio) : null,
        dataFim: request.arrendador?.dataFim ? new Date(request.arrendador.dataFim) : null,
        endereco: {
          ...request.arrendador?.endereco,
          aldeia: request.arrendador?.endereco.aldeia.id,
          suco: request.arrendador?.endereco.aldeia.suco.nome,
          postoAdministrativo: request.arrendador?.endereco.aldeia.suco.postoAdministrativo.nome,
          municipio: request.arrendador?.endereco.aldeia.suco.postoAdministrativo.municipio.nome,
        }
      }
    });
    this.uploadedDocs = [...request.documentos];
    this.uploadedDocs.forEach(doc => {
      this.requestForm.get(`${doc.coluna}File`)?.setValue(doc);
    })

    const empresaSedeService = this.dataMasterService.getAldeiasBySuco(request.empresaSede.aldeia.suco.id);
    const representanteService = this.dataMasterService.getAldeiasBySuco(request.representante.morada.aldeia.suco.id);
    const gerenteService = this.dataMasterService.getAldeiasBySuco(request.gerente.morada.aldeia.suco.id);

    // Restore the rental path on load: documentoPropriedade === NAO reveals both the
    // contrato upload and the Arrendador subform (the latter is nested inside the former).
    const isRental = request.documentoPropriedade === false;
    this.showcontratoArrendamentoForm = isRental;
    this.showArrendadorForm = isRental;

    forkJoin([empresaSedeService, representanteService, gerenteService]).subscribe({
      next: ([empresaSedeResponse, representanteResponse, gerenteResponse]) => {
        this.listaAldeiaEmpresa = [...mapToIdAndNome((empresaSedeResponse?._embedded?.aldeias ?? [])), ...this.listaAldeia];
        this.listaAldeiaRepresentante = [...mapToIdAndNome((representanteResponse?._embedded?.aldeias ?? []))];
        this.listaAldeiaGerente = [...mapToIdAndNome((gerenteResponse?._embedded?.aldeias ?? []))];

        this.requestForm.get('empresaSede')?.patchValue({
          aldeia: request.empresaSede.aldeia.id,
          suco: request.empresaSede.aldeia.suco.nome,
          postoAdministrativo: request.empresaSede.aldeia.suco.postoAdministrativo.nome,
          municipio: request.empresaSede.aldeia.suco.postoAdministrativo.municipio.nome
        });
        this.requestForm.get('representante')?.get('morada')?.patchValue({
          aldeia: request.representante.morada.aldeia.id,
          suco: request.representante.morada.aldeia.suco.nome,
          postoAdministrativo: request.representante.morada.aldeia.suco.postoAdministrativo.nome,
          municipio: request.representante.morada.aldeia.suco.postoAdministrativo.municipio.nome
        });
        this.requestForm.get('gerente')?.get('morada')?.patchValue({
          aldeia: request.gerente.morada.aldeia.id,
          suco: request.gerente.morada.aldeia.suco.nome,
          postoAdministrativo: request.gerente.morada.aldeia.suco.postoAdministrativo.nome,
          municipio: request.gerente.morada.aldeia.suco.postoAdministrativo.municipio.nome
        });
      }
    });
    this.listaClasseAtividade.push(this.requestForm.get('classeAtividade')?.value);
  }

  // draft=true keeps the mapping null-safe so a partially-filled form can still be persisted as EM_CURSO.
  private mapFormData(form: FormGroup, draft = false): any {
    const formData = form.getRawValue();
    let mapArrendador = null;
    if (formData.contratoArrendamento) {
      mapArrendador = {
        ...formData.arrendador,
        endereco: {
          ...formData.arrendador.endereco,
          aldeia: {
            id: formData.arrendador.endereco.aldeia
          }
        },
        dataInicio: formatDateForLocalDate(formData.arrendador.dataInicio),
        dataFim: formatDateForLocalDate(formData.arrendador.dataFim),
      }
    }
    return {
      ...formData,
      empresaSede: {
        ...formData.empresaSede,
        aldeia: {
          id: formData.empresaSede.aldeia,
        }
      },
      classeAtividade: draft
        ? (formData.classeAtividade?.id ? { id: formData.classeAtividade.id } : null)
        : { id: formData.classeAtividade.id },

      representante: {
        ...formData.representante,
        id: null,
        morada: {
          ...formData.representante.morada,
          id: null,
          aldeia: {
            id: formData.representante.morada.aldeia
          }
        }
      },
      gerente: {
        ...formData.gerente,
        id: null,
        morada: {
          ...formData.gerente.morada,
          id: null,
          aldeia: {
            id: formData.gerente.morada.aldeia
          }
        }
      },
      arrendador: mapArrendador,
      documentos: this.uploadedDocs
    }
  }

  private mapFormEmpresa(empresa: Empresa) {
    this.requestForm.get('nomeEmpresa')?.setValue(empresa.nome);
    this.requestForm.get('empresaNumeroRegistoComercial')?.setValue(empresa.numeroRegistoComercial);
    this.requestForm.get('empresaSede')?.get('local')?.setValue(empresa.sede.local);
    this.requestForm.get('empresaNif')?.setValue(empresa.nif);

    this.dataMasterService.getAldeiasBySuco(empresa.sede.aldeia.suco.id).subscribe(resp => {
      this.listaAldeiaEmpresa = (resp?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, id: a.id }));
      this.requestForm.get('empresaSede')?.get('aldeia')?.setValue(empresa.sede.aldeia.id);
      this.requestForm.get('empresaSede')?.get('suco')?.setValue(empresa.sede.aldeia.suco.nome);
      this.requestForm.get('empresaSede')?.get('postoAdministrativo')?.setValue(empresa.sede.aldeia.suco.postoAdministrativo.nome);
      this.requestForm.get('empresaSede')?.get('municipio')?.setValue(empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome);
    });

    this.mapRepresentante(empresa.representante);
    this.mapGerente(empresa.gerente);
  }

  private mapRepresentante(obj: Representante): void {
    this.requestForm.patchValue({
      representante: {
        ...obj,
        morada: {
          ...obj.morada,
          aldeia: obj.morada.aldeia.id,
          suco: obj.morada.aldeia.suco.nome,
          postoAdministrativo: obj.morada.aldeia.suco.postoAdministrativo.nome,
          municipio: obj.morada.aldeia.suco.postoAdministrativo.municipio.nome,
        }
      }
    });
  }

  private mapGerente(obj: Gerente): void {
    const newObj: any = {
      ...obj,
      nacionalidade: obj.nacionalidade,
      naturalidade: obj.naturalidade,
      morada: {
        ...obj.morada,
        aldeia: obj.morada.aldeia.id,
        suco: obj.morada.aldeia.suco.nome,
        postoAdministrativo: obj.morada.aldeia.suco.postoAdministrativo.nome,
        municipio: obj.morada.aldeia.suco.postoAdministrativo.municipio.nome,
      }
    };
    this.requestForm.patchValue({
      gerente: {
        ...newObj,
      }
    })
  }

  private initPersonForm(): FormGroup {
    return this._fb.group({
      id: new FormControl({ value: null, disabled: true }),
      nome: new FormControl({ value: null, disabled: true }),
      nacionalidade: new FormControl({ value: null, disabled: true }),
      naturalidade: new FormControl({ value: null, disabled: true }),
      morada: this._fb.group({
        id: [null],
        local: new FormControl({ value: null, disabled: true }),
        aldeia: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      telefone: new FormControl({ value: null, disabled: true }),
      email: new FormControl({ value: null, disabled: true }),
      estadoCivil: new FormControl({ value: null, disabled: true }),
    });
  }

  private setArrendadorValidators(group: FormGroup, required: boolean) {
    Object.keys(group.controls).forEach((key) => {
      if (key === 'id') return;
      const control = group.get(key);

      if (control instanceof FormGroup) {
        // Recursive for nested address group
        this.setArrendadorValidators(control, required);
      } else {
        if (required) {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
