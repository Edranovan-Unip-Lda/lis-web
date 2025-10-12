import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Documento, Empresa, Fatura, HistoricoEstadoAplicante, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { AplicanteStatus, AplicanteType, Categoria, TipoEstabelecimento, TipoPedidoCadastro } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService } from '@/core/services';
import { AplicanteService } from '@/core/services/aplicante.service';
import { DataMasterService } from '@/core/services/data-master.service';
import { DocumentosService } from '@/core/services/documentos.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { PedidoService } from '@/core/services/pedido.service';
import { calculateCommercialLicenseTax, caraterizacaEstabelecimentoOptions, mapToAtividadeEconomica, mapToGrupoAtividade, mapToIdAndNome, mapToTaxa, maxFileSizeUpload, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoEstabelecimentoOptions, tipoPedidoCadastroOptions } from '@/core/utils/global-function';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select, SelectChangeEvent, SelectFilterEvent } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-application-cadastro-detail',
  imports: [ReactiveFormsModule, Button, StepperModule, Select, InputText, FileUpload, Tag, StatusSeverityPipe, DatePipe, Toast, TitleCasePipe, RouterLink, InputNumber, InputGroup, InputGroupAddon, MultiSelect, DatePicker],
  templateUrl: './application-cadastro-detail.component.html',
  styleUrl: './application-cadastro-detail.component.scss',
  providers: [MessageService]
})
export class ApplicationCadastroDetailComponent {
  aplicanteData!: Aplicante;
  faturaForm!: FormGroup;
  aplicanteLoading = false;
  pedidoLoading = false;
  faturaLoading = false;
  pedidoId!: number;
  faturaId!: number;
  isNew = false;
  showDataEmissaoCertAnterior = true;
  aplicanteEstado!: AplicanteStatus;
  disableAllForm = false;

  requestForm!: FormGroup;
  tipoPedidoOpts = tipoPedidoCadastroOptions;
  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = tipoEstabelecimentoOptions;
  caraterizacaEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  tipoAtoOpts = tipoAtoOptions;
  quantoAtividadeOpts = quantoAtividadeoptions;
  categoria!: Categoria;
  listaAldeia: any[] = [];
  listaClasseAtividade: any[] = [];
  listaSociedadeComercial: any[] = [];
  listaPedidoAto: any[] = [];
  originalAldeias: any = [];

  uploadedFiles: any[] = [];
  uploadedDocs: any[] = [];
  uploadUrl = signal(`${environment.apiUrl}/aplicantes`);
  uploadURLDocs = signal(`${environment.apiUrl}/documentos`);
  maxFileSize = maxFileSizeUpload;
  downloadLoading = false;
  deleteLoading = false;

  pedidoActive = false;
  faturaActive = false;
  motivoRejeicao: any;
  showGpsCoordinates = false;

  constructor(
    private _fb: FormBuilder,
    private router: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private aplicanteService: AplicanteService,
    private messageService: MessageService,
    private pedidoService: PedidoService,
    private authService: AuthenticationService,
    private empresaService: EmpresaService,
    private documentoService: DocumentosService,
  ) {
  }

