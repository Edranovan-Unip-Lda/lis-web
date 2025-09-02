import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-application-form',
  imports: [CommonModule, ReactiveFormsModule, SelectModule, ButtonModule, StepperModule],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.scss'
})
export class ApplicationFormComponent {
  loading = false;
  applicationForm: FormGroup;
  applicationTypes: any[] = [
    {
      name: 'Inscrição no Cadastro',
      value: 'Inscrição no Cadastro'
    },
    {
      name: 'Licenca para Exercicio de Atividade',
      value: 'Licenca para Exercicio de Atividade'
    }
  ];
  categoryTpes: any[] = [
    {
      name: 'Comercial',
      value: 'Comercial'
    },
    {
      name: 'Industrial',
      value: 'Industrial'
    }
  ];

  constructor(
    private _fb: FormBuilder,
    private route: Router
  ) {
    this.applicationForm = this._fb.group({
      applicationType: [null],
      categoryType: [null],
    });
  }

  create(form: FormGroup) {
    switch (form.value.applicationType.value) {
      case 'Inscrição no Cadastro':
        this.route.navigateByUrl('/application/cadastro/1')
        break;

      case 'Licenca para Exercicio de Atividade':
        this.route.navigateByUrl('/application/atividade/1')
        break;
    }

  }
}
