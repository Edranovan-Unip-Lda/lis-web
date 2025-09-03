import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante, Documento, PedidoVistoria } from '@/core/models/entities.model';
import { AplicanteStatus, Categoria } from '@/core/models/enums';
import { AuthenticationService, DataMasterService } from '@/core/services';
import { PedidoService } from '@/core/services/pedido.service';
import { stateOptions, tipoAreaRepresentanteComercial, tipoAreaRepresentanteIndustrial, tipoDocumentoOptions } from '@/core/utils/global-function';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { Select, SelectFilterEvent } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auto-vistoria',
  imports: [ReactiveFormsModule, SelectButton, Textarea, DatePicker, FileUpload, InputText, Select, Button, Toast],
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

  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private pedidoService: PedidoService,
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
        break;
      case Categoria.industrial:
        this.tipoAreaRepresentanteOpts = tipoAreaRepresentanteIndustrial;
        break;
    }

    this.addParticipanteForm();
    this.uploadUrl.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);
  }

  save(form: FormGroup) {
    if (form.valid) {
      this.loading = true;
      const formValue = {
        ...form.getRawValue(),
        documentos: this.uploadedFiles,
        local: {
          ...form.value.local,
          aldeia: {
            id: form.value.local.aldeia
          }
        },
        requerente: {
          ...form.value.requerente,
          sede: {
            ...form.value.requerente.sede,
            aldeia: {
              id: form.value.requerente.sede.aldeia
            }
          },
          postoAdministrativo: {
            id: form.value.requerente.postoAdministrativo
          },
          residencia: {
            ...form.value.requerente.residencia,
            aldeia: {
              id: form.value.requerente.residencia.aldeia
            }
          }
        }
      };
      formValue.documentos = this.uploadedFiles;

      this.pedidoService.saveAutoVistoria(this.pedidoVistoria.id, formValue).subscribe({
        next: response => {
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

  downloadFile(file: Documento) {
    this.downloadLoading = true;
    // this.pedidoService.downloadRecibo(this.aplicanteData.id, this.pedidoId, this.faturaId, file.id).subscribe({
    //   next: (response) => {
    //     const url = window.URL.createObjectURL(response);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = file.nome;
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     this.messageService.add({
    //       severity: 'info',
    //       summary: 'Success',
    //       detail: 'Arquivo descarregado com sucesso!'
    //     });
    //   },
    //   error: error => {
    //     this.downloadLoading = false;
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Erro',
    //       detail: 'Falha no download do arquivo!'
    //     });
    //   },
    //   complete: () => {
    //     this.downloadLoading = false;
    //   }
    // });
  }

  removeFile(file: Documento) {
    const index = this.uploadedFiles.indexOf(file);
    if (index !== -1) {
      this.uploadedFiles.splice(index, 1);
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


  classeAtividadeChange(event: any): void {
    this.autoVistoriaForm.get('requerente')?.get('classeAtividadeCodigo')?.setValue(event.value.descricao);
  }

  private initForm() {
    this.autoVistoriaForm = this._fb.group({
      numeroProcesso: ['372932323'],
      dataHora: [null],
      local: this._fb.group({
        local: ['Rua de Teste'],
        aldeia: [null],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      funcionario: {
        id: this.authService.currentUserValue.id,
      },
      requerente: this._fb.group({
        denominacaoSocial: ['Edranovan Unipes, Lda'],
        numeroRegistoComercial: ['83929323'],
        sede: this._fb.group({
          local: ['Avenida de Teste, n. 23'],
          aldeia: [null],
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
        nif: ['9493044'],
        gerente: ['Mario da Silva'],
        telefone: ['4123-1234'],
        email: ['mario@mail.com'],
        classeAtividade: [null],
        classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
        nomeRepresentante: ['Abrao da Silva'],
        pai: ['Noel da Silva'],
        mae: ['Joana da Silva'],
        dataNascimento: [null],
        estadoCivil: ['Solteiro'],
        nacionalidade: ['Timorense'],
        naturalidade: ['Dili'],
        postoAdministrativo: [null],
        municipio: new FormControl({ value: null, disabled: true }),
        tipoDocumento: [null],
        numeroDocumento: ['00328383'],
        residencia: this._fb.group({
          local: ['Beco de Teste, n. 23'],
          aldeia: [null],
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
      }),
      nomeAtuante: ['Bruno da Alves'],
      legislacaoUrbanistica: [true],
      accessoEstrada: [true],
      escoamentoAguas: [true],
      alimentacaoEnergia: [true],
      seperadosSexo: [true],
      lavatoriosComEspelho: [true],
      sanitasAutomaticaAgua: [true],
      comunicacaoVentilacao: [true],
      esgotoAguas: [true],
      paredesPavimentos: [true],
      zonasDestinadas: [true],
      instalacoesFrigorificas: [true],
      sectoresLimpos: [true],
      pisosParedes: [true],
      pisosResistentes: [true],
      paredesInteriores: [true],
      paredes3metros: [true],
      unioesParedes: [true],
      ventilacoesNecessarias: [true],
      iluminacao: [true],
      aguaPotavel: [true],
      distribuicaoAgua: [true],
      redeDistribuicao: [true],
      redeEsgotos: [true],
      equipamentoUtensilios: [true],
      equipamentoPrimeirosSocorros: [true],
      recipientesLixo: [true],
      limpezaDiaria: [true],
      descreverIrregularidades: ['fdjfdnfjfndjfndjfnkjdfndjfnjdfn'],
      aptoAberto: [true],
      comDeficiencias: [false],
      recomendacoes: [null],
      prazo: [30],
      documentos: [null],
      membrosEquipaVistoria: this._fb.array([]),
    });
    // this.autoVistoriaForm = this._fb.group({
    //   numeroProcesso: [null],
    //   dataHora: [null],
    //   local: this._fb.group({
    //     local: [null],
    //     aldeia: [null],
    //     suco: new FormControl({ value: null, disabled: true }),
    //     postoAdministrativo: new FormControl({ value: null, disabled: true }),
    //     municipio: new FormControl({ value: null, disabled: true }),
    //   }),
    //   funcionario: {
    //   id: this.authService.currentUserValue.id,
    // },
    //   requerente: this._fb.group({
    //     denominacaoSocial: [null],
    //     numeroRegisto: [null],
    //     sede: this._fb.group({
    //       local: [null],
    //       aldeia: [null],
    //       suco: new FormControl({ value: null, disabled: true }),
    //       postoAdministrativo: new FormControl({ value: null, disabled: true }),
    //       municipio: new FormControl({ value: null, disabled: true }),
    //     }),
    //     nif: [null],
    //     gerente: [null],
    //     telefone: [null],
    //     email: [null],
    //     classeAtividade: [null],
    //     classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
    //     nomeRepresentante: [null],
    //     pai: [null],
    //     mae: [null],
    //     dataNascimento: [null],
    //     estadoCivil: [null],
    //     nacionalidade: [null],
    //     naturalidade: [null],
    //     postoAdministrativo: [null],
    //     municipio: new FormControl({ value: null, disabled: true }),
    //     tipoDocumento: [null],
    //     numeroDocumento: [null],
    //     residencia: this._fb.group({
    //       local: [null],
    //       aldeia: [null],
    //       suco: new FormControl({ value: null, disabled: true }),
    //       postoAdministrativo: new FormControl({ value: null, disabled: true }),
    //       municipio: new FormControl({ value: null, disabled: true }),
    //     }),
    //   }),
    //   nomeAtuante: [null],
    //   legislacaoUrbanistica: [null],
    //   accessoEstrada: [null],
    //   escoamentoAguas: [null],
    //   alimentacaoEnergia: [null],
    //   seperadosSexo: [null],
    //   lavatoriosComEspelho: [null],
    //   sanitasAutomaticaAgua: [null],
    //   comunicacaoVentilacao: [null],
    //   esgotoAguas: [null],
    //   paredesPavimentos: [null],
    //   zonasDestinadas: [null],
    //   instalacoesFrigorificas: [null],
    //   sectoresLimpos: [null],
    //   pisosParedes: [null],
    //   pisosResistentes: [null],
    //   paredesInteriores: [null],
    //   paredes3metros: [null],
    //   unioesParedes: [null],
    //   ventilacoesNecessarias: [null],
    //   iluminacao: [null],
    //   aguaPotavel: [null],
    //   distribuicaoAgua: [null],
    //   redeDistribuicao: [null],
    //   redeEsgotos: [null],
    //   equipamentoUtensilios: [null],
    //   equipamentoPrimeirosSocorros: [null],
    //   recipientesLixo: [null],
    //   limpezaDiaria: [null],
    //   descreverIrregularidades: [null],
    //   aptoAberto: [null],
    //   comDeficiencias: [null],
    //   recomendacoes: [null],
    //   prazo: [null],
    //   documental: [null],
    //   membrosEquipaVistoria: this._fb.array([]),
    // });
  }

  private createParticipanteForm(): FormGroup {
    return this._fb.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3)]],
      areaRepresentante: [null, [Validators.required, Validators.minLength(3)]],
      cargo: [null, [Validators.required, Validators.minLength(3)]],
    });
  }

  onUpload(event: any, arg: string) {
    if (event.originalEvent.body) {
      this.uploadedFiles = [...event.originalEvent.body];
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
}
