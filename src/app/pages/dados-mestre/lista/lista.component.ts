import { Categoria, TipoAtividadeEconomica } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { applicationTypesOptions, categoryTpesOptions, mapToAtividadeEconomica, mapToIdAndName, nivelRiscoOptions, roleOptions } from '@/core/utils/global-function';
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
  rolesOpts = roleOptions;
  // tipoAtividadeEconomicaOpts = tipoAtividadeEconomicaOptions;
  grupoAtivadadeOpts: any[] = [];
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

    this.dataForm.get('tipo')?.valueChanges.subscribe((value) => {
      if (value) {
        console.log("Value " + value);
        this.getGrupoAtividadesByTipo(value);
      } else {
        // this.dataForm.get('codigo')?.reset();
      }
    });


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
        this.dataList = this.route.snapshot.data['listaDirecao']._embedded.direcoes;
         this.cols = [
          { field: 'nome', header: 'Nome' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          nome: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'roles':
        this.dataList = this.route.snapshot.data['listaRoles']._embedded.roles;
         this.cols = [
          { field: 'name', header: 'Nome' },
        ];
         this.dataForm = this._fb.group({
          id: [''],
          name: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'grupo-atividades':
        this.dataList = this.route.snapshot.data['listaGrupoAtividade']._embedded.grupoAtividade;
        this.cols = [
          { field: 'tipo', header: 'Categoria' },
          { field: 'codigo', header: 'Codigo' },
          { field: 'descricao', header: 'Descricao' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          tipo: ['', [Validators.required, Validators.minLength(1)]],
          codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
          descricao: ['', [Validators.required, Validators.minLength(1)]],
        });
        break;
      case 'classe-atividades':
        this.dataList = this.route.snapshot.data['listaClasseAtividade']._embedded.classeAtividade;
        this.cols = [
          { field: 'grupoAtividade', header: 'Grupo Codigo' },
          { field: 'codigo', header: 'Codigo' },
          { field: 'descricao', header: 'Descricao' },
          { field: 'tipo', header: 'Categoria' },
          { field: 'tipoRisco', header: 'Risco' },
        ];
        this.dataForm = this._fb.group({
          id: [''],
          tipo: ['', [Validators.required, Validators.minLength(1)]],
          grupoAtividade: ['', [Validators.required]],
          codigo: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
          descricao: ['', [Validators.required, Validators.minLength(1)]],
          tipoRisco: ['', [Validators.required, Validators.minLength(1)]],
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

    this.service.save(this.type, formData).subscribe({
      next: response => {
        if (this.type === 'classe-atividades') {
          response.grupoAtividade = form.value.grupoAtividade
        }
        console.log(response);

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
        console.log(response);
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
    console.log(this.selectedData);

    this.selectedData.index = index;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.dataForm.reset();
  }

  private getGrupoAtividadesByTipo(categoria: Categoria): void {
    this.service.getAllGrupoAtividadeByTipo(categoria).subscribe({
      next: (response) => {
        this.grupoAtivadadeOpts = mapToAtividadeEconomica(response._embedded.grupoAtividade);


      }
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
