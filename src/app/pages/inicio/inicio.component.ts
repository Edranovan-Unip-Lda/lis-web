import { Empresa } from '@/core/models/empresa/empresa';
import { AplicanteType, Categoria } from '@/core/models/enums';
import { AuthenticationService } from '@/core/services';
import { EmpresaService } from '@/core/services/empresa.service';
import { applicationTypesOptions, categoryTpesOptions } from '@/core/utils/global-function';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-inicio',
  imports: [RouterModule, DialogModule, ButtonModule, ReactiveFormsModule, SelectModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {
  visible = false;
  applicationForm: FormGroup;
  loading = false;
  comercial = Categoria.comercial;
  industrial = Categoria.industrial;
  empresa: Empresa;

  applicationTypes: any[] = applicationTypesOptions
  categoryTpes: any[] = categoryTpesOptions

  constructor(
    private _fb: FormBuilder,
    private route: Router,
    private empresaService: EmpresaService,
    private authService: AuthenticationService,
  ) {
    this.applicationForm = this._fb.group({
      tipo: [null, [Validators.required]],
      categoria: [null, [Validators.required]],
    });

    this.empresa = this.authService.currentUserValue.empresa;
  }

  create(form: FormGroup) {
    this.loading = true;
    let formData = {
      tipo: form.value.tipo.value,
      categoria: form.value.categoria.value,
      empresa: this.empresa
    };
    console.log(formData);
    console.log(formData.tipo);

    this.empresaService.createAplicante(this.empresa.id, formData).subscribe({
      next: (response) => {
        console.log('Aplicante criado com sucesso:', response);
        this.visible = false;
        this.loading = false;
        this.applicationForm.reset();

        this.route.navigate(['/application', response.id], {
          queryParams: {
            categoria: response.categoria,
            tipo: response.tipo
          }
        });
      },
      error: (error) => {
        this.visible = false;
        this.loading = false;
        console.error('Erro ao criar aplicante:', error);
      }
    });
  }

  showDialog(categoryTpe: any) {
    this.applicationForm.reset();
    this.applicationForm.patchValue({
      categoria: this.categoryTpes.find(type => type.value === categoryTpe)
    });
    this.visible = true;
  }

}
