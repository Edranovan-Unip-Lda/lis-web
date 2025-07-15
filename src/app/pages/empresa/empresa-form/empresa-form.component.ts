import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-empresa-form',
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, PasswordModule],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.scss'
})
export class EmpresaFormComponent {
  empresaForm: FormGroup;
  loading = false;
  municipios = [];
  postos = [];
  sucos = [];
  aldeias = [];

  constructor(
    private _fb: FormBuilder,
  ) {
    this.empresaForm = this._fb.group({
      nome: [null],
      sede: [null],
      municipio: [null],
      posto: [null],
      suco: [null],
      aldeia: [null],
      nif: [null],
      numeruRegisto: [null],
      telemovel: [null],
      telefone: [null],
      email: [null],
      gerente: [null],
      password: [null],
      confirmPassword: [null]
    })
  }
}
