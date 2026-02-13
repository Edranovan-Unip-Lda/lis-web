import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, AutoVistoria, Documento, Empresa, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria } from '@/core/models/enums';
import { AuthenticationService, DataMasterService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { PedidoService } from '@/core/services/pedido.service';
import { autoVistoriaComercialFields, autoVistoriaIndustrialFields, mapToAtividadeEconomica, stateOptions, tipoAreaRepresentanteComercial, tipoAreaRepresentanteIndustrial, tipoDocumentoOptions, tipoEletricidadeOptions, tipoLocalOptions } from '@/core/utils/global-function';
import { autoVistoriaWithFilesValidator } from '@/core/validators/must-match';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileProgressEvent, FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { Select, SelectFilterEvent } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auto-vistoria',
  imports: [ReactiveFormsModule, SelectButton, Textarea, DatePicker, FileUpload, InputText, Select, Button, Toast, InputGroup, InputGroupAddon, InputNumber, ProgressBar],
  templateUrl: './auto-vistoria.component.html',
  styleUrl: './auto-vistoria.component.scss',
  providers: [MessageService]
})
export class AutoVistoriaComponent implements OnInit {
  autoVistoriaForm!: FormGroup;
  autoVistoria!: AutoVistoria | undefined;
  aplicante!: Aplicante;
  pedidoVistoria!: PedidoVistoria;
  stateOptions = stateOptions;
  uploadedFiles: any[] = [];
  listaClassificacaoAtividade: any[] = [];
  tipoAreaRepresentanteOpts: any[] = [];
  listaAldeia: any[] = [];
  listaAldeiaRequerente: any[] = [];
  listaAldeiaResidencia: any[] = [];
  originalAldeias: any[] = [];
  listaPostoAdministrativo: any[] = [];
  listaPostoAdministrativoOriginal: any[] = [];
  categoria: Categoria | undefined;
  tipoDocumentoOpts = tipoDocumentoOptions;
  downloadLoading = false;
  deleteLoading = false;
  uploadUrl = signal(`${environment.apiUrl}/documentos`);
  maxFileSize = 20 * 1024 * 1024; // 20 MB
  loading = false;
  loadingDownloadButtons = new Set<string>();
  loadingRemoveButtons = new Set<string>();
  minLengthParticipantes = 1;
  maxLengthParticipantes = 0;
  tipoLocalOpts = tipoLocalOptions;
  tipoEletricidadeOpts = tipoEletricidadeOptions;
  COMERCIAL = Categoria.comercial;
  INDUSTRIAL = Categoria.industrial;
  comercialFormFields = autoVistoriaComercialFields;
  industrialFormFields = autoVistoriaIndustrialFields;
  loadingUploadButtons = new Set<String>();
  protected readonly TRINTA_DIAS: number = 30;

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private pedidoService: PedidoService,
    private documentoService: DocumentosService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.aplicante = this.route.snapshot.data['aplicanteResolver'];
    this.initForm();

    this.categoria = this.aplicante.categoria;
    this.pedidoVistoria = this.aplicante.pedidoLicencaAtividade.listaPedidoVistoria.find(p => p.status === AplicanteStatus.submetido)!;

    this.listaClassificacaoAtividade = mapToAtividadeEconomica(this.route.snapshot.data['listaClasseAtividadeResolver']._embedded.classeAtividade);

    this.listaPostoAdministrativo = this.route.snapshot.data['listaPostoAdministrativoResolver']._embedded.postos;
    this.listaPostoAdministrativoOriginal = [...this.listaPostoAdministrativo];

    this.originalAldeias = this.route.snapshot.data['listaAldeiasResolver']._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
    this.listaAldeia = [...this.originalAldeias];
    this.listaAldeiaRequerente = [...this.originalAldeias];
    this.listaAldeiaResidencia = [...this.originalAldeias];

    switch (this.categoria) {
      case Categoria.comercial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteComercial;
        this.maxLengthParticipantes = 5;
        break;
      case Categoria.industrial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteIndustrial;
        this.maxLengthParticipantes = 7;
        break;
    }

