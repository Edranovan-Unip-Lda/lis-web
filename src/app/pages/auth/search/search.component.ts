import { Categoria, RecaptchaAction } from '@/core/models/enums';
import { CertificadoService, DocumentosService } from '@/core/services';
import { DatePipe, NgStyle, NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
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
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search',
  imports: [Fluid, Message, Button, InputGroup, InputGroupAddon, InputText, Skeleton, RecaptchaV3Module, DatePipe, NgStyle, QRCodeComponent, NgTemplateOutlet, ReactiveFormsModule, UpperCasePipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  providers: [MessageService]
})
export class SearchComponent {
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

  constructor(
    private route: ActivatedRoute,
    private certificadoService: CertificadoService,
    private documentoService: DocumentosService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(queryParams => {
      this.loading = true;
      const numero = queryParams.get('numero')?.trim();

      if (!numero) {
        this.loading = false;
        return;
      } else {
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
            this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);
            this.dataValido = this.certificadoData.updatedAt;
            this.loadImage(this.certificadoData.assinatura.id);
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
    let categoria: Categoria;
    if (this.isCadastro) {
      categoria = this.certificadoData.pedidoInscricaoCadastro.aplicante.categoria;
    } else {
      categoria = this.certificadoData.pedidoLicencaAtividade.aplicante.categoria;
    }
    switch (categoria) {
      case Categoria.comercial: return this.comercialCSS;
      case Categoria.industrial: return this.industrialCSS;
    }
  }

  loadImage(id: number) {
    this.documentoService.downloadById(id).subscribe(blob => {
      if (this.imageUrl) {
        URL.revokeObjectURL(this.imageUrl);
      }

      this.imageUrl = URL.createObjectURL(blob);
    });
  }

}
