import { Aplicante, PedidoAtividadeLicenca, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria, NivelRisco, QuantoAtividade, TipoAto, TipoEmpresa, TipoEstabelecimento } from '@/core/models/enums';
import { caraterizacaEstabelecimentoOptions, nivelRiscoOptions, quantoAtividadeoptions, tipoAtoOptions, tipoEmpresaOptions, tipoEstabelecimentoOptions } from '@/core/utils/global-function';
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
  selectedTipoEmpresa!: TipoEmpresa;
  seletedNivelRisco!: NivelRisco;
  selectedAtividade!: TipoAto;
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
    this.pedido = this.aplicanteData.pedidoVistorias.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);

    if (this.pedido) {
      this.seletedNivelRisco = this.nivelRiscoOpts.find(item => item.value === this.pedido?.risco).name;
      this.selectedTipoEmpresa = this.tipoEmpresaOpts.find(item => item.value === this.pedido?.tipoEmpresa).name;
      this.selectedTipoEstabelecimento = this.tipoEstabelecimentoOpts.find(item => item.value === this.pedido?.tipoEstabelecimento).name;
      this.selectedAtividade = this.tipoAtoOpts.find(item => item.value === this.pedido?.atividade).name;

    }
  }

  goBack() {
    this.location.back();
  }

}
