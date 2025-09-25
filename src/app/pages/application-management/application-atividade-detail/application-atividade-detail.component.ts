import { Aplicante, AutoVistoria, Documento, Fatura, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Role } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';
import { PedidoService } from '@/core/services/pedido.service';
import { mapToGrupoAtividade, mapToIdAndNome, mapToTaxa } from '@/core/utils/global-function';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { Tag } from 'primeng/tag';
import { FaturaAtividadeFormComponent } from './fatura-atividade-form/fatura-atividade-form.component';
import { FaturaVistoriaFormComponent } from './fatura-vistoria-form/fatura-vistoria-form.component';
import { PedidoAtividadeFormComponent } from './pedido-atividade-form/pedido-atividade-form.component';
import { PedidoVistoriaFormComponent } from './pedido-vistoria-form/pedido-vistoria-form.component';

@Component({
  selector: 'app-application-atividade-detail',
  imports: [ReactiveFormsModule, ButtonModule, StepperModule, InputTextModule, FileUploadModule, Tag, RouterLink, StatusSeverityPipe, DatePipe, TitleCasePipe, PedidoAtividadeFormComponent, FaturaAtividadeFormComponent, FaturaVistoriaFormComponent, PedidoVistoriaFormComponent],
  templateUrl: './application-atividade-detail.component.html',
  styleUrl: './application-atividade-detail.component.scss',
  providers: [MessageService]
})
export class ApplicationAtividadeDetailComponent {
  aplicanteData!: Aplicante;

  downloadLoading = false;
  loading = false;
  aplicanteEstado!: AplicanteStatus;
  motivoRejeicao!: string | null;
  listaAldeia: any[] = [];
  listaGrupoAtividade: any[] = [];
  listaPedidoAto: any[] = [];
  uploadedFiles: any[] = [];
  pedidoVistoria!: PedidoVistoria | undefined;
  autoVistoria!: AutoVistoria | undefined;
  isManager = false;
  isStaff = false;
  isClient = false;
  disabledPedidoLicencaNextBtn = true;
  disabledFaturaLicencaNextBtn = true;
  disabledPedidoVistoriaNextBtn = true;
  disabledFaturaVistoriaNextBtn = true;
  disabledPedidoLicencaAndFatura = false;
  disabledAllForm = false;

  @ViewChild(PedidoAtividadeFormComponent) child!: PedidoAtividadeFormComponent;

  stateOptions: any[] = [
    { label: 'SIM', value: true },
    { label: 'NAO', value: false }
  ];


