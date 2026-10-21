import { LanguageService } from '@/core/i18n';
import { Aplicante, AutoVistoria, Documento } from '@/core/models/entities.model';
import { AplicanteStatus, Role } from '@/core/models/enums';
import { AuthenticationService, DocumentosService, PedidoService } from '@/core/services';
import { PdfViewerComponent } from '@/shared/pdf-viewer/pdf-viewer.component';
import { Location } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FileUpload } from 'primeng/fileupload';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Toast } from 'primeng/toast';

type DocKind = 'pdf' | 'image' | 'other';
interface DocTab extends Documento { kind: DocKind; }
interface LoadedDoc { kind: DocKind; blob?: Blob; url?: string; }

@Component({
  selector: 'app-auto-vistoria-pdf',
  imports: [TranslatePipe, Button, Toast, ProgressSpinner, PdfViewerComponent, Tabs, TabList, Tab, TabPanels, TabPanel, ConfirmDialog, FileUpload],
  templateUrl: './auto-vistoria-pdf.component.html',
  styleUrl: './auto-vistoria-pdf.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class AutoVistoriaPdfComponent implements OnInit, OnDestroy {
  aplicanteData!: Aplicante;
  autoVistoria!: AutoVistoria | undefined;

  // tab 0 = the record; tabs 1..N = attached documents. Single viewer (only the active tab is rendered).
  activeTab = signal(0);
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  filename = signal('auto-vistoria.pdf');

  docs: DocTab[] = [];
  loaded = signal<Record<number, LoadedDoc>>({});
  loadingDownloadButtons = new Set<number>();

  // Admin-only correction of a wrong attachment (see DocumentosService.replaceById).
  isAdmin = false;
  acceptedDocTypes = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx';
  replacingDocs = new Set<number>();
  deletingDocs = new Set<number>();

  private destroyRef = inject(DestroyRef);
  private i18n = inject(LanguageService);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private documentoService: DocumentosService,
    private pedidoService: PedidoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.currentRole?.name === Role.admin;
    this.aplicanteData = this.route.snapshot.data['aplicanteResolver'];
    const pedidoVistoria = this.aplicanteData?.pedidoLicencaAtividade?.listaPedidoVistoria
      ?.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
    this.autoVistoria = pedidoVistoria?.autoVistoria;

    if (!this.autoVistoria) {
      this.loading.set(false);
      this.errorMsg.set('application.pdf.autoVistoria.notFound');
      return;
    }
    this.filename.set(`auto-vistoria-${this.autoVistoria.id}.pdf`);
    this.docs = (this.autoVistoria.documentos ?? []).map(d => ({ ...d, kind: this.kindOf(d.nome) }));
    this.loadPdf();
  }

  ngOnDestroy(): void {
    Object.values(this.loaded()).forEach(d => d.url && URL.revokeObjectURL(d.url));
  }

  onTab(value: string | number): void {
    const tab = Number(value);
    this.activeTab.set(tab);
    if (tab > 0) {
      this.loadDoc(tab - 1);
    }
  }

  private loadDoc(i: number): void {
    if (this.loaded()[i] || !this.docs[i]) return;
    const doc = this.docs[i];
    this.documentoService.downloadById(doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          const entry: LoadedDoc = doc.kind === 'image'
            ? { kind: 'image', url: URL.createObjectURL(blob) }
            : { kind: doc.kind, blob };
          this.loaded.update(m => ({ ...m, [i]: entry }));
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: this.i18n.instant('application.pdf.docLoadError'), key: 'br' });
        }
      });
  }

  private kindOf(nome: string): DocKind {
    const ext = (nome?.split('.').pop() ?? '').toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
    return 'other';
  }

  private loadPdf(): void {
    this.loading.set(true);
    this.pedidoService.getAutoVistoriaFormPdf(this.autoVistoria!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.pdfSrc.set(blob);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMsg.set('application.pdf.autoVistoria.loadError');
          this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: this.i18n.instant('application.pdf.autoVistoria.loadError'), key: 'br' });
        }
      });
  }

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.id);
    this.documentoService.downloadById(file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.nome;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.loadingDownloadButtons.delete(file.id);
        this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: this.i18n.instant('application.shared.toast.downloadFailed'), key: 'br' });
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.id);
      }
    });
  }

  /**
   * ROLE_ADMIN only: the document keeps its id and slot server-side, so the tab stays in place — only its
   * cached blob is dropped and re-fetched.
   */
  replaceDoc(index: number, event: { files: File[] }, uploader?: FileUpload): void {
    const file = event.files?.[0];
    uploader?.clear();
    const doc = this.docs[index];
    if (!file || !doc) return;

    this.replacingDocs.add(doc.id);
    this.documentoService.replaceById(doc.id, file).subscribe({
      next: updated => {
        this.docs[index] = { ...this.docs[index], ...updated, kind: this.kindOf(updated.nome) };
        const original = (this.autoVistoria?.documentos ?? []).find(d => d.id === updated.id);
        if (original) Object.assign(original, updated);
        this.evictCached(index);
        this.loadDoc(index);
        this.messageService.add({ severity: 'info', summary: this.i18n.instant('toast.confirmed'), detail: this.i18n.instant('application.pdf.replaceSuccess'), key: 'br' });
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: err || this.i18n.instant('application.pdf.replaceError'), key: 'br' });
      },
      complete: () => this.replacingDocs.delete(doc.id)
    });
  }

  deleteDoc(index: number, event: Event): void {
    const doc = this.docs[index];
    if (!doc) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.i18n.instant('application.pdf.confirmDeleteAutoVistoria', { nome: doc.nome }),
      header: this.i18n.instant('application.pdf.confirmHeader'),
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: this.i18n.instant('common.cancel'), severity: 'secondary', outlined: true },
      acceptButtonProps: { label: this.i18n.instant('common.delete'), severity: 'danger' },
      accept: () => {
        this.deletingDocs.add(doc.id);
        this.documentoService.deleteById(doc.id).subscribe({
          next: () => {
            // Every cached entry is keyed by index, so dropping a tab invalidates the whole map.
            this.revokeCachedUrls();
            this.loaded.set({});
            this.docs = this.docs.filter((_, i) => i !== index);
            if (this.autoVistoria) {
              this.autoVistoria.documentos = (this.autoVistoria.documentos ?? []).filter(d => d.id !== doc.id);
            }
            this.activeTab.set(0);
            this.messageService.add({ severity: 'info', summary: this.i18n.instant('toast.confirmed'), detail: this.i18n.instant('application.pdf.deleteSuccess'), key: 'br' });
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: this.i18n.instant('toast.error'), detail: err || this.i18n.instant('application.pdf.deleteError'), key: 'br' });
          },
          complete: () => this.deletingDocs.delete(doc.id)
        });
      }
    });
  }

  private evictCached(index: number): void {
    const entry = this.loaded()[index];
    if (entry?.url) URL.revokeObjectURL(entry.url);
    this.loaded.update(m => {
      const { [index]: _dropped, ...rest } = m;
      return rest;
    });
  }

  private revokeCachedUrls(): void {
    Object.values(this.loaded()).forEach(d => d.url && URL.revokeObjectURL(d.url));
  }

  goBack() {
    this.location.back();
  }
}
