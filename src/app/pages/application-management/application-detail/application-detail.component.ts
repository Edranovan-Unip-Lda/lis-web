import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Documento, Empresa, Fatura, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { AplicanteType, Categoria, TipoPedidoCadastro } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService } from '@/core/services';
import { AplicanteService } from '@/core/services/aplicante.service';
import { DataMasterService } from '@/core/services/data-master.service';
import { PedidoService } from '@/core/services/pedido.service';
import { calculateCommercialLicenseTax, caraterizacaEstabelecimentoOptions, mapToAtividadeEconomica, mapToIdAndNome, mapToTaxa, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoEstabelecimentoOptions, tipoPedidoCadastroOptions } from '@/core/utils/global-function';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select, SelectFilterEvent } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-application-detail',
  imports: [ReactiveFormsModule, Button, StepperModule, Select, InputText, FileUpload, Tag, StatusSeverityPipe, DatePipe, Toast, TitleCasePipe, RouterLink, InputNumber, InputGroup, InputGroupAddon, MultiSelect],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
  providers: [MessageService]
})
export class ApplicationDetailComponent {
  aplicanteData!: Aplicante;
  faturaForm!: FormGroup;
  pedidoLoading = false;
  faturaLoading = false;
  pedidoId!: number;
  faturaId!: number;
  isNew = false;
  showDataEmissaoCertAnterior = true;

  requestForm!: FormGroup;
  tipoPedidoOpts = tipoPedidoCadastroOptions;
  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = tipoEstabelecimentoOptions;
  caraterizacaEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  tipoAtoOpts = tipoAtoOptions;
  quantoAtividadeOpts = quantoAtividadeoptions;
  categoria!: Categoria;
  listaMunicipio: any[] = [];
  listaPosto: any[] = [];
  listaSuco: any[] = [];
  listaAldeia: any[] = [];
  listaAtividadeEconomicaTipo: any[] = [];
  listaAtividadeEconomicaAtividade: any[] = [];
  listaSociedadeComercial: any[] = [];
  listaPedidoAto: any[] = [];
  originalAldeias: any = [];

  uploadedFiles: any[] = [];
  uploadUrl = `${environment.apiUrl}/aplicantes`;
  maxFileSize = 20 * 1024 * 1024;
  downloadLoading = false;
  deleteLoading = false;

  pedidoActive = false;
  faturaActive = false;

  constructor(
    private _fb: FormBuilder,
    private router: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private aplicanteService: AplicanteService,
    private messageService: MessageService,
    private pedidoService: PedidoService,
    private authService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.initForm();

    this.listaAldeia = mapToIdAndNome(this.router.snapshot.data['aldeiasResolver']._embedded.aldeias);
    this.listaAtividadeEconomicaTipo = mapToAtividadeEconomica(this.router.snapshot.data['atividadeEconomicaTipoResolver']._embedded.atividadeEconomica);
    this.listaAtividadeEconomicaAtividade = mapToAtividadeEconomica(this.router.snapshot.data['atividadeEconomicaAtividadeResolver']._embedded.atividadeEconomica);
    this.listaSociedadeComercial = mapToIdAndNome(this.router.snapshot.data['sociedadeComercialResolver']._embedded.sociedadeComercial)

    this.originalAldeias = this.listaAldeia;


    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.categoria = this.aplicanteData.categoria;
    this.listaPedidoAto = mapToTaxa(this.router.snapshot.data['listaTaxaResolver']._embedded.taxas);

    this.mapNewFatura(this.aplicanteData);

    if (!this.aplicanteData.pedidoInscricaoCadastroDto) {
      this.isNew = true;
      this.mapNewPedido(this.aplicanteData.empresaDto);
    } else {
      this.isNew = false;
      this.pedidoActive = true;
      this.pedidoId = this.aplicanteData.pedidoInscricaoCadastroDto.id;

      if (this.aplicanteData.pedidoInscricaoCadastroDto.fatura) {
        this.faturaActive = true;
        this.faturaId = this.aplicanteData.pedidoInscricaoCadastroDto.fatura.id;
        this.mapEditFatura(this.aplicanteData.pedidoInscricaoCadastroDto.fatura);
        this.uploadUrl = `${this.uploadUrl}/${this.aplicanteData.id}/pedidos/${this.pedidoId}/faturas/${this.faturaId}/upload/${this.authService.currentUserValue.username}`;

      } else {
        this.faturaForm.patchValue({
          atividadeDeclarada: this.aplicanteData.pedidoInscricaoCadastroDto.atividadePrincipal.id,
          descricao: this.aplicanteData.pedidoInscricaoCadastroDto.atividadePrincipal.descricao,
        });
      }

      this.mapEditPedido(this.aplicanteData.pedidoInscricaoCadastroDto);
    }

    this.enableSuperficieFormControl();
    this.superficieOnChange();
  }

