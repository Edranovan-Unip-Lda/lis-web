import { CertificadoCadastro } from '@/core/models/entities.model';
import { AplicanteType, Role } from '@/core/models/enums';
import { AuthenticationService, CertificadoService } from '@/core/services';
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
  selector: 'app-certificate-pdf',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent, TranslatePipe],
  templateUrl: './certificate-pdf.component.html',
  styleUrl: './certificate-pdf.component.scss',
  providers: [MessageService]
})
export class CertificatePdfComponent {
  certificadoData!: CertificadoCadastro;
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  /** Translation key of the error to show (translated in the template so it follows language switches). */
  errorMsg = signal<string | null>(null);
  filename = signal('certificado-cadastro.pdf');
  isStaff = false;

  private destroyRef = inject(DestroyRef);
  private i18n = inject(LanguageService);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private certificadoService: CertificadoService,
    private messageService: MessageService,
    private authService: AuthenticationService,
  ) {
    // role is stored as an object ({ name: 'ROLE_*' }); staff = any role except client
    this.isStaff = !!this.authService.currentRole?.name && this.authService.currentRole.name !== Role.client;
  }

  ngOnInit(): void {
    this.certificadoData = this.route.snapshot.data['certificadoResolver'];
    if (!this.certificadoData) {
      this.loading.set(false);
      this.errorMsg.set('application.cadastro.certificate.notFound');
      return;
    }
    const empresa = this.certificadoData.pedidoInscricaoCadastro?.nomeEmpresa ?? this.certificadoData.id;
    this.filename.set(`certificado-cadastro-${empresa}.pdf`);
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
    this.certificadoService.getCertificadoPdf(this.certificadoData.id, AplicanteType.cadastro, regenerate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.pdfSrc.set(blob);
          this.loading.set(false);
          if (regenerate) {
            this.messageService.add({ severity: 'success', summary: this.i18n.instant('toast.success'), detail: this.i18n.instant('application.cadastro.certificate.regenerated'), key: 'br' });
          }
        },
        error: err => {
          this.loading.set(false);
          const key = err?.status === 404
            ? 'application.cadastro.certificate.notGenerated'
            : 'application.cadastro.certificate.loadFailed';
          this.errorMsg.set(key);
          this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: this.i18n.instant(key), key: 'br' });
        }
      });
  }

  goBack(): void {
    this.location.back();
  }
}
