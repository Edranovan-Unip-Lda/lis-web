import { Aplicante, PedidoInscricaoCadastro } from '@/core/models/entities.model';
import { PedidoService } from '@/core/services';
import { PdfViewerComponent } from '@/shared/pdf-viewer/pdf-viewer.component';
import { Location } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-pedido-inscricao',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent, TranslatePipe],
  templateUrl: './pedido-inscricao.component.html',
  styleUrl: './pedido-inscricao.component.scss',
  providers: [MessageService]
})
export class PedidoInscricaoComponent {
  aplicanteData!: Aplicante;
  pedido!: PedidoInscricaoCadastro;
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  /** Translation key of the error to show (translated in the template so it follows language switches). */
  errorMsg = signal<string | null>(null);
  filename = signal('pedido-cadastro.pdf');

  private destroyRef = inject(DestroyRef);
  private i18n = inject(LanguageService);

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
      this.errorMsg.set('application.cadastro.pedido.notFound');
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
          const key = 'application.cadastro.pedido.loadFailed';
          this.errorMsg.set(key);
          this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: this.i18n.instant(key), key: 'br' });
        }
      });
  }

  goBack(): void {
    this.location.back();
  }
}
