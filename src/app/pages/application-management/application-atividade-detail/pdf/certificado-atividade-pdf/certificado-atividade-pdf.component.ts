import { Aplicante } from '@/core/models/entities.model';
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
  aplicanteData!: Aplicante;
  dataValido = new Date();

  constructor(
    private router: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.aplicanteData.updatedAt = new Date(this.aplicanteData.updatedAt)
    this.aplicanteData.updatedAt.setFullYear(this.aplicanteData.updatedAt.getFullYear() + 1);
    this.dataValido = this.aplicanteData.updatedAt
  }

  goBack() {
    this.location.back();
  }
}
