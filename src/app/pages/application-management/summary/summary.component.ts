import { Aplicante, User } from '@/core/models/entities.model';
import { AplicanteStatus } from '@/core/models/enums';
import { StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService, UserService } from '@/core/services';
import { PedidoService } from '@/core/services/pedido.service';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-summary',
  imports: [Tag, StatusSeverityPipe, DatePipe, Button, RouterLink, Toast, ConfirmDialog, Textarea, ReactiveFormsModule, TitleCasePipe],
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

    this.form = this._fb.group({
      description: [null, [Validators.required, Validators.minLength(2)]],
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

  downloadFile() {
    this.downloadLoading = true;
    this.pedidoService.downloadRecibo(this.aplicanteData.id, this.aplicanteData.pedidoInscricaoCadastroDto.id, this.aplicanteData.pedidoInscricaoCadastroDto.fatura.id, this.aplicanteData.pedidoInscricaoCadastroDto.fatura.recibo?.id!).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.aplicanteData.pedidoInscricaoCadastroDto.fatura.recibo?.nome ?? 'recibo.pdf';
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

}
