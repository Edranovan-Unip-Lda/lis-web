import { Aldeia } from '@/core/models/data-master.model';
import { TipoPropriedade } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { tipoDocumentoOptions, tipoPropriedadeOptions } from '@/core/utils/global-function';
import { LayoutService } from '@/layout/service/layout.service';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Ripple } from 'primeng/ripple';
import { Select, SelectFilterEvent } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tooltip } from 'primeng/tooltip';
import { distinctUntilChanged } from 'rxjs';


interface Notification {
    state: string,
    message: string,
    icon: string
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, RouterLink, InputText, Fluid, Ripple, Password, ReactiveFormsModule, Select, Message, StepperModule, DatePicker, InputGroup, InputGroupAddonModule, InputNumber, Divider, Tooltip, DatePipe],
    templateUrl: './register.component.html',
})
export class Register {
    confirmed: boolean = false;
    municipios = [];
    postos = [];
    sucos = [];
    aldeias: any = [];

    layoutService = inject(LayoutService);
    empresaForm: FormGroup;

    loading = false;
    isSuccess = false;
    isError = false;
    emailVerification = 'test@mail.com';
    notification!: Notification;
    originalAldeias: any[] = [];
    tipoProriedadeOpts = tipoPropriedadeOptions;
    tipoDocumentoOpts = tipoDocumentoOptions;
    showAddBtnAcionistas = false;

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private dataMasterService: DataMasterService,
        private empresaService: EmpresaService,
    ) {
        this.empresaForm = this._fb.group({
            nome: ['Mr. Robot Lda', [Validators.required, Validators.minLength(3)]],
            nif: ['8392383', [Validators.required]],
            sede: ['Avenida Prest. António de Sousa', [Validators.required]],
            municipio: new FormControl({ value: null, disabled: true }),
            postoAdministrativo: new FormControl({ value: null, disabled: true }),
            suco: new FormControl({ value: null, disabled: true }),
            aldeia: [null, [Validators.required]],
            numeroRegistoComercial: ['832932833', [Validators.required]],
            capitalSocial: [null, [Validators.required]],
            dataRegisto: [null, [Validators.required]],
            tipoPropriedade: [null, [Validators.required]],
            acionistas: this._fb.array([]),
            utilizador: this._fb.group({
                gerente: ['Geovannio', [Validators.required, Validators.minLength(3)]],
                email: ['gvinhas@tic.gov.tl', [Validators.required, Validators.email]],
                password: ['lospalos', [Validators.required]],
            })
            // nome: ['null', [Validators.required, Validators.minLength(3)]],
            // nif: [null, [Validators.required]],
            // sede: [null, [Validators.required]],
            // municipio: new FormControl({ value: null, disabled: true }),
            // postoAdministrativo: new FormControl({ value: null, disabled: true }),
            // suco: new FormControl({ value: null, disabled: true }),
            // aldeia: [null, [Validators.required]],
            // numeruRegisto: [null, [Validators.required]],
            // capitalSocial: [null, [Validators.required]],
            // dataRegisto: [null, [Validators.required]],
            // tipoPropriedade: [null, [Validators.required]],
            // acionistas: this._fb.array([]),
            // utilizador: this._fb.group({
            //     gerente: [null, [Validators.required, Validators.minLength(3)]],
            //     email: [null, [Validators.required, Validators.email]],
            //     password: [null],
            // })
        });

        this.aldeias = this.route.snapshot.data['aldeiasResolver']._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
        this.originalAldeias = [...this.aldeias];
    }


    ngOnInit() {
        this.empresaForm.get('aldeia')?.valueChanges.subscribe((selectedItem) => {
            if (selectedItem) {
                this.dataMasterService.getAldeiaById(selectedItem.value).subscribe((aldeia: Aldeia) => {
                    this.empresaForm.patchValue({
                        municipio: aldeia.suco.postoAdministrativo.municipio.nome,
                        postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
                        suco: aldeia.suco.nome
                    });

                });
            } else {
                this.empresaForm.patchValue({
                    municipio: null,
                    postoAdministrativo: null,
                    suco: null
                });
            }
        });


        this.empresaForm.get('tipoPropriedade')?.valueChanges.subscribe({
            next: (value) => {
                if (!value) {
                    this.showAddBtnAcionistas = false;
                    this.acionistasArray.clear();
                    return;
                }
                switch (value.value) {
                    case TipoPropriedade.individual:
                        this.showAddBtnAcionistas = false;
                        this.acionistasArray.clear();
                        this.acionistasArray.push(this.generateAcionistaForm());
                        break;

                    case TipoPropriedade.sociedade:
                        this.showAddBtnAcionistas = true;
                        this.acionistasArray.clear();
                        this.acionistasArray.push(this.generateAcionistaForm());
                        break;
                    default:
                        this.showAddBtnAcionistas = false;
                        this.acionistasArray.clear();
                        break;
                }

            }
        });
    }


    aldeiaFilter(event: SelectFilterEvent) {
        const query = event.filter?.trim();
        if (query && query.length) {
            this.dataMasterService.searchAldeiasByNome(query)
                .subscribe(resp => {
                    this.aldeias = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
                    this.loading = false;
                });
        } else {
            // filter cleared — reset full list
            this.aldeias = [...this.originalAldeias];
        }
    }


    onPanelHide() {
        this.aldeias = [...this.originalAldeias];
    }

    submit(form: FormGroup) {
        this.loading = true;
        if (this.empresaForm.valid) {

            let formData = { ...form.value }
            formData.sede = {
                local: form.value.sede,
                aldeia: {
                    id: form.value.aldeia.value,
                    nome: form.value.aldeia.nome
                },
            };

            formData.gerente = form.value.utilizador.gerente;
            formData.tipoPropriedade = form.value.tipoPropriedade.value;
            formData.dataRegisto = this.formatDateForLocalDate(form.value.dataRegisto);
            formData.acionistas = form.value.acionistas.map((a: any) => {
                return {
                    nome: a.nome,
                    nif: a.nif,
                    tipoDocumento: a.tipoDocumento.value,
                    numeroDocumento: a.numeroDocumento,
                    telefone: a.telefone,
                    email: a.email,
                    acoes: a.acoes,
                }
            });
            const [firstName, ...rest] = form.value.utilizador.gerente.split(' ');
            formData.utilizador.firstName = firstName;
            formData.utilizador.lastName = rest.join(' ');
            formData.utilizador.username = form.value.utilizador.email.split('@')[0] + new Date().getUTCMilliseconds().toString();
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

    private setNotification(resend?: boolean): void {
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

    generateAcionistaForm() {
        return this._fb.group({
            nome: ['Antonio', [Validators.required, Validators.minLength(3)]],
            nif: ['83239239', [Validators.required]],
            tipoDocumento: [null, [Validators.required]],
            numeroDocumento: ['78833', [Validators.required]],
            telefone: ['8392393', [Validators.required]],
            email: ['gvinhas@tic.gov.tl', [Validators.required, Validators.email]],
            acoes: ['100', [Validators.required]],
            sectionTitle: [`Acionista n.º ${this.acionistasArray.length + 1}`]
        });
    }

    get acionistasArray(): FormArray {
        return this.empresaForm.get('acionistas') as FormArray;
    }

    addAcionistaForm() {
        this.acionistasArray.push(this.generateAcionistaForm());
    }

    removeAcionistaForm(index: number) {
        if (this.acionistasArray.length > 1) {
            this.acionistasArray.removeAt(index);
        }
    }

    private formatDateForLocalDate(date: Date): string {
        // Adjust for timezone offset so that local date is preserved
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const corrected = new Date(date.getTime() - offsetMs);

        return corrected.toISOString().split('T')[0];
    }
}
