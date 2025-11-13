import { Aplicante, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria, NivelRisco, QuantoAtividade, TipoAto, TipoEmpresa, TipoEstabelecimento } from '@/core/models/enums';
import { caraterizacaEstabelecimentoOptions, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoPedidoVistoriaComercialOptions, tipoPedidoVistoriaIndustrialOptions } from '@/core/utils/global-function';
import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-pedido-vistoria-pdf',
  imports: [Button, NgxPrintModule, DatePipe],
  templateUrl: './pedido-vistoria-pdf.component.html',
  styleUrl: './pedido-vistoria-pdf.component.scss'
})
export class PedidoVistoriaPdfComponent {
  aplicanteData!: Aplicante;
  pedido!: PedidoVistoria | undefined;
  tipoVistoria!: string;
  selectedTipoEmpresa!: TipoEmpresa;
  seletedNivelRisco!: NivelRisco;
  selectedAtividade!: any;
  selectedQuantoAtividade!: QuantoAtividade;
  selectedTipoEstabelecimento!: TipoEstabelecimento;
  quantoAtividadeOpts = quantoAtividadeoptions;
  tipoEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  tipoEmpresaOpts = tipoEmpresaOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  tipoAtoOpts = tipoAtoOptions;

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    // this.pedido = this.aplicanteData.pedidoVistorias.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
    this.pedido = this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);

    if (this.pedido) {
      switch (this.aplicanteData.categoria) {
        case Categoria.comercial:
          this.tipoVistoria = tipoPedidoVistoriaComercialOptions.find(item => item.value === this.pedido?.tipoVistoria)?.name;
          this.selectedTipoEstabelecimento = this.tipoEstabelecimentoOpts.find(item => item.value === this.pedido?.tipoEstabelecimento).name;
          this.selectedAtividade = this.tipoAtoOpts.find(item => item.value === this.pedido?.atividade).name;
          break;

        case Categoria.industrial:
          this.tipoVistoria = tipoPedidoVistoriaIndustrialOptions.find(item => item.value === this.pedido?.tipoVistoria)?.name;
          this.selectedAtividade = this.quantoAtividadeOpts.find(item => item.value === this.pedido?.tipoAtividade).name;
          break;
      }

      this.seletedNivelRisco = this.nivelRiscoOpts.find(item => item.value === this.pedido?.risco).name;
      this.selectedTipoEmpresa = this.tipoEmpresaOpts.find(item => item.value === this.pedido?.tipoEmpresa).name;
    }
  }

  goBack() {
    this.location.back();
  }

}
