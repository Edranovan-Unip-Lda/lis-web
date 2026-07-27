import { Aplicante, Documento, PedidoAtividadeLicenca } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { AuthenticationService, DocumentosService, PedidoService } from '@/core/services';
import { PdfViewerComponent } from '@/shared/pdf-viewer/pdf-viewer.component';
import { Location } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-pedido-pdf',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent, Tabs, TabList, Tab, TabPanels, TabPanel, ConfirmDialog, FileUpload],
  templateUrl: './pedido-pdf.component.html',
  styleUrl: './pedido-pdf.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class PedidoPdfComponent implements OnInit, OnDestroy {
  aplicanteData!: Aplicante;
  pedido!: PedidoAtividadeLicenca;

  // tab 0 = the form; tabs 1..N = attached documents. A single pdf viewer is reused (only the active tab's
  // content is rendered), so there is never more than one ngx-extended-pdf-viewer instance on the page.
  activeTab = signal(0);

  // form PDF (tab 0)
  pdfSrc = signal<Blob | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  filename = signal('pedido-atividade.pdf');

  // attached documents (tabs 1..N), lazy-loaded + cached by index
  docs: DocTab[] = [];
  loaded = signal<Record<number, LoadedDoc>>({});
  loadingDownloadButtons = new Set<number>();

  // Admin-only correction of a wrong attachment (see DocumentosService.replaceById).
  isAdmin = false;
  acceptedDocTypes = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx';
  replacingDocs = new Set<number>();
  deletingDocs = new Set<number>();

  private destroyRef = inject(DestroyRef);

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
    this.pedido = this.aplicanteData?.pedidoLicencaAtividade;
    if (!this.pedido) {
      this.loading.set(false);
      this.errorMsg.set('Pedido não encontrado.');
      return;
    }
    this.filename.set(`pedido-atividade-${this.pedido.id}.pdf`);
    this.docs = (this.pedido.documentos ?? []).map(d => ({ ...d, kind: this.kindOf(d.nome) }));
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
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar o documento.', key: 'br' });
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
    this.pedidoService.getAtividadeFormPdf(this.pedido.id)
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
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha no download do arquivo!', key: 'br' });
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
        const original = (this.pedido.documentos ?? []).find(d => d.id === updated.id);
        if (original) Object.assign(original, updated);
        this.evictCached(index);
        this.loadDoc(index);
        this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Documento substituído com sucesso.', key: 'br' });
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err || 'Falha ao substituir o documento.', key: 'br' });
      },
      complete: () => this.replacingDocs.delete(doc.id)
    });
  }

  deleteDoc(index: number, event: Event): void {
    const doc = this.docs[index];
    if (!doc) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja eliminar o documento "${doc.nome}"? O campo correspondente do formulário ficará vazio.`,
      header: 'Confirmação',
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      accept: () => {
        this.deletingDocs.add(doc.id);
        this.documentoService.deleteById(doc.id).subscribe({
          next: () => {
            // Every cached entry is keyed by index, so dropping a tab invalidates the whole map.
            this.revokeCachedUrls();
            this.loaded.set({});
            this.docs = this.docs.filter((_, i) => i !== index);
            this.pedido.documentos = (this.pedido.documentos ?? []).filter(d => d.id !== doc.id);
            this.activeTab.set(0);
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Documento eliminado com sucesso.', key: 'br' });
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err || 'Falha ao eliminar o documento.', key: 'br' });
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
