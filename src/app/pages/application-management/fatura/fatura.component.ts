import { Aplicante, Fatura } from '@/core/models/entities.model';
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
  fatura!: Fatura;
  seletedNivelRisco!: string;
  nivelRiscoOpts = nivelRiscoOptions;

  constructor(
    private router: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit() {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.fatura = this.aplicanteData.pedidoInscricaoCadastro.fatura;
    console.log(this.fatura);

    this.seletedNivelRisco = this.nivelRiscoOpts.find(item => item.value === this.fatura.nivelRisco).name;
  }


  getMontanteSubTotal(montanteMinimo: number, montanteMaximo: number): number {
    return calculateCommercialLicenseTax(this.fatura.superficie, montanteMinimo, montanteMaximo);
  }

  goBack() {
    this.location.back();
  }
}
