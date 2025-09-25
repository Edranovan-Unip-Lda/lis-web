import { Aplicante, AutoVistoria, PedidoVistoria, User } from '@/core/models/entities.model';
import { AplicanteStatus, AplicanteType, Role } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService, UserService } from '@/core/services';
import { PedidoService } from '@/core/services/pedido.service';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-summary',
  imports: [Tag, StatusSeverityPipe, DatePipe, Button, RouterLink, Toast, ConfirmDialog, Textarea, Textarea, ReactiveFormsModule, TitleCasePipe, Select],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  providers: [MessageService, ConfirmationService, Textarea]
})
export class SummaryComponent {
  aplicanteData!: Aplicante;
  uploadUrl = `${environment.apiUrl}/aplicantes`;
  downloadLoading = false;
  user!: User;
  form!: FormGroup;
  descricao: FormControl = new FormControl('', [Validators.required, Validators.minLength(2)]);
  pedidoVistoria!: PedidoVistoria | undefined;
  autoVistoria!: AutoVistoria | undefined;
  userList: User[] = [];
  selectedFuncionario = new FormControl(null, [Validators.required]);
  notes = new FormControl(null, [Validators.required]);


  constructor(
    private router: ActivatedRoute,
    private pedidoService: PedidoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private authService: AuthenticationService,
    private _fb: FormBuilder,
    private route: Router
  ) { }

  ngOnInit(): void {
    this.aplicanteData = this.router.snapshot.data['aplicanteResolver'];
    this.user = this.authService.currentUserValue;

    if (this.router.snapshot.data['userRoleStaffResolver']) {
      this.userList = this.router.snapshot.data['userRoleStaffResolver']._embedded.users;
    }

    this.form = this._fb.group({
      description: [null, [Validators.required, Validators.minLength(2)]],
    });

    this.checkedForms(this.aplicanteData);
  }

  atribuir(): void {
    let username = this.authService.currentUserValue.username;

    if (this.selectedFuncionario.value && this.notes.value) {
      this.userService.atribuirAplicante(username, this.aplicanteData.id, this.selectedFuncionario.value, this.notes.value).subscribe({
        next: response => {
          this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Aplicante atribuido com sucesso', life: 3000, key: 'tr' });
          // this.aplicanteData = response;
          this.route.navigate(['gestor/application', this.aplicanteData.id],
            {
              queryParams: {
                categoria: this.aplicanteData.categoria,
                tipo: this.aplicanteData.tipo
              }
            }
          );
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atribuir o aplicante', life: 3000, key: 'tr' });
        }
      });
    }


  }

