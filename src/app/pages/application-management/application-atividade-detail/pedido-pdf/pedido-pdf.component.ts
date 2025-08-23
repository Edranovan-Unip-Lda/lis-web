import { Aplicante, PedidoAtividadeLicenca } from '@/core/models/entities.model';
import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-pedido-pdf',
  imports: [DatePipe, NgxPrintModule, Button],
  templateUrl: './pedido-pdf.component.html',
  styleUrl: './pedido-pdf.component.scss'
})
export class PedidoPdfComponent implements OnInit {
  aplicanteData!: Aplicante;
  pedido!: PedidoAtividadeLicenca;

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.pedido = this.aplicanteData.pedidoLicencaAtividade;
  }

  goBack() {
    this.location.back();
  }
}
