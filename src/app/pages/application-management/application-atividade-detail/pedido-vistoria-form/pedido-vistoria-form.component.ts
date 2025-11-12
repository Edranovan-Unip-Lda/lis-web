import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Empresa, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { PedidoService } from '@/core/services/pedido.service';
import { caraterizacaEstabelecimentoOptions, mapToIdAndNome, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoPedidoVistoriaComercialOptions, tipoPedidoVistoriaIndustrialOptions } from '@/core/utils/global-function';
import { Component, Input, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select, SelectFilterEvent } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-pedido-vistoria-form',
  imports: [Select, ReactiveFormsModule, InputText, Textarea, Button, Toast, Textarea],
  templateUrl: './pedido-vistoria-form.component.html',
  styleUrl: './pedido-vistoria-form.component.scss',
  providers: [MessageService]
})
export class PedidoVistoriaFormComponent {
  vistoriaRequestForm!: FormGroup;
  @Input() aplicanteData!: Aplicante;
  @Input() listaAldeia: any[] = [];
  @Input() listaClasseAtividade: any[] = [];
  @Input() disabledAllForm!: boolean;
  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  atividadesOpts = tipoAtoOptions;
  tipoPedidoVistoriaOpts: any = [];
  originalAldeias: any = [];
  dataSent = output<any>();
  loading = false;
  pedido: PedidoVistoria | undefined;
  categoria!: string;


  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private pedidoService: PedidoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();

    switch (this.aplicanteData.categoria) {
      case Categoria.comercial:
        this.tipoPedidoVistoriaOpts = tipoPedidoVistoriaComercialOptions;
        this.categoria = Categoria.comercial;
        this.vistoriaRequestForm.get('atividade')?.setValidators(Validators.required);
        break;
      case Categoria.industrial:
        this.tipoPedidoVistoriaOpts = tipoPedidoVistoriaIndustrialOptions;
        this.categoria = Categoria.industrial;
        this.atividadesOpts = quantoAtividadeoptions;
        this.vistoriaRequestForm.get('tipoAtividade')?.setValidators(Validators.required);
        this.vistoriaRequestForm.patchValue({
          tipoEmpresa: this.aplicanteData.empresa.tipoEmpresa
        })
        this.vistoriaRequestForm.get('tipoEmpresa')?.disable();
        break;
    }

    if (this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria) {
      this.pedido = this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
    }

    this.mapEmpresaForm(this.aplicanteData.empresa);

    // Map data from Pedido Licenca Atividade (New Form)
    this.vistoriaRequestForm.patchValue({
      tipoEmpresa: this.aplicanteData.empresa.tipoEmpresa
    });
    const request = this.aplicanteData.pedidoLicencaAtividade;
    this.vistoriaRequestForm.patchValue({
      risco: request.risco,
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
      grupoAtividade: request.classeAtividade.grupoAtividade.codigo,
      grupoAtividadeCodigo: request.classeAtividade.grupoAtividade.descricao,
    });

    if (this.pedido) {
      this.mapPedidoForm(this.pedido);
      if (this.disabledAllForm) {
        this.vistoriaRequestForm.disable();
      }
    }

