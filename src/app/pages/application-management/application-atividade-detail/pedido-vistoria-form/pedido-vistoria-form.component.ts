import { Aldeia } from '@/core/models/data-master.model';
import { DataMasterService } from '@/core/services/data-master.service';
import { caraterizacaEstabelecimentoOptions, mapToGrupoAtividade, mapToIdAndNome, nivelRiscoOptions, tipoAtoOptions, tipoEmpresaOptions, tipoPedidoVistoriaOptions } from '@/core/utils/global-function';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select, SelectFilterEvent } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-pedido-vistoria-form',
  imports: [Select, ReactiveFormsModule, InputText, Textarea, Button],
  templateUrl: './pedido-vistoria-form.component.html',
  styleUrl: './pedido-vistoria-form.component.scss'
})
export class PedidoVistoriaFormComponent {
  vistoriaComercialRequestForm!: FormGroup;

  tipoEmpresaOpts = tipoEmpresaOptions;
  tipoEstabelecimentoOpts = caraterizacaEstabelecimentoOptions;
  nivelRiscoOpts = nivelRiscoOptions;
  atividadesOpts = tipoAtoOptions;
  tipoPedidoVistoriaOpts = tipoPedidoVistoriaOptions;
  listaAldeia: any[] = [];
  listaGrupoAtividade: any[] = [];
  listaClasseAtividade: any[] = [];
  originalAldeias: any = [];



  constructor(
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private dataMasterService: DataMasterService,
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.listaAldeia = mapToIdAndNome(this.route.snapshot.data['aldeiasResolver']._embedded.aldeias);
    this.listaGrupoAtividade = mapToGrupoAtividade(this.route.snapshot.data['grupoAtividadeResolver']._embedded.grupoAtividade);


  }

  submit(form: FormGroup): void {

  }

  aldeiaOnChange(event: any): void {
    if (event.value) {
      const selectedItem = event.value.id;

      this.dataMasterService.getAldeiaById(selectedItem).subscribe({
        next: (aldeia: Aldeia) => {
          this.vistoriaComercialRequestForm.get('localEstabelecimento')?.patchValue({
            municipio: aldeia.suco.postoAdministrativo.municipio.nome,
            postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
            suco: aldeia.suco.nome
          });
        }
      });
    } else {
      this.vistoriaComercialRequestForm.get('sede')?.patchValue({
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
          this.listaAldeia = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, id: a.id }));
          // this.loading = false;
        });
    } else {
      // filter cleared — reset full list
      this.listaAldeia = [...this.originalAldeias];
    }
  }

  onPanelHide() {
    this.listaAldeia = [...this.originalAldeias];
  }

  tipoAtividadeChange(event: any): void {
    const value = event.value;
    if (value) {
      this.vistoriaComercialRequestForm.get('grupoAtividadeCodigo')?.setValue(event.value.descricao);

      this.dataMasterService.getClassesByGrupoId(value.id).subscribe({
        next: response => this.listaClasseAtividade = response._embedded.classeAtividade
      });
    } else {
      this.vistoriaComercialRequestForm.get('grupoAtividadeCodigo')?.reset();
      this.listaClasseAtividade = [];
    }
  }

  atividadePrincipalChange(event: any): void {
    if (event.value) {
      this.vistoriaComercialRequestForm.get('classeAtividadeCodigo')?.patchValue(event.value.descricao);
      this.vistoriaComercialRequestForm.get('risco')?.setValue(event.value.tipoRisco);
    } else {
      this.vistoriaComercialRequestForm.get('classeAtividadeCodigo')?.reset();
      this.vistoriaComercialRequestForm.get('risco')?.reset();
    }
  }

  private initForm(): void {
    this.vistoriaComercialRequestForm = this._fb.group({
      tipoPedido: [null],
      empresa: this._fb.group({
        nome: [null],
        numeroRegisto: [null],
        sede: [null],
        nif: [null],
        gerente: [null],
        telefone: [null],
        telemovel: [null],
        email: [null],
      }),
      nomeEstabelecimento: [null],
      localEstabelecimento: this._fb.group({
        id: [null],
        local: [null, [Validators.required]],
        aldeia: [null, [Validators.required]],
        suco: new FormControl({ value: null, disabled: true }),
        postoAdministrativo: new FormControl({ value: null, disabled: true }),
        municipio: new FormControl({ value: null, disabled: true }),
      }),
      tipoEmpresa: [null],
      tipoEstabelecimento: [null],
      risco: new FormControl({ value: null, disabled: true }),
      atividade: [null, Validators.required],
      grupoAtividade: [null, Validators.required],
      grupoAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      classeAtividade: [null, Validators.required],
      classeAtividadeCodigo: new FormControl({ value: null, disabled: true }),
      alteracoes: [null],
      observacao: [null],
    });
  }
}
