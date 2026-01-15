import { CertificadoLicencaAtividade } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { DocumentosService } from '@/core/services';
import { DatePipe, Location, NgStyle, UpperCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Button } from 'primeng/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-certificado-atividade-pdf',
  imports: [Button, DatePipe, NgStyle, UpperCasePipe, QRCodeComponent],
  templateUrl: './certificado-atividade-pdf.component.html',
  styleUrl: './certificado-atividade-pdf.component.scss'
})
export class CertificadoAtividadePdfComponent {
  certificadoData!: CertificadoLicencaAtividade;
  dataValido = new Date();
  industrialCSS!: any;
  comercialCSS!: any;
  imageUrl!: string;
  qrcodeUrl = signal(`${environment.webUrl}/auth/search?numero=`);

  constructor(
    private router: ActivatedRoute,
    private location: Location,
    private documentoService: DocumentosService,
  ) { }

  ngOnInit(): void {
    this.certificadoData = this.router.snapshot.data['certificadoResolver'];
    this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
    this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);

    this.qrcodeUrl.set(`${environment.webUrl}/auth/search?numero=${this.certificadoData.pedidoLicencaAtividade.aplicante.numero}`);
    this.loadImage(this.certificadoData.assinatura.id);

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

  goBack() {
    this.location.back();
  }

  getCategoriaStyle() {
    const categoria = this.certificadoData.pedidoLicencaAtividade.aplicante.categoria;
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

  generatePDF() {
    const data = document.getElementById('myDiv');
    if (data) {
      html2canvas(data).then(canvas => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;
        const fileName = `alvara-licenca-${this.certificadoData.pedidoLicencaAtividade.nomeEmpresa}.pdf`;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

        let position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save(fileName); // Generated PDF
      });
    }
  }
}
