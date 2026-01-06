import { CertificadoCadastro } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { DocumentosService } from '@/core/services';
import { DatePipe, Location, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-certificate-pdf',
  imports: [DatePipe, Button, TableModule, NgStyle],
  templateUrl: './certificate-pdf.component.html',
  styleUrl: './certificate-pdf.component.scss'
})
export class CertificatePdfComponent {
  certificadoData!: CertificadoCadastro;
  dataValido = new Date();
  industrialCSS!: any;
  comercialCSS!: any;
  imageUrl!: string;

  constructor(
    private router: ActivatedRoute,
    private location: Location,
    private documentoService: DocumentosService,
  ) { }

  ngOnInit(): void {
    this.certificadoData = this.router.snapshot.data['certificadoResolver'];

    this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
    this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);
    this.dataValido = this.certificadoData.updatedAt;

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
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;
        const fileName = `alvara-licenca-${this.certificadoData.pedidoInscricaoCadastro.nomeEmpresa}.pdf`;

        const contentDataURL = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

        let position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save(fileName); // Generated PDF
      });
    }
  }
}
