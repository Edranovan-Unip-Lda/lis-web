import { Aldeia, Role } from '@/core/models/data-master.model';
import { Documento, Empresa } from '@/core/models/entities.model';
import { TipoPropriedade } from '@/core/models/enums';
import { AuthenticationService, DataMasterService, EmpresaService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { maxFileSizeUpload, tipoDocumentoOptions, tipoPropriedadeOptions, tipoRelacaoFamiliaOptions } from '@/core/utils/global-function';
import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select, SelectChangeEvent, SelectFilterEvent } from 'primeng/select';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-empresa-form',
  imports: [ReactiveFormsModule, InputText, Select, Button, StepPanel, FileUpload, InputGroup, InputGroupAddon, InputNumber, Stepper, DatePicker, Divider, DatePipe, StepPanels, StepList, Step, Toast],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.scss',
  providers: [MessageService]
})
export class EmpresaFormComponent implements OnInit {
  confirmed: boolean = false;
  municipios = [];
  postos = [];
  sucos = [];
  aldeias: any = [];
  listaSociedadeComercial = [];
  empresaForm!: FormGroup;
  loading = false;
  isSuccess = false;
  isError = false;
  emailVerification = 'test@mail.com';
  notification!: Notification;
  originalAldeias: any[] = [];
  tipoProriedadeOpts = tipoPropriedadeOptions;
  tipoDocumentoOpts = tipoDocumentoOptions;
  tipoRelacaoFamiliaOpts = tipoRelacaoFamiliaOptions;
  showAddBtnAcionistas = false;
  selectedRole!: Role;
  listaAldeiaAcionista: any[][] = [];
  uploadedDocs: any[] = [];
  maxFileSize = maxFileSizeUpload;
  empresa!: Empresa;
  uploadURLDocs = signal(`${environment.apiUrl}/documentos`);
  loadingDownloadButtons = new Set<string>();
  loadingRemoveButtons = new Set<string>();

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private empresaService: EmpresaService,
    private documentoService: DocumentosService,
    private messageService: MessageService,
    private authService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.initForm();

