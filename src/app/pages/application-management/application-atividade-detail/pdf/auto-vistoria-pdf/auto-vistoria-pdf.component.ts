import { Aplicante, AutoVistoria, Documento } from '@/core/models/entities.model';
import { AplicanteStatus } from '@/core/models/enums';
import { DocumentosService, PedidoService } from '@/core/services';
import { PdfViewerComponent } from '@/shared/pdf-viewer/pdf-viewer.component';
import { Location } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Toast } from 'primeng/toast';

type DocKind = 'pdf' | 'image' | 'other';
interface DocTab extends Documento { kind: DocKind; }
interface LoadedDoc { kind: DocKind; blob?: Blob; url?: string; }

@Component({
  selector: 'app-auto-vistoria-pdf',
  imports: [Button, Toast, ProgressSpinner, PdfViewerComponent, Tabs, TabList, Tab, TabPanels, TabPanel],
  templateUrl: './auto-vistoria-pdf.component.html',
  styleUrl: './auto-vistoria-pdf.component.scss',
  providers: [MessageService]
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

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private documentoService: DocumentosService,
    private pedidoService: PedidoService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.route.snapshot.data['aplicanteResolver'];
    const pedidoVistoria = this.aplicanteData?.pedidoLicencaAtividade?.listaPedidoVistoria
      ?.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
    this.autoVistoria = pedidoVistoria?.autoVistoria;

    if (!this.autoVistoria) {
      this.loading.set(false);
      this.errorMsg.set('Auto de vistoria não encontrado.');
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
    this.pedidoService.getAutoVistoriaFormPdf(this.autoVistoria!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.pdfSrc.set(blob);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          const detail = 'Falha ao carregar o auto de vistoria.';
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

  goBack() {
    this.location.back();
  }
}
