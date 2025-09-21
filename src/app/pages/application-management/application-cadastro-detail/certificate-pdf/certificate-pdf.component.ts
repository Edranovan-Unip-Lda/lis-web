import { CertificadoCadastro } from '@/core/models/entities.model';
import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-certificate-pdf',
  imports: [DatePipe, NgxPrintModule, Button, TableModule],
  templateUrl: './certificate-pdf.component.html',
  styleUrl: './certificate-pdf.component.scss'
})
export class CertificatePdfComponent {
  certificadoData!: CertificadoCadastro;
  dataValido = new Date();

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    // certificadoResolver
    console.log(
      this.router.snapshot.data['certificadoResolver']
    );

    this.certificadoData = this.router.snapshot.data['certificadoResolver'];
    
    this.certificadoData.updatedAt = new Date(this.certificadoData.updatedAt)
    this.certificadoData.updatedAt.setFullYear(this.certificadoData.updatedAt.getFullYear() + 1);
    this.dataValido = this.certificadoData.updatedAt;
  }

  goBack() {
    this.location.back();
  }
}