    this.listaAldeia = mapToIdAndNome(this.route.snapshot.data['aldeiasResolver']._embedded.aldeias);
    if (this.disabledAllForm) {
      this.vistoriaRequestForm.disable();
    }
  }

  submit(form: FormGroup): void {
    this.loading = true;

    let formData = {
      ...form.getRawValue(),
      localEstabelecimento: {
        ...form.getRawValue().localEstabelecimento,
        aldeia: {
          id: form.getRawValue().localEstabelecimento.aldeia
        }
      },
      classeAtividade: {
        id: form.getRawValue().classeAtividade.id
      },
    }

    if (this.pedido) {
      this.pedidoService.updatePedidoVistoria(this.aplicanteData.pedidoLicencaAtividade.id, this.pedido.id, formData).subscribe({
        next: (resp: any) => {
          this.vistoriaRequestForm.get('id')?.setValue(resp.id);
          this.addMessages(true, true);
          this.loading = false;
        },
        error: error => {
          console.error(error);
          this.addMessages(false, true, error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.pedidoService.savePedidoVistoria(this.aplicanteData.pedidoLicencaAtividade.id, formData).subscribe({
        next: response => {
          this.vistoriaRequestForm.get('id')?.setValue(response.id);
          this.pedido = response;
          this.addMessages(true, true);
          this.loading = false;
          this.dataSent.emit(response);
        },
        error: error => {
          console.error(error);
          this.addMessages(false, true, error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }



  }

  aldeiaOnChange(event: any): void {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.vistoriaRequestForm.get('localEstabelecimento')?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.vistoriaRequestForm.get('sede')?.patchValue({
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

  tipoAtividadeChange(event: any): void {
    const value = event.value;
    if (value) {
      this.vistoriaRequestForm.get('grupoAtividadeCodigo')?.setValue(event.value.descricao);

      this.dataMasterService.getClassesByGrupoId(value.id).subscribe({
        next: response => this.listaClasseAtividade = response._embedded.classeAtividade
      });
    } else {
      this.vistoriaRequestForm.get('grupoAtividadeCodigo')?.reset();
      this.listaClasseAtividade = [];
    }
  }

  atividadePrincipalChange(event: any): void {
    if (event.value) {
      this.vistoriaRequestForm.get('classeAtividadeCodigo')?.patchValue(event.value.descricao);
      this.vistoriaRequestForm.get('grupoAtividade')?.setValue(event.value.grupoAtividade.codigo);
      this.vistoriaRequestForm.get('grupoAtividadeCodigo')?.setValue(event.value.grupoAtividade.descricao);
      this.vistoriaRequestForm.get('risco')?.setValue(event.value.tipoRisco);
    } else {
      this.vistoriaRequestForm.get('classeAtividadeCodigo')?.reset();
      this.vistoriaRequestForm.get('grupoAtividade')?.reset();
      this.vistoriaRequestForm.get('grupoAtividadeCodigo')?.reset();
      this.vistoriaRequestForm.get('risco')?.reset();
    }
  }

  private mapEmpresaForm(empresa: Empresa): void {
    this.vistoriaRequestForm.patchValue({
      empresa: {
        nome: empresa.nome,
        sede: `${empresa.sede.local} - ${empresa.sede.aldeia.nome}, ${empresa.sede.aldeia.suco.nome}, ${empresa.sede.aldeia.suco.postoAdministrativo.nome}, ${empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome}`,
        aldeia: empresa.sede.aldeia.nome,
        suco: empresa.sede.aldeia.suco.nome,
        postoAdministrativo: empresa.sede.aldeia.suco.postoAdministrativo.nome,
        municipio: empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome,
        nif: empresa.nif,
        numeroRegistoComercial: empresa.numeroRegistoComercial,
        telemovel: empresa.telemovel,
        email: empresa.email,
        gerente: empresa.gerente.nome,
      }
    });
  }

  private mapPedidoForm(pedido: PedidoVistoria): void {
    this.vistoriaRequestForm.patchValue({
      ...pedido,
      id: pedido.id,
      tipoVistoria: pedido.tipoVistoria,
      nomeEstabelecimento: pedido.nomeEstabelecimento,
      localEstabelecimento: {
        id: pedido.localEstabelecimento.id,
        local: pedido.localEstabelecimento.local,
        aldeia: pedido.localEstabelecimento.aldeia.id,
        suco: pedido.localEstabelecimento.aldeia.suco.nome,
        postoAdministrativo: pedido.localEstabelecimento.aldeia.suco.postoAdministrativo.nome,
        municipio: pedido.localEstabelecimento.aldeia.suco.postoAdministrativo.municipio.nome
      },
      tipoEmpresa: pedido.tipoEmpresa,
      tipoEstabelecimento: pedido.tipoEstabelecimento,
      risco: pedido.risco,
      atividade: pedido.atividade,
      grupoAtividade: pedido.classeAtividade.grupoAtividade.codigo,
      grupoAtividadeCodigo: pedido.classeAtividade.grupoAtividade.descricao,
      classeAtividade: {
        id: pedido.classeAtividade.id,
        codigo: pedido.classeAtividade.codigo,
        descricao: pedido.classeAtividade.descricao,
        tipoRisco: pedido.classeAtividade.tipoRisco,
        grupoAtividade: {
          id: pedido.classeAtividade.grupoAtividade.id,
          codigo: pedido.classeAtividade.grupoAtividade.codigo,
          descricao: pedido.classeAtividade.grupoAtividade.descricao,
        }
      },
      classeAtividadeCodigo: pedido.classeAtividade.descricao,
    });
  }

  private initForm(): void {
    this.vistoriaRequestForm = this._fb.group({
      id: [null],
      tipoVistoria: [null],
      empresa: this._fb.group({
        nome: new FormControl({ value: null, disabled: true }),
        sede: new FormControl({ value: null, disabled: true }),
        aldeia: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
        nif: new FormControl({ value: null, disabled: true }),
        numeroRegistoComercial: new FormControl({ value: null, disabled: true }),
        telemovel: new FormControl({ value: null, disabled: true }),
        email: new FormControl({ value: null, disabled: true }),
        gerente: new FormControl({ value: null, disabled: true }),
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: this._fb.group({
        id: [null],
        local: [null, [Validators.required]],
        aldeia: [null, [Validators.required]],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      tipoEmpresa: [null],
      tipoEstabelecimento: [null],
      risco: new FormControl({ value: null, disabled: true }),
      atividade: [null],
      tipoAtividade: [null],
      classeAtividade: new FormControl({ value: null, disabled: true }),
      classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      grupoAtividade: new FormControl({ value: null, disabled: true }),
      grupoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      alteracoes: [null],
      observacao: [null],
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
