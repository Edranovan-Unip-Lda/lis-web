import { Empresa, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { caraterizacaEstabelecimentoOptions, nivelRiscoOptions, tipoAtoOptions, tipoEmpresaOptions, tipoEstabelecimentoOptions, tipoPedidoCadastroOptions } from '@/core/utils/global-function';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-pedido-cadastro',
  imports: [ReactiveFormsModule, Select, InputText],
  templateUrl: './pedido-cadastro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pedido-cadastro.component.scss'
})
export class PedidoCadastroComponent {
  readonly pedidoData = input.required<PedidoInscricaoCadastro>();
  readonly empresaData = input.required<Empresa>();

  requestForm: FormGroup;
  tipoPedidoOpts = tipoPedidoCadastroOptions;
  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = tipoEstabelecimentoOptions;
  caraterizacaEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  tipoAtoOpts = tipoAtoOptions;
  categoria!: Categoria;
  listaMunicipio: any[] = [];
  listaPosto: any[] = [];
  listaSuco: any[] = [];
  listaAldeia: any[] = [];

  constructor(
    private _fb: FormBuilder,
  ) {

    this.requestForm = this._fb.group({
      tipoPedido: [null],
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
        aldeia: [null, [Validators.required]]
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: [null],
      tipoEstabelecimento: [null],
      tipoEmpresa: [null],
      caraterizacaoEstabelecimento: [null],
      risco: [null],
      ato: [null],
      tipoAtividade: [null],
      atividadePrincipal: [null],
      alteracoes: [null],
      dataEmissaoCertAnterior: [null],
      observacao: [null],
    });

    console.log(this.pedidoData.name);
    console.log(this.empresaData.name);



  }
}
