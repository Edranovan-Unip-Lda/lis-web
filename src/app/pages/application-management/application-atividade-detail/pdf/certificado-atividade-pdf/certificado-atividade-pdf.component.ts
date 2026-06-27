import { CertificadoLicencaAtividade } from '@/core/models/entities.model';
import { AplicanteType, Role } from '@/core/models/enums';
import { AuthenticationService, CertificadoService } from '@/core/services';
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
  selector: 'app-certificado-atividade-pdf',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent],
  templateUrl: './certificado-atividade-pdf.component.html',
  styleUrl: './certificado-atividade-pdf.component.scss',
  providers: [MessageService]
})
export class CertificadoAtividadePdfComponent {
  certificadoData!: CertificadoLicencaAtividade;
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  filename = signal('alvara-licenca.pdf');
  isStaff = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private certificadoService: CertificadoService,
    private messageService: MessageService,
    private authService: AuthenticationService,
  ) {
    this.isStaff = this.authService.currentRole && this.authService.currentRole !== Role.client;
  }

  ngOnInit(): void {
    this.certificadoData = this.route.snapshot.data['certificadoResolver'];
    if (!this.certificadoData) {
      this.loading.set(false);
      this.errorMsg.set('Certificado não encontrado.');
      return;
    }
    const empresa = this.certificadoData.pedidoLicencaAtividade?.nomeEmpresa ?? this.certificadoData.id;
    this.filename.set(`alvara-licenca-${empresa}.pdf`);
    this.loadPdf();
  }

  /** Staff-only: force the backend to re-render the stored PDF (e.g. after a layout change). */
  regenerate(): void {
    this.errorMsg.set(null);
    this.pdfSrc.set(null);
    this.loadPdf(true);
  }

  private loadPdf(regenerate = false): void {
    this.loading.set(true);
    this.certificadoService.getCertificadoPdf(this.certificadoData.id, AplicanteType.licenca, regenerate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.pdfSrc.set(blob);
          this.loading.set(false);
          if (regenerate) {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Alvará regenerado.', key: 'br' });
          }
        },
        error: err => {
          this.loading.set(false);
          const detail = err?.status === 404
            ? 'O PDF do alvará ainda não foi gerado.'
            : 'Falha ao carregar o alvará.';
          this.errorMsg.set(detail);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail, key: 'br' });
        }
      });
  }

  goBack(): void {
    this.location.back();
  }
}
