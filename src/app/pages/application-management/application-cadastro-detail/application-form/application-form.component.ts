import { i18nOptions } from '@/core/i18n';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-application-form',
  imports: [CommonModule, ReactiveFormsModule, SelectModule, ButtonModule, StepperModule, TranslatePipe],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.scss'
})
export class ApplicationFormComponent {
  loading = false;
  applicationForm: FormGroup;
  // Values are the legacy routing keys used by create(); labels resolve from the enum dictionaries.
  applicationTypes: any[] = i18nOptions('enum.AplicanteType', [
    { key: 'CADASTRO', value: 'Inscrição no Cadastro' },
    { key: 'ATIVIDADE', value: 'Licenca para Exercicio de Atividade' }
  ]);
  categoryTpes: any[] = i18nOptions('enum.Categoria', [
    { key: 'COMERCIAL', value: 'Comercial' },
    { key: 'INDUSTRIAL', value: 'Industrial' }
  ]);

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
