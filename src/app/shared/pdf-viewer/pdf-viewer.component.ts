import { Component, input } from '@angular/core';
import { NgxExtendedPdfViewerModule, PdfSrcType } from 'ngx-extended-pdf-viewer';

/**
 * Thin, presentational wrapper over ngx-extended-pdf-viewer. Pass it a PDF source (Blob / Uint8Array / URL)
 * already fetched by the feature component — keeps this generic and reusable across certificates, invoices and
 * forms. Renders nothing until a source is provided.
 */
@Component({
  selector: 'app-pdf-viewer',
  imports: [NgxExtendedPdfViewerModule],
  template: `
    @if (src()) {
      <ngx-extended-pdf-viewer
        [src]="src()!"
        [height]="height()"
        [filenameForDownload]="filename()"
        [language]="'pt-PT'"
        [textLayer]="true"
        [showToolbar]="true"
        [showPrintButton]="true"
        [showZoomButtons]="true"
        [showZoomDropdown]="true"
        [showSidebarButton]="true"
        [showFindButton]="true"
        [showPagingButtons]="true"
        [showPreviousAndNextPageButtons]="true"
        [showPageNumber]="true"
        [showPageLabel]="true"
        [showPresentationModeButton]="true"
        [showOpenFileButton]="false"
        [showDownloadButton]="true"
        [showSecondaryToolbarButton]="false"
        [showEditorButtons]="false"
        [showMovePageButton]="false"
        [showRotateButton]="false"
        [showHandToolButton]="false">
      </ngx-extended-pdf-viewer>
    }
  `,
})
export class PdfViewerComponent {
  src = input<PdfSrcType | null>(null);
  filename = input<string>('documento.pdf');
  height = input<string>('85vh');
}
