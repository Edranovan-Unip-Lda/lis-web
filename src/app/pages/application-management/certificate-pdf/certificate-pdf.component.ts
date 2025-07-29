import { Aplicante } from '@/core/models/entities.model';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
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
  aplicanteData!: Aplicante;
  dataValido = new Date();

  constructor(
    private router: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.aplicanteData.updatedAt = new Date(this.aplicanteData.updatedAt)
    this.aplicanteData.updatedAt.setFullYear(this.aplicanteData.updatedAt.getFullYear() + 1);
    this.dataValido = this.aplicanteData.updatedAt
  }
}
