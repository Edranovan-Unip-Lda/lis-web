import { Aplicante, Documento } from '@/core/models/entities.model';
import { AplicanteStatus } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { mapToGrupoAtividade, mapToIdAndNome, mapToTaxa } from '@/core/utils/global-function';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { StepperModule } from 'primeng/stepper';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { FaturaAtividadeFormComponent } from './fatura-atividade-form/fatura-atividade-form.component';
import { FaturaVistoriaFormComponent } from './fatura-vistoria-form/fatura-vistoria-form.component';
import { PedidoAtividadeFormComponent } from './pedido-atividade-form/pedido-atividade-form.component';
import { PedidoVistoriaFormComponent } from './pedido-vistoria-form/pedido-vistoria-form.component';

@Component({
  selector: 'app-application-atividade-detail',
  imports: [ReactiveFormsModule, ButtonModule, StepperModule, InputTextModule, FileUploadModule, SelectButton, Textarea, Tag, DatePicker, RouterLink, StatusSeverityPipe, DatePipe, TitleCasePipe, PedidoAtividadeFormComponent, FaturaAtividadeFormComponent, FaturaVistoriaFormComponent, PedidoVistoriaFormComponent],
  templateUrl: './application-atividade-detail.component.html',
  styleUrl: './application-atividade-detail.component.scss'
})
export class ApplicationAtividadeDetailComponent {
  aplicanteData!: Aplicante;
  
  autoVistoriaForm: FormGroup;
  downloadLoading = false;
  aplicanteEstado!: AplicanteStatus;
  motivoRejeicao = '';
  listaAldeia: any[] = [];
  listaGrupoAtividade: any[] = [];
  listaPedidoAto: any[] = [];
  uploadedFiles: any[] = [];

  @ViewChild(PedidoAtividadeFormComponent) child!: PedidoAtividadeFormComponent;

  stateOptions: any[] = [
    { label: 'SIM', value: true },
    { label: 'NAO', value: false }
  ];


  constructor(
    private _fb: FormBuilder,
    private router: ActivatedRoute,
  ) {

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
      sanitasAutomaticaAgua: [null],
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
      distribuicaoAgua: [null],
      redeDistribuicao: [null],
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

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.listaAldeia = mapToIdAndNome(this.router.snapshot.data['aldeiasResolver']._embedded.aldeias);
    this.listaGrupoAtividade = mapToGrupoAtividade(this.router.snapshot.data['grupoAtividadeResolver']._embedded.grupoAtividade);
    this.listaPedidoAto = mapToTaxa(this.router.snapshot.data['listaTaxaResolver']._embedded.taxas);
    this.aplicanteEstado = this.aplicanteData.estado;
  }

  downloadFile(file: Documento) { }

  onDataReceived(payload: string) {
    console.log('Parent received:', payload);
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
