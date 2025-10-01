import { Documento, Empresa } from '@/core/models/entities.model';
import { DocumentosService } from '@/core/services/documentos.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-empresa-detail',
  imports: [Button, RouterLink, DatePipe, CurrencyPipe, TitleCasePipe],
  templateUrl: './empresa-detail.component.html',
  styleUrl: './empresa-detail.component.scss',
  providers: [MessageService]
})
export class EmpresaDetailComponent implements OnInit {
  empresa!: Empresa;
  loadingDownloadButtons = new Set<string>();

  constructor(
    private documentoService: DocumentosService,
    private messageService: MessageService,
    private router: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.empresa = this.router.snapshot.data['empresaResolver'];
  }

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.nome);
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.nome);
      }
    });
  }
}
