import { CertificadoLicencaAtividade } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { DatePipe, Location, NgStyle, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-certificado-atividade-pdf',
  imports: [Button, DatePipe, NgStyle, UpperCasePipe],
  templateUrl: './certificado-atividade-pdf.component.html',
  styleUrl: './certificado-atividade-pdf.component.scss'
})
export class CertificadoAtividadePdfComponent {
  certificadoData!: CertificadoLicencaAtividade;
  dataValido = new Date();
  industrialCSS!: any;
  comercialCSS!: any;

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.certificadoData = this.router.snapshot.data['certificadoResolver'];
    this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
    this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);

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
