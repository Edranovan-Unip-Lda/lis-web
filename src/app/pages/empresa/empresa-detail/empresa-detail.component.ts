import { LanguageService, LocalizedCurrencyPipe, LocalizedDatePipe } from '@/core/i18n';
import { Role } from '@/core/models/data-master.model';
import { Documento, Empresa } from '@/core/models/entities.model';
import { AuthenticationService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { estadoCivilOptions, tipoNacionalidadeOptions, tipoRelacaoFamiliaOptions } from '@/core/utils/global-function';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-empresa-detail',
  imports: [LocalizedCurrencyPipe, LocalizedDatePipe, Button, RouterLink, ConfirmDialog, Toast, TranslatePipe],
  templateUrl: './empresa-detail.component.html',
  styleUrl: './empresa-detail.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class EmpresaDetailComponent implements OnInit {
  empresa!: Empresa;
  loadingDownloadButtons = new Set<string>();
  deletingDocs = new Set<number>();
  role!: string;
  readonly estadoCivilOpts = estadoCivilOptions;
  readonly nacionalidadeOpts = tipoNacionalidadeOptions;
  readonly relacaoFamiliaOpts = tipoRelacaoFamiliaOptions;
  private i18n = inject(LanguageService);

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
          summary: this.i18n.instant('toast.success'),
          detail: this.i18n.instant('empresa.docs.downloaded')
        });
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.instant('toast.error'),
          detail: this.i18n.instant('empresa.docs.downloadError')
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
      message: this.i18n.instant('empresa.docs.confirmDelete', { nome: doc.nome }),
      header: this.i18n.instant('empresa.common.confirmation'),
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: this.i18n.instant('common.cancel'), severity: 'secondary', outlined: true },
      acceptButtonProps: { label: this.i18n.instant('common.delete'), severity: 'danger' },
      accept: () => {
        this.deletingDocs.add(doc.id);
        this.documentoService.deleteById(doc.id).subscribe({
          next: () => {
            this.empresa.documentos = this.empresa.documentos.filter(d => d.id !== doc.id);
            this.messageService.add({ severity: 'info', summary: this.i18n.instant('toast.confirmed'), detail: this.i18n.instant('empresa.docs.deleted') });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: err || this.i18n.instant('empresa.docs.deleteError') });
          },
          complete: () => this.deletingDocs.delete(doc.id)
        });
      }
    });
  }

  /** Free-text/enum values stored in PT are shown through their option's translated label. */
  optionLabel(opts: { value: unknown; name: string }[], value: unknown): string {
    return opts.find(o => o.value === value)?.name ?? (value as string) ?? '';
  }
}
