import { Aplicante } from '@/core/models/entities.model';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-certificate-pdf',
  imports: [],
  templateUrl: './certificate-pdf.component.html',
  styleUrl: './certificate-pdf.component.scss'
})
export class CertificatePdfComponent {
  aplicanteData!: Aplicante;

  constructor(
    private router: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    console.log(this.aplicanteData);

  }
}
