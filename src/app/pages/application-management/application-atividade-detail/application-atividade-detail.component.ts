import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepperModule } from 'primeng/stepper';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-application-atividade-detail',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, StepperModule, SelectModule, InputTextModule, FileUploadModule, SelectButtonModule, TextareaModule, TagModule, DatePickerModule],
  templateUrl: './application-atividade-detail.component.html',
  styleUrl: './application-atividade-detail.component.scss'
})
export class ApplicationAtividadeDetailComponent {
  requestForm: FormGroup;
  faturaForm: FormGroup;
  vistoriaComercialRequestForm: FormGroup;
  autoVistoriaForm: FormGroup;
  uploadedFiles: any[] = [];
  requestTypes: any[] = [
    {
      name: 'Pedido de Licenca',
      value: 'Pedido de Licenca'
    },
    {
      name: 'Pedido de Alteracao de Licenca',
      value: 'Pedido de Alteracao de Licenca'
    },
    {
      name: 'Pedido de Renovacao de Licenca',
      value: 'Pedido de Renovacao de Licenca'
    },
    {
      name: 'Licenca para Instalacao',
      value: 'Licenca para Instalacao'
    },
    {
      name: 'Licenca para Exploracao',
      value: 'Licenca para Exploracao'
    },
    {
      name: 'Licenca para Alteracao',
      value: 'Licenca para Alteracao'
    },
    {
      name: 'Renovacao de Licenca',
      value: 'Renovacao de Licenca'
    },
  ];

