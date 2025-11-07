import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Documento, Empresa, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria } from '@/core/models/enums';
import { AuthenticationService, DataMasterService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { PedidoService } from '@/core/services/pedido.service';
import { stateOptions, tipoAreaRepresentanteComercial, tipoAreaRepresentanteIndustrial, tipoDocumentoOptions, tipoEletricidadeOptions, tipoLocalOptions } from '@/core/utils/global-function';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select, SelectFilterEvent } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auto-vistoria',
  imports: [ReactiveFormsModule, SelectButton, Textarea, DatePicker, FileUpload, InputText, Select, Button, Toast, InputGroup, InputGroupAddon, InputNumber],
  templateUrl: './auto-vistoria.component.html',
  styleUrl: './auto-vistoria.component.scss',
  providers: [MessageService]
})
export class AutoVistoriaComponent implements OnInit {
  autoVistoriaForm!: FormGroup;
  aplicante!: Aplicante;
  pedidoVistoria!: PedidoVistoria;
  stateOptions = stateOptions;
  uploadedFiles: any[] = [];
  listaClassificacaoAtividade: any[] = [];
  tipoAreaRepresentanteOpts: any[] = [];
  listaAldeia: any[] = [];
  listaAldeiaRequerente: any[] = [];
  listaAldeiaResidencia: any[] = [];
  originalAldeias: any[] = [];
  listaPostoAdministrativo: any[] = [];
  listaPostoAdministrativoOriginal: any[] = [];
  categoria: Categoria | undefined;
  tipoDocumentoOpts = tipoDocumentoOptions;
  downloadLoading = false;
  deleteLoading = false;
  uploadUrl = signal(`${environment.apiUrl}/documentos`);
  maxFileSize = 20 * 1024 * 1024; // 20 MB
  loading = false;
  loadingDownloadButtons = new Set<string>();
  loadingRemoveButtons = new Set<string>();
  maxLengthParticipantes = 5;
  tipoLocalOpts = tipoLocalOptions;
  tipoEletricidadeOpts = tipoEletricidadeOptions;

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private pedidoService: PedidoService,
    private documentoService: DocumentosService,
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.aplicante = this.route.snapshot.data['aplicanteResolver'];
    this.categoria = this.aplicante.categoria;
    this.pedidoVistoria = this.aplicante.pedidoLicencaAtividade.listaPedidoVistoria.find(p => p.status === AplicanteStatus.submetido)!;

    this.listaClassificacaoAtividade = this.route.snapshot.data['listaClasseAtividadeResolver']._embedded.classeAtividade;

    this.listaPostoAdministrativo = this.route.snapshot.data['listaPostoAdministrativoResolver']._embedded.postos;
    this.listaPostoAdministrativoOriginal = [...this.listaPostoAdministrativo];

    this.originalAldeias = this.route.snapshot.data['listaAldeiasResolver']._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
    this.listaAldeia = [...this.originalAldeias];
    this.listaAldeiaRequerente = [...this.originalAldeias];
    this.listaAldeiaResidencia = [...this.originalAldeias];

    switch (this.categoria) {
      case Categoria.comercial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteComercial;
        this.maxLengthParticipantes = 5;
        break;
      case Categoria.industrial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteIndustrial;
        this.maxLengthParticipantes = 7;
        break;
    }

