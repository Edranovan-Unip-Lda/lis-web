import { Aldeia, Role } from '@/core/models/data-master.model';
import { Documento, Empresa } from '@/core/models/entities.model';
import { TipoNacionalidade, TipoPropriedade } from '@/core/models/enums';
import { AuthenticationService, DataMasterService, EmpresaService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { estadoCivilOptions, maxFileSizeUpload, tipoDocumentoOptions, tipoNacionalidadeOptions, tipoPropriedadeOptions, tipoRelacaoFamiliaOptions, tipoRepresentante } from '@/core/utils/global-function';
import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
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
  imports: [ReactiveFormsModule, InputText, Select, Button, StepPanel, FileUpload, InputGroup, InputGroupAddon, InputNumber, Stepper, DatePicker, Divider, DatePipe, StepPanels, StepList, Step, Toast, NgxPrintModule],
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
  gerenteListaAldeias: any[] = [];
  representanteListaAldeias: any[] = [];
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
  tipoNacionalidadeOpts = tipoNacionalidadeOptions;
  tipoEstadoCivilOpts = estadoCivilOptions;
  showAddBtnAcionistas = false;
  selectedRole!: Role;
  listaAldeiaAcionista: any[][] = [];
  uploadedDocs: any[] = [];
  maxFileSize = maxFileSizeUpload;
  empresa!: Empresa;
  uploadURLDocs = signal(`${environment.apiUrl}/documentos`);
  loadingDownloadButtons = new Set<string>();
  loadingRemoveButtons = new Set<string>();
  tipoRepresentanteOptions = tipoRepresentante;
  gerenteForeigner: boolean = false;
  representanteForeigner: boolean = false;

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
    this.gerenteListaAldeias = [...this.aldeias];
    this.representanteListaAldeias = [...this.aldeias];

    this.empresa = this.route.snapshot.data['empresaResolver'] as Empresa;
    if (this.empresa) {
      this.mapEmpresaForm(this.empresa);
    }

    this.uploadURLDocs.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);
  }

  submit(form: FormGroup): void {
    this.loading = true;
    if (!this.empresaForm.valid) {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, verifique os campos obrigatórios e tente novamente.'
      });
      return;
    }

    const formData = this.prepareFormData(form.value);

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
          detail: 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações. ' + error
        });
      }
    });
  }

  private prepareFormData(formValue: any): any {
    return {
      ...formValue,
      sede: this.mapSedeData(formValue.sede),
      sociedadeComercial: this.mapSociedadeComercial(formValue.sociedadeComercial),
      tipoPropriedade: formValue.tipoPropriedade?.value,
      dataRegisto: this.formatDateForLocalDate(formValue.dataRegisto),
      acionistas: this.mapAcionistas(formValue.acionistas),
      gerente: this.mapPessoaWithMorada(formValue.gerente),
      representante: this.mapPessoaWithMorada(formValue.representante),
      documentos: this.uploadedDocs
    };
  }

  private mapSedeData(sede: any): any {
    return {
      ...sede,
      aldeia: {
        id: sede.aldeia?.value,
        nome: sede.aldeia?.nome
      }
    };
  }

  private mapSociedadeComercial(sociedade: any): any {
    return {
      id: sociedade?.value,
      nome: sociedade?.nome
    };
  }

  private mapAcionistas(acionistas: any[]): any[] {
    return acionistas.map(acionista => ({
      id: acionista.id,
      nome: acionista.nome,
      nif: acionista.nif,
      tipoDocumento: acionista.tipoDocumento,
      numeroDocumento: acionista.numeroDocumento,
      telefone: acionista.telefone,
      email: acionista.email,
      acoes: acionista.acoes,
      agregadoFamilia: acionista.agregadoFamilia,
      relacaoFamilia: acionista.relacaoFamilia,
      endereco: {
        ...acionista.endereco,
        aldeia: {
          id: acionista.endereco.aldeia?.value
        }
      }
    }));
  }

  private mapPessoaWithMorada(pessoa: any): any {
    return {
      ...pessoa,
      morada: {
        ...pessoa.morada,
        aldeia: {
          id: pessoa.morada.aldeia?.value
        }
      }
    };
  }

  aldeiaOnChange(event: SelectChangeEvent): void {
    if (event.value) {
      this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
        this.empresaForm.patchValue({
          sede: {
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          }
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

  gerenteRepresentanteAldeiaOnChange(event: SelectChangeEvent, formControl: string): void {
    if (event.value) {
      this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
        this.empresaForm.get(formControl)?.get('morada')?.patchValue({
          municipio: aldeia.suco.postoAdministrativo.municipio.nome,
          postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
          suco: aldeia.suco.nome
        });

      });
    } else {
      this.empresaForm.get(formControl)?.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  gerenteRepresentanteAldeiaFilter(event: SelectFilterEvent, formControl: string) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          if (formControl === 'gerente') {
            this.gerenteListaAldeias = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
          } else {
            this.representanteListaAldeias = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
          }
          this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      if (formControl === 'gerente') {
        this.gerenteListaAldeias = [...this.originalAldeias];
      } else {
        this.representanteListaAldeias = [...this.originalAldeias];
      }

    }
  }


  gerenteRepresentanteOnPanelHide(formControl: string) {
    if (formControl === 'gerente') {
      this.gerenteListaAldeias = [...this.originalAldeias];
    } else {
      this.representanteListaAldeias = [...this.originalAldeias];
    }
    this.empresaForm.get(formControl)?.get('morada')?.reset();
  }

  nacionalidadeOnChange(event: SelectChangeEvent, formControl: string): void {
    if (event.value) {
      const value: TipoNacionalidade = event.value;
      if (value === TipoNacionalidade.estrangeiro) {
        this.setForeigner(formControl, true);
        this.empresaForm.get(`${formControl}.numeroVisto`)?.addValidators(Validators.required);
        this.empresaForm.get(`${formControl}.validadeVisto`)?.addValidators(Validators.required);
      } else {
        this.setForeigner(formControl, false);
        this.empresaForm.get(`${formControl}.numeroVisto`)?.removeValidators(Validators.required);
        this.empresaForm.get(`${formControl}.validadeVisto`)?.removeValidators(Validators.required);
      }
    } else {
      this.setForeigner(formControl, false);
      this.empresaForm.get(`${formControl}.numeroVisto`)?.removeValidators(Validators.required);
      this.empresaForm.get(`${formControl}.validadeVisto`)?.removeValidators(Validators.required);
    }
    this.empresaForm.get(`${formControl}.numeroVisto`)?.updateValueAndValidity();
    this.empresaForm.get(`${formControl}.validadeVisto`)?.updateValueAndValidity();
  }

  sociedadeComercialOnChange({ value }: SelectChangeEvent): void {
    const tipo = this.getTipoFromNome(value?.nome);
    this.empresaForm.patchValue({
      tipoPropriedade: tipoPropriedadeOptions.find(t => t.value === tipo)
    });
  }

  private getTipoFromNome(nome?: unknown): TipoPropriedade {
    const text = String(nome ?? '').toLowerCase();
    const isUnipessoal = /\bunipessoal\b/.test(text);
    return isUnipessoal ? TipoPropriedade.individual : TipoPropriedade.sociedade;
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

  disableStepGerente(): boolean {
    return !!(
      this.empresaForm.get('gerente.nome')?.invalid ||
      this.empresaForm.get('gerente.email')?.invalid ||
      this.empresaForm.get('gerente.morada.local')?.invalid ||
      this.empresaForm.get('gerente.morada.aldeia')?.invalid);
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
        a.download = file.nome;
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

  getCurrentPosition(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.empresaForm.get('latitude')?.setValue(position.coords.latitude);
        this.empresaForm.get('longitude')?.setValue(position.coords.longitude);
      });
    }
  }

  onRepresentanteTipoChange({ value }: SelectChangeEvent): void {
    switch (value) {
      case 'Empresa':
        this.empresaForm.get('representante')?.get('nomeEmpresa')?.setValidators([Validators.required, Validators.minLength(3)]);
        this.empresaForm.get('representante')?.get('nome')?.setValidators([Validators.required, Validators.minLength(3)]);
        break;

      case 'Individual':
        this.empresaForm.get('representante')?.get('nome')?.setValidators([Validators.required, Validators.minLength(3)]);
        this.empresaForm.get('representante')?.get('nomeEmpresa')?.clearValidators();
        this.empresaForm.get('representante')?.get('nomeEmpresa')?.setValue(null);
        break;
    }

    this.empresaForm.get('representante')?.get('nomeEmpresa')?.updateValueAndValidity();
    this.empresaForm.get('representante')?.get('nome')?.updateValueAndValidity();
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
      endereco: this._fb.group({
        id: [null],
        local: [null, [Validators.required]],
        municipio: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        aldeia: [null, [Validators.required]],
      }),
    });
  }

  setForeigner(field: string, value: boolean) {
    const key = `${field}Foreigner` as keyof EmpresaFormComponent;
    (this as any)[key] = value;
  }

  private initForm(): void {
    this.empresaForm = this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      nif: [null, [Validators.required]],
      sede: this._fb.group({
        id: [null],
        local: [null, [Validators.required]],
        municipio: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        aldeia: [null, [Validators.required]],
      }),
      sociedadeComercial: [null, [Validators.required]],
      numeroRegistoComercial: [null, [Validators.required]],
      capitalSocial: [null, [Validators.required]],
      dataRegisto: [null, [Validators.required]],
      telefone: [null, [Validators.required]],
      telemovel: [null, [Validators.required]],
      tipoPropriedade: [null, [Validators.required]],
      acionistas: this._fb.array([]),
      totalTrabalhadores: [null, [Validators.required, Validators.min(1)]],
      volumeNegocioAnual: [null, Validators.required],
      balancoTotalAnual: [null, [Validators.required]],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      email: [null, [Validators.required, Validators.email]],
      gerente: this._fb.group({
        id: [null],
        nome: [null, Validators.required],
        telefone: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]],
        tipoDocumento: [null, [Validators.required]],
        numeroDocumento: [, [Validators.required]],
        nacionalidade: [null, [Validators.required]],
        numeroVisto: [null],
        validadeVisto: [null],
        naturalidade: [null, [Validators.required]],
        estadoCivil: [null, [Validators.required]],
        morada: this._fb.group({
          id: [null],
          local: [null, [Validators.required]],
          municipio: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          suco: new FormControl({ value: null, disabled: true }),
          aldeia: [null, [Validators.required]],
        }),
      }),
      representante: this._fb.group({
        id: [null],
        tipo: [null, [Validators.required]],
        nomeEmpresa: [null],
        nome: [null],
        pai: [null, [Validators.required]],
        mae: [null, [Validators.required]],
        dataNascimento: [null, [Validators.required]],
        estadoCivil: [null, [Validators.required]],
        nacionalidade: [null, [Validators.required]],
        numeroVisto: [null],
        validadeVisto: [null],
        naturalidade: [null, [Validators.required]],
        telefone: [null, [Validators.required]],
        email: [null, [Validators.required, Validators.email]],
        tipoDocumento: [null, [Validators.required]],
        numeroDocumento: [, [Validators.required]],
        morada: this._fb.group({
          id: [null],
          local: [null, [Validators.required]],
          municipio: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          suco: new FormControl({ value: null, disabled: true }),
          aldeia: [null, [Validators.required]],
        }),
      })
    });
  }

  private mapGerenteForm(empresa: Empresa): void {
    if (empresa.gerente) {
      this.empresaForm.get('gerente')?.patchValue({
        id: empresa.gerente.id,
        nome: empresa.gerente.nome,
        telefone: empresa.gerente.telefone,
        email: empresa.gerente.email,
        tipoDocumento: empresa.gerente.tipoDocumento ? this.tipoDocumentoOpts.find(td => td.value === empresa.gerente.tipoDocumento).value : null,
        numeroDocumento: empresa.gerente.numeroDocumento,
        nacionalidade: empresa.gerente.nacionalidade ? this.tipoNacionalidadeOpts.find(tn => tn.value === empresa.gerente.nacionalidade).value : null,
        numeroVisto: empresa.gerente.numeroVisto,
        validadeVisto: empresa.gerente.validadeVisto ? new Date(empresa.gerente.validadeVisto) : null,
        naturalidade: empresa.gerente.naturalidade,
        estadoCivil: empresa.gerente.estadoCivil ? this.tipoEstadoCivilOpts.find(ec => ec.value === empresa.gerente.estadoCivil).value : null,
        morada: {
          id: empresa.gerente.morada.id,
          local: empresa.gerente.morada.local,
          municipio: empresa.gerente.morada.aldeia?.suco.postoAdministrativo.municipio.nome,
          postoAdministrativo: empresa.gerente.morada.aldeia?.suco.postoAdministrativo.nome,
          suco: empresa.gerente.morada.aldeia?.suco.nome,
          aldeia: empresa.gerente.morada.aldeia ? { nome: empresa.gerente.morada.aldeia.nome, value: empresa.gerente.morada.aldeia.id } : null,
        },
      });
    }
  }

  private mapRepresentanteForm(empresa: Empresa): void {
    if (empresa.representante) {
      this.empresaForm.get('representante')?.patchValue({
        id: empresa.representante.id,
        tipo: empresa.representante.tipo,
        nomeEmpresa: empresa.representante.nomeEmpresa,
        nome: empresa.representante.nome,
        pai: empresa.representante.pai,
        mae: empresa.representante.mae,
        dataNascimento: empresa.representante.dataNascimento ? new Date(empresa.representante.dataNascimento) : null,
        estadoCivil: empresa.representante.estadoCivil ? this.tipoEstadoCivilOpts.find(ec => ec.value === empresa.representante.estadoCivil).value : null,
        nacionalidade: empresa.representante.nacionalidade ? this.tipoNacionalidadeOpts.find(tn => tn.value === empresa.representante.nacionalidade).value : null,
        numeroVisto: empresa.representante.numeroVisto,
        validadeVisto: empresa.representante.validadeVisto ? new Date(empresa.representante.validadeVisto) : null,
        naturalidade: empresa.representante.naturalidade,
        telefone: empresa.representante.telefone,
        email: empresa.representante.email,
        tipoDocumento: empresa.representante.tipoDocumento ? this.tipoDocumentoOpts.find(td => td.value === empresa.representante.tipoDocumento).value : null,
        numeroDocumento: empresa.representante.numeroDocumento,
        morada: {
          id: empresa.representante.morada.id,
          local: empresa.representante.morada.local,
          municipio: empresa.representante.morada.aldeia?.suco.postoAdministrativo.municipio.nome,
          postoAdministrativo: empresa.representante.morada.aldeia?.suco.postoAdministrativo.nome,
          suco: empresa.representante.morada.aldeia?.suco.nome,
          aldeia: empresa.representante.morada.aldeia ? { nome: empresa.representante.morada.aldeia.nome, value: empresa.representante.morada.aldeia.id } : null,
        },
      });
    }
  }

  private mapEmpresaForm(empresa: Empresa): void {
    this.empresaForm.patchValue({
      id: empresa.id,
      nome: empresa.nome,
      nif: empresa.nif,
      sociedadeComercial: empresa.sociedadeComercial ? { nome: empresa.sociedadeComercial.nome, value: empresa.sociedadeComercial.id } : null,
      numeroRegistoComercial: empresa.numeroRegistoComercial,
      capitalSocial: empresa.capitalSocial,
      dataRegisto: empresa.dataRegisto ? new Date(empresa.dataRegisto) : null,
      sede: {
        id: empresa.sede.id,
        local: empresa.sede.local,
        municipio: empresa.sede.aldeia?.suco.postoAdministrativo.municipio.nome,
        postoAdministrativo: empresa.sede.aldeia?.suco.postoAdministrativo.nome,
        suco: empresa.sede.aldeia?.suco.nome,
        aldeia: empresa.sede.aldeia ? { nome: empresa.sede.aldeia.nome, value: empresa.sede.aldeia.id } : null,
      },
      latitude: empresa.latitude,
      longitude: empresa.longitude,
      telefone: empresa.telefone,
      telemovel: empresa.telemovel,
      tipoPropriedade: empresa.tipoPropriedade ? this.tipoProriedadeOpts.find(tp => tp.value === empresa.tipoPropriedade) : null,
      totalTrabalhadores: empresa.totalTrabalhadores,
      volumeNegocioAnual: empresa.volumeNegocioAnual,
      balancoTotalAnual: empresa.balancoTotalAnual,
      email: empresa.email,
    });

    this.mapGerenteForm(empresa);
    this.mapRepresentanteForm(empresa);

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
            tipoDocumento: acionista.tipoDocumento ? this.tipoDocumentoOpts.find(td => td.value === acionista.tipoDocumento).value : null,
            numeroDocumento: acionista.numeroDocumento,
            telefone: acionista.telefone,
            email: acionista.email,
            acoes: acionista.acoes,
            agregadoFamilia: acionista.agregadoFamilia,
            relacaoFamilia: acionista.relacaoFamilia,
            endereco: {
              id: acionista.endereco.id,
              local: acionista.endereco.local,
              municipio: acionista.endereco.aldeia?.suco.postoAdministrativo.municipio.nome,
              postoAdministrativo: acionista.endereco.aldeia?.suco.postoAdministrativo.nome,
              suco: acionista.endereco.aldeia?.suco.nome,
              aldeia: acionista.endereco.aldeia ? { nome: acionista.endereco.aldeia.nome, value: acionista.endereco.aldeia.id } : null,
            },
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
              tipoDocumento: acionista.tipoDocumento ? this.tipoDocumentoOpts.find(td => td.value === acionista.tipoDocumento).value : null,
              numeroDocumento: acionista.numeroDocumento,
              telefone: acionista.telefone,
              email: acionista.email,
              acoes: acionista.acoes,
              agregadoFamilia: acionista.agregadoFamilia,
              relacaoFamilia: acionista.relacaoFamilia,
              endereco: {
                id: acionista.endereco.id,
                local: acionista.endereco.local,
                municipio: acionista.endereco.aldeia?.suco.postoAdministrativo.municipio.nome,
                postoAdministrativo: acionista.endereco.aldeia?.suco.postoAdministrativo.nome,
                suco: acionista.endereco.aldeia?.suco.nome,
                aldeia: acionista.endereco.aldeia ? { nome: acionista.endereco.aldeia.nome, value: acionista.endereco.aldeia.id } : null,
              },
            });
          });
        }
        break;
    }

    this.uploadedDocs = empresa.documentos ? [...empresa.documentos] : [];
  }
}
