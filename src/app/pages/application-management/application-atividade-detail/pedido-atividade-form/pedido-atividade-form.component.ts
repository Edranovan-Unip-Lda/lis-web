import { Aldeia } from '@/core/models/data-master.model';
import { Aplicante } from '@/core/models/entities.model';
import { Categoria } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { stateOptions, tipoPedidoAtividadeComercialOptions, tipoPedidoAtividadeIndustrialOptions } from '@/core/utils/global-function';
import { Component, Input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select, SelectFilterEvent } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-pedido-atividade-form',
  imports: [ReactiveFormsModule, Select, SelectButton, InputText, Textarea, Button],
  templateUrl: './pedido-atividade-form.component.html',
  styleUrl: './pedido-atividade-form.component.scss'
})
export class PedidoAtividadeFormComponent {
  @Input() aplicanteData!: Aplicante;
  requestForm!: FormGroup;
  tipoPedidoAtividadeComercialOpts = tipoPedidoAtividadeComercialOptions;
  tipoPedidoAtividadeIndustrialOpts = tipoPedidoAtividadeIndustrialOptions;
  @Input() listaAldeia: any[] = [];
  @Input() listaGrupoAtividade: any[] = [];
  originalAldeias: any[] = [];
  listaAldeiaEmpresa: any[] = [];
  listaAldeiaRepresentante: any[] = [];
  listaAldeiaGerente: any[] = [];

  stateOpts = stateOptions;
  dataSent = output<string>();

  constructor(
    private _fb: FormBuilder,
    private dataMasterService: DataMasterService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.copyAldeiaList(this.listaAldeia);
  }

  aldeiaOnChange(event: any, controlName: string): void {
    if (event.value.id) {
      const selectedItem = event.value.id;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.requestForm.get(controlName)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.requestForm.get('sede')?.patchValue({
        municipio: null,
        postoAdministrativo: null,
        suco: null
      });
    }
  }

  aldeiaNestedOnChange(event: any, parentControlName: string, childControlName: string): void {
    if (event.value.id) {
      const selectedItem = event.value.id;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.requestForm.get(parentControlName)?.get(childControlName)?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.requestForm.get(parentControlName)?.get(childControlName)?.patchValue({
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
          this.listaAldeiaEmpresa = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaEmpresa = [...this.originalAldeias];
    }
  }

  representanteAldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaRepresentante = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaRepresentante = [...this.originalAldeias];
    }
  }

  gerenteAldeiaFilter(event: SelectFilterEvent) {
    const query = event.filter?.trim();
    if (query && query.length) {
      this.dataMasterService.searchAldeiasByNome(query)
        .subscribe(resp => {
          this.listaAldeiaGerente = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeiaGerente = [...this.originalAldeias];
    }
  }


  onPanelHide() {
    this.listaAldeia = [...this.originalAldeias];
  }

  tipoAtividadeChange(event: any): void {
    this.requestForm.get('risco')?.setValue(event.value.tipoRisco);
  }

  submit(): void {
    this.dataSent.emit('Hello from child!');
  }


  private initForm(): void {
    this.requestForm = this._fb.group({
      tipo: [null, [Validators.required]],
      nomeEmpresa: [null],
      empresaNumeroRegistoComercial: [null],
      empresaSede: this._fb.group({
        local: [null],
        aldeia: [null],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      tipoAtividade: [null],
      risco: new FormControl({ value: null, disabled: true }),
      estatutoSociedadeComercial: [null],
      empresaNif: [null],
      representante: this._fb.group({
        nome: [null],
        nacionalidade: [null],
        naturalidade: [null],
        morada: this._fb.group({
          local: [null],
          aldeia: [null],
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
        telefone: [null],
        email: [null],
      }),
      gerente: this._fb.group({
        nome: [null],
        estadoCivil: [null],
        nacionalidade: [null],
        naturalidade: [null],
        morada: this._fb.group({
          local: [null],
          aldeia: [null],
          suco: new FormControl({ value: null, disabled: true }),
          postoAdministrativo: new FormControl({ value: null, disabled: true }),
          municipio: new FormControl({ value: null, disabled: true }),
        }),
        telefone: [null],
        email: [null],
      }),
      planta: [null],
      documentoPropriedade: [null],
      documentoImovel: [null],
      contratoArrendamento: [null],
      planoEmergencia: [null],
      estudoAmbiental: [null],
      numEmpregosCriados: [null, [Validators.min(0)]],
      numEmpregadosCriar: [null, [Validators.min(0)]],
      reciboPagamento: [null],
      outrosDocumentos: [null]
    });
  }

  tipoPedidoOpts(categoria: Categoria): any[] {
    return categoria === Categoria.comercial ? tipoPedidoAtividadeComercialOptions : tipoPedidoAtividadeIndustrialOptions;
  }

  copyAldeiaList(aldeias: Aldeia[]) {
    const copy = () => [...aldeias];
    [
      this.originalAldeias,
      this.listaAldeiaEmpresa,
      this.listaAldeiaRepresentante,
      this.listaAldeiaGerente
    ] = [copy(), copy(), copy(), copy()];
  }


}
