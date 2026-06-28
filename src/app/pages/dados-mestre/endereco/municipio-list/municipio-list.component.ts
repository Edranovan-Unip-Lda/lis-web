import { DataMasterService } from '@/core/services/data-master.service';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { Table, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-municipio-list',
  imports: [ReactiveFormsModule, Dialog, TitleCasePipe,TableModule, Button, InputIconModule, IconField, InputTextModule, PopoverModule, ConfirmDialog, Toast],
  templateUrl: './municipio-list.component.html',
  styleUrl: './municipio-list.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class MunicipioListComponent {
  dataList: any[] = [];
  page = 0;
  size = 50;
  totalData = 60;
  dataIsFetching = false;
  form: FormGroup;
  showDialog = false;
  type = '';
  isNew = false;
  selectedData: any;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private _fb: FormBuilder,
    private service: DataMasterService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.dataList = (this.route.snapshot.data['municipioResolve']?._embedded?.municipios ?? []);
    this.type = this.route.snapshot.data['type'];

    this.form = this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]]
    });
  }



  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openDialogNewData(type: string): void {
    this.isNew = true;
    this.showDialog = true;
  }

  openDialogEditData(data: any, index?: any,): void {
    this.showDialog = true;
    this.isNew = false;
    this.form.patchValue(data);
    this.selectedData = data;
    this.selectedData.index = index;
  }


  saveData(form: FormGroup): void {
    this.loading = true;

    this.service.save(this.type, form.value).subscribe({
      next: response => {
        this.dataList.push(response);
        this.addMessages(true, true);
      },
      error: error => {
        this.loading = false;
        this.addMessages(false, true, error);
        console.error(error);
      },
      complete: () => {
        this.loading = false;
        this.closeDialog();
      }
    });
  }

  updateData(form: FormGroup): void {
    this.loading = true;

    this.service.update(this.type, this.selectedData.id, form.value).subscribe({
      next: response => {
        this.dataList[this.selectedData.index] = response
        this.addMessages(true, false);
      },
      error: error => {
        this.loading = false;
        this.addMessages(false, false, error);
        console.error(error);
      },
      complete: () => {
        this.loading = false;
        this.form.reset();
        this.closeDialog();
      }
    });
  }

  deleteData(id: number) {

    this.confirmationService.confirm({
      // target: event.target as EventTarget,
      message: 'Quer apagar este registo?',
      header: 'Zona de risco',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },

      accept: () => {
        this.service.delete(this.type, id).subscribe({
          next: () => {
            this.dataList = this.dataList.filter((val) => val.id !== id);
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Registo excluído' });
          },
          error: error => {
            console.error(error);
            this.addMessages(false, false, error);
          },
          complete: () => {
            this.closeDialog();
          }
        });
      },
    });
  }

  closeDialog(): void {
    this.showDialog = false;
    this.form.reset();
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
