import { CertificadoCadastro } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { CertificadoService, DocumentosService } from '@/core/services';
import { DatePipe, Location, NgStyle } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-certificate-pdf',
  imports: [DatePipe, Button, TableModule, NgStyle, QRCodeComponent, Toast],
  templateUrl: './certificate-pdf.component.html',
  styleUrl: './certificate-pdf.component.scss',
  providers: [MessageService]
})
export class CertificatePdfComponent {
  certificadoData!: CertificadoCadastro;
  dataValido = new Date();
  industrialCSS!: any;
  comercialCSS!: any;
  imageUrl!: string;
  qrcodeUrl = signal(`${environment.webUrl}/auth/search?numero=`);

  constructor(
    private router: ActivatedRoute,
    private location: Location,
    private documentoService: DocumentosService,
    private messageService: MessageService,
    private certificadoService: CertificadoService,
  ) { }

  ngOnInit(): void {
    this.certificadoData = this.router.snapshot.data['certificadoResolver'];

    this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
    this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);
    this.dataValido = this.certificadoData.updatedAt;

    this.loadImage(this.certificadoData.assinatura.id);

    this.qrcodeUrl.set(`${environment.webUrl}/auth/search?numero=${this.certificadoData.pedidoInscricaoCadastro.aplicante.numero}`);

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

  ngAfterViewInit() {
    const autoUpload = this.router.snapshot.queryParamMap.get('autoUpload');

    if (autoUpload === 'true') {
      setTimeout(() => {
        this.generateAndUploadPDF();
      }, 2000); // Wait 2 seconds for view to stabilize
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

  getCategoriaStyle() {
    const categoria = this.certificadoData.pedidoInscricaoCadastro.aplicante.categoria;
    switch (categoria) {
      case Categoria.comercial: return this.comercialCSS;
      case Categoria.industrial: return this.industrialCSS;
    }
  }

  goBack() {
    this.location.back();
  }

  generatePDF() {
    const data = document.getElementById('myDiv');
    if (data) {
      html2canvas(data, { scale: 3 }).then(canvas => {
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const fileName = `inscricao-cadastro-${this.certificadoData.pedidoInscricaoCadastro.nomeEmpresa}.pdf`;

        const contentDataURL = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

        let position = 0;
        pdf.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
        pdf.save(fileName); // Generated PDF
      });
    }
  }

  private generateAndUploadPDF() {
    const data = document.getElementById('myDiv');
    if (data) {
      html2canvas(data, { scale: 3 }).then(canvas => {
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const fileName = `inscricao-cadastro-${this.certificadoData.pedidoInscricaoCadastro.nomeEmpresa}.pdf`;

        const contentDataURL = canvas.toDataURL('image/jpeg', 0.75);
        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.addImage(contentDataURL, 'JPEG', 0, 0, imgWidth, imgHeight);

        // Convert PDF to blob and upload in background
        const pdfBlob = pdf.output('blob');
        this.certificadoService.sendCertificadoToEmailById(this.certificadoData.id, this.certificadoData.pedidoInscricaoCadastro.aplicante.tipo, pdfBlob, fileName).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Certificate sent to email successfully.', key: 'br' });
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send certificate to email. ' + error, key: 'br' });
          }
        });
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }
  }
}
