import { LanguageService, LocalizedCurrencyPipe } from '@/core/i18n';
import { DataMasterService } from '@/core/services/data-master.service';
import { applicationTypesOptions, categoryTpesOptions, mapToGrupoAtividade, nivelRiscoOptions, roleOptions } from '@/core/utils/global-function';
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
  selector: 'app-lista',
  imports: [LocalizedCurrencyPipe, TableModule, InputText, Button, Dialog, Select, TranslatePipe, ReactiveFormsModule, ConfirmDialog, Toast, IconField, InputIcon, Paginator],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ListaComponent {
  dataForm!: FormGroup;
  dataList: any[] = [];
  // header = i18n key; enum = enum.<name> prefix for cells holding an enum code
  cols: { field: string; header: string; enum?: string }[] = [];
  showDialog = false;
  type = '';
  isNew = false;
  selectedData: any;
  nivelRiscoOpts = nivelRiscoOptions;
  categoryOpts = categoryTpesOptions;
  aplicanteOpts = applicationTypesOptions;
  rolesOpts = roleOptions;
  // tipoAtividadeEconomicaOpts = tipoAtividadeEconomicaOptions;
  grupoAtivadadeOpts: any[] = [];
  loading = false;
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;
  private i18n = inject(LanguageService);

  constructor(
    private route: ActivatedRoute,
    private service: DataMasterService,
    private _fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {

  }

  ngOnInit(): void {
    this.setDataMaster(this.route.snapshot.data['type']);

    this.getGrupoAtividades();

    this.dataForm.get('grupoAtividade')?.valueChanges.subscribe((value) => {
      if (value) {
        this.dataForm.get('codigo')?.setValue(value.codigo);
      } else {
        this.dataForm.get('codigo')?.reset();
      }
    });

  }

  private setDataMaster(type: string): void {
    this.type = type;
    switch (type) {
      case 'direcoes':
        this.dataList = (this.route.snapshot.data['listaDirecao']?._embedded?.direcoes ?? []);
        this.cols = [
          { field: 'nome', header: 'common.name', enum: 'Categoria' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          nome: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'roles':
        this.dataList = (this.route.snapshot.data['listaRoles']?._embedded?.roles ?? []);
        this.cols = [
          { field: 'name', header: 'common.name', enum: 'Role' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          name: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'grupo-atividades':
        this.dataList = (this.route.snapshot.data['listaGrupoAtividade']?._embedded?.grupoAtividade ?? []);
        this.totalData = this.route.snapshot.data['listaGrupoAtividade'].page.totalElements;
        this.cols = [
          { field: 'codigo', header: 'dadosMestre.fields.codigo' },
          { field: 'descricao', header: 'dadosMestre.fields.descricao' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          codigo: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
          descricao: [null, [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'classe-atividades':
        this.dataList = (this.route.snapshot.data['listaClasseAtividade']?._embedded?.classeAtividade ?? []);
        this.totalData = this.route.snapshot.data['listaClasseAtividade'].page.totalElements;
        this.cols = [
          { field: 'grupoAtividade', header: 'dadosMestre.fields.grupoCodigo' },
          { field: 'codigo', header: 'dadosMestre.fields.codigo' },
          { field: 'descricao', header: 'dadosMestre.fields.descricao' },
          { field: 'tipoRisco', header: 'dadosMestre.fields.risco', enum: 'NivelRisco' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          grupoAtividade: ['', [Validators.required]],
          codigo: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
          descricao: ['', [Validators.required, Validators.minLength(1)]],
          tipoRisco: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'taxas':
        this.dataList = (this.route.snapshot.data['listaTaxa']?._embedded?.taxas ?? []);
        this.cols = [
          { field: 'categoria', header: 'dadosMestre.fields.categoria', enum: 'Categoria' },
          { field: 'tipo', header: 'dadosMestre.fields.tipo', enum: 'AplicanteType' },
          { field: 'ato', header: 'dadosMestre.fields.ato' },
          { field: 'montanteMinimo', header: 'dadosMestre.fields.montanteMinimo' },
          { field: 'montanteMaximo', header: 'dadosMestre.fields.montanteMaximo' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          categoria: ['', [Validators.required, Validators.minLength(1)]],
          tipo: ['', [Validators.required, Validators.minLength(1)]],
          ato: ['', [Validators.required, Validators.minLength(1)]],
          montanteMinimo: ['', [Validators.required, Validators.min(1)]],
          montanteMaximo: ['', [Validators.required, Validators.min(1)]],
        });

        break;
      case 'sociedade-comercial':
        this.dataList = (this.route.snapshot.data['listaSociedadeComercial']?._embedded?.sociedadeComercial ?? []);
        this.cols = [
          { field: 'nome', header: 'common.name' },
          { field: 'acronimo', header: 'dadosMestre.fields.acronimo' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          nome: ['', [Validators.required, Validators.minLength(1)]],
          acronimo: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /** Label for an enum code stored in master data; unknown codes render as-is. */
  enumLabel(enumName: string, value: string): string {
    if (!value) return '';
    const key = `enum.${enumName}.${value}`;
    const label = this.i18n.instant(key);
    return label === key ? value : label;
  }


  saveData(form: FormGroup): void {
    this.loading = true;

    const formData = { ...form.value };

    this.service.save(this.type, formData).subscribe({
      next: response => {
        if (this.type === 'classe-atividades') {
          response.grupoAtividade = form.value.grupoAtividade
        }

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

    const formData = { ...form.value };

    let grupoAtividade = formData.grupoAtividade;
    if (this.type === 'classe-atividades') {
      delete formData.grupoAtividade;
    }

    this.service.update(this.type, this.selectedData.id, formData).subscribe({
      next: response => {
        response.grupoAtividade = grupoAtividade;
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
        this.dataForm.reset();
        this.closeDialog();
      }
    });
  }

  onPageChange(event: any): void {
    this.dataIsFetching = true;
    this.page = event.page;
    this.size = event.rows;
    this.getData(this.page, this.size);
    this.service.getPageClasseAtividade
  }

  private getData(page: number, size: number): void {
    switch (this.type) {
      case 'direcoes':
        this.service.getPageDirecao(page, size).subscribe({
          next: response => {
            this.dataList = (response?._embedded?.direcoes ?? []);
            this.totalData = response.page.totalElements;
            this.dataIsFetching = false;
          },
          error: error => {
            this.dataIsFetching = false;
          }
        });
        break;
      case 'roles':
        this.service.getRoles().subscribe({
          next: response => {
            this.dataList = (response?._embedded?.roles ?? []);
            this.totalData = response.page.totalElements;
            this.dataIsFetching = false;
          },
          error: error => {
            this.dataIsFetching = false;
          }
        });
        break;
      case 'grupo-atividades':
        this.service.getPageGrupoAtividade(page, size).subscribe({
          next: response => {
            this.dataList = (response?._embedded?.grupoAtividade ?? []);
            this.totalData = response.page.totalElements;
            this.dataIsFetching = false;
          },
          error: error => {
            this.dataIsFetching = false;
          }
        });
        break;
      case 'classe-atividades':
        this.service.getPageClasseAtividade(page, size).subscribe({
          next: response => {
            this.dataList = (response?._embedded?.classeAtividade ?? []);
            this.totalData = response.page.totalElements;
            this.dataIsFetching = false;
          },
          error: error => {
            this.dataIsFetching = false;
          }
        });
        break;
      case 'taxas':
        this.service.getTaxa(page, size).subscribe({
          next: response => {
            this.dataList = (response?._embedded?.taxas ?? []);
            this.totalData = response.page.totalElements;
            this.dataIsFetching = false;
          },
          error: error => {
            this.dataIsFetching = false;
          }
        });
        break;
      case 'sociedade-comercial':
        this.service.getSociedadeComercial(page, size).subscribe({
          next: response => {
            this.dataList = (response?._embedded?.sociedadeComercial ?? []);
            this.totalData = response.page.totalElements;
            this.dataIsFetching = false;
          },
          error: error => {
            this.dataIsFetching = false;
          }
        });
        break;
    }
  }

  openDialogNewData(type: string): void {
    this.isNew = true;
    this.showDialog = true;
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

  openDialogEditData(data: any, index?: any,): void {
    let formEditData = {};
    switch (this.type) {
      case 'grupo-atividades':
        formEditData = {
          id: data.id,
          tipo: data.tipo,
          codigo: data.codigo,
          descricao: data.descricao,
        };
        break;
      case 'classe-atividades':
        delete data.grupoAtividade._links;
        formEditData = {
          id: data.id,
          grupoAtividade: data.grupoAtividade,
          codigo: data.codigo,
          descricao: data.descricao,
          tipo: data.tipo,
          tipoRisco: data.tipoRisco,
        }
        break;
      case 'taxas':
        formEditData = {
          id: data.id,
          categoria: data.categoria,
          tipo: data.tipo,
          ato: data.ato,
          montanteMinimo: data.montanteMinimo,
          montanteMaximo: data.montanteMaximo
        };
        break;
      case 'sociedade-comercial':
        formEditData = {
          id: data.id,
          nome: data.nome,
          acronimo: data.acronimo,
        };
        break;
    }

    this.showDialog = true;
    this.isNew = false;
    this.dataForm.patchValue(formEditData);
    this.selectedData = data;

    this.selectedData.index = index;
  }

  closeDialog($event?: any): void {
    this.showDialog = false;
    this.dataForm.reset();
  }

  private getGrupoAtividades(): void {
    this.service.getAllGrupoAtividade().subscribe({
      next: (response) => {
        this.grupoAtivadadeOpts = mapToGrupoAtividade((response?._embedded?.grupoAtividade ?? []));
      }
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = this.i18n.instant(isSuccess ? (isNew ? 'dadosMestre.common.createdSummary' : 'dadosMestre.common.updatedSummary') : 'toast.error');
    const detail = this.i18n.instant(isSuccess ? (isNew ? 'dadosMestre.common.createdDetail' : 'dadosMestre.common.updatedDetail') : 'dadosMestre.common.errorDetail');

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
