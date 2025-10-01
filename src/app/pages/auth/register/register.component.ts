import { Aldeia, Role } from '@/core/models/data-master.model';
import { TipoPropriedade } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { maxFileSizeUpload, tipoDocumentoOptions, tipoPropriedadeOptions, tipoRelacaoFamiliaOptions } from '@/core/utils/global-function';
import { LayoutService } from '@/layout/service/layout.service';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Ripple } from 'primeng/ripple';
import { Select, SelectChangeEvent, SelectFilterEvent } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { Tooltip } from 'primeng/tooltip';


interface Notification {
    state: string,
    message: string,
    icon: string
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, FileUpload, RouterLink, InputText, Fluid, Ripple, Password, ReactiveFormsModule, Select, Message, StepperModule, DatePicker, InputGroup, InputGroupAddonModule, InputNumber, Divider, Tooltip, DatePipe],
    templateUrl: './register.component.html',
})
export class Register {
    confirmed: boolean = false;
    municipios = [];
    postos = [];
    sucos = [];
    aldeias: any = [];
    listaSociedadeComercial = [];

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
    tipoRelacaoFamiliaOpts = tipoRelacaoFamiliaOptions;
    showAddBtnAcionistas = false;
    selectedRole!: Role;
    listaAldeiaAcionista: any[][] = [];
    uploadedDocs: any[] = [];
    maxFileSize = maxFileSizeUpload;

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
            sociedadeComercial: [null, [Validators.required]],
            municipio: new FormControl({ value: null, disabled: true }),
            postoAdministrativo: new FormControl({ value: null, disabled: true }),
            suco: new FormControl({ value: null, disabled: true }),
            aldeia: [null, [Validators.required]],
            numeroRegistoComercial: [null, [Validators.required]],
            capitalSocial: [null, [Validators.required]],
            dataRegisto: [null, [Validators.required]],
            telefone: [null, [Validators.required]],
            telemovel: [null, [Validators.required]],
            tipoPropriedade: [null, [Validators.required]],
            acionistas: this._fb.array([]),
            totalTrabalhadores: [null],
            volumeNegocioAnual: [null],
            balancoTotalAnual: [null, [Validators.required]],
            utilizador: this._fb.group({
                gerente: [null, [Validators.required, Validators.minLength(3)]],
                email: [null, [Validators.required, Validators.email]],
                password: [null],
            })
        });

        this.aldeias = this.route.snapshot.data['aldeiasResolver']._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));

        this.listaSociedadeComercial = this.route.snapshot.data['listaSociedadeComercial']._embedded.sociedadeComercial.map((s: any) => ({ nome: s.nome, value: s.id }));
        this.originalAldeias = [...this.aldeias];
    }


    ngOnInit() {
        this.empresaForm.get('tipoPropriedade')?.valueChanges.subscribe({
            next: (value) => {
                if (!value) {
                    this.showAddBtnAcionistas = false;
                    this.acionistasArray.clear();
                    return;
                }
                switch (value.value) {
                    case TipoPropriedade.individual:
                        this.acionistasArray.clear();
                        this.showAddBtnAcionistas = false;
                        this.acionistasArray.push(this.generateAcionistaForm(true));
                        break;

                    case TipoPropriedade.sociedade:
                        this.acionistasArray.clear();
                        this.showAddBtnAcionistas = true;
                        this.acionistasArray.push(this.generateAcionistaForm(false));
                        break;
                    default:
                        this.showAddBtnAcionistas = false;
                        this.acionistasArray.clear();
                        break;
                }
                const idx = this.acionistasArray.length - 1;
                this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
            }
        });

        const roles: any[] = this.route.snapshot.data['roleListResolver']._embedded.roles;
        this.selectedRole = roles.find(r => r.name === 'ROLE_CLIENT')!;
    }

    aldeiaOnChange(event: SelectChangeEvent): void {
        if (event.value) {
            this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
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
            formData.sociedadeComercial = {
                id: formData.sociedadeComercial.value,
                nome: formData.sociedadeComercial.nome
            }

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
                    agregadoFamilia: a.agregadoFamilia,
                    relacaoFamilia: a.relacaoFamilia,
                    endereco: {
                        local: a.local,
                        aldeia: {
                            id: a.aldeia.value
                        }
                    }
                }
            });
            const [firstName, ...rest] = form.value.utilizador.gerente.split(' ');
            formData.utilizador.firstName = firstName;
            formData.utilizador.lastName = rest.join(' ');
            formData.utilizador.username = form.value.utilizador.email.split('@')[0] + new Date().getUTCMilliseconds().toString();
            formData.utilizador.role = this.selectedRole

            this.empresaService.save(formData, this.uploadedDocs).subscribe({
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

    /**
     * Generate a new form for a acionista.
     *
     * The form is a `FormGroup` containing the following fields:
     * - `nome`: string, required, minimum length 3
     * - `nif`: string, required
     * - `tipoDocumento`: string, required
     * - `numeroDocumento`: string, required, default value is '78833'
     * - `telefone`: string, required
     * - `email`: string, required, must be a valid email
     * - `acoes`: string, required, default value is '100'
     * - `sectionTitle`: string, required, default value is `Acionista n.º ${this.acionistasArray.length + 1}`
     *
     * @returns a new `FormGroup` for a acionista
     */

    generateAcionistaForm(isIndividual: boolean) {
        return this._fb.group({
            nome: [null, [Validators.required, Validators.minLength(3)]],
            nif: [null, [Validators.required]],
            tipoDocumento: [null, [Validators.required]],
            numeroDocumento: [, [Validators.required]],
            telefone: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            acoes: [isIndividual ? 100 : null, [Validators.required]],
            agregadoFamilia: [null, [Validators.required]],
            relacaoFamilia: [null, [Validators.required]],
            sectionTitle: [`Acionista n.º ${this.acionistasArray.length + 1}`],
            local: [null, [Validators.required]],
            municipio: new FormControl({ value: null, disabled: true }),
            postoAdministrativo: new FormControl({ value: null, disabled: true }),
            suco: new FormControl({ value: null, disabled: true }),
            aldeia: [null, [Validators.required]],
        });
    }

    get acionistasArray(): FormArray {
        return this.empresaForm.get('acionistas') as FormArray;
    }

    addAcionistaForm() {
        this.acionistasArray.push(this.generateAcionistaForm(false));
        const idx = this.acionistasArray.length - 1;
        this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
    }

    removeAcionistaForm(index: number) {
        if (this.acionistasArray.length > 1) {
            this.acionistasArray.removeAt(index);
        }
    }

    aldeiaAcionistaOnChange(event: SelectChangeEvent, index: number): void {
        if (event.value) {
            this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
                this.acionistasArray.controls.at(index)?.patchValue({
                    municipio: aldeia.suco.postoAdministrativo.municipio.nome,
                    postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
                    suco: aldeia.suco.nome
                });

            });
        } else {
            this.acionistasArray.controls.at(index)?.patchValue({
                municipio: null,
                postoAdministrativo: null,
                suco: null
            });
        }
    }

    aldeiaAcionistaFilter(event: any, index: number) {
        const query = event.filter?.trim();
        if (query && query.length) {
            this.dataMasterService.searchAldeiasByNome(query)
                .subscribe(resp => {
                    this.listaAldeiaAcionista[index] = resp._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
                    this.loading = false;
                });
        } else {
            // filter cleared — reset full list
            this.listaAldeiaAcionista[index] = [...this.originalAldeias];
        }
    }

    onPanelHideAcionista(index: number) {
        this.listaAldeiaAcionista[index] = [...this.originalAldeias];
    }

    onSelect(e: FileSelectEvent) {
        this.uploadedDocs = [...this.uploadedDocs, ...e.files];
    }

    onFileRemove(e: { file: any }) {
        const key = e.file.__key ?? `${e.file.name}-${e.file.size}-${e.file.lastModified}`;
        this.uploadedDocs = this.uploadedDocs.filter(f => (f.__key ?? `${f.name}-${f.size}-${f.lastModified}`) !== key);
    }

    // Fired when the "clear" button is pressed
    onFileClear() {
        this.uploadedDocs = [];
    }

    disableStepEmpresa(): boolean {
        return !!(
            this.empresaForm.get('nome')?.invalid ||
            this.empresaForm.get('sede')?.invalid ||
            this.empresaForm.get('sociedadeComercial')?.invalid ||
            this.empresaForm.get('aldeia')?.invalid ||
            this.empresaForm.get('nif')?.invalid ||
            this.empresaForm.get('numeroRegistoComercial')?.invalid ||
            this.empresaForm.get('capitalSocial')?.invalid ||
            this.empresaForm.get('dataRegisto')?.invalid
        );
    }

    disableStepProprietario(): boolean {
        return !!(
            this.empresaForm.get('tipoPropriedade')?.invalid ||
            this.acionistasArray.invalid);
    }

    disableStepConta(): boolean {
        return !!(
            this.empresaForm.get('utilizador.gerente')?.invalid ||
            this.empresaForm.get('utilizador.email')?.invalid ||
            this.empresaForm.get('utilizador.password')?.invalid);
    }

    private formatDateForLocalDate(date: Date): string {
        // Adjust for timezone offset so that local date is preserved
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const corrected = new Date(date.getTime() - offsetMs);

        return corrected.toISOString().split('T')[0];
    }

    bytesToMBs(value: number): string {
        if (!value && value !== 0) return '';
        const mb = value / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    }
}