  revisto(event: any) {
    this.confirmationService.confirm({
      key: 'revisto',
      target: event.currentTarget as EventTarget,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirmar',
      },
      accept: () => {
        const formData = {
          id: null,
          status: AplicanteStatus.revisto,
          descricao: null,
          alteradoPor: this.user.username,
        }
        this.userService.revistoAplicante(this.user.username, this.aplicanteData.id, formData).subscribe({
          next: response => {
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Aplicante revisto com sucesso', life: 3000, key: 'tr' });
            this.aplicanteData = response;
            this.route.navigate(['gestor/application', this.aplicanteData.id],
              {
                queryParams: {
                  categoria: this.aplicanteData.categoria,
                  tipo: this.aplicanteData.tipo
                }
              }
            );
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao revisto o aplicante', life: 3000, key: 'tr' });
          }
        });
      },
    });
  }

  rejeitarRevisto(event: any) {
    this.confirmationService.confirm({
      key: 'aprovar',
      target: event.currentTarget as EventTarget,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirmar',
      },
      accept: () => {
        const formData = {
          id: null,
          status: AplicanteStatus.rejeitado,
          descricao: null,
          alteradoPor: this.user.username,
        }
        this.userService.revistoAplicante(this.user.username, this.aplicanteData.id, formData).subscribe({
          next: response => {
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Aplicante revisto com sucesso', life: 3000, key: 'tr' });
            this.aplicanteData = response;
            this.route.navigate(['gestor/application', this.aplicanteData.id],
              {
                queryParams: {
                  categoria: this.aplicanteData.categoria,
                  tipo: this.aplicanteData.tipo
                }
              }
            );
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao revisto o aplicante', life: 3000, key: 'tr' });
          }
        });
      },
    });
  }

  aprovar(event: any) {
    this.confirmationService.confirm({
      key: 'aprovar',
      target: event.currentTarget as EventTarget,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirmar',
      },
      accept: () => {
        const formData = {
          id: null,
          status: AplicanteStatus.aprovado,
          descricao: null,
          alteradoPor: this.user.username,
        }
        this.userService.updateAplicante(this.user.username, this.aplicanteData.id, formData).subscribe({
          next: response => {
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Aplicante aprovado com sucesso. O certificao foi gerado com sucesso', life: 3000, key: 'tr' });
            this.aplicanteData = response;
            this.route.navigate(['gestor/application', this.aplicanteData.id],
              {
                queryParams: {
                  categoria: this.aplicanteData.categoria,
                  tipo: this.aplicanteData.tipo
                }
              }
            );
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao aprovar o aplicante', life: 3000, key: 'tr' });
          }
        });
      },
    });
  }

  cancelar(event: Event) {
    this.confirmationService.confirm({
      key: 'cancelar',
      target: event.currentTarget as EventTarget,
      header: 'Confirmar a rejeição do Aplicante',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        icon: 'pi pi-times',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Confirmar',
        icon: 'pi pi-save',
        // disabled: !this.descricao.valid
      },
      accept: () => {
        const formData = {
          id: null,
          status: AplicanteStatus.rejeitado,
          descricao: this.descricao.value,
          alteradoPor: this.user.username,
        }
        this.userService.updateAplicante(this.user.username, this.aplicanteData.id, formData).subscribe({
          next: (response) => {
            this.aplicanteData.estado = response.estado;
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Aplicante rejeitado com sucesso. A decisão foi registada no histórico.', life: 3000, key: 'tr' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao rejeitar o aplicante', life: 3000, key: 'tr' });
          }
        });
      },
    });
  }

  downloadFile(aplicanteId: number, pedidoId: number, faturaId: number, reciboId: number) {
    this.downloadLoading = true;
    this.pedidoService.downloadRecibo(aplicanteId, pedidoId, faturaId, reciboId).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recibo.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Arquivo descarregado com sucesso!'
        });
      },
      error: error => {
        this.downloadLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao descarregar o arquivo!',
          key: 'br'
        });
      },
      complete: () => {
        this.downloadLoading = false;
      }
    });
  }

  showApprovalActions(aplicante: Aplicante): boolean {
    const estado = aplicante?.estado;
    const tipo = aplicante?.tipo;
    const role = this.user?.role.name;

    const validEstadoTipo =
      (estado === AplicanteStatus.submetido && tipo === AplicanteType.cadastro) ||
      (estado === AplicanteStatus.revisto && tipo === AplicanteType.licenca);

    return validEstadoTipo && role === Role.manager;
  }

  showReviewdActions(aplicante: Aplicante): boolean {
    const estado = aplicante?.estado;
    const tipo = aplicante?.tipo;
    const role = this.user?.role.name;

    const validEstadoTipo = estado === AplicanteStatus.revisao && tipo === AplicanteType.licenca;

    return validEstadoTipo && role === Role.chief;
  }

  showDispatchActions(aplicante: Aplicante): boolean {
    const estado = aplicante?.estado;
    const tipo = aplicante?.tipo;
    const role = this.user?.role.name;

    const validEstadoTipo = estado === AplicanteStatus.submetido && tipo === AplicanteType.licenca;
    return validEstadoTipo && role === Role.chief;
  }

  private checkedForms(aplicante: Aplicante) {
    if (aplicante.pedidoLicencaAtividade) {
      this.pedidoVistoria = this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
      if (aplicante.pedidoLicencaAtividade.fatura && aplicante.pedidoLicencaAtividade.fatura.recibo) {
      }
      if (aplicante.pedidoLicencaAtividade.listaPedidoVistoria && aplicante.pedidoLicencaAtividade.listaPedidoVistoria.length > 0) {
        const pedidoVistoria = aplicante.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado);
        if (pedidoVistoria && pedidoVistoria.fatura && pedidoVistoria.fatura.recibo) {
          // Will Fix this Later
          this.autoVistoria = pedidoVistoria.autoVistoria;
        }
      }
    }
  }
}