    this.addParticipanteForm();
    this.uploadUrl.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);

    this.mapAutoVistoriaForm(this.aplicante, this.pedidoVistoria);
    console.log(this.pedidoVistoria);

    this.mapRequerenteForm(this.aplicante.empresa);

    this.autoVistoriaForm.valueChanges.subscribe(() => {
      if (!this.isAllOptionsTrue()) {
        this.autoVistoriaForm.get('prazo')?.setValue(30, { emitEvent: false });
      } else {
        this.autoVistoriaForm.get('prazo')?.setValue(0, { emitEvent: false });
      }
    })
  }

  save(form: FormGroup) {
    if (form.valid) {
      this.loading = true;
      const formData = this.mapFormToData(form);

      console.log(formData);
      this.pedidoService.saveAutoVistoria(this.pedidoVistoria.id, formData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Auto Vistoria submetida com sucesso', life: 3000, key: 'tr' });
          this.autoVistoriaForm.disable();
          this.uploadedFiles = [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao submeter a Auto Vistoria', life: 3000, key: 'tr' });
        }
      });
    } else {
      form.markAllAsTouched();
    }
  }

  aldeiaFilter(event: SelectFilterEvent, parentControlName?: string, childControlName?: string) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          if (parentControlName && childControlName) {
            this.autoVistoriaForm.get(parentControlName)?.get(childControlName)?.patchValue(resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id })));
            if (parentControlName === 'requerente' && childControlName === 'sede') {
              this.listaAldeiaRequerente = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
            } else {
              this.listaAldeiaResidencia = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
            }
          } else {
            this.listaAldeia = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          }
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      if (parentControlName && childControlName) {
        if (parentControlName === 'requerente' && childControlName === 'sede') {
          this.listaAldeiaRequerente = [...this.originalAldeias];
        } else {
          this.listaAldeiaResidencia = [...this.originalAldeias];
        }
      } else {
        this.listaAldeia = [...this.originalAldeias];
      }
    }
  }

  aldeiaOnChange(event: any, arg: string) {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.autoVistoriaForm.get(arg)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.autoVistoriaForm.get(arg)?.reset();
    }
  }

  aldeiaNestedOnChange(event: any, parentControlName: string, childControlName: string): void {
    if (event.value) {
      const selectedItem = event.value;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.autoVistoriaForm.get(parentControlName)?.get(childControlName)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.autoVistoriaForm.get(parentControlName)?.get(childControlName)?.reset();
    }
  }

  postoFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchPostosByNome(query)
        .subscribe(resp => {
          this.listaPostoAdministrativo = resp._embedded.postos.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaPostoAdministrativo = [...this.listaPostoAdministrativoOriginal];
    }
  }

  postoChange(event: any): void {
    if (event.value) {
      const selectedItem = event.value;

      const selectedPosto = this.listaPostoAdministrativo.find(p => p.id === selectedItem);
      if (selectedPosto) {
        // Assuming that the municipio name is part of the posto object
        this.autoVistoriaForm.get('requerente')?.patchValue({
          municipio: selectedPosto.municipio.nome
        })
      }
    } else {
      this.autoVistoriaForm.get('requerente')?.patchValue({
        municipio: null,
        postoAdministrativo: null
      });
    }
  }


  /**
   * Returns a list of all available area representante options for the given position i
   * @param {number} i - The position index
   * @returns {any[]} - A list of available area representante options
   */
  availablePositions(i: number): any[] {
    const picked = new Set<string>(
      this.membrosEquipaVistoria.controls
        .map((fg, idx) => (idx === i ? null : fg.get('areaRepresentante')?.value))
        .filter((v): v is string => !!v)
    );
    return this.tipoAreaRepresentanteOpts.filter(p => !picked.has(p.value));
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
        this.loadingDownloadButtons.delete(file.nome);
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
    const index = this.uploadedFiles.indexOf(file);
    if (index !== -1) {
      if (!file.id) {
        this.uploadedFiles.splice(index, 1);
        this.messageService.add({
          severity: 'info',
          summary: 'Sucesso',
          detail: 'Arquivo foi removido com sucesso!'
        });
        return;
      }
      this.documentoService.deleteById(file.id).subscribe({
        next: () => {
          this.uploadedFiles.splice(index, 1);
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
        complete: () => this.loadingRemoveButtons.delete(file.nome)
      });
    }
  }


  onPanelHide() {
    this.listaAldeia = [...this.originalAldeias];
  }

  bytesToMBs(value: number): string {
    if (!value && value !== 0) return '';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  disabledSubmitButton(): boolean {
    const { length } = this.uploadedFiles;
    return !this.autoVistoriaForm.valid || length === 0 || this.autoVistoriaForm.disabled;
  }

  classeAtividadeChange(event: any): void {
    if (event.value) {
      this.autoVistoriaForm.get('requerente')?.get('classeAtividadeCodigo')?.setValue(event.value.descricao);
    } else {
      this.autoVistoriaForm.get('requerente')?.get('classeAtividadeCodigo')?.reset();
    }
  }

  private mapFormToData(form: FormGroup) {
    const formData = form.getRawValue();
    return {
      ...formData,
      local: {
        ...formData.local,
        aldeia: {
          id: formData.local.aldeia
        }
      },
      documentos: this.uploadedFiles,
      requerente: {
        ...formData.requerente,
        sede: {
          ...formData.requerente.sede,
          aldeia: {
            id: formData.requerente.sede.aldeia
          }
        },
        residencia: {
          ...formData.requerente.residencia,
          aldeia: {
            id: formData.requerente.residencia.aldeia
          }
        }
      },
    }
  }

  private initForm() {
    this.autoVistoriaForm = this._fb.group({
      numeroProcesso: new FormControl({ value: null, disabled: true }),
      dataHora: [null],
      local: this._fb.group({
        local: new FormControl({ value: null, disabled: true }),
        aldeia: new FormControl({ value: null, disabled: true }),
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      funcionario: {
        id: this.authService.currentUserValue.id,
      },
      requerente: this._fb.group({
        denominacaoSocial: new FormControl({ value: null, disabled: true }),
        numeroRegistoComercial: new FormControl({ value: null, disabled: true }),
        sede: this._fb.group({
          local: new FormControl({ value: null, disabled: true }),
          aldeia: new FormControl({ value: null, disabled: true }),
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
        nif: new FormControl({ value: null, disabled: true }),
        gerente: new FormControl({ value: null, disabled: true }),
        telefone: new FormControl({ value: null, disabled: true }),
        email: new FormControl({ value: null, disabled: true }),
        classeAtividade: [null],
        classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
        nomeRepresentante: new FormControl({ value: null, disabled: true }),
        pai: new FormControl({ value: null, disabled: true }),
        mae: new FormControl({ value: null, disabled: true }),
        dataNascimento: new FormControl({ value: null, disabled: true }),
        estadoCivil: new FormControl({ value: null, disabled: true }),
        nacionalidade: new FormControl({ value: null, disabled: true }),
        naturalidade: new FormControl({ value: null, disabled: true }),
        tipoDocumento: new FormControl({ value: null, disabled: true }),
        numeroDocumento: new FormControl({ value: null, disabled: true }),
        residencia: this._fb.group({
          local: new FormControl({ value: null, disabled: true }),
          aldeia: new FormControl({ value: null, disabled: true }),
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
      }),
      nomeAtuante: new FormControl({ value: null, disabled: true }),
      legislacaoUrbanistica: [null],
      tipoLocal: [null],
      accessoEstrada: [null],
      superficie: [null],
      larguraEstrada: [null],
      escoamentoAguas: [null],
      alimentacaoEnergia: [null],
      tipoEletricidade: [null],
      seperadosSexo: [null],
      lavatoriosComEspelho: [null],
      sanitasAutomaticaAgua: [null],
      comunicacaoVentilacao: [null],
      esgotoAguas: [null],
      paredesPavimentos: [null],
      zonasDestinadas: [null],
      instalacoesFrigorificas: [null],
      sectoresLimpos: [null],
      pisosParedes: [null],
      pisosResistentes: [null],
      paredesInteriores: [null],
      paredes3metros: [null],
      unioesParedes: [null],
      ventilacoesNecessarias: [null],
      iluminacao: [null],
      aguaPotavel: [null],
      distribuicaoAgua: [null],
      redeDistribuicao: [null],
      redeEsgotos: [null],
      maximoHigieneSeguranca: [null],
      equipamentoUtensilios: [null],
      equipamentoPrimeirosSocorros: [null],
      recipientesLixo: [null],
      limpezaDiaria: [null],
      descreverIrregularidades: [null, [Validators.required, Validators.minLength(3)]],
      aptoAberto: [null, [Validators.required]],
      comDeficiencias: [null, [Validators.required]],
      recomendacoes: [null],
      prazo: new FormControl({ value: null, disabled: true }),
      documental: [null],
      membrosEquipaVistoria: this._fb.array([]),
    });
  }

  /**
   * Verifica se todas as opcoes de uma auto-vistoria estao como true.
   * Se a categoria for comercial, verifica se todas as opcoes de comecialidade estao como true.
   * Se a categoria for diferente de comercial, verifica se todas as opcoes de comecialidade e sanitas automaticas estao como true.
   * @return boolean - True se todas as opcoes estiverem como true, false caso contrario.
   */
  private isAllOptionsTrue(): boolean {
    if (this.categoria === Categoria.comercial) {
      return this.autoVistoriaForm.get('legislacaoUrbanistica')?.value &&
        this.autoVistoriaForm.get('accessoEstrada')?.value &&
        this.autoVistoriaForm.get('escoamentoAguas')?.value &&
        this.autoVistoriaForm.get('alimentacaoEnergia')?.value &&
        this.autoVistoriaForm.get('tipoEletricidade')?.value &&

        this.autoVistoriaForm.get('seperadosSexo')?.value &&
        this.autoVistoriaForm.get('lavatoriosComEspelho')?.value &&
        this.autoVistoriaForm.get('comunicacaoVentilacao')?.value &&
        this.autoVistoriaForm.get('esgotoAguas')?.value &&
        this.autoVistoriaForm.get('paredesPavimentos')?.value &&
        this.autoVistoriaForm.get('zonasDestinadas')?.value &&
        this.autoVistoriaForm.get('instalacoesFrigorificas')?.value &&
        this.autoVistoriaForm.get('sectoresLimpos')?.value &&
        this.autoVistoriaForm.get('pisosParedes')?.value &&
        this.autoVistoriaForm.get('pisosResistentes')?.value &&
        this.autoVistoriaForm.get('paredesInteriores')?.value &&
        this.autoVistoriaForm.get('paredes3metros')?.value &&
        this.autoVistoriaForm.get('unioesParedes')?.value &&
        this.autoVistoriaForm.get('iluminacao')?.value &&
        this.autoVistoriaForm.get('aguaPotavel')?.value &&
        this.autoVistoriaForm.get('distribuicaoAgua')?.value &&
        this.autoVistoriaForm.get('redeDistribuicao')?.value &&
        this.autoVistoriaForm.get('redeEsgotos')?.value &&
        this.autoVistoriaForm.get('equipamentoUtensilios')?.value &&
        this.autoVistoriaForm.get('equipamentoPrimeirosSocorros')?.value &&
        this.autoVistoriaForm.get('recipientesLixo')?.value &&
        this.autoVistoriaForm.get('limpezaDiaria')?.value
    } else {
      return this.autoVistoriaForm.get('legislacaoUrbanistica')?.value &&
        this.autoVistoriaForm.get('accessoEstrada')?.value &&
        this.autoVistoriaForm.get('escoamentoAguas')?.value &&
        this.autoVistoriaForm.get('alimentacaoEnergia')?.value &&
        this.autoVistoriaForm.get('tipoEletricidade')?.value &&

        this.autoVistoriaForm.get('seperadosSexo')?.value &&
        this.autoVistoriaForm.get('lavatoriosComEspelho')?.value &&
        this.autoVistoriaForm.get('sanitasAutomaticaAgua')?.value &&
        this.autoVistoriaForm.get('comunicacaoVentilacao')?.value &&
        this.autoVistoriaForm.get('esgotoAguas')?.value &&
        this.autoVistoriaForm.get('paredesPavimentos')?.value &&
        this.autoVistoriaForm.get('pisosParedes')?.value &&
        this.autoVistoriaForm.get('paredesInteriores')?.value &&
        this.autoVistoriaForm.get('paredes3metros')?.value &&
        this.autoVistoriaForm.get('ventilacoesNecessarias')?.value &&
        this.autoVistoriaForm.get('iluminacao')?.value &&
        this.autoVistoriaForm.get('aguaPotavel')?.value &&
        this.autoVistoriaForm.get('distribuicaoAgua')?.value &&
        this.autoVistoriaForm.get('redeDistribuicao')?.value &&
        this.autoVistoriaForm.get('redeEsgotos')?.value &&
        this.autoVistoriaForm.get('maximoHigieneSeguranca')?.value &&
        this.autoVistoriaForm.get('equipamentoPrimeirosSocorros')?.value &&
        this.autoVistoriaForm.get('recipientesLixo')?.value &&
        this.autoVistoriaForm.get('zonasDestinadas')?.value &&
        this.autoVistoriaForm.get('instalacoesFrigorificas')?.value &&
        this.autoVistoriaForm.get('sectoresLimpos')?.value &&
        this.autoVistoriaForm.get('pisosResistentes')?.value &&
        this.autoVistoriaForm.get('unioesParedes')?.value &&
        this.autoVistoriaForm.get('equipamentoUtensilios')?.value &&
        this.autoVistoriaForm.get('limpezaDiaria')?.value
    }
  }

  private createParticipanteForm(): FormGroup {
    return this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      areaRepresentante: [null, [Validators.required, Validators.minLength(3)]],
      cargo: [null, [Validators.required, Validators.minLength(3)]],
      tipoDocumento: [null, Validators.required],
      numeroDocumento: [null, Validators.required],
      telemovel: [null, Validators.required],
    });
  }

  onUpload(event: any, arg: string) {
    if (event.originalEvent.body) {
      this.uploadedFiles = [...this.uploadedFiles, ...event.originalEvent.body];
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Sucesso',
      detail: 'Arquivo carregado com sucesso!'
    });
  }

  addParticipanteForm(): void {
    this.membrosEquipaVistoria.push(this.createParticipanteForm());
  }

  removeParticipanteForm(index: number): void {
    this.membrosEquipaVistoria.removeAt(index);
  }

  get membrosEquipaVistoria(): FormArray {
    return this.autoVistoriaForm.get('membrosEquipaVistoria') as FormArray;
  }

  private mapAutoVistoriaForm(aplicanteData: Aplicante, pedidoVistoria: PedidoVistoria): void {
    this.autoVistoriaForm.patchValue({
      numeroProcesso: aplicanteData.numero,
      local: {
        local: pedidoVistoria.localEstabelecimento.local,
        aldeia: pedidoVistoria.localEstabelecimento.aldeia.id,
        suco: pedidoVistoria.localEstabelecimento.aldeia.suco.nome,
        postoAdministrativo: pedidoVistoria.localEstabelecimento.aldeia.suco.postoAdministrativo.nome,
        municipio: pedidoVistoria.localEstabelecimento.aldeia.suco.postoAdministrativo.municipio.nome,
      },
    });
  }

  private mapRequerenteForm(empresa: Empresa): void {
    this.autoVistoriaForm.patchValue({
      requerente: {
        denominacaoSocial: empresa.nome,
        numeroRegistoComercial: empresa.numeroRegistoComercial,
        sede: {
          local: empresa.sede.local,
          aldeia: empresa.sede.aldeia.id,
          suco: empresa.sede.aldeia.suco.nome,
          postoAdministrativo: empresa.sede.aldeia.suco.postoAdministrativo.nome,
          municipio: empresa.sede.aldeia.suco.postoAdministrativo.municipio.nome
        },
        nif: empresa.nif,
        gerente: empresa.gerente.nome,
        telefone: empresa.gerente.telefone,
        email: empresa.gerente.email,
        nomeRepresentante: empresa.representante.nome,
        pai: empresa.representante.pai,
        mae: empresa.representante.mae,
        dataNascimento: new Date(empresa.representante.dataNascimento),
        estadoCivil: empresa.representante.estadoCivil,
        nacionalidade: empresa.representante.nacionalidade,
        naturalidade: empresa.representante.naturalidade,
        tipoDocumento: empresa.representante.tipoDocumento,
        numeroDocumento: empresa.representante.numeroDocumento,
        residencia: {
          local: empresa.representante.morada.local,
          aldeia: empresa.representante.morada.aldeia.id,
          suco: empresa.representante.morada.aldeia.suco.nome,
          postoAdministrativo: empresa.representante.morada.aldeia.suco.postoAdministrativo.nome,
          municipio: empresa.representante.morada.aldeia.suco.postoAdministrativo.municipio.nome
        },
      },
      nomeAtuante: empresa.nome,
    });
  }
}