    this.addParticipanteForm();
    this.uploadUrl.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);

    this.mapAutoVistoriaForm(this.aplicante, this.pedidoVistoria);

    this.mapRequerenteForm(this.aplicante.empresa);

    this.autoVistoriaForm.valueChanges.subscribe(() => {
      if (!this.isAllOptionsTrue()) {
        this.autoVistoriaForm.get('prazo')?.setValue(this.TRINTA_DIAS, { emitEvent: false });
      } else {
        this.autoVistoriaForm.get('prazo')?.setValue(0, { emitEvent: false });
      }
    });

    this.logInvalidControls(this.autoVistoriaForm);

  }

  logInvalidControls(form: FormGroup, parentKey = ''): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      const fieldPath = parentKey ? `${parentKey}.${key}` : key;

      if (control instanceof FormGroup) {
        this.logInvalidControls(control, fieldPath);
      } else {
        if (control?.invalid) {
          console.warn(`❌ INVALID → ${fieldPath}`, control.errors);
        }
      }
    });
  }

  save(form: FormGroup) {
    if (form.valid) {
      this.loading = true;
      const formData = this.mapFormToData(form);

      this.pedidoService.saveAutoVistoria(this.pedidoVistoria.id, formData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Auto Vistoria submetida com sucesso', life: 3000, key: 'tr' });
          this.autoVistoriaForm.disable();
          this.uploadedFiles = [];
          this.loading = false;
          this.router.navigate(['/gestor/application/task/', this.aplicante.id], {
            queryParams: {
              categoria: this.aplicante.categoria,
              tipo: this.aplicante.tipo
            }
          });
        },
        error: () => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao submeter a Auto Vistoria', life: 3000, key: 'tr' });
        }
      });
    } else {
      // form.markAllAsTouched();
      const invalidControls = this.findInvalidControls(this.autoVistoriaForm);
      return;
    }
  }

  private findInvalidControls(formGroup: FormGroup, parentKey: string = ''): string[] {
    const invalid: string[] = [];

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      const controlPath = parentKey ? `${parentKey}.${key}` : key;

      if (control instanceof FormGroup) {
        invalid.push(...this.findInvalidControls(control, controlPath));
      } else if (control?.invalid) {
        invalid.push(controlPath);
      }
    });

    return invalid;
  }

  aldeiaFilter(event: SelectFilterEvent, parentControlName?: string, childControlName?: string) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          if (parentControlName && childControlName) {
            this.autoVistoriaForm.get(parentControlName)?.get(childControlName)?.patchValue(resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id })));
            if (parentControlName === 'requerente' && childControlName === 'sede') {
              this.listaAldeiaRequerente = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
            } else {
              this.listaAldeiaResidencia = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
            }
          } else {
            this.listaAldeia = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          }
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      if (parentControlName && childControlName) {
        if (parentControlName === 'requerente' && childControlName === 'sede') {
          this.listaAldeiaRequerente = [...this.originalAldeias];
        } else {
          this.listaAldeiaResidencia = [...this.originalAldeias];
        }
      } else {
        this.listaAldeia = [...this.originalAldeias];
      }
    }
  }

  aldeiaOnChange(event: any, arg: string) {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.autoVistoriaForm.get(arg)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.autoVistoriaForm.get(arg)?.reset();
    }
  }

  aldeiaNestedOnChange(event: any, parentControlName: string, childControlName: string): void {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.autoVistoriaForm.get(parentControlName)?.get(childControlName)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.autoVistoriaForm.get(parentControlName)?.get(childControlName)?.reset();
    }
  }

  postoFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchPostosByNome(query)
        .subscribe(resp => {
          this.listaPostoAdministrativo = resp._embedded.postos.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaPostoAdministrativo = [...this.listaPostoAdministrativoOriginal];
    }
  }

  postoChange(event: any): void {
    if (event.value) {
      const selectedItem = event.value;

      const selectedPosto = this.listaPostoAdministrativo.find(p => p.id === selectedItem);
      if (selectedPosto) {
        // Assuming that the municipio name is part of the posto object
        this.autoVistoriaForm.get('requerente')?.patchValue({
          municipio: selectedPosto.municipio.nome
        })
      }
    } else {
      this.autoVistoriaForm.get('requerente')?.patchValue({
        municipio: null,
        postoAdministrativo: null
      });
    }
  }


  /**
   * Returns a list of all available area representante options for the given position i
   * @param {number} i - The position index
   * @returns {any[]} - A list of available area representante options
   */
  availablePositions(i: number): any[] {
    const picked = new Set<string>(
      this.membrosEquipaVistoria.controls
        .map((fg, idx) => (idx === i ? null : fg.get('areaRepresentante')?.value))
        .filter((v): v is string => !!v)
    );
    return this.tipoAreaRepresentanteOpts.filter(p => !picked.has(p.value));
  }

  onUpload(event: any, arg: string) {
    if (event.originalEvent.body) {
      const files: Documento[] = event.originalEvent.body;
      if (arg) {
        const file = files[0];
        file.coluna = arg;
        files.forEach(doc => {
          doc.coluna = arg;
          return true;
        });
        this.autoVistoriaForm.get(`${arg}File`)?.setValue(file);
        this.autoVistoriaForm.get(`${arg}File`)?.updateValueAndValidity();
        this.loadingUploadButtons.delete(arg);
      }
      this.uploadedFiles = [...this.uploadedFiles, ...event.originalEvent.body];
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivo carregado com sucesso!'
    });
  }

  getFileByField(field: string): Documento {
    return this.uploadedFiles.find(doc => doc.coluna === field) || null;
  }

  uploadOnProgress(event: FileProgressEvent, field: string): void {
    this.loadingUploadButtons.add(field);
  }

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.nome);
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
        this.loadingDownloadButtons.delete(file.nome);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.nome);
      }
    });
  }

  removeDoc(file: Documento) {
    this.loadingRemoveButtons.add(file.nome);
    const index = this.uploadedFiles.indexOf(file);
    if (index !== -1) {
      if (!file.id) {
        this.uploadedFiles.splice(index, 1);
        this.messageService.add({
          severity: 'info',
          summary: 'Sucesso',
          detail: 'Arquivo foi removido com sucesso!'
        });
        return;
      }
      this.documentoService.deleteById(file.id).subscribe({
        next: () => {
          this.uploadedFiles.splice(index, 1);
          this.messageService.add({
            severity: 'info',
            summary: 'Sucesso',
            detail: 'Arquivo foi removido com sucesso!'
          });
        },
        error: error => {
          this.loadingRemoveButtons.delete(file.nome);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha no removero arquivo!'
          });
        },
        complete: () => this.loadingRemoveButtons.delete(file.nome)
      });
    }
  }


  onPanelHide() {
    this.listaAldeia = [...this.originalAldeias];
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  disabledSubmitButton(): boolean {
    return !this.autoVistoriaForm.valid || this.autoVistoriaForm.disabled;
  }

  classeAtividadeChange(event: any): void {
    if (event.value) {
      this.autoVistoriaForm.get('requerente')?.get('classeAtividadeCodigo')?.setValue(event.value.descricao);
    } else {
      this.autoVistoriaForm.get('requerente')?.get('classeAtividadeCodigo')?.reset();
    }
  }

  private mapFormToData(form: FormGroup) {
    const formData = form.getRawValue();
    return {
      ...formData,
      local: {
        ...formData.local,
        aldeia: {
          id: formData.local.aldeia
        }
      },
      documentos: this.uploadedFiles,
      requerente: {
        ...formData.requerente,
        sede: {
          ...formData.requerente.sede,
          aldeia: {
            id: formData.requerente.sede.aldeia
          }
        },
        residencia: {
          ...formData.requerente.residencia,
          aldeia: {
            id: formData.requerente.residencia.aldeia
          }
        }
      },
    }
  }

  private initForm() {
    this.autoVistoriaForm = this._fb.group({
      numeroProcesso: new FormControl({ value: null, disabled: true }),
      dataHora: [null],
      local: this._fb.group({
        local: new FormControl({ value: null, disabled: true }),
        aldeia: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      funcionario: {
        id: this.authService.currentUserValue.id,
      },
      requerente: this._fb.group({
        denominacaoSocial: new FormControl({ value: null, disabled: true }),
        numeroRegistoComercial: new FormControl({ value: null, disabled: true }),
        sede: this._fb.group({
          local: new FormControl({ value: null, disabled: true }),
          aldeia: new FormControl({ value: null, disabled: true }),
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
        nif: new FormControl({ value: null, disabled: true }),
        gerente: new FormControl({ value: null, disabled: true }),
        telefone: new FormControl({ value: null, disabled: true }),
        email: new FormControl({ value: null, disabled: true }),
        classeAtividade: new FormControl({ value: null, disabled: true }),
        classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
        nomeRepresentante: new FormControl({ value: null, disabled: true }),
        pai: new FormControl({ value: null, disabled: true }),
        mae: new FormControl({ value: null, disabled: true }),
        dataNascimento: new FormControl({ value: null, disabled: true }),
        estadoCivil: new FormControl({ value: null, disabled: true }),
        nacionalidade: new FormControl({ value: null, disabled: true }),
        naturalidade: new FormControl({ value: null, disabled: true }),
        tipoDocumento: new FormControl({ value: null, disabled: true }),
        numeroDocumento: new FormControl({ value: null, disabled: true }),
        residencia: this._fb.group({
          local: new FormControl({ value: null, disabled: true }),
          aldeia: new FormControl({ value: null, disabled: true }),
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
      }),
      nomeAtuante: new FormControl({ value: null, disabled: true }),
      legislacaoUrbanistica: [null],
      tipoLocal: [null],
      legislacaoUrbanisticaFile: [null],
      legislacaoUrbanisticaDescricao: [null],

      acessoEstrada: [null],
      acesoEstradaFile: [null],
      acessoEstradaDescricao: [null],
      superficie: [null],
      larguraEstrada: [null],

      escoamentoAguas: [null],
      escoamentoAguasFile: [null],
      escoamentoAguasDescricao: [null],

      alimentacaoEnergia: [null],
      alimentacaoEnergiaFile: [null],
      alimentacaoEnergiaDescricao: [null],
      tipoEletricidade: [null],
      tipoEletricidadeFile: [null],

      descreverIrregularidades: [null],
      aptoAberto: [null, [Validators.required]],
      comDeficiencias: [null, [Validators.required]],
      recomendacoes: [null],
      prazo: new FormControl({ value: null, disabled: true }),
      documental: [null],
      membrosEquipaVistoria: this._fb.array([]),
    });

    switch (this.aplicante.categoria) {
      case Categoria.comercial:
        autoVistoriaComercialFields.forEach(field => {
          // Add Yes/No selectbutton control
          this.autoVistoriaForm.addControl(field.name, new FormControl(null));

          // Add matching file upload control
          this.autoVistoriaForm.addControl(`${field.name}File`, new FormControl(null));

          const descricao = `${field.name}Descricao`;
          // Add matching description control
          this.autoVistoriaForm.addControl(descricao, new FormControl(null));

        });
        this.autoVistoriaForm.addValidators(autoVistoriaWithFilesValidator(autoVistoriaComercialFields));
        break;

      case Categoria.industrial:
        autoVistoriaIndustrialFields.forEach(field => {
          // Add Yes/No selectbutton control
          this.autoVistoriaForm.addControl(field.name, new FormControl(null));

          // Add matching file upload control
          this.autoVistoriaForm.addControl(`${field.name}File`, new FormControl(null));

          // Add matching description control
          const descricao = `${field.name}Descricao`;
          this.autoVistoriaForm.addControl(descricao, new FormControl(null));
        });
        this.autoVistoriaForm.addValidators(autoVistoriaWithFilesValidator(autoVistoriaIndustrialFields));
        break;
    }
    this.autoVistoriaForm.updateValueAndValidity();

  }

  /**
   * Verifica se todas as opcoes de uma auto-vistoria estao como true.
   * Se a categoria for comercial, verifica se todas as opcoes de comecialidade estao como true.
   * Se a categoria for diferente de comercial, verifica se todas as opcoes de comecialidade e sanitas automaticas estao como true.
   * @return boolean - True se todas as opcoes estiverem como true, false caso contrario.
   */
  private isAllOptionsTrue(): boolean {
    const commonFields = [
      'legislacaoUrbanistica',
      'acessoEstrada',
      'escoamentoAguas',
      'alimentacaoEnergia'
    ];

    // Check common required fields first
    const allCommonTrue = commonFields.every(
      f => this.autoVistoriaForm.get(f)?.value === true
    );

    if (!allCommonTrue) return false;

    // Category-specific additional fields:
    switch (this.categoria) {

      case Categoria.comercial:
        return autoVistoriaComercialFields.every(
          field => this.autoVistoriaForm.get(field.name)?.value === true
        );

      case Categoria.industrial:
        return autoVistoriaIndustrialFields.every(
          field => this.autoVistoriaForm.get(field.name)?.value === true
        );

      default:
        return false;
    }
  }

  private createParticipanteForm(): FormGroup {
    return this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      areaRepresentante: [null, [Validators.required, Validators.minLength(3)]],
      cargo: [null, [Validators.required, Validators.minLength(3)]],
      tipoDocumento: [null, Validators.required],
      numeroDocumento: [null, Validators.required],
      telemovel: [null],
    });
  }

  addParticipanteForm(): void {
    this.membrosEquipaVistoria.push(this.createParticipanteForm());
  }

  removeParticipanteForm(index: number): void {
    this.membrosEquipaVistoria.removeAt(index);
  }

  get membrosEquipaVistoria(): FormArray {
    return this.autoVistoriaForm.get('membrosEquipaVistoria') as FormArray;
  }

  private mapAutoVistoriaForm(aplicanteData: Aplicante, pedidoVistoria: PedidoVistoria): void {
    this.autoVistoriaForm.patchValue({
      numeroProcesso: aplicanteData.numero,
      local: {
        local: pedidoVistoria.localEstabelecimento.local,
        aldeia: pedidoVistoria.localEstabelecimento.aldeia.id,
        suco: pedidoVistoria.localEstabelecimento.aldeia.suco.nome,
        postoAdministrativo: pedidoVistoria.localEstabelecimento.aldeia.suco.postoAdministrativo.nome,
        municipio: pedidoVistoria.localEstabelecimento.aldeia.suco.postoAdministrativo.municipio.nome,
      },
      requerente: {
        classeAtividade: {
          id: pedidoVistoria.classeAtividade.id,
          codigo: pedidoVistoria.classeAtividade.codigo,
          descricao: pedidoVistoria.classeAtividade.descricao,
          tipoRisco: pedidoVistoria.classeAtividade.tipoRisco,
          grupoAtividade: {
            id: pedidoVistoria.classeAtividade.grupoAtividade.id,
            codigo: pedidoVistoria.classeAtividade.grupoAtividade.codigo,
            descricao: pedidoVistoria.classeAtividade.grupoAtividade.descricao,
          }
        },
        classeAtividadeCodigo: pedidoVistoria.classeAtividade.descricao,
      }
    });

    this.listaClassificacaoAtividade.push(this.autoVistoriaForm.get('requerente.classeAtividade')?.value);

    this.autoVistoria = this.getAutoVistoriaData(aplicanteData);
    if (this.autoVistoria) {
      this.mapAutoVistoriaEdit(this.autoVistoria);
    }

  }

  private mapAutoVistoriaEdit(autoVistoria: AutoVistoria): void {
    this.autoVistoriaForm.patchValue({
      ...autoVistoria,
      dataHora: new Date(autoVistoria.updatedAt)
    });
  }

  private mapRequerenteForm(empresa: Empresa): void {
    this.autoVistoriaForm.patchValue({
      requerente: {
        denominacaoSocial: empresa.nome,
        numeroRegistoComercial: empresa.numeroRegistoComercial,
        sede: {
          local: empresa.sede.local,
          aldeia: empresa.sede.aldeia.id,
          suco: empresa.sede.aldeia.suco.nome,
          postoAdministrativo: empresa.sede.aldeia.suco.postoAdministrativo.nome,
          municipio: empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome
        },
        nif: empresa.nif,
        gerente: empresa.gerente.nome,
        telefone: empresa.gerente.telefone,
        email: empresa.gerente.email,
        nomeRepresentante: empresa.representante.nome,
        pai: empresa.representante.pai,
        mae: empresa.representante.mae,
        dataNascimento: new Date(empresa.representante.dataNascimento),
        estadoCivil: empresa.representante.estadoCivil,
        nacionalidade: empresa.representante.nacionalidade,
        naturalidade: empresa.representante.naturalidade,
        tipoDocumento: empresa.representante.tipoDocumento,
        numeroDocumento: empresa.representante.numeroDocumento,
        residencia: {
          local: empresa.representante.morada.local,
          aldeia: empresa.representante.morada.aldeia.id,
          suco: empresa.representante.morada.aldeia.suco.nome,
          postoAdministrativo: empresa.representante.morada.aldeia.suco.postoAdministrativo.nome,
          municipio: empresa.representante.morada.aldeia.suco.postoAdministrativo.municipio.nome
        },
      },
      nomeAtuante: empresa.nome,
    });
  }

  minimalParticipante(): boolean {
    return (this.membrosEquipaVistoria.length < this.minLengthParticipantes) || (this.membrosEquipaVistoria.length > this.maxLengthParticipantes)
  }

  private getAutoVistoriaData(aplicante: Aplicante): AutoVistoria | undefined {
    if (aplicante.pedidoLicencaAtividade.listaPedidoVistoria && aplicante.pedidoLicencaAtividade.listaPedidoVistoria.length > 0) {
      const pedidoVistoria = aplicante.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
      if (pedidoVistoria && pedidoVistoria.fatura && pedidoVistoria.fatura.recibo) {
        return pedidoVistoria.autoVistoria;
      }
    }
    return undefined;
  }
}
