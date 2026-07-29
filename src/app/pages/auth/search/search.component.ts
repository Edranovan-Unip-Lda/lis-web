import { Categoria, RecaptchaAction } from '@/core/models/enums';
import { CertificadoService, DocumentosService } from '@/core/services';
import { DatePipe, NgClass, NgStyle, NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha-2';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search',
  // CHANGED: added Image (license preview) + Tag (status badge)
  imports: [Fluid, Message, Button, InputGroup, InputGroupAddon, InputText, Skeleton, Tag, RecaptchaV3Module, DatePipe, NgClass, NgStyle, QRCodeComponent, NgTemplateOutlet, ReactiveFormsModule, UpperCasePipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  providers: [MessageService]
})
export class SearchComponent implements OnDestroy {
  private destroyRef = inject(DestroyRef);
  // When true, public certificate search + QR-code verification are disabled (testing/demo build).
  readonly testing = environment.testing;
  messages = signal<any[]>([]);
  searchInput = new FormControl(null, [Validators.required, Validators.minLength(1)]);
  loading = false;
  certificadoData!: any;
  industrialCSS!: any;
  comercialCSS!: any;
  isCadastro = false;
  dataValido = new Date();
  imageUrl!: string;
  qrcodeUrl = signal(`${environment.webUrl}/auth/search?numero=`);
  readonly numeroRegex = "^MCI\\/(COMERCIAL|INDUSTRIAL)\\/(0[1-9]|1[0-2])\\/\\d{4}\\/\\d+-\\d+$";

  // NEW: rasterized certificate (data URL) shown via <p-image>, and a flag so we can render
  // the "invalid" card only after the user has actually searched.
  // certificadoImage = signal<string | null>(null);
  searched = signal(false);

  constructor(
    private route: ActivatedRoute,
    private certificadoService: CertificadoService,
    private documentoService: DocumentosService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) { }

  ngOnInit(): void {

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => { // BUG-WEB-6: teardown
      const numero = queryParams.get('numero')?.trim();

      if (!numero) {
        this.loading = false;
        return;
      } else {
        this.loading = true;
        this.getData(numero);
      }


    });

    this.industrialCSS = {
      'background-image': 'url("/images/bg-industrial.png")',
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    }
    this.comercialCSS = {
      'background-image': 'url("/images/bg-comercial.png")',
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat'
    }
  }

  submit(form: FormControl) {
    if (form.valid) {
      this.loading = true;
      const numero = form.value?.trim();
      this.getData(numero);
    }
  }

  private getData(numero: string) {
    this.searched.set(true);

    if (numero.match(this.numeroRegex)) {
      this.recaptchaV3Service.execute(RecaptchaAction.certificadoSearch).subscribe(token => {
        this.certificadoService.searchByNumero(numero, token).subscribe({
          next: (certificado) => {
            // Type guards: check for unique properties
            this.isCadastro = 'pedidoInscricaoCadastro' in certificado;
            this.messages.set([{
              severity: 'success',
              content: 'Certificado encontrado com sucesso.'
            }]);
            this.certificadoData = certificado;
            this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
            const originalDay = this.certificadoData.updatedAt.getDate();
            this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);
            // BUG-WEB-7: a Feb-29 date +1yr rolls into March — clamp back to the last valid day of the target month.
            if (this.certificadoData.updatedAt.getDate() !== originalDay) {
              this.certificadoData.updatedAt.setDate(0);
            }
            this.dataValido = this.certificadoData.updatedAt;
            this.loading = false;
          },
          error: (error) => {
            this.messages.set([{
              severity: 'error',
              content: error
            }]);
            this.certificadoData = null;
            this.loading = false;
          }
        });
      });

    } else {
      this.messages.set([{
        severity: 'error',
        content: 'Número de certificado inválido.'
      }]);
      this.certificadoData = null;
      this.loading = false;
    }

  }

  getCategoriaStyle() {
    switch (this.categoria) {
      case Categoria.comercial: return this.comercialCSS;
      case Categoria.industrial: return this.industrialCSS;
      default: return this.comercialCSS;
    }
  }

  // ---- Unified accessors so the status card works for both certificate types ----

  get categoria(): Categoria {
    return this.isCadastro
      ? this.certificadoData?.pedidoInscricaoCadastro?.aplicante?.categoria
      : this.certificadoData?.pedidoLicencaAtividade?.aplicante?.categoria;
  }

  get numero(): string {
    return this.isCadastro
      ? this.certificadoData?.pedidoInscricaoCadastro?.aplicante?.numero
      : this.certificadoData?.pedidoLicencaAtividade?.aplicante?.numero;
  }

  get empresaNome(): string {
    if (this.isCadastro) {
      return this.certificadoData?.sociedadeComercial || this.certificadoData?.pedidoInscricaoCadastro?.nomeEmpresa;
    }
    return this.certificadoData?.pedidoLicencaAtividade?.nomeEmpresa;
  }

  get tipoDocumento(): string {
    return this.isCadastro ? 'Certificado de Inscrição no Cadastro' : 'Alvará de Licença para Exercício da Atividade';
  }

  get emissao(): Date {
    return this.isCadastro ? new Date(this.certificadoData.createdAt) : new Date(this.certificadoData.dataEmissao);
  }

  get validUntil(): Date {
    return this.isCadastro ? this.dataValido : new Date(this.certificadoData.dataValidade);
  }

  // Valid through the whole validity day itself (compare at midnight).
  get isValid(): boolean {
    if (!this.certificadoData) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.validUntil.getTime() >= today.getTime();
  }

  ngOnDestroy(): void {
    // BUG-WEB-6: free the last object URL so it isn't leaked when leaving the page.
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }

}
