import { TipoAtividadeEconomica } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { applicationTypesOptions, categoryTpesOptions, nivelRiscoOptions, tipoAtividadeEconomicaOptions } from '@/core/utils/global-function';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-lista',
  imports: [TableModule, InputText, Button, Dialog, TitleCasePipe, Select, ReactiveFormsModule, ConfirmDialog, Toast, IconField, InputIcon, CurrencyPipe],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ListaComponent {
  dataForm!: FormGroup;
  dataList: any[] = [];
  cols: { field: string; header: string }[] = [];
  showDialog = false;
  type = '';
  isNew = false;
  selectedData: any;
  nivelRiscoOpts = nivelRiscoOptions;
  categoryOpts = categoryTpesOptions;
  aplicanteOpts = applicationTypesOptions;
  tipoAtividadeEconomicaOpts = tipoAtividadeEconomicaOptions;
  loading = false;
  page = 0;
  size = 50;
  totalData = 0;
  dataIsFetching = false;

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

    if (this.type === 'atividade-economica') {
      this.dataForm.get('tipoAtividadeEconomica')?.valueChanges.subscribe({
        next: value => {
          switch (value.value) {
            case TipoAtividadeEconomica.tipo:
              this.dataForm.get('codigo')?.setValidators([Validators.minLength(2), Validators.maxLength(2)]);
              break;
            case TipoAtividadeEconomica.atividadePrincipal:
              this.dataForm.get('codigo')?.setValidators([Validators.minLength(4), Validators.maxLength(4)]);
              break;
          }
        }
      });
    }

  }

  private setDataMaster(type: string): void {
    this.type = type;
    switch (type) {
      case 'atividade-economica':
        this.dataList = this.route.snapshot.data['listaAtividade']._embedded.atividadeEconomica;
        this.cols = [
          { field: 'codigo', header: 'Codigo' },
          { field: 'descricao', header: 'Descricao' },
          { field: 'tipo', header: 'Categoria' },
          { field: 'tipoRisco', header: 'Risco' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          codigo: ['', [Validators.required]],
          descricao: ['', [Validators.required, Validators.minLength(1)]],
          tipo: ['', [Validators.required, Validators.minLength(1)]],
          tipoRisco: ['', [Validators.required, Validators.minLength(1)]],
          tipoAtividadeEconomica: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'taxas':
        this.dataList = this.route.snapshot.data['listaTaxa']._embedded.taxas;
        this.cols = [
          { field: 'categoria', header: 'Categoria' },
          { field: 'tipo', header: 'Tipo' },
          { field: 'ato', header: 'Ato' },
          { field: 'montanteMinimo', header: 'Montante Mínimo' },
          { field: 'montanteMaximo', header: 'Montante Máximo' },
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
        this.dataList = this.route.snapshot.data['listaSociedadeComercial']._embedded.sociedadeComercial;
        this.cols = [
          { field: 'nome', header: 'Nome' },
          { field: 'acronimo', header: 'Acrónimo' },
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


  saveData(form: FormGroup): void {
    this.loading = true;

    const formData = { ...form.value };

    switch (this.type) {
      case 'atividade-economica':
        formData.tipo = formData.tipo.value;
        formData.tipoRisco = formData.tipoRisco.value;
        formData.tipoAtividadeEconomica = formData.tipoAtividadeEconomica.value;
        break;
    }

    console.log(formData);

    this.service.save(this.type, formData).subscribe({
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

    const formData = { ...form.value };
    switch (this.type) {
      case 'atividade-economica':
        formData.tipo = formData.tipo.value;
        formData.tipoRisco = formData.tipoRisco.value;
        formData.tipoAtividadeEconomica = formData.tipoAtividadeEconomica.value;
        break;
    }

    this.service.update(this.type, this.selectedData.id, formData).subscribe({
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
        this.dataForm.reset();
        this.closeDialog();
      }
    });
  }

  openDialogNewData(type: string): void {
    this.isNew = true;
    this.showDialog = true;
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

  openDialogEditData(data: any, index?: any,): void {
    let formEditData = {};
    switch (this.type) {
      case 'atividade-economica':
        formEditData = {
          id: data.id,
          codigo: data.codigo,
          descricao: data.descricao,
          tipo: categoryTpesOptions.find(item => item.value === data.tipo),
          tipoRisco: nivelRiscoOptions.find(item => item.value === data.tipoRisco),
          tipoAtividadeEconomica: this.tipoAtividadeEconomicaOpts.find(item => item.value === data.tipoAtividadeEconomica)
        };
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

  closeDialog(): void {
    this.showDialog = false;
    this.dataForm.reset();
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
