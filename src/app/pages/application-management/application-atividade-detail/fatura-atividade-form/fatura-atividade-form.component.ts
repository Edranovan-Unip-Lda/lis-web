import { Aplicante, Documento } from '@/core/models/entities.model';
import { AuthenticationService } from '@/core/services';
import { PedidoService } from '@/core/services/pedido.service';
import { calculateCommercialLicenseTax } from '@/core/utils/global-function';
import { Component, Input, signal } from '@angular/core';
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
  disableAllForm = false;
  maxFileSize = 20 * 1024 * 1024;
  pedidoId!: number;
  faturaId!: number;


  constructor(
    private _fb: FormBuilder,
    private authService: AuthenticationService,
    private pedidoService: PedidoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.enableSuperficieFormControl();
    this.superficieOnChange();
  }

  saveFatura(form: FormGroup) {

  }


  onUpload(event: any, arg: string) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    // this.messageService.add({
    //   severity: 'info',
    //   summary: 'Success',
    //   detail: 'File Uploaded'
    // });
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
    // this.deleteLoading = true;
    // this.pedidoService.deleteRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
    //   next: () => {
    //     this.uploadedFiles.pop();
    //     this.aplicanteData.pedidoInscricaoCadastro.fatura.recibo = null;

    //     this.messageService.add({
    //       severity: 'info',
    //       summary: 'Success',
    //       detail: 'Arquivo excluído com sucesso!'
    //     });
    //   },
    //   error: error => {
    //     this.deleteLoading = false;
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Erro',
    //       detail: 'Falha no exclusão do arquivo!'
    //     });
    //   },
    //   complete: () => {
    //     this.deleteLoading = false;
    //   }
    // });
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
      nomeEmpresa: [null, [Validators.required]],
      sociedadeComercial: [null, [Validators.required]],
      nif: [null, [Validators.required]],
      sede: [null, [Validators.required]],
      nivelRisco: [null, [Validators.required]],
      superficie: new FormControl({ value: null, disabled: true, }),
      total: new FormControl({ value: null, disabled: true, }, [Validators.required]),
    });
  }
}
