import { DataMasterService } from '@/core/services/data-master.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { LayoutService } from '@/layout/service/layout.service';
import { CommonModule } from "@angular/common";
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { InputText } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Ripple } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageModule } from 'primeng/message';

interface Notification {
    state: string,
    message: string,
    icon: string
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ButtonModule, RouterModule, FormsModule, InputText, Fluid, Ripple, PasswordModule, ReactiveFormsModule, SelectModule, InputMaskModule, MessageModule],
    templateUrl: './register.component.html',
})
export class Register {
    confirmed: boolean = false;
    municipios = [];
    postos = [];
    sucos = [];
    aldeias = [];

    layoutService = inject(LayoutService);
    empresaForm: FormGroup;
    loading = false;
    isSuccess = false;
    isError = false;
    emailVerification = 'test@mail.com';
    notification!: Notification;

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private dataMasterService: DataMasterService,
        private empresaService: EmpresaService,
    ) {
        this.empresaForm = this._fb.group({
            nome: [null, [Validators.required, Validators.minLength(3)]],
            nif: [null, [Validators.required]],
            sede: [null, [Validators.required]],
            municipio: [null],
            postoAdministrativo: [null],
            suco: [null],
            aldeia: [null, [Validators.required]],
            numeruRegisto: [null],
            telefone: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            gerente: [null, [Validators.required, Validators.minLength(3)]],
            password: [null],
        });
        this.municipios = this.route.snapshot.data['municipiosResolver']._embedded.municipios || [];
    }


    ngOnInit() {
        this.empresaForm.get('municipio')?.valueChanges.subscribe((selectedItem) => {
            if (selectedItem) {
                this.dataMasterService.getPostosByMunicipio(selectedItem.id).subscribe((postos) => {
                    this.postos = postos._embedded.postos || [];
                });
            }
        });

        this.empresaForm.get('postoAdministrativo')?.valueChanges.subscribe((selectedItem) => {
            if (selectedItem) {
                this.dataMasterService.getSucosByPosto(selectedItem.id).subscribe((sucos) => {
                    this.sucos = sucos._embedded.sucos || [];
                });
            }
        });

        this.empresaForm.get('suco')?.valueChanges.subscribe((selectedItem) => {
            if (selectedItem) {
                this.dataMasterService.getAldeiasBySuco(selectedItem.id).subscribe((aldeias) => {
                    this.aldeias = aldeias._embedded.aldeias || [];
                });
            }
        });
    }

    submit(form: FormGroup) {
        this.loading = true;
        if (this.empresaForm.valid) {
            const [firstName, ...rest] = form.value.gerente.split(' ');
            const formData = {
                nome: form.value.nome,
                nif: form.value.nif,
                utilizador: {
                    firstName: firstName,
                    lastName: rest.join(' '),
                    email: form.value.email,
                    username: form.value.email.split('@')[0],
                    password: form.value.password,
                },
                gerente: form.value.gerente,
                numeroRegistoComercial: form.value.numeruRegisto,
                telefone: form.value.telefone,
                sede: {
                    local: form.value.sede,
                    aldeia: form.value.aldeia,
                },
            };
            console.log(formData);

            this.empresaService.save(formData).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.isSuccess = true;
                    this.emailVerification = response.utilizador.email;
                    this.empresaForm.reset();
                    this.setNotification();
                },
                error: (error) => {
                    this.loading = false;
                    this.isError = true;
                    // this.empresaForm.reset();
                    // Handle error response
                    console.error('Error saving empresa:', error);
                }
            });

        } else {
            this.loading = false;
            // Handle form errors
            console.error('Form is invalid');
        }
    }

    setNotification(resend?: boolean): void {
        this.notification = {} as Notification;
        if (resend) {
            this.notification.icon = 'bi bi-info-circle';
            this.notification.state = 'info';
            this.notification.message = `O email de verificação já foi reenviado. Por favor, verifique a sua caixa de entrada.`;
        } else {
            this.notification.icon = 'bi bi-check-circle'
            this.notification.state = 'success';
            this.notification.message = `Registo concluído com sucesso. Verifique o seu email ${this.emailVerification} para ativar a conta.`;
        }
    }
}
