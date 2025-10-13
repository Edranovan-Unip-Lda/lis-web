import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Documento, Empresa, Gerente, PedidoAtividadeLicenca, Representante } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { AplicanteService } from '@/core/services/aplicante.service';
import { DataMasterService } from '@/core/services/data-master.service';
import { DocumentosService } from '@/core/services/documentos.service';
import { formatDateForLocalDate, mapToIdAndNome, maxFileSizeUpload, stateOptions, tipoDocumentoOptions, tipoPedidoAtividadeComercialOptions, tipoPedidoAtividadeIndustrialOptions } from '@/core/utils/global-function';
import { Component, Input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select, SelectFilterEvent } from 'primeng/select';
import { SelectButton, SelectButtonChangeEvent } from 'primeng/selectbutton';
import { Toast } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pedido-atividade-form',
  imports: [ReactiveFormsModule, Select, SelectButton, InputText, Button, Toast, FileUpload, DatePicker, InputGroup, InputGroupAddon, InputNumber],
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
  @Input() disabledForm!: boolean;
  @Input() disabledAllForm!: boolean;
  originalAldeias: any[] = [];
  listaAldeiaEmpresa: any[] = [];
  listaAldeiaRepresentante: any[] = [];
  listaAldeiaGerente: any[] = [];
  listaAldeiaArrendador: any[] = [];
  isNew = false;
  isLoading = false;
  uploadedDocs: any[] = [];
  uploadURLDocs = signal(`${environment.apiUrl}/documentos`);
  maxFileSize = maxFileSizeUpload;
  loadingDownloadButtons = new Set<string>();
  loadingRemoveButtons = new Set<string>();
  showArrendadorForm = false;
  tipoDocumentoOpts = tipoDocumentoOptions;

  stateOpts = stateOptions;
  dataSent = output<any>();

  constructor(
    private _fb: FormBuilder,
    private dataMasterService: DataMasterService,
    private aplicanteService: AplicanteService,
    private messageService: MessageService,
    private documentoService: DocumentosService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.copyAldeiaList(this.listaAldeia);

    if (this.aplicanteData.pedidoLicencaAtividade) {
      this.mapRequestFormData(this.aplicanteData.pedidoLicencaAtividade);
      if (this.disabledAllForm) {
        this.requestForm.disable();
      }
    } else {
      this.isNew = true;
      this.mapFormEmpresa(this.aplicanteData.empresa);
    }

    this.uploadURLDocs.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);
    if (this.disabledAllForm) {
      this.requestForm.disable();
    }
  }


  save(form: FormGroup): void {
    this.isLoading = true;
    let formData = this.mapFormData(form);

    this.aplicanteService.savePedidoAtividade(this.aplicanteData.id, formData).subscribe({
      next: (res) => {
        this.requestForm.get('id')?.setValue(res.id);
        this.dataSent.emit(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.addMessages(false, true, err);
      },
      complete: () => {
        this.isLoading = false;
        this.isNew = false;
        this.addMessages(true, true);
      }
    });
  }

  update(form: FormGroup): void {
    this.isLoading = true;

    let formData = this.mapFormData(form);

    this.aplicanteService.updatePedidoAtividade(this.aplicanteData.id, this.aplicanteData.pedidoLicencaAtividade.id, formData).subscribe({
      next: (res) => {
        this.requestForm.get('id')?.setValue(res.id);
      },
      error: (err) => {
        this.isLoading = false;
        this.addMessages(false, false, err);
      },
      complete: () => {
        this.isLoading = false;
        this.isNew = false;
        this.addMessages(true, false);
      }
    });
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
          this.listaAldeiaEmpresa = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
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
          this.listaAldeiaRepresentante = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
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
          this.listaAldeiaGerente = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
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
          this.listaAldeiaArrendador = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
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

  tipoPedidoOpts(categoria: Categoria): any[] {
    return categoria === Categoria.comercial ? tipoPedidoAtividadeComercialOptions : tipoPedidoAtividadeIndustrialOptions;
  }

  contratoArrendamentoOnChange(event: SelectButtonChangeEvent): void {
    if (event.value) {
      this.showArrendadorForm = true;
    } else {
      this.showArrendadorForm = false;
      this.requestForm.get('arrendador')?.reset();
    }
  }

  onUploadDocs(event: any) {
    if (event.originalEvent.body) {
      this.uploadedDocs = [...this.uploadedDocs, ...event.originalEvent.body];
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivos carregado com sucesso!'
    });
  }

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.nome);
    this.documentoService.downloadById(file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.pdf';
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
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.nome);
      }
    });
  }

  removeDoc(file: Documento) {
    this.loadingRemoveButtons.add(file.nome);
    const index = this.uploadedDocs.indexOf(file);
    if (index !== -1) {
      if (!file.id) {
        this.uploadedDocs.splice(index, 1);
        return;
      }
      this.documentoService.deleteById(file.id).subscribe({
        next: () => {
          this.uploadedDocs.splice(index, 1);
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
      });
    }
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
      nomeEmpresa: [null],
      empresaNumeroRegistoComercial: [null],
      empresaSede: this._fb.group({
        local: [null],
        aldeia: [null],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      classeAtividade: [null],
      classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      tipoAtividade: new FormControl({ value: null, disabled: true }),
      tipoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      risco: new FormControl({ value: null, disabled: true }),
      estatutoSociedadeComercial: [null],
      empresaNif: [null],
      representante: this.initPersonForm(),
      gerente: this.initPersonForm(),
      planta: [null],
      documentoPropriedade: [null],
      documentoImovel: [null],
      contratoArrendamento: [null],
      planoEmergencia: [null],
      estudoAmbiental: [null],
      numEmpregosCriados: new FormControl({ value: this.aplicanteData.empresa.totalTrabalhadores, disabled: true }),
      numEmpregadosCriar: [null, [Validators.min(0)]],
      reciboPagamento: [null],
      outrosDocumentos: [null],
      arrendador: this._fb.group({
        id: [null],
        nome: [null],
        endereco: this._fb.group({
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
      })
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
    const empresaSedeService = this.dataMasterService.getAldeiasBySuco(request.empresaSede.aldeia.suco.id);
    const representanteService = this.dataMasterService.getAldeiasBySuco(request.representante.morada.aldeia.suco.id);
    const gerenteService = this.dataMasterService.getAldeiasBySuco(request.gerente.morada.aldeia.suco.id);

    this.showArrendadorForm = request.contratoArrendamento ? true : false;

    forkJoin([empresaSedeService, representanteService, gerenteService]).subscribe({
      next: ([empresaSedeResponse, representanteResponse, gerenteResponse]) => {
        this.listaAldeiaEmpresa = [...mapToIdAndNome(empresaSedeResponse._embedded.aldeias), ...this.listaAldeia];
        this.listaAldeiaRepresentante = [...mapToIdAndNome(representanteResponse._embedded.aldeias)];
        this.listaAldeiaGerente = [...mapToIdAndNome(gerenteResponse._embedded.aldeias)];

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
  }

  private mapFormData(form: FormGroup): any {
    return {
      ...form.getRawValue(),
      empresaSede: {
        ...form.value.empresaSede,
        aldeia: {
          id: form.value.empresaSede.aldeia,
        }
      },
      classeAtividade: {
        id: form.value.classeAtividade.id
      },

      representante: {
        ...form.value.representante,
        id: null,
        morada: {
          ...form.value.representante.morada,
          id: null,
          aldeia: {
            id: form.value.representante.morada.aldeia
          }
        }
      },
      gerente: {
        ...form.value.gerente,
        id: null,
        morada: {
          ...form.value.gerente.morada,
          id: null,
          aldeia: {
            id: form.value.gerente.morada.aldeia
          }
        }
      },
      arrendador: {
        ...form.value.arrendador,
        endereco: {
          ...form.value.arrendador.endereco,
          aldeia: {
            id: form.value.gerente.morada.aldeia
          }
        },
        dataInicio: formatDateForLocalDate(form.value.arrendador.dataInicio),
        dataFim: formatDateForLocalDate(form.value.arrendador.dataFim),
      },
      documentos: this.uploadedDocs
    }
  }

  private mapFormEmpresa(empresa: Empresa) {
    this.requestForm.get('nomeEmpresa')?.setValue(empresa.nome);
    this.requestForm.get('empresaNumeroRegistoComercial')?.setValue(empresa.numeroRegistoComercial);
    this.requestForm.get('empresaSede')?.get('local')?.setValue(empresa.sede.local);
    this.requestForm.get('empresaNif')?.setValue(empresa.nif);

    this.dataMasterService.getAldeiasBySuco(empresa.sede.aldeia.suco.id).subscribe(resp => {
      this.listaAldeiaEmpresa = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
      this.requestForm.get('empresaSede')?.get('aldeia')?.setValue(empresa.sede.aldeia.id);
      this.requestForm.get('empresaSede')?.get('suco')?.setValue(empresa.sede.aldeia.suco.nome);
      this.requestForm.get('empresaSede')?.get('postoAdministrativo')?.setValue(empresa.sede.aldeia.suco.postoAdministrativo.nome);
      this.requestForm.get('empresaSede')?.get('municipio')?.setValue(empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome);
    });

    this.mapRepresentante(empresa.representante);
    this.mapGerente(empresa.gerente);
  }

  private mapRepresentante(obj: Representante): void {
    const newObj: any = {
      ...obj
    };
    newObj.morada.suco = obj.morada.aldeia.suco.nome;
    newObj.morada.postoAdministrativo = obj.morada.aldeia.suco.postoAdministrativo.nome;
    newObj.morada.municipio = obj.morada.aldeia.suco.postoAdministrativo.municipio.nome;
    newObj.morada.aldeia = obj.morada.aldeia.id;
    this.requestForm.patchValue({
      representante: {
        ...newObj,
      }
    });
  }

  private mapGerente(obj: Gerente): void {
    const newObj: any = {
      ...obj
    };
    newObj.morada.suco = obj.morada.aldeia.suco.nome;
    newObj.morada.postoAdministrativo = obj.morada.aldeia.suco.postoAdministrativo.nome;
    newObj.morada.municipio = obj.morada.aldeia.suco.postoAdministrativo.municipio.nome;
    newObj.morada.aldeia = obj.morada.aldeia.id;
    this.requestForm.patchValue({
      gerente: {
        ...newObj,
      }
    })
  }

  private initPersonForm(): FormGroup {
    return this._fb.group({
      id: [null],
      nome: [null],
      nacionalidade: [null],
      naturalidade: [null],
      morada: this._fb.group({
        id: [null],
        local: [null],
        aldeia: [null],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      telefone: [null],
      email: [null],
    })
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
