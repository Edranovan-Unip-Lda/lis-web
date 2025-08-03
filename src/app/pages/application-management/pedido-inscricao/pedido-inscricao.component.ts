import { Aplicante, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { CaraterizacaoEstabelecimento, Categoria, NivelRisco, QuantoAtividade, TipoAto, TipoEmpresa, TipoEstabelecimento, TipoPedidoCadastro } from '@/core/models/enums';
import { caraterizacaEstabelecimentoOptions, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoEstabelecimentoOptions, tipoPedidoCadastroOptions } from '@/core/utils/global-function';
import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-pedido-inscricao',
  imports: [DatePipe, NgxPrintModule, Button],
  templateUrl: './pedido-inscricao.component.html',
  styleUrl: './pedido-inscricao.component.scss'
})
export class PedidoInscricaoComponent {
  aplicanteData!: Aplicante;
  pedido!: PedidoInscricaoCadastro;
  tipoPedido: any[] = tipoPedidoCadastroOptions;
  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = tipoEstabelecimentoOptions;
  caraterizacaEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  tipoAtoOpts = tipoAtoOptions;
  quantoAtividadeOpts = quantoAtividadeoptions;
  selectedTipoPedido!: TipoPedidoCadastro;
  selectedTipoEmpresa!: TipoEmpresa;
  selectedTipoEstabelecimento!: TipoEstabelecimento;
  selectedCaraterizacaEstabelecimento!: CaraterizacaoEstabelecimento;
  seletedNivelRisco!: NivelRisco;
  selectedTipoAto!: TipoAto;
  selectedQuantoAtividade!: QuantoAtividade;

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.pedido = this.aplicanteData.pedidoInscricaoCadastroDto;
    this.selectedTipoPedido = this.tipoPedido.find(item => item.value === this.pedido.tipoPedidoCadastro).name;

    this.selectedCaraterizacaEstabelecimento = this.caraterizacaEstabelecimentoOpts.find(item => item.value === this.pedido.caraterizacaoEstabelecimento).name;
    this.seletedNivelRisco = this.nivelRiscoOpts.find(item => item.value === this.pedido.risco).name;

    if (this.aplicanteData.categoria === Categoria.industrial) {
      this.selectedQuantoAtividade = this.quantoAtividadeOpts.find(item => item.value === this.pedido.quantoAtividade).name;
      this.selectedTipoEmpresa = this.tipoEmpresaOpts.find(item => item.value === this.pedido.tipoEmpresa).name;
    } else {
      this.selectedTipoEstabelecimento = this.tipoEstabelecimentoOpts.find(item => item.value === this.pedido.tipoEstabelecimento).name;
      this.selectedTipoAto = this.tipoAtoOpts.find(item => item.value === this.pedido.ato).name;
    }
  }

  goBack() {
    this.location.back();
  }
}
