import { Aplicante } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { AuthenticationService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-application-list',
  imports: [TableModule, InputText, Button, IconField, InputIcon, RouterModule, Tag, StatusSeverityPipe, StatusIconPipe, Tooltip, UpperCasePipe, DatePipe, Toast, ConfirmDialog],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ApplicationListComponent {
  applications: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  currentRole: any;
  roleAdmin = Role.admin;
  roleClient = Role.client;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: EmpresaService,
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.currentRole = this.authService.currentRole.name;

    this.applications = this.route.snapshot.data['applicationPage'].content;
    this.totalData = this.route.snapshot.data['applicationPage'].totalElements;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  toDetail(aplicante: Aplicante) {
    const user = this.authService.currentUserValue;

    if (user.role.name === Role.client) {
      this.router.navigate([`/application/${aplicante.tipo.toLowerCase()}`, aplicante.id], {
      // this.router.navigate([`/application`, aplicante.id], {
        queryParams: {
          categoria: aplicante.categoria,
          tipo: aplicante.tipo
        }
      });
    } else {
      if (aplicante.estado === 'APROVADO') {
        this.router.navigate(['/gestor/application', aplicante.id], {
          queryParams: {
            categoria: aplicante.categoria,
            tipo: aplicante.tipo
          }
        });
      } else {
        this.router.navigate(['/gestor/application/task', aplicante.id], {
          queryParams: {
            categoria: aplicante.categoria,
            tipo: aplicante.tipo
          }
        });
      }

    }

  }

  delete(aplicante: Aplicante) {
    const empresaId = this.authService.currentUserValue.empresa.id;

    this.confirmationService.confirm({
      message: 'Quer apagar este aplicante?',
      header: 'Zona de risco',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
        icon: 'pi pi-times'
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
        icon: 'pi pi-check'
      },

      accept: () => {
        this.service.deleteApicante(empresaId, aplicante.id).subscribe({
          next: () => {
            this.applications = this.applications.filter(item => item.id !== aplicante.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Aplicante removido com sucesso'
            });
          },
          error: error => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Ocorreu um erro ao remover o aplicante'
            });
          },
        });
      },
    });
  }
}
