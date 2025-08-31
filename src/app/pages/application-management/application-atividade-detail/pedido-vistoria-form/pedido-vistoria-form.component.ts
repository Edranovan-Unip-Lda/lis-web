import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria } from '@/core/models/enums';
import { AplicanteService } from '@/core/services/aplicante.service';
import { DataMasterService } from '@/core/services/data-master.service';
import { caraterizacaEstabelecimentoOptions, mapToAtividadeEconomica, mapToGrupoAtividade, mapToIdAndNome, nivelRiscoOptions, tipoAtoOptions, tipoEmpresaOptions, tipoPedidoAtividadeComercialOptions, tipoPedidoVistoriaComercialOptions, tipoPedidoVistoriaIndustrialOptions } from '@/core/utils/global-function';
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
  imports: [Select, ReactiveFormsModule, InputText, Textarea, Button, Toast],
  templateUrl: './pedido-vistoria-form.component.html',
  styleUrl: './pedido-vistoria-form.component.scss',
  providers: [MessageService]
})
export class PedidoVistoriaFormComponent {
  vistoriaRequestForm!: FormGroup;
  @Input() aplicanteData!: Aplicante;
  @Input() listaAldeia: any[] = [];
  @Input() listaGrupoAtividade: any[] = [];
  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  atividadesOpts = tipoAtoOptions;
  tipoPedidoVistoriaOpts: any = [];
  listaClasseAtividade: any[] = [];
  originalAldeias: any = [];
  dataSent = output<any>();
  loading = false;
  pedido: PedidoVistoria | undefined;


  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private aplicanteService: AplicanteService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();

    if (this.aplicanteData.categoria == Categoria.comercial) {
      this.tipoPedidoVistoriaOpts = tipoPedidoVistoriaComercialOptions;
    } else {
      this.tipoPedidoVistoriaOpts = tipoPedidoVistoriaIndustrialOptions;
    }

    this.pedido = this.aplicanteData.pedidoVistorias.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);

    if (this.pedido) {
      console.log(this.listaGrupoAtividade);

      this.mapPedidoForm(this.pedido);
    }


    this.listaAldeia = mapToIdAndNome(this.route.snapshot.data['aldeiasResolver']._embedded.aldeias);
    this.listaGrupoAtividade = mapToGrupoAtividade(this.route.snapshot.data['grupoAtividadeResolver']._embedded.grupoAtividade);

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
      }
    }

    if (this.pedido) {
      this.aplicanteService.updatePedidoVistoria(this.aplicanteData.id, this.pedido.id, formData).subscribe({
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
      this.aplicanteService.savePedidoVistoria(this.aplicanteData.id, formData).subscribe({
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
      this.vistoriaRequestForm.get('risco')?.setValue(event.value.tipoRisco);
    } else {
      this.vistoriaRequestForm.get('classeAtividadeCodigo')?.reset();
      this.vistoriaRequestForm.get('risco')?.reset();
    }
  }

  private mapPedidoForm(pedido: PedidoVistoria): void {
    let grupoAtividade = {
      id: pedido.classeAtividade.grupoAtividade.id,
      codigo: pedido.classeAtividade.grupoAtividade.codigo,
      descricao: pedido.classeAtividade.grupoAtividade.descricao,
      tipoRisco: pedido.classeAtividade.grupoAtividade.tipoRisco
    }

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
      grupoAtividade: grupoAtividade,
      grupoAtividadeCodigo: grupoAtividade.descricao,
      classeAtividadeCodigo: pedido.classeAtividade.descricao,
    });

    this.dataMasterService.getClassesByGrupoId(pedido.classeAtividade.grupoAtividade.id).subscribe({
      next: response => {
        let classeAtividade = {
          id: pedido.classeAtividade.id,
          codigo: pedido.classeAtividade.codigo,
          descricao: pedido.classeAtividade.descricao,
          tipoRisco: pedido.classeAtividade.tipoRisco
        };
        this.listaClasseAtividade = mapToAtividadeEconomica(response._embedded.classeAtividade);
        this.vistoriaRequestForm.get('classeAtividade')?.setValue(classeAtividade);
      }
    });
  }

  private initForm(): void {
    this.vistoriaRequestForm = this._fb.group({
      id: [null],
      tipoVistoria: [null],
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
      atividade: [null, Validators.required],
      grupoAtividade: [null, Validators.required],
      grupoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      classeAtividade: [null, Validators.required],
      classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
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
