import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * Global non-production notice. Shown on every page when `environment.testing`
 * is true. Rendered first in the document flow (sticky, top) so it reserves its
 * own space and never overlaps the in-flow layout topbar, while staying pinned
 * on scroll. Points the public to the official site.
 */
@Component({
  selector: 'app-testing-banner',
  standalone: true,
  template: `
    @if (testing) {
      <div class="testing-banner" role="alert">
        <i class="pi pi-exclamation-triangle"></i>
        <span>
          <strong>Ambiente de Teste</strong> — Plataforma destinada exclusivamente a fins de
          demonstração e formação. Os dados apresentados não têm validade oficial. Para aceder ao
          sistema oficial, visite
          <a href="https://lic.mci.gov.tl" rel="noopener noreferrer">lic.mci.gov.tl</a>.
        </span>
      </div>
    }
  `,
  styles: [`
    .testing-banner {
      position: sticky;
      top: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      padding: .6rem 1rem;
      background: #b45309;
      color: #fff;
      font-size: .85rem;
      line-height: 1.3rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.2);
    }
    .testing-banner a { color: #fff; font-weight: 700; text-decoration: underline; }
    .testing-banner i { font-size: 1.05rem; flex-shrink: 0; }
  `]
})
export class TestingBannerComponent {
  readonly testing = environment.testing;
}