  ngOnInit(): void {
    this.initForm();

    this.listaAldeia = mapToIdAndNome(this.router.snapshot.data['aldeiasResolver']._embedded.aldeias);
    this.listaSociedadeComercial = mapToIdAndNome(this.router.snapshot.data['sociedadeComercialResolver']._embedded.sociedadeComercial);


    this.originalAldeias = this.listaAldeia;


    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.categoria = this.aplicanteData.categoria;
    this.aplicanteEstado = this.aplicanteData.estado;
    this.motivoRejeicao = this.getRejectedReason(this.aplicanteData.historicoStatus);

    this.disabledForms(this.aplicanteData.estado);

    this.listaPedidoAto = mapToTaxa(this.router.snapshot.data['listaTaxaResolver']._embedded.taxas);
    this.listaClasseAtividade = this.router.snapshot.data['classeAtividadeResolver']._embedded.classeAtividade;

    this.mapNewFatura(this.aplicanteData);

    if (!this.aplicanteData.pedidoInscricaoCadastro) {
      this.isNew = true;
      this.requestForm.patchValue({
        tipoEmpresa: this.aplicanteData.empresa.tipoEmpresa
      });
      this.requestForm.get('tipoEmpresa')?.disable();
    } else {
      this.isNew = false;
      this.pedidoActive = true;
      this.pedidoId = this.aplicanteData.pedidoInscricaoCadastro.id;

      if (this.aplicanteData.pedidoInscricaoCadastro.fatura) {
        this.faturaActive = true;
        this.faturaId = this.aplicanteData.pedidoInscricaoCadastro.fatura.id;
        this.mapEditFatura(this.aplicanteData.pedidoInscricaoCadastro.fatura);
        this.setTaxaAto(this.aplicanteData.pedidoInscricaoCadastro.tipoPedidoCadastro);
        this.uploadUrl.set(
          `${environment.apiUrl}/aplicantes/${this.aplicanteData.id}/pedidos/${this.pedidoId}/faturas/${this.faturaId}/upload/${this.authService.currentUserValue.username}`
        );

      } else {
        this.faturaForm.patchValue({
          atividadeDeclarada: this.aplicanteData.pedidoInscricaoCadastro.classeAtividade.id,
          descricao: this.aplicanteData.pedidoInscricaoCadastro.classeAtividade.descricao,
        });
      }

      this.mapEditPedido(this.aplicanteData.pedidoInscricaoCadastro);
    }

    // this.enableSuperficieFormControl();
    this.superficieOnChange();
    this.uploadURLDocs.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);
  }

  pedidoCadstroOnChange(event: any): void {
    event.value.value === TipoPedidoCadastro.inicial ? this.showDataEmissaoCertAnterior = true : this.showDataEmissaoCertAnterior = false;
  }

  aldeiaOnChange(event: SelectChangeEvent): void {
    if (event.value) {
      const selectedItem = event.value.id;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.requestForm.get('localEstabelecimento')?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.requestForm.get('sede')?.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  mapEditPedido(pedido: PedidoInscricaoCadastro): void {
    this.requestForm.patchValue(pedido);
    this.uploadedDocs = pedido.documentos;

    this.requestForm.patchValue({
      tipoPedidoCadastro: this.tipoPedidoOpts.find(item => item.value === pedido.tipoPedidoCadastro),
      tipoEstabelecimento: this.tipoEstabelecimentoOpts.find(item => item.value === pedido.tipoEstabelecimento),
      tipoEmpresa: this.categoria === Categoria.industrial ? pedido.tipoEmpresa : null,
      quantoAtividade: this.categoria === Categoria.industrial ? pedido.quantoAtividade : null,
      caraterizacaoEstabelecimento: this.caraterizacaEstabelecimentoOpts.find(item => item.value === pedido.caraterizacaoEstabelecimento),
      risco: pedido.classeAtividade.tipoRisco,
      ato: this.tipoAtoOpts.find(item => item.value === pedido.ato),
      grupoAtividade: {
        id: pedido.classeAtividade.grupoAtividade.id,
        codigo: pedido.classeAtividade.grupoAtividade.codigo,
        descricao: pedido.classeAtividade.grupoAtividade.descricao,
        tipoRisco: pedido.classeAtividade.grupoAtividade.tipoRisco
      },
      grupoAtividadeCodigo: pedido.classeAtividade.grupoAtividade.descricao,
    });

    forkJoin([
      this.dataMasterService.getClassesByGrupoId(pedido.classeAtividade.grupoAtividade.id),
      this.dataMasterService.getAldeiasBySuco(pedido.localEstabelecimento.aldeia.suco.id)]).subscribe({
        next: responses => {

          this.listaClasseAtividade = mapToAtividadeEconomica(responses[0]._embedded.classeAtividade);
          this.listaAldeia = [...mapToIdAndNome(responses[1]._embedded.aldeias), ...this.listaAldeia];

          // Map Grupo Classe Atividade & Aldeia 
          this.requestForm.patchValue({
            localEstabelecimento: {
              id: pedido.localEstabelecimento.id,
              local: pedido.localEstabelecimento.local,
              aldeia: {
                id: pedido.localEstabelecimento.aldeia.id,
                nome: pedido.localEstabelecimento.aldeia.nome
              },
              suco: pedido.localEstabelecimento.aldeia.suco.nome,
              postoAdministrativo: pedido.localEstabelecimento.aldeia.suco.postoAdministrativo.nome,
              municipio: pedido.localEstabelecimento.aldeia.suco.postoAdministrativo.municipio.nome
            },
            classeAtividade: {
              id: pedido.classeAtividade.id,
              codigo: pedido.classeAtividade.codigo,
              descricao: pedido.classeAtividade.descricao,
              tipoRisco: pedido.classeAtividade.tipoRisco
            },
            classeAtividadeCodigo: pedido.classeAtividade.descricao,
          });
        }
      });
  }

  tipoAtividadeChange(event: any): void {
    const value = event.value;
    if (value) {
      this.requestForm.get('grupoAtividadeCodigo')?.setValue(event.value.descricao);

      this.dataMasterService.getClassesByGrupoId(value.id).subscribe({
        next: response => this.listaClasseAtividade = response._embedded.classeAtividade
      });
    } else {
      this.requestForm.get('grupoAtividadeCodigo')?.reset();
      this.listaClasseAtividade = [];
    }
  }

  atividadeDeclaradaChange(event: any): void {
    event.value ? this.faturaForm.get('codigo')?.setValue(event.value.descricao) : this.faturaForm.get('codigo')?.reset();
  }

  atividadePrincipalChange(event: any): void {
    if (event.value) {
      this.requestForm.get('classeAtividadeCodigo')?.patchValue(event.value.descricao);

      this.requestForm.get('grupoAtividadeCodigo')?.setValue(event.value.grupoAtividade.descricao);
      this.requestForm.get('grupoAtividade')?.setValue(event.value.grupoAtividade.codigo);
      this.requestForm.get('risco')?.setValue(event.value.tipoRisco);
    } else {
      this.requestForm.get('classeAtividadeCodigo')?.reset();
      this.requestForm.get('grupoAtividadeCodigo')?.reset();
      this.requestForm.get('grupoAtividade')?.reset();
      this.requestForm.get('risco')?.reset();
    }
  }

  submitAplicante(callback: any) {
    this.aplicanteLoading = true;

    const formData = {
      id: this.aplicanteData.id,
      tipo: this.aplicanteData.tipo,
      categoria: this.aplicanteData.categoria,
      numero: this.aplicanteData.numero,
      estado: AplicanteStatus.submetido
    }

    this.empresaService.submitAplicanteByEmpresaIdAndAplicanteId(this.aplicanteData.empresa.id, this.aplicanteData.id, formData).subscribe({
      next: response => {
        this.aplicanteEstado = response.estado;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'A Aplicante foi submetido com sucesso!'
        });
        this.disabledForms(AplicanteStatus.submetido);
        callback(1);
      },
      error: err => {
        this.aplicanteLoading = false;
        this.addMessages(false, true, err);
      },
      complete: () => {
        this.aplicanteLoading = false;
      }
    });
  }

  submit(form: FormGroup, callback: any): void {
    this.pedidoLoading = true;

    let formData: PedidoInscricaoCadastro = form.value;

    formData.tipoPedidoCadastro = form.value.tipoPedidoCadastro.value;
    formData.caraterizacaoEstabelecimento = form.value.caraterizacaoEstabelecimento.value;
    formData.risco = form.getRawValue().risco;
    formData.documentos = this.uploadedDocs;

    if (this.aplicanteData.categoria === Categoria.comercial) {
      formData.tipoEstabelecimento = form.value.tipoEstabelecimento.value;
      formData.ato = form.value.ato.value;
    } else {
      formData.tipoEmpresa = form.value.tipoEmpresa;
      formData.quantoAtividade = form.value.quantoAtividade;
    }

    if (this.isNew) {
      this.aplicanteService.savePedidoCadastro(this.aplicanteData.id, formData).subscribe({
        next: (response) => {
          this.addMessages(true, true);
          callback(3);

          this.pedidoId = response.id;
          this.aplicanteData.pedidoInscricaoCadastro = response;
          this.requestForm.patchValue({
            id: response.id,
          });
          this.isNew = false;
          this.requestForm.get('localEstabelecimento')?.patchValue({
            id: response.localEstabelecimento.id
          });
          // Set data in Fatura form
          this.mapNewFatura(this.aplicanteData);
          this.pedidoActive = true;
        },
        error: error => {
          this.addMessages(false, true, error);
          this.pedidoLoading = false;
        },
        complete: () => {
          callback(3);
          this.pedidoLoading = false;
          // this.closeDialog();
        }
      });
    } else {
      this.aplicanteService.updatePedidoCadastro(this.aplicanteData.id, formData.id, formData).subscribe({
        next: (response) => {
          this.addMessages(true, false);
          this.setTaxaAto(response.tipoPedidoCadastro);
          callback(3);
        },
        error: error => {
          this.addMessages(false, true, error);
          this.pedidoLoading = false;
        },
        complete: () => {
          callback(3);
          this.pedidoLoading = false;
        }
      });
    }
  }

  saveFatura(form: FormGroup): void {
    this.faturaLoading = true;
    let formData = { ...form.getRawValue() };
    formData.pedidoInscricaoCadastro = {
      id: this.pedidoId
    }
    // formData.atividadeDeclarada = this.listaAtividadeEconomicaAtividade.find(item => item.id === formData.atividadeDeclarada);
    formData.taxas = this.listaPedidoAto.filter(item => formData.taxas.includes(item.id));

    if (this.pedidoId && this.faturaId) {
      formData.id = this.faturaId;
      this.pedidoService.updateFatura(this.pedidoId, this.faturaId, formData).subscribe({
        next: (response) => {
          this.faturaId = response.id;
          this.aplicanteData.pedidoInscricaoCadastro.fatura = response;
          this.addMessages(true, false);
        },
        error: error => {
          this.addMessages(false, true, error);
          this.faturaLoading = false;
        },
        complete: () => {
          this.faturaLoading = false;
          // this.closeDialog();
        }
      });

    } else {
      this.pedidoService.saveFatura(this.pedidoId, formData).subscribe({
        next: (response) => {
          this.faturaId = response.id;
          this.aplicanteData.pedidoInscricaoCadastro.fatura = response;
          this.faturaActive = true;
          this.addMessages(true, false);

          this.updateUploadUrl();
        },
        error: error => {
          this.addMessages(false, true, error);
          this.faturaLoading = false;
        },
        complete: () => {
          this.faturaLoading = false;
        }
      });
    }


  }

  aldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeia = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeia = [...this.originalAldeias];
    }
  }


  onPanelHide() {
    this.listaAldeia = [...this.originalAldeias];
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

  onUpload(event: any, arg: string) {
    if (event.originalEvent.body) {
      this.uploadedFiles.push(event.originalEvent.body)
      this.aplicanteData.pedidoInscricaoCadastro.fatura.recibo = event.originalEvent.body
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivo carregado com sucesso!'
    });
  }

  updateUploadUrl() {
    this.uploadUrl.set(
      `${environment.apiUrl}/aplicantes/${this.aplicanteData.id}/pedidos/${this.pedidoId}/faturas/${this.faturaId}/upload/${this.authService.currentUserValue.username}`
    );
  }

  downloadFile(file: Documento) {
    this.downloadLoading = true;
    this.pedidoService.downloadRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
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
        this.downloadLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.downloadLoading = false;
      }
    });
  }

  downloadDoc(id: number): void {
    this.downloadLoading = true;
    this.documentoService.downloadById(id).subscribe({
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
        this.downloadLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.downloadLoading = false;
      }
    });
  }

  removeDoc(file: Documento) {
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
          this.downloadLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha no removero arquivo!'
          });
        },
      });
    }
  }

  removeFile(file: Documento) {
    this.deleteLoading = true;
    this.pedidoService.deleteRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
      next: () => {
        this.uploadedFiles.pop();
        this.aplicanteData.pedidoInscricaoCadastro.fatura.recibo = null;

        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Arquivo excluído com sucesso!'
        });
      },
      error: error => {
        this.deleteLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no exclusão do arquivo!'
        });
      },
      complete: () => {
        this.deleteLoading = false;
      }
    });
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  private getRejectedReason(historico: HistoricoEstadoAplicante[]): string | undefined {
    if (historico && historico.length) {
      return historico.find(h => h.status === AplicanteStatus.rejeitado)?.descricao;
    } else {
      return;
    }
  }

  private initForm(): void {
    this.requestForm = this._fb.group({
      id: [null],
      tipoPedidoCadastro: [null, [Validators.required]],
      nomeEstabelecimento: [null, [Validators.required]],
      localEstabelecimento: this._fb.group({
        id: [null],
        local: [null, [Validators.required]],
        aldeia: [null, [Validators.required]],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      tipoEstabelecimento: [null],
      tipoEmpresa: [null],
      quantoAtividade: [null],
      caraterizacaoEstabelecimento: [null],
      risco: new FormControl({ value: null, disabled: true }),
      ato: [null],
      grupoAtividade: new FormControl({ value: null, disabled: true }),
      grupoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      classeAtividade: [null, Validators.required],
      classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      alteracoes: [null],
      dataEmissaoCertAnterior: [null],
      observacao: [null],
      documentos: [null],
      longitude: [null],
      latitude: [null],
    });

    this.faturaForm = this._fb.group({
      id: [null],
      taxas: new FormControl({ value: null, disabled: true, }),
      nomeEmpresa: [null, [Validators.required]],
      sociedadeComercial: [null, [Validators.required]],
      nif: [null, [Validators.required]],
      sede: [null, [Validators.required]],
      nivelRisco: [null, [Validators.required]],
      superficie: [null, [Validators.required]],
      total: new FormControl({ value: null, disabled: true, }, [Validators.required]),
    });
  }

  tipoEstabelecimentoOnChange(event: SelectChangeEvent): void {
    const selected = event.value;
    if (!selected) {
      this.requestForm.patchValue({
        longitude: null,
        latitude: null
      });
      this.showGpsCoordinates = false;
      return;
    }
    if (selected.value === TipoEstabelecimento.principal) {
      this.requestForm.patchValue({
        longitude: this.aplicanteData.empresa.longitude,
        latitude: this.aplicanteData.empresa.latitude
      });
      this.showGpsCoordinates = false;
    } else {
      this.requestForm.patchValue({
        longitude: null,
        latitude: null
      });
      this.showGpsCoordinates = true;
    }
  }

  private disabledForms(aplicanteEstado: AplicanteStatus): void {
    if (aplicanteEstado === AplicanteStatus.submetido || aplicanteEstado === AplicanteStatus.aprovado) {
      this.requestForm.disable();
      this.faturaForm.disable();
      this.disableAllForm = true;
    }
  }

  private mapNewFatura(aplicante: Aplicante): void {
    this.setTaxaAto(aplicante.pedidoInscricaoCadastro?.tipoPedidoCadastro);
    this.faturaForm.patchValue({
      nomeEmpresa: aplicante.empresa.nome,
      sociedadeComercial: aplicante.empresa.sociedadeComercial.nome,
      nif: aplicante.empresa.nif,
      sede: `${aplicante.empresa.sede.local}, ${aplicante.empresa.sede.aldeia.nome}, ${aplicante.empresa.sede.aldeia.suco.nome}, ${aplicante.empresa.sede.aldeia.suco.postoAdministrativo.nome}, ${aplicante.empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
      nivelRisco: aplicante.pedidoInscricaoCadastro?.classeAtividade.tipoRisco,
    });

  }

  private mapEditFatura(fatura: Fatura) {

    // Enable superficie form control in edit mode
    this.faturaForm.get('superficie')?.enable();
    this.faturaForm.get('superficie')?.addValidators([Validators.required])

    // this.enableSuperficieFormControl();

    this.faturaForm.patchValue(fatura);
    this.faturaForm.patchValue({
      taxas: fatura.taxas.map(t => t.id),
      sociedadeComercial: fatura.sociedadeComercial,
    });

    if (fatura.recibo) {
      this.uploadedFiles.push(fatura.recibo);
    }
  }

  private setTaxaAto(tipoPedidoCadastro: TipoPedidoCadastro) {
    switch (tipoPedidoCadastro) {
      case TipoPedidoCadastro.inicial:
        let incialFiltered = this.listaPedidoAto.filter(
          t => t.ato && !/atualiza[cç]ão/i.test(t.ato)
        ).map(t => t.id);
        this.faturaForm.get('taxas')?.setValue(incialFiltered);
        break;

      case TipoPedidoCadastro.anual:
        const anualFiltered = this.listaPedidoAto.filter(
          t => t.ato && /atualiza[cç]ão anual/i.test(t.ato)
        ).map(t => t.id);
        this.faturaForm.get('taxas')?.setValue(anualFiltered);
        break;
      case TipoPedidoCadastro.alteracao:
        const alteracaoFiltered = this.listaPedidoAto.filter(
          t => t.ato && /atualiza[cç]ão pontual/i.test(t.ato)
        ).map(t => t.id);
        this.faturaForm.get('taxas')?.setValue(alteracaoFiltered);
        break;
    }
  }

  // private enableSuperficieFormControl() {
  //   this.faturaForm.get('taxas')?.valueChanges.subscribe({
  //     next: value => {
  //       console.log(value);

  //       if (value && value.length > 0) {
  //         this.faturaForm.get('superficie')?.enable();
  //         this.faturaForm.get('superficie')?.addValidators([Validators.required])
  //       } else {
  //         this.faturaForm.get('superficie')?.disable();
  //       }
  //     }
  //   })
  // }

  /**
   * Subscribes to changes in the 'superficie' form control and updates the 'total' form control
   * with the calculated total based on the current superficie and selected taxas.
   */
  private superficieOnChange() {
    this.faturaForm.get('superficie')?.valueChanges.subscribe({
      next: value => {
        if (value) {
          const superficie = value;
          const taxas: number[] = this.faturaForm.get('taxas')?.value;
          this.faturaForm.get('total')?.setValue(
            this.getTotalFatura(superficie, taxas)
          );
        }


      }
    })
  }

  /**
   * Returns the total of all the taxes based on the given superficie and taxa.
   * @param superficie The superficie of the company.
   * @param taxas The array of taxas to calculate.
   * @returns The total of all the taxes.
   */
  private getTotalFatura(superficie: number, taxas: number[]): number {
    let total = 0;

    for (let index = 0; index < taxas.length; index++) {
      const element = taxas[index];
      const taxa = this.listaPedidoAto.find(t => t.id === element);
      if (taxa) {
        total += calculateCommercialLicenseTax(superficie, taxa.montanteMinimo, taxa.montanteMaximo);
      }
    }

    return total;
  }

  isSubmitted(aplicanteData: Aplicante): boolean {
    return aplicanteData.estado !== 'SUBMETIDO' && aplicanteData.estado !==
      'APROVADO'
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
