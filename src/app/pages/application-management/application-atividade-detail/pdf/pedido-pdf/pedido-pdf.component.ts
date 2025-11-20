import { Aplicante, Documento, PedidoAtividadeLicenca } from '@/core/models/entities.model';
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
  loadingDownloadButtons = new Set<string>();
  loadingRemoveButtons = new Set<string>();

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.pedido = this.aplicanteData.pedidoLicencaAtividade;
  }

  downloadDoc(file: Documento): void {
    // this.loadingDownloadButtons.add(file.nome);
    // this.documentoService.downloadById(file.id).subscribe({
    //   next: (response) => {
    //     const url = window.URL.createObjectURL(response);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'documento.pdf';
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     this.messageService.add({
    //       severity: 'info',
    //       summary: 'Sucesso',
    //       detail: 'Arquivo descarregado com sucesso!'
    //     });
    //   },
    //   error: error => {
    //     this.loadingDownloadButtons.delete(file.nome);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Erro',
    //       detail: 'Falha no download do arquivo!'
    //     });
    //   },
    //   complete: () => {
    //     this.loadingDownloadButtons.delete(file.nome);
    //   }
    // });
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  goBack() {
    this.location.back();
  }
}
