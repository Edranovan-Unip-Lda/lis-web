import { Aplicante } from '@/core/models/entities.model';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pedido-inscricao',
  imports: [],
  templateUrl: './pedido-inscricao.component.html',
  styleUrl: './pedido-inscricao.component.scss'
})
export class PedidoInscricaoComponent {
  aplicanteData!: Aplicante;

  constructor(
    private router: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    console.log(this.aplicanteData);

  }
}
