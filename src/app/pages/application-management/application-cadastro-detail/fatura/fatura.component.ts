import { Aplicante, Fatura } from '@/core/models/entities.model';
import { AplicanteStatus } from '@/core/models/enums';
import { FaturaService } from '@/core/services';
import { PdfViewerComponent } from '@/shared/pdf-viewer/pdf-viewer.component';
import { Location } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-fatura',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent],
  templateUrl: './fatura.component.html',
  styleUrl: './fatura.component.scss',
  providers: [MessageService]
})
export class FaturaComponent {
  aplicanteData!: Aplicante;
  fatura!: Fatura | undefined;
  type = 'CADASTRO';
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  filename = signal('fatura.pdf');

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private faturaService: FaturaService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.aplicanteData = this.route.snapshot.data['aplicanteResolver'];
    this.selectFatura(this.route.snapshot.data['type']);

    if (!this.fatura) {
      this.loading.set(false);
      this.errorMsg.set('Fatura não encontrada.');
      return;
    }
    this.filename.set(`fatura-${this.fatura.id}.pdf`);
    this.loadPdf();
  }

  selectFatura(tipo: string) {
    switch (tipo) {
      case 'CADASTRO':
        this.fatura = this.aplicanteData.pedidoInscricaoCadastro?.fatura;
        break;
      case 'ATIVIDADE':
        this.fatura = this.aplicanteData.pedidoLicencaAtividade?.fatura;
        this.type = 'ATIVIDADE';
        break;
      case 'VISTORIA':
        const pedidoVistoria = this.aplicanteData.pedidoLicencaAtividade?.listaPedidoVistoria
          ?.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
        this.fatura = pedidoVistoria?.fatura;
        this.type = 'VISTORIA';
        break;
    }
  }

  private loadPdf() {
    this.loading.set(true);
    this.faturaService.getFaturaPdf(this.fatura!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.pdfSrc.set(blob);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          const detail = 'Falha ao carregar a fatura.';
          this.errorMsg.set(detail);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail, key: 'br' });
        }
      });
  }

  goBack() {
    this.location.back();
  }
}
