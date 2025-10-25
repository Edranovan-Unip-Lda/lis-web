import { Aplicante, Documento, Fatura, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, TipoPedidoLicenca, TipoPedidoVistoria } from '@/core/models/enums';
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
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-fatura-vistoria-form',
  imports: [MultiSelect, InputGroup, InputGroupAddon, InputNumber, ReactiveFormsModule, FileUpload, Button, RouterLink, Toast],
  templateUrl: './fatura-vistoria-form.component.html',
  styleUrl: './fatura-vistoria-form.component.scss',
  providers: [MessageService]
})
export class FaturaVistoriaFormComponent {
  @Input() aplicanteData!: Aplicante;
  @Input() listaPedidoAto: any[] = [];
  faturaForm!: FormGroup;
  uploadedFiles: any[] = [];
  downloadLoading = false;
  uploadUrl = signal(`${environment.apiUrl}/aplicantes`);
  deleteLoading = false;
  faturaLoading = false;
  disableAllForm = false;
  maxFileSize = 20 * 1024 * 1024;
  pedidoId!: number;
  faturaId!: number;
  fatura!: Fatura;
  pedidoVistoria!: PedidoVistoria;
  loading = false;
  dataSent = output<any>();

  constructor(
    private _fb: FormBuilder,
    private authService: AuthenticationService,
    private pedidoService: PedidoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();

    if (this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.length > 0) {

      this.pedidoVistoria = this.aplicanteData.pedidoLicencaAtividade.listaPedidoVistoria.find(item => item.status === AplicanteStatus.submetido || item.status === AplicanteStatus.aprovado)!;
      if (this.pedidoVistoria) {
        this.pedidoId = this.pedidoVistoria.id;
        if (this.pedidoVistoria.fatura) {
          this.faturaId = this.pedidoVistoria.fatura.id;
          this.fatura = this.pedidoVistoria.fatura;
          this.mapEditFatura(this.pedidoVistoria.fatura);
        } else {
          // Set default superficie value from arrendador areaTotalConstrucao if arrendador exists
          if (this.aplicanteData.pedidoLicencaAtividade.arrendador) {
            this.faturaForm.patchValue({
              superficie: this.aplicanteData.pedidoLicencaAtividade.arrendador.areaTotalConstrucao
            });
          }
          this.setTaxaAto(this.aplicanteData.pedidoLicencaAtividade.tipo, this.pedidoVistoria.tipoVistoria);
        }
      }
    }
    this.enableSuperficieFormControl();
    this.superficieOnChange();
  }

  submitFatura(form: FormGroup) {
    this.loading = true;
    let formData: any = {
      ...form.getRawValue(),
      pedidoVistoria: {
        id: this.pedidoId
      },
      nomeEmpresa: this.aplicanteData.empresa.nome,
      nivelRisco: this.pedidoVistoria?.risco,
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
      this.pedidoService.updateFaturaPedidoVistoria(this.pedidoId, this.faturaId, formData).subscribe({
        next: (response) => {
          if (this.pedidoVistoria) {
            this.pedidoVistoria.fatura = response;
          }
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
      this.pedidoService.saveFaturaPedidoVistoria(this.pedidoId, formData).subscribe({
        next: (response) => {
          this.faturaId = response.id;
          this.addMessages(true, true);
          this.updateUploadUrl();
          this.pedidoVistoria.fatura = response;
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
      this.pedidoVistoria.fatura.recibo = event.originalEvent.body;
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
        this.pedidoVistoria.fatura.recibo = null;
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

  private setTaxaAto(tipoPedidoAtividade: TipoPedidoLicenca, tipoVistoria: TipoPedidoVistoria) {
    let filtered: number[] = [];
    switch (tipoPedidoAtividade) {
      case TipoPedidoLicenca.novo:
        filtered = this.listaPedidoAto.filter(
          t => t.ato && /licen[cç]a para exercício/i.test(t.ato)
        ).map(t => t.id);
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;

      case TipoPedidoLicenca.alteracao:
        filtered = this.listaPedidoAto.filter(
          t => t.ato && /mudan[cç]a ou altera[cç]ões/i.test(t.ato)
        ).map(t => t.id);
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;
      case TipoPedidoLicenca.renovacao:
        filtered = this.listaPedidoAto.filter(
          t => t.ato && /renova[cç]ão/i.test(t.ato)
        ).map(t => t.id);
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;
    }

    switch (tipoVistoria) {
      case TipoPedidoVistoria.inicial:
        filtered = filtered.concat(this.listaPedidoAto.filter(
          t => t.ato && /inicial/i.test(t.ato)
        ).map(t => t.id));
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;
      case TipoPedidoVistoria.exploracao:
        filtered = filtered.concat(this.listaPedidoAto.filter(
          t => t.ato && /explora[cç]ão/i.test(t.ato)
        ).map(t => t.id));
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;
      case TipoPedidoVistoria.subsequente:
        filtered = filtered.concat(this.listaPedidoAto.filter(
          t => t.ato && /subsequente/i.test(t.ato)
        ).map(t => t.id))
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;
      case TipoPedidoVistoria.previa:
        filtered = filtered.concat(this.listaPedidoAto.filter(
          t => t.ato && /prévia/i.test(t.ato)
        ).map(t => t.id));
        this.faturaForm.get('taxas')?.setValue(filtered);
        break;

    }
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
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
        } else {
          this.faturaForm.get('total')?.setValue(0);
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

  private initForm(): void {
    this.faturaForm = this._fb.group({
      id: [null],
      taxas: new FormControl({ value: null, disabled: true, }),
      superficie: [null, [Validators.required]],
      total: new FormControl({ value: null, disabled: true, }, [Validators.required]),
    });
  }

  private addMessages(isSuccess: boolean, isNew: boolean, error?: any) {
    const summary = isSuccess ? (isNew ? 'Dados registados com sucesso!' : 'Dados atualizados com sucesso!') : 'Error';
    const detail = isSuccess ? (isNew ? `Os dados foram registados` : `Os dados foram actualizados`) : 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.';

    this.messageService.add({ severity: isSuccess ? 'success' : 'error', summary, detail });
  }

}
