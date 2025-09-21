import { CertificadoLicencaAtividade } from '@/core/models/entities.model';
import { DatePipe, Location, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-certificado-atividade-pdf',
  imports: [Button, NgxPrintModule, TitleCasePipe, DatePipe],
  templateUrl: './certificado-atividade-pdf.component.html',
  styleUrl: './certificado-atividade-pdf.component.scss'
})
export class CertificadoAtividadePdfComponent {
  certificadoData!: CertificadoLicencaAtividade;
  dataValido = new Date();

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.certificadoData = this.router.snapshot.data['certificadoResolver'];
    console.log(this.certificadoData);
    
    this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
    this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);
    this.dataValido = this.certificadoData.updatedAt
  }

  goBack() {
    this.location.back();
  }
}
