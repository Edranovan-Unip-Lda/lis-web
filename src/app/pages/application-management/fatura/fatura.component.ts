import { Aplicante, Fatura } from '@/core/models/entities.model';
import { AplicanteStatus } from '@/core/models/enums';
import { calculateCommercialLicenseTax, nivelRiscoOptions } from '@/core/utils/global-function';
import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-fatura',
  imports: [DatePipe, NgxPrintModule, Button, TableModule, CurrencyPipe],
  templateUrl: './fatura.component.html',
  styleUrl: './fatura.component.scss'
})
export class FaturaComponent {
  aplicanteData!: Aplicante
  fatura!: Fatura | undefined;
  seletedNivelRisco!: string;
  nivelRiscoOpts = nivelRiscoOptions;

  constructor(
    private router: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit() {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.selectFatura(this.router.snapshot.data['tipo']);
  }

  selectFatura(tipo: string) {
    switch (tipo) {
      case 'CADASTRO':
        this.fatura = this.aplicanteData.pedidoInscricaoCadastro.fatura;
        break;
      case 'ATIVIDADE':
        this.fatura = this.aplicanteData.pedidoLicencaAtividade.fatura
        break;
      case 'VISTORIA':
        this.fatura = this.aplicanteData.pedidoVistorias.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado)?.fatura;
        break;
    }
    this.seletedNivelRisco = this.nivelRiscoOpts.find(item => item.value === this.fatura?.nivelRisco).name;
  }


  getMontanteSubTotal(montanteMinimo: number, montanteMaximo: number): number {
    if (this.fatura) {
      return calculateCommercialLicenseTax(this.fatura.superficie, montanteMinimo, montanteMaximo);
    }
    return 0;
  }

  goBack() {
    this.location.back();
  }
}