  constructor(
    private _fb: FormBuilder,
    private router: ActivatedRoute,
    private pedidoService: PedidoService,
    private empresaService: EmpresaService,
    private messageService: MessageService,
    private authService: AuthenticationService
  ) {

  }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];

    this.listaAldeia = mapToIdAndNome(this.router.snapshot.data['aldeiasResolver']._embedded.aldeias);
    this.listaGrupoAtividade = mapToGrupoAtividade(this.router.snapshot.data['grupoAtividadeResolver']._embedded.grupoAtividade);
    this.listaPedidoAto = mapToTaxa(this.router.snapshot.data['listaTaxaResolver']._embedded.taxas);
    this.aplicanteEstado = this.aplicanteData.estado;

    this.checkedForms(this.aplicanteData);

    switch (this.authService.currentRole.name) {
      case Role.manager:
        this.isManager = true;
        break;
      case Role.staff:
        this.isStaff = true;
        break;
      case Role.client:
        this.isClient = true;
        break;
    }

    // Disabled Pedido and Fatura Licenca if the Aplicante was rejected
    if (this.aplicanteData.estado === AplicanteStatus.rejeitado &&
      this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.every(item => item.status === AplicanteStatus.rejeitado)) {
      this.disabledPedidoLicencaAndFatura = true;
    }

    // Get Motivo rejeicao from the latest status (Historico)
    if (this.aplicanteData.estado === AplicanteStatus.rejeitado) {
      const latest = this.aplicanteData.historicoStatus
        .reduce((max, curr) => new Date(curr.createdAt) > new Date(max.createdAt) ? curr : max);

      this.motivoRejeicao = latest?.status === AplicanteStatus.rejeitado
        ? latest.descricao
        : null;
    }

    if (this.aplicanteData.estado === AplicanteStatus.emCurso || this.aplicanteData.estado === AplicanteStatus.rejeitado) {
      this.disabledAllForm = true;
    }
  }


  submitAplicante(callback: any) {
    this.loading = true;

    const formData = {
      id: this.aplicanteData.id,
      tipo: this.aplicanteData.tipo,
      categoria: this.aplicanteData.categoria,
      numero: this.aplicanteData.numero,
      estado: AplicanteStatus.submetido
    }

    this.empresaService.submitAplicanteByEmpresaIdAndAplicanteId(this.aplicanteData.empresa.id, this.aplicanteData.id, formData).subscribe({
      next: response => {
        this.aplicanteEstado = response.estado;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'O Aplicante foi submetida com sucesso!'
        });
        // this.disabledForms(AplicanteStatus.submetido);
        callback(1);
      },
      error: err => {
        this.loading = false;
        this.addMessages(false, true, err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  downloadFile(file: Documento) {
    this.downloadLoading = true;
    this.pedidoService.downloadRecibo(this.aplicanteData.id, this.aplicanteData.pedidoLicencaAtividade.id, this.aplicanteData.pedidoLicencaAtividade.fatura.id, file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.nome;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: error => {
        this.downloadLoading = false;
      },
      complete: () => {
        this.downloadLoading = false;
      }
    });
  }

  onPedidoLicencaReceived(payload: any) {
    this.aplicanteData.pedidoLicencaAtividade = payload;
    this.disabledPedidoLicencaNextBtn = false;
  }

  onFaturaPedidoReceived(payload: Fatura) {
    this.aplicanteData.pedidoLicencaAtividade.fatura = payload;
    if (payload && payload.recibo) {
      this.disabledFaturaLicencaNextBtn = false;
    } else {
      this.disabledFaturaLicencaNextBtn = true;
    }
  }

  onPedidoVistoriaReceived(payload: any) {
    if (!this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria) {
      this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria = [];
    }
    this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria = [...this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria, payload];
    this.pedidoVistoria = payload;
    this.disabledPedidoVistoriaNextBtn = false;
  }

  onPedidoVistoriaFaturaReceived(payload: any) {
    if (this.pedidoVistoria) {
      this.pedidoVistoria.fatura = payload;
      this.disabledFaturaVistoriaNextBtn = false;
    } else {
      this.disabledFaturaVistoriaNextBtn = true;
    }
  }

  isSubmitted(aplicanteData: Aplicante): boolean {
    return aplicanteData.estado !== AplicanteStatus.submetido &&
      aplicanteData.estado !== AplicanteStatus.revisao &&
      aplicanteData.estado !== AplicanteStatus.aprovado &&
      aplicanteData.estado !== AplicanteStatus.atribuido &&
      aplicanteData.estado !== AplicanteStatus.revisto;
  }

  private checkedForms(aplicante: Aplicante) {
    if (aplicante.pedidoLicencaAtividade) {
      this.pedidoVistoria = this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
      this.disabledPedidoLicencaNextBtn = false;
      if (aplicante.pedidoLicencaAtividade.fatura && aplicante.pedidoLicencaAtividade.fatura.recibo) {
        this.disabledFaturaLicencaNextBtn = false;
      }
      if (aplicante.pedidoLicencaAtividade.listaPedidoVistoria && aplicante.pedidoLicencaAtividade.listaPedidoVistoria.length > 0) {
        this.disabledPedidoVistoriaNextBtn = false;
        const pedidoVistoria = aplicante.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
        if (pedidoVistoria && pedidoVistoria.fatura && pedidoVistoria.fatura.recibo) {
          this.disabledFaturaVistoriaNextBtn = false;
          this.autoVistoria = pedidoVistoria.autoVistoria;
        }
      }
    }
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }

}
