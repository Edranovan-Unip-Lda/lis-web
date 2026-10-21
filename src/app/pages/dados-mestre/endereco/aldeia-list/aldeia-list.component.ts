import { LanguageService } from '@/core/i18n';
import { DataMasterService } from '@/core/services/data-master.service';
import { mapToIdAndNome } from '@/core/utils/global-function';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-aldeia-list',
  imports: [TableModule, Button, InputIcon, IconField, InputText, Toast, ConfirmDialog, ReactiveFormsModule, Select, TranslatePipe, Dialog, Paginator],
  templateUrl: './aldeia-list.component.html',
  styleUrl: './aldeia-list.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class AldeiaListComponent {
  dataList: any[] = [];
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  form: FormGroup;
  showDialog = false;
  type = '';
  isNew = false;
  selectedData: any;
  loading = false;
  private i18n = inject(LanguageService);
  municipioList: any[] = [];
  postoList: any[] = [];
  sucoList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private _fb: FormBuilder,
    private service: DataMasterService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.form = this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      municipio: [null, [Validators.required]],
      postoAdministrativo: [null, [Validators.required]],
      suco: [null, [Validators.required]],
    });

    this.type = this.route.snapshot.data['type'];
    this.dataList = (this.route.snapshot.data['aldeiaResolve']?._embedded?.aldeias ?? []);
    this.totalData = this.route.snapshot.data['aldeiaResolve'].page.totalElements;

    this.municipioList = mapToIdAndNome((this.route.snapshot.data['municipioResolve']?._embedded?.municipios ?? []));
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

    delete data.suco._links;

    this.form.get('municipio')?.disable();
    this.form.get('postoAdministrativo')?.disable();
    this.form.get('suco')?.disable();

    this.service.getSucoById(data.suco.id).subscribe({
      next: response => {
        delete response.postoAdministrativo._links;
        data.postoAdministrativo = response.postoAdministrativo;

        this.service.getSucosByPosto(response.postoAdministrativo.id).subscribe({
          next: response => {
            this.sucoList = mapToIdAndNome((response?._embedded?.sucos ?? []));
            this.service.getPostoById(data.postoAdministrativo.id).subscribe({
              next: response => {
                delete response.municipio._links;
                data.municipio = response.municipio;

                this.service.getPostosByMunicipio(response.municipio.id).subscribe({
                  next: response => {
                    this.postoList = mapToIdAndNome((response?._embedded?.postos ?? []));
                    
                    this.form.patchValue(data);
                    this.selectedData = data;
                    this.selectedData.index = index;
                  }
                });
              }
            });

          }
        });

      }
    })


  }

  municipioSelectOnChange(event: any): void {
    this.service.getPostosByMunicipio(event.value.id).subscribe({
      next: response => {
        this.postoList = mapToIdAndNome((response?._embedded?.postos ?? []));
      }
    });
  }

  postoSelectOnChange(event: any): void {
    this.service.getSucosByPosto(event.value.id).subscribe({
      next: response => {
        this.sucoList = mapToIdAndNome((response?._embedded?.sucos ?? []));
      }
    });
  }


  saveData(form: FormGroup): void {
    this.loading = true;

    this.service.save(this.type, form.value).subscribe({
      next: response => {
        response.suco = form.value.suco;
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
    
    //Partial update (no need parent object)
    const suco = form.getRawValue().suco;
    delete form.value.suco;
    delete form.value.postoAdministrativo;
    delete form.value.municipio;

    this.service.update(this.type, this.selectedData.id, form.value).subscribe({
      next: response => {
        response.suco = suco;
        
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
      message: this.i18n.instant('dadosMestre.common.deleteConfirm'),
      header: this.i18n.instant('dadosMestre.common.deleteHeader'),
      icon: 'pi pi-info-circle',
      rejectLabel: this.i18n.instant('common.cancel'),
      rejectButtonProps: {
        label: this.i18n.instant('common.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.i18n.instant('common.delete'),
        severity: 'danger',
      },

      accept: () => {
        this.service.delete(this.type, id).subscribe({
          next: () => {
            this.dataList = this.dataList.filter((val) => val.id !== id);
            this.messageService.add({ severity: 'info', summary: this.i18n.instant('toast.confirmed'), detail: this.i18n.instant('dadosMestre.common.deleted') });
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
    this.form.enable();
  }

  getData(page: number, size: number): void {
    this.dataIsFetching = true;
    this.service.getAldeias(page, size).subscribe({
      next: response => {
        this.dataList = (response?._embedded?.aldeias ?? []);
        this.totalData = response.page.totalElements;
        this.dataIsFetching = false;
      }
    })
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.size = event.rows;
    this.getData(this.page, this.size);
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = this.i18n.instant(isSuccess ? (isNew ? 'dadosMestre.common.createdSummary' : 'dadosMestre.common.updatedSummary') : 'toast.error');
    const detail = this.i18n.instant(isSuccess ? (isNew ? 'dadosMestre.common.createdDetail' : 'dadosMestre.common.updatedDetail') : 'dadosMestre.common.errorDetail');

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
