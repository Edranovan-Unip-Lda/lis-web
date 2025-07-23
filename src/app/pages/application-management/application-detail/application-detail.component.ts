import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-application-detail',
  imports: [CommonModule, ReactiveFormsModule, Button, StepperModule, Select, InputText, FileUpload, Tag, StatusSeverityPipe],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent {
  aplicanteData: any;
  requestForm: FormGroup;
  faturaForm: FormGroup;
  requestTypes: any[] = [
    {
      name: 'Inscrição Inicial',
      value: 'Inscrição Inicial'
    },
    {
      name: 'Alteracao',
      value: 'Alteracao'
    },
    {
      name: 'Atualizacao Anual',
      value: 'Atualizacao Anual'
    },
  ];

  estabelecimentoTypes: any[] = [
    {
      name: 'Estabelecimento Principal',
      value: 'Estabelecimento Principal'
    },
    { name: 'Delegacao', value: 'Delegacao' },
    { name: 'Sucursal', value: 'Sucursal' },
  ];

  caraterizacaoEstabelecimentoTypes: any[] = [
    {
      name: 'Kiosk',
      value: 'Kiosk'
    },
    { name: 'Loja', value: 'Loja' },
    { name: 'Armazem', value: 'Armazem' },];

  riscoTypes: any[] = [
    {
      name: 'Baixo',
      value: 'Baixo'
    },
    { name: 'Medio', value: 'Medio' },
    { name: 'Alto', value: 'Alto' },]

  atoTypes: any[] = [
    {
      name: 'Venda a Retalho',
      value: 'Venda a Retalho'
    },
    {
      name: 'Venda a Grosso',
      value: 'Venda a Grosso'
    }];

  pedidoAto: any[] = [
    {
      name: 'Licenca para exercicio da atividade comercial',
      value: 'Licenca para exercicio da atividade comercial',
      montante: 500
    },
    {
      name: 'Renovacao da licenca de exercicio da atividade comercial',
      value: 'Renovacao da licenca de exercicio da atividade comercial',
      montante: 250
    },
    {
      name: 'Licenca para abertura de sucursal ou delegacao',
      value: 'Licenca para abertura de sucursal ou delegacao',
      montante: 500
    },
    {
      name: 'Vistoria previa para licenca de estabelecimento comercial',
      value: 'Vistoria previa para licenca de estabelecimento comercial',
      montante: 200
    },
    {
      name: 'Licenca para mudanca ou alteracoes de estabelecimento comercial',
      value: 'Licenca para mudanca ou alteracoes de estabelecimento comercial',
      montante: 100
    },
    {
      name: 'Vistoria subsequente',
      value: 'Vistoria subsequente',
      montante: 100
    },
    {
      name: 'Inscricao no cadastro comercial',
      value: 'Inscricao no cadastro comercial',
      montante: 50
    },
    {
      name: 'Atualizacao pontual de dados de inscricao no cadastro comercial',
      value: 'Atualizacao pontual de dados de inscricao no cadastro comercial',
      montante: 25
    },
    {
      name: 'Alvara de Licenca da atividade comercial',
      value: 'Alvara de Licenca da atividade comercial',
      montante: 25
    },
    {
      name: 'Certificado de inscricao no cadastro comercial',
      value: 'Certificado de inscricao no cadastro comercial',
      montante: 25
    },
  ]

  uploadedFiles: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private router: ActivatedRoute,
  ) {
    this.requestForm = this._fb.group({
      requestType: [null],
      empresa: this._fb.group({
        nome: [null],
        sede: [null],
        nif: [null],
        numeruRegisto: [null],
        telemovel: [null],
        telefone: [null],
        email: [null],
        gerente: [null],
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: [null],
      tipoEstabelecimento: [null],
      caraterizacaoEstabelecimento: [null],
      risco: [null],
      ato: [null],
      tipoAtividade: [null],
      tipoAtividadeCodigo: [null],
      atividadePrincipal: [null],
      atividadePrincipalCodigo: [null],
      alteracoes: [null],
      dataEmissao: [null],
      observacao: [null],
    });

    this.faturaForm = this._fb.group({
      ato: [null],
      nomeRequerente: [null],
      sociedadeComercial: [null],
      atividadeDeclarada: [null],
      codigo: [null]
    });

    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    console.log(this.aplicanteData);


  }

  onUpload(event: any, arg: string) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    // this.messageService.add({
    //   severity: 'info',
    //   summary: 'Success',
    //   detail: 'File Uploaded'
    // });
  }
}
