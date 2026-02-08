import { Aplicante, AutoVistoria, Documento } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria } from '@/core/models/enums';
import { BooleanPipe } from '@/core/pipes/custom.pipe';
import { DocumentosService } from '@/core/services';
import { tipoAreaRepresentanteComercial, tipoAreaRepresentanteIndustrial } from '@/core/utils/global-function';
import { DatePipe, Location, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-auto-vistoria-pdf',
  imports: [Button, NgxPrintModule, DatePipe, BooleanPipe, TitleCasePipe],
  templateUrl: './auto-vistoria-pdf.component.html',
  styleUrl: './auto-vistoria-pdf.component.scss',
  providers: [MessageService]
})
export class AutoVistoriaPdfComponent implements OnInit {
  aplicanteData!: Aplicante;
  autoVistoria!: AutoVistoria;
  tipoAreaRepresentanteOpts: any[] = [];
  categoria!: Categoria | string;
  loadingDownloadButtons = new Set<number>();

  constructor(
    private router: ActivatedRoute,
    private location: Location,
    private documentoService: DocumentosService,
    private messageService: MessageService,
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

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.id);
    this.documentoService.downloadById(file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'info',
          summary: 'Sucesso',
          detail: 'Arquivo descarregado com sucesso!'
        });
      },
      error: error => {
        this.loadingDownloadButtons.delete(file.id);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.id);
      }
    });
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
}
