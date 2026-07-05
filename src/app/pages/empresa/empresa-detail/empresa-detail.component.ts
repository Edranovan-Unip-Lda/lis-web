import { Role } from '@/core/models/data-master.model';
import { Documento, Empresa } from '@/core/models/entities.model';
import { AuthenticationService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-empresa-detail',
  imports: [Button, RouterLink, DatePipe, CurrencyPipe, TitleCasePipe, ConfirmDialog, Toast],
  templateUrl: './empresa-detail.component.html',
  styleUrl: './empresa-detail.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class EmpresaDetailComponent implements OnInit {
  empresa!: Empresa;
  loadingDownloadButtons = new Set<string>();
  deletingDocs = new Set<number>();
  role!: string;

  constructor(
    private documentoService: DocumentosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: ActivatedRoute,
    private authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.empresa = this.router.snapshot.data['empresaResolver'];
    this.role = this.authService.currentRole.name;
  }

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.nome);
    this.documentoService.downloadById(file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.nome;
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

  deleteDoc(doc: Documento, event: Event): void {
    this.messageService.clear();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja eliminar o documento "${doc.nome}"?`,
      header: 'Confirmação',
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      accept: () => {
        this.deletingDocs.add(doc.id);
        this.documentoService.deleteById(doc.id).subscribe({
          next: () => {
            this.empresa.documentos = this.empresa.documentos.filter(d => d.id !== doc.id);
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Documento eliminado com sucesso' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err || 'Ocorreu um erro ao eliminar o documento' });
          },
          complete: () => this.deletingDocs.delete(doc.id)
        });
      }
    });
  }
}
