import { Aplicante, Documento, Fatura } from '@/core/models/entities.model';
import { AuthenticationService } from '@/core/services';
import { PedidoService } from '@/core/services/pedido.service';
import { calculateCommercialLicenseTax } from '@/core/utils/global-function';
import { Component, Input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-fatura-atividade-form',
  imports: [MultiSelect, InputGroup, InputGroupAddon, InputNumber, ReactiveFormsModule, FileUpload, Button, RouterLink, Toast],
  templateUrl: './fatura-atividade-form.component.html',
  styleUrl: './fatura-atividade-form.component.scss',
  providers: [MessageService]
})
export class FaturaAtividadeFormComponent {
  @Input() aplicanteData!: Aplicante;
  @Input() listaPedidoAto: any[] = [];
  faturaForm!: FormGroup;
  uploadedFiles: any[] = [];
  downloadLoading = false;
  uploadUrl = signal(`${environment.apiUrl}/aplicantes`);
  deleteLoading = false;
  faturaLoading = false;
  maxFileSize = 20 * 1024 * 1024;
  pedidoId!: number;
  faturaId!: number;
  loading = false;
  dataSent = output<any>();
  fatura!: Fatura;
  @Input() disabledForm!: boolean;
  @Input() disabledAllForm!: boolean;


  constructor(
    private _fb: FormBuilder,
    private authService: AuthenticationService,
    private pedidoService: PedidoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.pedidoId = this.aplicanteData.pedidoLicencaAtividade.id;

    if (this.aplicanteData.pedidoLicencaAtividade.fatura) {
      this.fatura = this.aplicanteData.pedidoLicencaAtividade.fatura;
      this.faturaId = this.fatura.id;
      this.mapEditFatura(this.fatura);
    }

    this.enableSuperficieFormControl();
    this.superficieOnChange();

    this.disabledForm ? this.faturaForm.disable() : this.faturaForm.enable();
    this.disabledAllForm ? this.faturaForm.disable() : this.faturaForm.enable();
  }

  submitFatura(form: FormGroup) {
    this.loading = true;
    let formData: any = {
      ...form.getRawValue(),
      pedidoLicencaAtividade: {
        id: this.pedidoId
      },
      nomeEmpresa: this.aplicanteData.empresa.nome,
      nivelRisco: this.aplicanteData.pedidoLicencaAtividade.risco,
      nif: this.aplicanteData.empresa.nif,
      sociedadeComercial: this.aplicanteData.empresa.sociedadeComercial.nome,
      sede: `${this.aplicanteData.empresa.sede.local},
       ${this.aplicanteData.empresa.sede.aldeia.nome}
       ${this.aplicanteData.empresa.sede.aldeia.suco.nome}
       ${this.aplicanteData.empresa.sede.aldeia.suco.postoAdministrativo.nome}
       ${this.aplicanteData.empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome}`
    }

    formData.taxas = this.listaPedidoAto.filter(item => formData.taxas.includes(item.id));

    if (this.pedidoId && this.faturaId) {
      formData.id = this.faturaId;
      this.pedidoService.updateFaturaPedidoLicenca(this.pedidoId, this.faturaId, formData).subscribe({
        next: (response) => {
          this.addMessages(true, false);
        },
        error: error => {
          this.addMessages(false, true, error);
          this.faturaLoading = false;
        },
        complete: () => {
          this.faturaLoading = false;
          // this.closeDialog();
        }
      });
    } else {
      this.pedidoService.saveFaturaPedidoLicenca(this.pedidoId, formData).subscribe({
        next: (response) => {
          this.faturaId = response.id;
          this.fatura = response;
          this.addMessages(true, true);
          this.updateUploadUrl();
          this.aplicanteData.pedidoLicencaAtividade.fatura = response;
          this.fatura = response;
        },
        error: error => {
          this.addMessages(false, true, error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          // this.closeDialog();
        }
      });
    }
  }

  onUpload(event: any, arg: string) {
    if (event.originalEvent.body) {
      this.uploadedFiles.push(event.originalEvent.body)
      this.aplicanteData.pedidoLicencaAtividade.fatura.recibo = event.originalEvent.body;
      this.fatura.recibo = event.originalEvent.body;
      this.dataSent.emit(this.fatura);
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivo carregado com sucesso!'
    });
  }

  updateUploadUrl() {
    this.uploadUrl.set(
      `${environment.apiUrl}/aplicantes/${this.aplicanteData.id}/pedidos/${this.pedidoId}/faturas/${this.faturaId}/upload/${this.authService.currentUserValue.username}`
    );
  }

  downloadFile(file: Documento) {
    this.downloadLoading = true;
    this.pedidoService.downloadRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.nome;
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
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.downloadLoading = false;
      }
    });
  }

  removeFile(file: Documento) {
    this.deleteLoading = true;
    this.pedidoService.deleteRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
      next: () => {
        this.uploadedFiles.pop();
        this.aplicanteData.pedidoLicencaAtividade.fatura.recibo = null;
        this.fatura.recibo = null;
        this.dataSent.emit(this.fatura);

        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Arquivo excluído com sucesso!'
        });
      },
      error: error => {
        this.deleteLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no exclusão do arquivo!'
        });
      },
      complete: () => {
        this.deleteLoading = false;
      }
    });
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  private mapEditFatura(fatura: Fatura) {

    // Enable superficie form control in edit mode
    this.faturaForm.get('superficie')?.enable();
    this.faturaForm.get('superficie')?.addValidators([Validators.required])

    this.enableSuperficieFormControl();

    this.faturaForm.patchValue(fatura);
    this.faturaForm.patchValue({
      taxas: fatura.taxas.map(t => t.id),
    });

    if (fatura.recibo) {
      this.uploadedFiles.push(fatura.recibo);
    }

    this.updateUploadUrl();
  }

  private enableSuperficieFormControl() {
    this.faturaForm.get('taxas')?.valueChanges.subscribe({
      next: value => {
        if (value && value.length > 0) {
          this.faturaForm.get('superficie')?.enable();
          this.faturaForm.get('superficie')?.addValidators([Validators.required])
        } else {
          this.faturaForm.get('superficie')?.disable();
          this.faturaForm.get('superficie')?.reset();
          this.faturaForm.get('total')?.reset();
        }
      }
    })
  }


  private superficieOnChange() {
    this.faturaForm.get('superficie')?.valueChanges.subscribe({
      next: value => {
        if (value) {
          const superficie = value;
          const taxas: number[] = this.faturaForm.get('taxas')?.value;
          this.faturaForm.get('total')?.setValue(
            this.getTotalFatura(superficie, taxas)
          );
        }


      }
    })
  }

  /**
    * Returns the total of all the taxes based on the given superficie and taxa.
    * @param superficie The superficie of the company.
    * @param taxas The array of taxas to calculate.
    * @returns The total of all the taxes.
    */
  private getTotalFatura(superficie: number, taxas: number[]): number {
    let total = 0;

    for (let index = 0; index < taxas.length; index++) {
      const element = taxas[index];
      const taxa = this.listaPedidoAto.find(t => t.id === element);
      if (taxa) {
        total += calculateCommercialLicenseTax(superficie, taxa.montanteMinimo, taxa.montanteMaximo);
      }
    }

    return total;
  }

  private initForm(): void {
    this.faturaForm = this._fb.group({
      id: [null],
      taxas: [null, [Validators.required]],
      superficie: new FormControl({ value: null, disabled: true, }),
      total: new FormControl({ value: null, disabled: true, }, [Validators.required]),
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }
}
