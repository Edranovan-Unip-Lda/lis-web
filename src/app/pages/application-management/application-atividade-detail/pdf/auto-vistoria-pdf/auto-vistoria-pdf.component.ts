import { Aplicante, AutoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, AreaRepresentante, Categoria } from '@/core/models/enums';
import { BooleanPipe } from '@/core/pipes/custom.pipe';
import { tipoAreaRepresentanteComercial, tipoAreaRepresentanteIndustrial } from '@/core/utils/global-function';
import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-auto-vistoria-pdf',
  imports: [Button, NgxPrintModule, DatePipe, BooleanPipe],
  templateUrl: './auto-vistoria-pdf.component.html',
  styleUrl: './auto-vistoria-pdf.component.scss'
})
export class AutoVistoriaPdfComponent implements OnInit {
  aplicanteData!: Aplicante;
  autoVistoria!: AutoVistoria;
  tipoAreaRepresentanteOpts: any[] = [];
  categoria!: Categoria | string;

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }


  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    let pedidoVistoria = this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido);

    if (pedidoVistoria) {
      this.autoVistoria = pedidoVistoria.autoVistoria;
    }

    switch (this.aplicanteData.categoria) {
      case Categoria.comercial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteComercial;
        this.categoria = Categoria.comercial;
        break;
      case Categoria.industrial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteIndustrial;
        this.categoria = Categoria.industrial;
        break;
    }
  }

  getAreaRepresentanteLabel(value: any): any {
    return this.tipoAreaRepresentanteOpts.find(item => item.value === value);
  }

  goBack() {
    this.location.back();
  }
}