  stateOptions: any[] = [
    { label: 'SIM', value: true },
    { label: 'NAO', value: false }
  ];

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
  ];

  tipoPedidoVistoriaOpts: any[] = [
    {
      name: 'Vistoria previa',
      value: 'Vistoria previa'
    },
    {
      name: 'Vistoria subsequente',
      value: 'Vistoria subsequente'
    }
  ];

  tipoEmpresaOpts: any[] = [
    {
      name: 'Microempresa',
      value: 'Microempresa',
    },
    {
      name: 'Pequena empresa',
      value: 'Pequena empresa',
    },
    {
      name: 'Media empresa',
      value: 'Media empresa',
    },
    {
      name: 'Grande empresa',
      value: 'MicroemGrande empresapresa',
    },
  ];

  tipoEstabelecimentoOpts: any[] = [
    {
      name: 'Kiosk',
      value: 'Kiosk'
    },
    {
      name: 'Loja',
      value: 'Loja'
    }
  ];

  nivelRiscoOpts: any[] = [
    {
      name: 'Medio Risco',
      value: 'Medio Risco'
    },
    {
      name: 'Alto Risco',
      value: 'Alto Risco'
    }
  ];

  atividadesOpts: any[] = [
    {
      name: 'Venda a grosso',
      value: 'Venda a grosso'
    },
    {
      name: 'Venda a retalho',
      value: 'Venda a retalho'
    }
  ];


  constructor(
    private _fb: FormBuilder
  ) {

    this.requestForm = this._fb.group({
      firma: [null],
      numeroRegistoComercial: [null],
      sede: this._fb.group({
        rua: [null],
        aldeia: [null],
        suco: [null],
        postoAdministrativo: [null],
        municipio: [null]
      }),
      tipoAtividade: [null],
      nivelRisco: [null],
      estatutoSociedadeComercial: [null],
      nif: [null],
      representante: this._fb.group({
        nome: [null],
        nacionalidade: [null],
        naturalidade: [null],
        morada: this._fb.group({
          rua: [null],
          aldeia: [null],
          suco: [null],
          postoAdministrativo: [null],
          municipio: [null]
        }),
        telefone: [null],
        email: [null],
      }),
      gerente: this._fb.group({
        nome: [null],
        estadoCivil: [null],
        nacionalidade: [null],
        naturalidade: [null],
        morada: this._fb.group({
          rua: [null],
          aldeia: [null],
          suco: [null],
          postoAdministrativo: [null],
          municipio: [null]
        }),
        telefone: [null],
        email: [null],
      }),
      planta: [null],
      documentoPropriedade: [null],
      documentoimovel: [null],
      contratoArrendamento: [null],
      planoEmergencia: [null],
      estudoAmbiental: [null],
      numEmpregosCriados: [null, [Validators.min(0)]],
      numEmpregadosCriar: [null, [Validators.min(0)]],
      reciboPagamento: [null],
      outrosDocumentos: [null]
    });

    this.faturaForm = this._fb.group({
      ato: [null],
      nomeRequerente: [null],
      sociedadeComercial: [null],
      atividadeDeclarada: [null],
      codigo: [null]
    });

    this.vistoriaComercialRequestForm = this._fb.group({
      tipoPedido: [null],
      empresa: this._fb.group({
        nome: [null],
        numeroRegisto: [null],
        sede: [null],
        nif: [null],
        gerente: [null],
        telefone: [null],
        telemovel: [null],
        email: [null],
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: [null],
      tipoEmpresa: [null],
      tipoEstabelecimento: [null],
      nivelRisco: [null],
      atividade: [null],
      tipoAtividade: [null],
      codigoTipoAtividade: [null],
      atividadePrincipal: [null],
      codigoAtividadePrincipal: [null],
      alteracoes: [null],
      observacao: [null],
    });

    this.autoVistoriaForm = this._fb.group({
      numeroProcesso: [null],
      dataHora: [null],
      local: [null],
      funcionario: [null],
      requerente: this._fb.group({
        denominacaoSocial: [null],
        numeroRegisto: [null],
        sede: [null],
        nif: [null],
        gerente: [null],
        telefone: [null],
        email: [null],
        classificacaoAtividade: [null],
        nomeRepresentante: [null],
        pai: [null],
        mae: [null],
        dataNascimento: [null],
        estadoCivil: [null],
        natural: [null],
        postoAdministrativo: [null],
        municipio: [null],
        documentacaoIdentificacao: [null],
        residencia: [null],
      }),
      participantes: this._fb.group({
        representanteComercio: [null],
        cargoComercio: [null],
        representanteAutoridadeLocal: [null],
        cargoAutoridadeLocal: [null],
        representanteSaude: [null],
        cargoSaude: [null],
        representanteTrabalho: [null],
        cargoTrabalho: [null],
        representanteBombeiros: [null],
        cargoBombeiros: [null],
      }),
      nomeAtuante: [null],
      legislacaoUrbanistica: [null],
      accessoEstrada: [null],
      escoamentoAguas: [null],
      alimentacaoEnergia: [null],
      seperadosSexo: [null],
      lavatoriosComEspelho: [null],
      comunicacaoVentilacao: [null],
      esgotoAguas: [null],
      paredesPavimentos: [null],
      zonasDestinadas: [null],
      instalacoesFrigorificas: [null],
      sectoresLimpos: [null],
      pisosParedes: [null],
      pisosResistentes: [null],
      paredesInteriores: [null],
      paredes3metros: [null],
      unioesParedes: [null],
      ventilacoesNecessarias: [null],
      iluminacao: [null],
      aguaPotavel: [null],
      distribuicaoAguaNaoPotavel: [null],
      redeEsgotos: [null],
      equipamentoUtensilios: [null],
      equipamentoPrimeirosSocorros: [null],
      recipientesLixo: [null],
      limpezaDiaria: [null],
      descreverIrregularidades: [null],
      aptoAberto: [null],
      comDeficiencias: [null],
      recomendacoes: [null],
      prazo: [null],
      documental: [null],
      membrosEquipaVistoria: this._fb.group({
        representanteComercio: [null],
        representanteAutoridadeLocal: [null],
        representanteSaude: [null],
        representanteTrabalho: [null],
        representanteBombeiros: [null],
      })
    });
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
