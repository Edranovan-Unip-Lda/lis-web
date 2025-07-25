import { Aplicante, Empresa, Fatura, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { AplicanteType, Categoria } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AplicanteService } from '@/core/services/aplicante.service';
import { DataMasterService } from '@/core/services/data-master.service';
import { PedidoService } from '@/core/services/pedido.service';
import { caraterizacaEstabelecimentoOptions, mapToAtividadeEconomica, mapToIdAndNome, mapToTaxa, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoEstabelecimentoOptions, tipoPedidoCadastroOptions } from '@/core/utils/global-function';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-application-detail',
  imports: [ReactiveFormsModule, Button, StepperModule, Select, InputText, FileUpload, Tag, StatusSeverityPipe, CurrencyPipe, DatePipe, Toast, TitleCasePipe, RouterLink],
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
  listaAtividadeEconomica: any[] = [];
  listaPedidoAto: any[] = [];

  uploadedFiles: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private router: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private aplicanteService: AplicanteService,
    private messageService: MessageService,
    private pedidoService: PedidoService,
  ) {
  }

  ngOnInit(): void {
    this.initForm();

    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.categoria = this.aplicanteData.categoria;
    this.listaPedidoAto = mapToTaxa(this.router.snapshot.data['listaTaxaResolver']._embedded.taxas);

    console.log(this.aplicanteData);


    if (!this.aplicanteData.pedidoInscricaoCadastroDto) {
      this.isNew = true;
      this.mapNewPedido(this.aplicanteData.empresaDto);
    } else {
      this.isNew = false;
      this.pedidoId = this.aplicanteData.pedidoInscricaoCadastroDto.id;

      if (this.aplicanteData.pedidoInscricaoCadastroDto.fatura) {
        this.faturaId = this.aplicanteData.pedidoInscricaoCadastroDto.fatura.id;
        this.mapEditFatura(this.aplicanteData.pedidoInscricaoCadastroDto.fatura);
      }

      this.mapEditPedido(this.aplicanteData.pedidoInscricaoCadastroDto);
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

    const municipios = this.dataMasterService.getMunicipios();
    const postos = this.dataMasterService.getPostosByMunicipio(empresa.sede.aldeia.suco.postoAdministrativo.municipio.id);
    const sucos = this.dataMasterService.getSucosByPosto(empresa.sede.aldeia.suco.postoAdministrativo.id);
    const aldeias = this.dataMasterService.getAldeiasBySuco(empresa.sede.aldeia.suco.id);
    const atividadeEconomicas = this.dataMasterService.getAtividadeEconomica();

    forkJoin([municipios, postos, sucos, aldeias, atividadeEconomicas]).subscribe({
      next: responses => {

        this.listaMunicipio = mapToIdAndNome(responses[0]._embedded.municipios);
        this.listaPosto = mapToIdAndNome(responses[1]._embedded.postos);
        this.listaSuco = mapToIdAndNome(responses[2]._embedded.sucos);
        this.listaAldeia = mapToIdAndNome(responses[3]._embedded.aldeias);
        this.listaAtividadeEconomica = mapToAtividadeEconomica(responses[4]._embedded.atividadeEconomica);

        this.requestForm.patchValue({
          sede: {
            local: empresa.sede.local,
            aldeia: aldeia,
            suco: suco,
            postoAdministrativo: postoAdministrativo,
            municipio: municipio
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
      descricao: pedido.tipoAtividade.descricao
    }

    let atividadePrincipal = {
      id: pedido.atividadePrincipal.id,
      codigo: pedido.atividadePrincipal.codigo,
      descricao: pedido.atividadePrincipal.descricao
    }

    this.requestForm.patchValue({
      tipoPedidoCadastro: this.tipoPedidoOpts.find(item => item.value === pedido.tipoPedidoCadastro),
      tipoEstabelecimento: this.tipoEstabelecimentoOpts.find(item => item.value === pedido.tipoEstabelecimento),
      tipoEmpresa: this.categoria === Categoria.industrial ? pedido.tipoEmpresa : null,
      quantoAtividade: this.categoria === Categoria.industrial ? pedido.quantoAtividade : null,
      caraterizacaoEstabelecimento: this.caraterizacaEstabelecimentoOpts.find(item => item.value === pedido.caraterizacaoEstabelecimento),
      risco: this.nivelRiscoOpts.find(item => item.value === pedido.risco),
      ato: this.tipoAtoOpts.find(item => item.value === pedido.ato),
      tipoAtividade: tipoAtividade,
      atividadePrincipal: atividadePrincipal,
      tipoAtividadeCodigo: pedido.tipoAtividade.codigo,
      atividadePrincipalCodigo: pedido.atividadePrincipal.codigo,
    });

    const municipios = this.dataMasterService.getMunicipios();
    const postos = this.dataMasterService.getPostosByMunicipio(pedido.sede.aldeia.suco.postoAdministrativo.municipio.id);
    const sucos = this.dataMasterService.getSucosByPosto(pedido.sede.aldeia.suco.postoAdministrativo.id);
    const aldeias = this.dataMasterService.getAldeiasBySuco(pedido.sede.aldeia.suco.id);
    const atividadeEconomicas = this.dataMasterService.getAtividadeEconomica();

    forkJoin([municipios, postos, sucos, aldeias, atividadeEconomicas]).subscribe({
      next: responses => {

        this.listaMunicipio = mapToIdAndNome(responses[0]._embedded.municipios);
        this.listaPosto = mapToIdAndNome(responses[1]._embedded.postos);
        this.listaSuco = mapToIdAndNome(responses[2]._embedded.sucos);
        this.listaAldeia = mapToIdAndNome(responses[3]._embedded.aldeias);
        this.listaAtividadeEconomica = mapToAtividadeEconomica(responses[4]._embedded.atividadeEconomica);

        this.requestForm.patchValue({
          sede: {
            id: pedido.sede.id,
            local: pedido.sede.local,
            aldeia: aldeia,
            suco: suco,
            postoAdministrativo: postoAdministrativo,
            municipio: municipio
          }
        });
      }
    });
  }

  private mapEditFatura(fatura: Fatura) {
    let taxa = {
      id: fatura.taxa.id,
      ato: fatura.taxa.ato,
      montante: fatura.taxa.montante
    }

    this.faturaForm.patchValue(fatura);
    this.faturaForm.patchValue({
      codigo: fatura.atividadeDeclarada.codigo,
      taxa: taxa
    });
    console.log(this.faturaForm.value);

  }

  munisipiuChange(event: any): void {
    this.dataMasterService.getPostosByMunicipio(event.value.id).subscribe({
      next: (response) => {
        this.listaPosto = response._embedded.postos;
        this.listaSuco = [];
        this.listaAldeia = [];
      }
    });
  }

  postuChange(event: any): void {
    this.dataMasterService.getSucosByPosto(event.value.id).subscribe({
      next: (response) => {
        this.listaSuco = response._embedded.sucos;
        this.listaAldeia = [];
      }
    });
  }

  sukuChange(event: any): void {
    this.dataMasterService.getAldeiasBySuco(event.value.id).subscribe({
      next: (response) => this.listaAldeia = response._embedded.aldeias
    });
  }

  tipoAtividadeChange(event: any): void {
    this.requestForm.get('tipoAtividadeCodigo')?.setValue(event.value.codigo);
  }

  atividadeDeclaradaChange(event: any): void {
    this.faturaForm.get('codigo')?.setValue(event.value.codigo);
  }

  atividadePrincipalChange(event: any): void {
    this.requestForm.get('atividadePrincipalCodigo')?.patchValue(event.value.codigo);
  }

  submit(form: FormGroup, callback: any): void {
    console.log(form.value);
    this.pedidoLoading = true;

    let formData: PedidoInscricaoCadastro = form.value;

    formData.tipoPedidoCadastro = form.value.tipoPedidoCadastro.value;
    formData.caraterizacaoEstabelecimento = form.value.caraterizacaoEstabelecimento.value;
    formData.risco = form.value.risco.value;

    if (this.aplicanteData.categoria === Categoria.comercial) {
      formData.tipoEstabelecimento = form.value.tipoEstabelecimento.value;
      formData.ato = form.value.ato.value;
    } else {
      formData.tipoEmpresa = form.value.tipoEmpresa.value;
      formData.quantoAtividade = form.value.quantoAtividade;
    }


    console.log(formData);

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
    console.log(form.value);

    let formData = { ...form.value }
    formData.pedidoInscricaoCadastro = {
      id: this.pedidoId
    }

    console.log(formData);


    if (this.pedidoId && formData.id) {

      this.pedidoService.updateFatura(this.pedidoId, formData.id, formData).subscribe({
        next: (response) => {
          console.log(response);
          this.faturaId = response.id;
          this.aplicanteData.pedidoInscricaoCadastroDto.fatura = response;
          this.addMessages(true, false);
        },
        error: error => {
          this.addMessages(false, true, error);
          console.error(error);
          this.pedidoLoading = false;
        },
        complete: () => {
          this.pedidoLoading = false;
          // this.closeDialog();
        }
      });

    } else {
      this.pedidoService.saveFatura(this.pedidoId, form.value).subscribe({
        next: (response) => {
          console.log(response);
          this.faturaId = response.id;
          this.aplicanteData.pedidoInscricaoCadastroDto.fatura = response;
          this.addMessages(true, false);
        },
        error: error => {
          this.addMessages(false, true, error);
          console.error(error);
          this.pedidoLoading = false;
        },
        complete: () => {
          this.pedidoLoading = false;
          // this.closeDialog();
        }
      });
    }


  }

  onUpload(event: any, arg: string) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    // this.messageService.add({
    //   severity: 'info',
    //   summary: 'Success',
    //   detail: 'File Uploaded'
    // });
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
        suco: [null, [Validators.required]],
        postoAdministrativo: [null, [Validators.required]],
        municipio: [null, [Validators.required]],
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: [null],
      tipoEstabelecimento: [null],
      tipoEmpresa: [null],
      quantoAtividade: [null],
      caraterizacaoEstabelecimento: [null],
      risco: [null],
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
      taxa: [null],
      nomeEmpresa: [null],
      sociedadeComercial: [null],
      atividadeDeclarada: [null],
      codigo: new FormControl({ value: null, disabled: true }),
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
