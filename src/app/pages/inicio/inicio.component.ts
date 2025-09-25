import { Documento, Empresa } from '@/core/models/entities.model';
import { AplicanteType, Categoria } from '@/core/models/enums';
import { DocumentosService } from '@/core/services/documentos.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { applicationTypesOptions, categoryTpesOptions } from '@/core/utils/global-function';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-inicio',
  imports: [RouterModule, DialogModule, ButtonModule, ReactiveFormsModule, SelectModule, DatePipe, TitleCasePipe, CurrencyPipe, Toast],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
  providers: [MessageService]
})
export class InicioComponent implements OnInit {
  visible = false;
  applicationForm: FormGroup;
  loading = false;
  comercial = Categoria.comercial;
  industrial = Categoria.industrial;
  empresa!: Empresa;

  applicationTypes: any[] = applicationTypesOptions
  categoryTpes: any[] = categoryTpesOptions;
  loadingDownloadButtons = new Set<string>();

  constructor(
    private _fb: FormBuilder,
    private route: Router,
    private empresaService: EmpresaService,
    private router: ActivatedRoute,
    private documentoService: DocumentosService,
    private messageService: MessageService,
  ) {
    this.applicationForm = this._fb.group({
      tipo: [null, [Validators.required]],
      categoria: [null, [Validators.required]],
    });

    // this.empresa = this.authService.currentUserValue.empresa;
  }

  ngOnInit(): void {
    this.empresa = this.router.snapshot.data['empresaResolver'];
  }

  create(form: FormGroup) {
    this.loading = true;
    let formData = {
      tipo: form.value.tipo.value,
      categoria: form.value.categoria.value,
      empresa: this.empresa
    };

    this.empresaService.createAplicante(this.empresa.id, formData).subscribe({
      next: (response) => {
        this.visible = false;
        this.loading = false;
        this.applicationForm.reset();

        if (response.tipo === AplicanteType.licenca) {
          this.route.navigate(['/application/atividade', response.id], {
            queryParams: {
              categoria: response.categoria,
              tipo: response.tipo
            }
          });
        } else {
          this.route.navigate(['/application/cadastro', response.id], {
            queryParams: {
              categoria: response.categoria,
              tipo: response.tipo
            }
          });
        }
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

}