    this.aldeias = this.route.snapshot.data['aldeiasResolver']._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));

    this.listaSociedadeComercial = this.route.snapshot.data['listaSociedadeComercial']._embedded.sociedadeComercial.map((s: any) => ({ nome: s.nome, value: s.id }));
    this.originalAldeias = [...this.aldeias];

    this.empresa = this.route.snapshot.data['empresaResolver'] as Empresa;
    if (this.empresa) {
      this.mapEmpresaForm(this.empresa);
    }

    this.uploadURLDocs.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);
  }

  submit(form: FormGroup) {
    this.loading = true;
    if (this.empresaForm.valid) {

      let formData = { ...form.value }
      formData.sede = {
        id: form.value.idSede,
        local: form.value.sede,
        aldeia: {
          id: form.value.aldeia.value,
          nome: form.value.aldeia.nome
        },
      };
      formData.sociedadeComercial = {
        id: formData.sociedadeComercial.value,
        nome: formData.sociedadeComercial.nome
      }

      formData.tipoPropriedade = form.value.tipoPropriedade.value;
      formData.dataRegisto = this.formatDateForLocalDate(form.value.dataRegisto);
      formData.acionistas = form.value.acionistas.map((a: any) => {
        return {
          id: a.id,
          nome: a.nome,
          nif: a.nif,
          tipoDocumento: a.tipoDocumento.value,
          numeroDocumento: a.numeroDocumento,
          telefone: a.telefone,
          email: a.email,
          acoes: a.acoes,
          agregadoFamilia: a.agregadoFamilia,
          relacaoFamilia: a.relacaoFamilia,
          endereco: {
            id: a.idLocal,
            local: a.local,
            aldeia: {
              id: a.aldeia.value
            }
          }
        }
      });
      formData.documentos = this.uploadedDocs;

      this.empresaService.update(this.authService.currentUserValue.username, formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.isSuccess = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'A informação da Empresa actualizada com sucesso!'
          });
        },
        error: (error) => {
          this.loading = false;
          this.isError = true;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.'
          });
          console.error('Error updating empresa:', error);
        }
      });

    } else {
      this.loading = false;
      // Handle form errors
      console.error('Form is invalid');
    }
  }

  aldeiaOnChange(event: SelectChangeEvent): void {
    if (event.value) {
      this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
        this.empresaForm.patchValue({
          municipio: aldeia.suco.postoAdministrativo.municipio.nome,
          postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
          suco: aldeia.suco.nome
        });

      });
    } else {
      this.empresaForm.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  aldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.aldeias = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
          this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.aldeias = [...this.originalAldeias];
    }
  }


  onPanelHide() {
    this.aldeias = [...this.originalAldeias];
  }

  tipoPropriedadeChange(event: SelectChangeEvent) {
    if (!event.value) {
      this.showAddBtnAcionistas = false;
      this.acionistasArray.clear();
      return;
    }
    switch (event.value) {
      case TipoPropriedade.individual:
        this.acionistasArray.clear();
        this.showAddBtnAcionistas = false;
        this.acionistasArray.push(this.generateAcionistaForm(true));
        break;

      case TipoPropriedade.sociedade:
        this.acionistasArray.clear();
        this.showAddBtnAcionistas = true;
        this.acionistasArray.push(this.generateAcionistaForm(false));
        break;
      default:
        this.showAddBtnAcionistas = false;
        this.acionistasArray.clear();
        break;
    }
    const idx = this.acionistasArray.length - 1;
    this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
  }

  addAcionistaForm() {
    this.acionistasArray.push(this.generateAcionistaForm(false));
    const idx = this.acionistasArray.length - 1;
    this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
  }

  removeAcionistaForm(index: number) {
    if (this.acionistasArray.length > 1) {
      this.acionistasArray.removeAt(index);
    }
  }

  aldeiaAcionistaOnChange(event: SelectChangeEvent, index: number): void {
    if (event.value) {
      this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
        this.acionistasArray.controls.at(index)?.patchValue({
          municipio: aldeia.suco.postoAdministrativo.municipio.nome,
          postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
          suco: aldeia.suco.nome
        });

      });
    } else {
      this.acionistasArray.controls.at(index)?.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  aldeiaAcionistaFilter(event: any, index: number) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaAcionista[index] = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
          this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaAcionista[index] = [...this.originalAldeias];
    }
  }

  onPanelHideAcionista(index: number) {
    this.listaAldeiaAcionista[index] = [...this.originalAldeias];
  }

  onUploadDocs(event: any) {
    if (event.originalEvent.body) {
      this.uploadedDocs = [...this.uploadedDocs, ...event.originalEvent.body];
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivos carregado com sucesso!'
    });
  }

  onFileRemove(e: { file: any }) {
    const key = e.file.__key ?? `${e.file.name}-${e.file.size}-${e.file.lastModified}`;
    this.uploadedDocs = this.uploadedDocs.filter(f => (f.__key ?? `${f.name}-${f.size}-${f.lastModified}`) !== key);
  }

  // Fired when the "clear" button is pressed
  onFileClear() {
    this.uploadedDocs = [];
  }

  disableStepEmpresa(): boolean {
    return !!(
      this.empresaForm.get('nome')?.invalid ||
      this.empresaForm.get('sede')?.invalid ||
      this.empresaForm.get('sociedadeComercial')?.invalid ||
      this.empresaForm.get('aldeia')?.invalid ||
      this.empresaForm.get('nif')?.invalid ||
      this.empresaForm.get('numeroRegistoComercial')?.invalid ||
      this.empresaForm.get('capitalSocial')?.invalid ||
      this.empresaForm.get('dataRegisto')?.invalid
    );
  }

  disableStepProprietario(): boolean {
    return !!(
      this.empresaForm.get('tipoPropriedade')?.invalid ||
      this.acionistasArray.invalid);
  }

  disableStepConta(): boolean {
    return !!(
      this.empresaForm.get('utilizador.gerente')?.invalid ||
      this.empresaForm.get('utilizador.email')?.invalid ||
      this.empresaForm.get('utilizador.password')?.invalid);
  }

  downloadDoc(file: Documento): void {
    this.loadingDownloadButtons.add(file.nome);
    this.documentoService.downloadById(file.id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'info',
          summary: 'Sucesso',
          detail: 'Arquivo descarregado com sucesso!'
        });
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha no download do arquivo!'
        });
      },
      complete: () => {
        this.loadingDownloadButtons.delete(file.nome);
      }
    });
  }

  removeDoc(file: Documento) {
    this.loadingRemoveButtons.add(file.nome);
    const index = this.uploadedDocs.indexOf(file);
    if (index !== -1) {
      if (!file.id) {
        this.uploadedDocs.splice(index, 1);
        return;
      }
      this.documentoService.deleteById(file.id).subscribe({
        next: () => {
          this.uploadedDocs.splice(index, 1);
          this.messageService.add({
            severity: 'info',
            summary: 'Sucesso',
            detail: 'Arquivo foi removido com sucesso!'
          });
        },
        error: error => {
          this.loadingRemoveButtons.delete(file.nome);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha no removero arquivo!'
          });
        },
      });
    }
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  get acionistasArray(): FormArray {
    return this.empresaForm.get('acionistas') as FormArray;
  }

  private formatDateForLocalDate(date: Date): string {
    // Adjust for timezone offset so that local date is preserved
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const corrected = new Date(date.getTime() - offsetMs);

    return corrected.toISOString().split('T')[0];
  }

  private generateAcionistaForm(isIndividual: boolean) {
    return this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      nif: [null, [Validators.required]],
      tipoDocumento: [null, [Validators.required]],
      numeroDocumento: [, [Validators.required]],
      telefone: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      acoes: [isIndividual ? 100 : null, [Validators.required]],
      agregadoFamilia: [null, [Validators.required]],
      relacaoFamilia: [null, [Validators.required]],
      sectionTitle: [`Acionista n.º ${this.acionistasArray.length + 1}`],
      idLocal: [null],
      local: [null, [Validators.required]],
      municipio: new FormControl({ value: null, disabled: true }),
      postoAdministrativo: new FormControl({ value: null, disabled: true }),
      suco: new FormControl({ value: null, disabled: true }),
      aldeia: [null, [Validators.required]],
    });
  }

  private initForm(): void {
    this.empresaForm = this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      nif: [null, [Validators.required]],
      idSede: [null],
      sede: [null, [Validators.required]],
      sociedadeComercial: [null, [Validators.required]],
      municipio: new FormControl({ value: null, disabled: true }),
      postoAdministrativo: new FormControl({ value: null, disabled: true }),
      suco: new FormControl({ value: null, disabled: true }),
      aldeia: [null, [Validators.required]],
      numeroRegistoComercial: [null, [Validators.required]],
      capitalSocial: [null, [Validators.required]],
      dataRegisto: [null, [Validators.required]],
      telefone: [null, [Validators.required]],
      telemovel: [null, [Validators.required]],
      tipoPropriedade: [null, [Validators.required]],
      acionistas: this._fb.array([]),
      totalTrabalhadores: [null],
      volumeNegocioAnual: [null],
      balancoTotalAnual: [null, [Validators.required]],
    });
  }

  private mapEmpresaForm(empresa: Empresa): void {
    this.empresaForm.patchValue({
      id: empresa.id,
      nome: empresa.nome,
      nif: empresa.nif,
      sede: empresa.sede.local,
      idSede: empresa.sede.id,
      sociedadeComercial: empresa.sociedadeComercial ? { nome: empresa.sociedadeComercial.nome, value: empresa.sociedadeComercial.id } : null,
      aldeia: empresa.sede.aldeia ? { nome: empresa.sede.aldeia.nome, value: empresa.sede.aldeia.id } : null,
      municipio: empresa.sede.aldeia?.suco.postoAdministrativo.municipio.nome,
      postoAdministrativo: empresa.sede.aldeia?.suco.postoAdministrativo.nome,
      suco: empresa.sede.aldeia?.suco.nome,
      numeroRegistoComercial: empresa.numeroRegistoComercial,
      capitalSocial: empresa.capitalSocial,
      dataRegisto: empresa.dataRegisto ? new Date(empresa.dataRegisto) : null,
      telefone: empresa.telefone,
      telemovel: empresa.telemovel,
      tipoPropriedade: empresa.tipoPropriedade ? this.tipoProriedadeOpts.find(tp => tp.value === empresa.tipoPropriedade) : null,
      totalTrabalhadores: empresa.totalTrabalhadores,
      volumeNegocioAnual: empresa.volumeNegocioAnual,
      balancoTotalAnual: empresa.balancoTotalAnual,
    });

    switch (empresa.tipoPropriedade) {
      case TipoPropriedade.individual:
        this.acionistasArray.push(this.generateAcionistaForm(true));
        const idx = this.acionistasArray.length - 1;
        this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
        if (empresa.acionistas && empresa.acionistas.length) {
          const acionista = empresa.acionistas[0];
          this.acionistasArray.at(0).patchValue({
            id: acionista.id,
            nome: acionista.nome,
            nif: acionista.nif,
            tipoDocumento: acionista.tipoDocumento ? this.tipoDocumentoOpts.find(td => td.value === acionista.tipoDocumento) : null,
            numeroDocumento: acionista.numeroDocumento,
            telefone: acionista.telefone,
            email: acionista.email,
            acoes: acionista.acoes,
            agregadoFamilia: acionista.agregadoFamilia,
            relacaoFamilia: acionista.relacaoFamilia,
            local: acionista.endereco.local,
            idLocal: acionista.endereco.id,
            municipio: acionista.endereco.aldeia?.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: acionista.endereco.aldeia?.suco.postoAdministrativo.nome,
            suco: acionista.endereco.aldeia?.suco.nome,
            aldeia: acionista.endereco.aldeia ? { nome: acionista.endereco.aldeia.nome, value: acionista.endereco.aldeia.id } : null,
          });
        }
        break;

      case TipoPropriedade.sociedade:
        this.acionistasArray.clear();
        this.showAddBtnAcionistas = true;
        if (empresa.acionistas && empresa.acionistas.length) {
          empresa.acionistas.forEach((acionista, index) => {
            this.acionistasArray.push(this.generateAcionistaForm(false));
            const idx = this.acionistasArray.length - 1;
            this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
            this.acionistasArray.at(index).patchValue({
              id: acionista.id,
              nome: acionista.nome,
              nif: acionista.nif,
              tipoDocumento: acionista.tipoDocumento ? this.tipoDocumentoOpts.find(td => td.value === acionista.tipoDocumento) : null,
              numeroDocumento: acionista.numeroDocumento,
              telefone: acionista.telefone,
              email: acionista.email,
              acoes: acionista.acoes,
              agregadoFamilia: acionista.agregadoFamilia,
              relacaoFamilia: acionista.relacaoFamilia,
              idLocal: acionista.endereco.id,
              local: acionista.endereco.local,
              municipio: acionista.endereco.aldeia?.suco.postoAdministrativo.municipio.nome,
              postoAdministrativo: acionista.endereco.aldeia?.suco.postoAdministrativo.nome,
              suco: acionista.endereco.aldeia?.suco.nome,
              aldeia: acionista.endereco.aldeia ? { nome: acionista.endereco.aldeia.nome, value: acionista.endereco.aldeia.id } : null,
            });
          });
        }
        break;
    }

    this.uploadedDocs = empresa.documentos ? [...empresa.documentos] : [];
  }
}