  pedidoCadstroOnChange(event: any): void {
    event.value.value === TipoPedidoCadastro.inicial ? this.showDataEmissaoCertAnterior = true : this.showDataEmissaoCertAnterior = false;
  }

  aldeiaOnChange(event: any): void {
    if (event.value.id) {
      const selectedItem = event.value.id;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.requestForm.get('sede')?.patchValue({
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

  private mapNewPedido(empresa: Empresa): void {
    const municipio = empresa.sede.aldeia.suco.postoAdministrativo.municipio;
    const postoAdministrativo = {
      id: empresa.sede.aldeia.suco.postoAdministrativo.id,
      nome: empresa.sede.aldeia.suco.postoAdministrativo.nome
    };
    const suco = {
      id: empresa.sede.aldeia.suco.id,
      nome: empresa.sede.aldeia.suco.nome
    };
    const aldeia = {
      id: empresa.sede.aldeia.id,
      nome: empresa.sede.aldeia.nome
    };

    this.requestForm.patchValue({
      nomeEmpresa: empresa.nome,
      nif: empresa.nif,
      numeroRegistoComercial: empresa?.numeroRegistoComercial,
      telemovel: empresa.telemovel,
      telefone: empresa.telefone,
      email: empresa.utilizador.email,
      gerente: empresa.gerente,
    });

    this.dataMasterService.getAldeiasBySuco(empresa.sede.aldeia.suco.id).subscribe({
      next: (response) => {
        this.listaAldeia = [...mapToIdAndNome(response._embedded.aldeias), ...this.listaAldeia];
        this.requestForm.patchValue({
          sede: {
            local: empresa.sede.local,
            aldeia: aldeia,
            suco: suco.nome,
            postoAdministrativo: postoAdministrativo.nome,
            municipio: municipio.nome
          }
        });
      }
    });
  }

  mapEditPedido(pedido: PedidoInscricaoCadastro): void {
    this.requestForm.patchValue(pedido);
    const municipio = pedido.sede.aldeia.suco.postoAdministrativo.municipio;
    const postoAdministrativo = {
      id: pedido.sede.aldeia.suco.postoAdministrativo.id,
      nome: pedido.sede.aldeia.suco.postoAdministrativo.nome
    };
    const suco = {
      id: pedido.sede.aldeia.suco.id,
      nome: pedido.sede.aldeia.suco.nome
    };
    const aldeia = {
      id: pedido.sede.aldeia.id,
      nome: pedido.sede.aldeia.nome
    };

    let tipoAtividade = {
      id: pedido.tipoAtividade.id,
      codigo: pedido.tipoAtividade.codigo,
      descricao: pedido.tipoAtividade.descricao,
      tipoRisco: pedido.tipoAtividade.tipoRisco
    }

    let atividadePrincipal = {
      id: pedido.atividadePrincipal.id,
      codigo: pedido.atividadePrincipal.codigo,
      descricao: pedido.atividadePrincipal.descricao,
      tipoRisco: pedido.atividadePrincipal.tipoRisco
    }

    this.requestForm.patchValue({
      tipoPedidoCadastro: this.tipoPedidoOpts.find(item => item.value === pedido.tipoPedidoCadastro),
      tipoEstabelecimento: this.tipoEstabelecimentoOpts.find(item => item.value === pedido.tipoEstabelecimento),
      tipoEmpresa: this.categoria === Categoria.industrial ? pedido.tipoEmpresa : null,
      quantoAtividade: this.categoria === Categoria.industrial ? pedido.quantoAtividade : null,
      caraterizacaoEstabelecimento: this.caraterizacaEstabelecimentoOpts.find(item => item.value === pedido.caraterizacaoEstabelecimento),
      risco: pedido.tipoAtividade.tipoRisco,
      ato: this.tipoAtoOpts.find(item => item.value === pedido.ato),
      tipoAtividade: tipoAtividade,
      atividadePrincipal: atividadePrincipal,
      tipoAtividadeCodigo: pedido.tipoAtividade.descricao,
      atividadePrincipalCodigo: pedido.atividadePrincipal.descricao,
    });

    this.dataMasterService.getAldeiasBySuco(pedido.sede.aldeia.suco.id).subscribe({
      next: (response) => {
        this.listaAldeia = [...mapToIdAndNome(response._embedded.aldeias), ...this.listaAldeia];
        this.requestForm.patchValue({
          sede: {
            id: pedido.sede.id,
            local: pedido.sede.local,
            aldeia: aldeia,
            suco: suco.nome,
            postoAdministrativo: postoAdministrativo.nome,
            municipio: municipio.nome
          }
        });
      }
    });
  }

  tipoAtividadeChange(event: any): void {
    const value = event.value;
    if (value) {
      this.requestForm.get('tipoAtividadeCodigo')?.setValue(event.value.descricao);
      this.requestForm.get('risco')?.setValue(value.tipoRisco)
    } else {
      this.requestForm.get('tipoAtividadeCodigo')?.reset();
      this.requestForm.get('risco')?.reset();
    }
  }

  atividadeDeclaradaChange(event: any): void {
    event.value ? this.faturaForm.get('codigo')?.setValue(event.value.descricao) : this.faturaForm.get('codigo')?.reset();
  }

  atividadePrincipalChange(event: any): void {
    event.value ? this.requestForm.get('atividadePrincipalCodigo')?.patchValue(event.value.descricao) : this.requestForm.get('atividadePrincipalCodigo')?.reset();
  }

  submit(form: FormGroup, callback: any): void {
    this.pedidoLoading = true;

    let formData: PedidoInscricaoCadastro = form.value;

    formData.tipoPedidoCadastro = form.value.tipoPedidoCadastro.value;
    formData.caraterizacaoEstabelecimento = form.value.caraterizacaoEstabelecimento.value;
    formData.risco = form.getRawValue().risco;

    if (this.aplicanteData.categoria === Categoria.comercial) {
      formData.tipoEstabelecimento = form.value.tipoEstabelecimento.value;
      formData.ato = form.value.ato.value;
    } else {
      formData.tipoEmpresa = form.value.tipoEmpresa;
      formData.quantoAtividade = form.value.quantoAtividade;
    }

    if (this.isNew) {
      this.aplicanteService.savePedido(this.aplicanteData.id, AplicanteType.cadastro, formData).subscribe({
        next: (response) => {
          this.addMessages(true, true);
          callback(3);

          this.pedidoId = response.id;
          this.aplicanteData.pedidoInscricaoCadastroDto = response;
          this.requestForm.patchValue({
            id: response.id,
          });
          this.requestForm.get('sede')?.patchValue({
            id: response.sede.id
          });
          // Set data in Fatura form
          this.mapNewFatura(this.aplicanteData);
          this.pedidoActive = true;
        },
        error: error => {
          this.addMessages(false, true, error);
          console.error(error);
          this.pedidoLoading = false;
        },
        complete: () => {
          callback(3);
          this.pedidoLoading = false;
          // this.closeDialog();
        }
      });
    } else {
      this.aplicanteService.updatePedido(this.aplicanteData.id, formData.id, AplicanteType.cadastro, formData).subscribe({
        next: (response) => {
          this.addMessages(true, false);
          callback(3);
        },
        error: error => {
          this.addMessages(false, true, error);
          console.error(error);
          this.pedidoLoading = false;
        },
        complete: () => {
          callback(3);
          this.pedidoLoading = false;
          // this.closeDialog();
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
    formData.atividadeDeclarada = this.listaAtividadeEconomicaAtividade.find(item => item.id === formData.atividadeDeclarada);
    formData.taxas = this.listaPedidoAto.filter(item => formData.taxas.includes(item.id));

    if (this.pedidoId && formData.id) {

      this.pedidoService.updateFatura(this.pedidoId, formData.id, formData).subscribe({
        next: (response) => {
          this.faturaId = response.id;
          this.aplicanteData.pedidoInscricaoCadastroDto.fatura = response;
          this.addMessages(true, false);
        },
        error: error => {
          this.addMessages(false, true, error);
          console.error(error);
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
          this.aplicanteData.pedidoInscricaoCadastroDto.fatura = response;
          this.faturaActive = true;
          this.addMessages(true, false);
        },
        error: error => {
          this.addMessages(false, true, error);
          console.error(error);
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

  onUpload(event: any, arg: string) {
    if (event.originalEvent.body) {
      this.uploadedFiles.push(event.originalEvent.body)
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivo carregado com sucesso!'
    });
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
          summary: 'Success',
          detail: 'Arquivo descarregado com sucesso!'
        });
      },
      error: error => {
        this.downloadLoading = false;
        console.error(error);
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

  removeFile(file: Documento) {
    this.deleteLoading = true;
    this.pedidoService.deleteRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
      next: () => {
        this.uploadedFiles.pop();
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Arquivo excluído com sucesso!'
        });
      },
      error: error => {
        this.deleteLoading = false;
        console.error(error);
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

  private initForm(): void {
    this.requestForm = this._fb.group({
      id: [null],
      tipoPedidoCadastro: [null],
      nomeEmpresa: [null],
      nif: [null],
      numeroRegistoComercial: [null],
      telemovel: [null],
      telefone: [null],
      email: [null],
      gerente: [null],
      sede: this._fb.group({
        id: [null],
        local: [null, [Validators.required]],
        aldeia: [null, [Validators.required]],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: [null],
      tipoEstabelecimento: [null],
      tipoEmpresa: [null],
      quantoAtividade: [null],
      caraterizacaoEstabelecimento: [null],
      risco: new FormControl({ value: null, disabled: true }),
      ato: [null],
      tipoAtividade: [null],
      tipoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      atividadePrincipal: [null],
      atividadePrincipalCodigo: new FormControl({ value: null, disabled: true }),
      alteracoes: [null],
      dataEmissaoCertAnterior: [null],
      observacao: [null],
    });

    this.faturaForm = this._fb.group({
      id: [null],
      taxas: [null, [Validators.required]],
      nomeEmpresa: [null, [Validators.required]],
      sociedadeComercial: [null, [Validators.required]],
      nif: [null, [Validators.required]],
      sede: [null, [Validators.required]],
      nivelRisco: [null, [Validators.required]],
      atividadeDeclarada: [null, [Validators.required]],
      descricao: new FormControl({ value: null, disabled: true }),
      superficie: new FormControl({ value: null, disabled: true, }),
      total: new FormControl({ value: null, disabled: true, }, [Validators.required]),
    });
  }

  private mapNewFatura(aplicante: Aplicante): void {
    this.faturaForm.patchValue({
      nomeEmpresa: aplicante.empresaDto.nome,
      sociedadeComercial: aplicante.empresaDto.sociedadeComercial.nome,
      nif: aplicante.empresaDto.nif,
      sede: `${aplicante.empresaDto.sede.local}, ${aplicante.empresaDto.sede.aldeia.nome}, ${aplicante.empresaDto.sede.aldeia.suco.nome}, ${aplicante.empresaDto.sede.aldeia.suco.postoAdministrativo.nome}, ${aplicante.empresaDto.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
      atividadeDeclarada: aplicante.pedidoInscricaoCadastroDto?.atividadePrincipal.id,
      descricao: aplicante.pedidoInscricaoCadastroDto?.atividadePrincipal.descricao,
      nivelRisco: aplicante.pedidoInscricaoCadastroDto?.atividadePrincipal.tipoRisco,
    });

  }

  private mapEditFatura(fatura: Fatura) {

    // Enable superficie form control in edit mode
    this.faturaForm.get('superficie')?.enable();
    this.faturaForm.get('superficie')?.addValidators([Validators.required])

    this.enableSuperficieFormControl();

    this.faturaForm.patchValue(fatura);
    this.faturaForm.patchValue({
      atividadeDeclarada: fatura.atividadeDeclarada.id,
      codigo: fatura.atividadeDeclarada.codigo,
      taxas: fatura.taxas.map(t => t.id),
      sociedadeComercial: fatura.sociedadeComercial,
    });

    if (fatura.recibo) {
      this.uploadedFiles.push(fatura.recibo);
    }
  }

  private enableSuperficieFormControl() {
    this.faturaForm.get('taxas')?.valueChanges.subscribe({
      next: value => {
        if (value && value.length > 0) {
          this.faturaForm.get('superficie')?.enable();
          this.faturaForm.get('superficie')?.addValidators([Validators.required])
        } else {
          this.faturaForm.get('superficie')?.disable();
        }
      }
    })
  }

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

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
