import { Aplicante, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { PedidoService } from '@/core/services';
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
  selector: 'app-pedido-inscricao',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent],
  templateUrl: './pedido-inscricao.component.html',
  styleUrl: './pedido-inscricao.component.scss',
  providers: [MessageService]
})
export class PedidoInscricaoComponent {
  aplicanteData!: Aplicante;
  pedido!: PedidoInscricaoCadastro;
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  filename = signal('pedido-cadastro.pdf');

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private pedidoService: PedidoService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.route.snapshot.data['aplicanteResolver'];
    this.pedido = this.aplicanteData?.pedidoInscricaoCadastro;
    if (!this.pedido) {
      this.loading.set(false);
      this.errorMsg.set('Pedido não encontrado.');
      return;
    }
    this.filename.set(`pedido-cadastro-${this.pedido.id}.pdf`);
    this.loadPdf();
  }

  private loadPdf(): void {
    this.loading.set(true);
    this.pedidoService.getCadastroFormPdf(this.pedido.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.pdfSrc.set(blob);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          const detail = 'Falha ao carregar o formulário.';
          this.errorMsg.set(detail);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail, key: 'br' });
        }
      });
  }

  goBack(): void {
    this.location.back();
  }
}
