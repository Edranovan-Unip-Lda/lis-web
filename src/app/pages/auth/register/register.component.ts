import { Aldeia, Role } from '@/core/models/data-master.model';
import { RecaptchaAction, TipoNacionalidade, TipoPropriedade } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { estadoCivilOptions, maxFileSizeUpload, tipoDocumentoOptions, tipoNacionalidadeOptions, tipoPropriedadeOptions, tipoRelacaoFamiliaOptions, tipoRepresentante } from '@/core/utils/global-function';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReCaptchaV3Service, RecaptchaV3Module } from 'ng-recaptcha-2';
import { NgxPrintModule } from 'ngx-print';
import { Button } from 'primeng/button';
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
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Notification {
    state: string,
    message: string,
    icon: string
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [Button, FileUpload, RouterLink, InputText, Fluid, Ripple, Password, ReactiveFormsModule, Select, Message, StepperModule, DatePicker, InputGroup, InputGroupAddonModule, InputNumber, Divider, Tooltip, DatePipe, NgxPrintModule, CurrencyPipe, RecaptchaV3Module, DecimalPipe],
    templateUrl: './register.component.html',
})
export class Register {
    confirmed: boolean = false;
    municipios = [];
    postos = [];
    sucos = [];
    aldeias: any = [];
    gerenteListaAldeias: any[] = [];
    representanteListaAldeias: any[] = [];
    listaSociedadeComercial = [];

    empresaForm!: FormGroup;

    loading = false;
    isSuccess = false;
    isError = false;
    emailVerification = 'test@mail.com';
    notification!: Notification;
    originalAldeias: any[] = [];
    tipoProriedadeOpts = tipoPropriedadeOptions;
    tipoDocumentoOpts = tipoDocumentoOptions;
    tipoRelacaoFamiliaOpts = tipoRelacaoFamiliaOptions;
    tipoNacionalidadeOpts = tipoNacionalidadeOptions;
    tipoEstadoCivilOpts = estadoCivilOptions;
    showAddBtnAcionistas = false;
    selectedRole!: Role;
    listaAldeiaAcionista: any[][] = [];
    uploadedDocs: any[] = [];
    maxFileSize = maxFileSizeUpload;
    tipoRepresentanteOptions = tipoRepresentante;
    gerenteForeigner: boolean = false;
    representanteForeigner: boolean = false;
    errorMessage: any;
    private aldeiaSearchSubject = new Subject<string>();
    private gerenteAldeiaSearchSubject = new Subject<string>();
    private representanteAldeiaSearchSubject = new Subject<string>();
    private acionistaAldeiaSearchSubjects: Subject<string>[] = [];
    aldeiaIsLoading = false;
    gerenteAldeiaIsLoading = false;
    representanteAldeiaIsLoading = false;
    acionistaAldeiaIsLoading: boolean[] = [];

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private dataMasterService: DataMasterService,
        private empresaService: EmpresaService,
        private recaptchaV3Service: ReCaptchaV3Service
    ) { }


    ngOnInit() {
        this.initForm();

        this.aldeias = this.route.snapshot.data['aldeiasResolver']._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));

        this.listaSociedadeComercial = this.route.snapshot.data['listaSociedadeComercial']._embedded.sociedadeComercial.map((s: any) => ({ nome: s.nome, value: s.id }));
        this.originalAldeias = [...this.aldeias];
        this.gerenteListaAldeias = [...this.aldeias];
        this.representanteListaAldeias = [...this.aldeias];

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

        this.setUtilizadorEmail();
        this.setupAldeiaSearch();
        this.setupGerenteAldeiaSearch();
        this.setupRepresentanteAldeiaSearch();
    }

    setupAldeiaSearch(): void {
        this.aldeiaSearchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(query => {
                if (query && query.length >= 2) {
                    this.aldeiaIsLoading = true;
                    return this.dataMasterService.searchAldeiasByNome(query).pipe(
                        catchError(error => {
                            console.error('Error searching aldeias:', error);
                            this.aldeiaIsLoading = false;
                            return of(null);
                        })
                    );
                } else {
                    this.aldeiaIsLoading = false;
                    return of(null);
                }
            })
        ).subscribe({
            next: (response) => {
                if (response) {
                    this.aldeias = response._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
                } else {
                    this.aldeias = [...this.originalAldeias];
                }
                this.aldeiaIsLoading = false;
            }
        });
    }

    setupGerenteAldeiaSearch(): void {
        this.gerenteAldeiaSearchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(query => {
                if (query && query.length >= 2) {
                    this.gerenteAldeiaIsLoading = true;
                    return this.dataMasterService.searchAldeiasByNome(query).pipe(
                        catchError(error => {
                            console.error('Error searching aldeias:', error);
                            this.gerenteAldeiaIsLoading = false;
                            return of(null);
                        })
                    );
                } else {
                    this.gerenteAldeiaIsLoading = false;
                    return of(null);
                }
            })
        ).subscribe({
            next: (response) => {
                if (response) {
                    this.gerenteListaAldeias = response._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
                } else {
                    this.gerenteListaAldeias = [...this.originalAldeias];
                }
                this.gerenteAldeiaIsLoading = false;
            }
        });
    }

    setupRepresentanteAldeiaSearch(): void {
        this.representanteAldeiaSearchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(query => {
                if (query && query.length >= 2) {
                    this.representanteAldeiaIsLoading = true;
                    return this.dataMasterService.searchAldeiasByNome(query).pipe(
                        catchError(error => {
                            console.error('Error searching aldeias:', error);
                            this.representanteAldeiaIsLoading = false;
                            return of(null);
                        })
                    );
                } else {
                    this.representanteAldeiaIsLoading = false;
                    return of(null);
                }
            })
        ).subscribe({
            next: (response) => {
                if (response) {
                    this.representanteListaAldeias = response._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
                } else {
                    this.representanteListaAldeias = [...this.originalAldeias];
                }
                this.representanteAldeiaIsLoading = false;
            }
        });
    }

    setupAcionistaAldeiaSearch(index: number): void {
        if (!this.acionistaAldeiaSearchSubjects[index]) {
            this.acionistaAldeiaSearchSubjects[index] = new Subject<string>();
            this.acionistaAldeiaIsLoading[index] = false;

            this.acionistaAldeiaSearchSubjects[index].pipe(
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(query => {
                    if (query && query.length >= 2) {
                        this.acionistaAldeiaIsLoading[index] = true;
                        return this.dataMasterService.searchAldeiasByNome(query).pipe(
                            catchError(error => {
                                console.error('Error searching aldeias:', error);
                                this.acionistaAldeiaIsLoading[index] = false;
                                return of(null);
                            })
                        );
                    } else {
                        this.acionistaAldeiaIsLoading[index] = false;
                        return of(null);
                    }
                })
            ).subscribe({
                next: (response) => {
                    if (response) {
                        this.listaAldeiaAcionista[index] = response._embedded.aldeias.map((a: any) => ({ nome: a.nome, value: a.id }));
                    } else {
                        this.listaAldeiaAcionista[index] = [...this.originalAldeias];
                    }
                    this.acionistaAldeiaIsLoading[index] = false;
                }
            });
        }
    }


    submit(form: FormGroup) {
        this.loading = true;
        if (this.empresaForm.valid) {

            let formData = { ...form.getRawValue() }
            formData.sede = {
                ...formData.sede,
                aldeia: {
                    id: formData.sede.aldeia.value,
                },
            };
            formData.sociedadeComercial = {
                id: formData.sociedadeComercial.value,
                nome: formData.sociedadeComercial.nome
            }

            formData.gerente = {
                ...formData.gerente,
                morada: {
                    ...formData.gerente.morada,
                    aldeia: {
                        id: formData.gerente.morada.aldeia.value
                    }
                },
                tipoDocumento: formData.gerente.tipoDocumento.value
            }
            formData.representante = {
                ...formData.representante,
                morada: {
                    ...formData.representante.morada,
                    aldeia: {
                        id: formData.representante.morada.aldeia.value
                    }
                },
                tipoDocumento: formData.representante.tipoDocumento.value
            }
            formData.tipoPropriedade = formData.tipoPropriedade.value;
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
            // Duplicate first name to last name (if last name is empty)
            const parts = form.value.gerente.nome.trim().split(/\s+/);
            formData.utilizador.firstName = parts[0];
            formData.utilizador.lastName = parts.slice(1).join(' ') || parts[0];

            formData.utilizador.username = formData.gerente.email.split('@')[0] + new Date().getUTCMilliseconds().toString();
            formData.utilizador.role = this.selectedRole;
            formData.utilizador.email = formData.gerente.email;

            this.recaptchaV3Service.execute(RecaptchaAction.registerEmpresa).subscribe((token: string) => {
                formData.recaptchaToken = token;
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
                        this.errorMessage = error;
                    }
                });
            });

        } else {
            this.loading = false;
        }
    }

    aldeiaOnChange(event: SelectChangeEvent): void {
        if (event.value) {
            this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
                this.empresaForm.get('sede')?.patchValue({
                    municipio: aldeia.suco.postoAdministrativo.municipio.nome,
                    postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
                    suco: aldeia.suco.nome
                });
            });
        } else {
            this.empresaForm.get('sede')?.patchValue({
                municipio: null,
                postoAdministrativo: null,
                suco: null
            });
        }
    }

    aldeiaFilter(event: SelectFilterEvent): void {
        const query = event.filter?.trim() || '';
        this.aldeiaSearchSubject.next(query);
    }


    onPanelHide() {
        this.aldeias = [...this.originalAldeias];
    }

    gerenteRepresentanteAldeiaOnChange(event: SelectChangeEvent, formControl: string): void {
        if (event.value) {
            this.dataMasterService.getAldeiaById(event.value.value).subscribe((aldeia: Aldeia) => {
                this.empresaForm.get(formControl)?.get('morada')?.patchValue({
                    municipio: aldeia.suco.postoAdministrativo.municipio.nome,
                    postoAdministrativo: aldeia.suco.postoAdministrativo.nome,
                    suco: aldeia.suco.nome
                });

            });
        } else {
            this.empresaForm.get(formControl)?.patchValue({
                municipio: null,
                postoAdministrativo: null,
                suco: null
            });
        }
    }

    gerenteRepresentanteAldeiaFilter(event: SelectFilterEvent, formControl: string): void {
        const query = event.filter?.trim() || '';
        if (formControl === 'gerente') {
            this.gerenteAldeiaSearchSubject.next(query);
        } else {
            this.representanteAldeiaSearchSubject.next(query);
        }
    }


    gerenteRepresentanteOnPanelHide(formControl: string) {
        if (formControl === 'gerente') {
            this.gerenteListaAldeias = [...this.originalAldeias];
        } else {
            this.representanteListaAldeias = [...this.originalAldeias];
        }
        this.empresaForm.get(formControl)?.get('morada')?.reset();
    }

    nacionalidadeOnChange(event: SelectChangeEvent, formControl: string): void {
        if (event.value) {
            const value: TipoNacionalidade = event.value;
            if (value === TipoNacionalidade.estrangeiro) {
                this.setForeigner(formControl, true);
                this.empresaForm.get(`${formControl}.numeroVisto`)?.addValidators(Validators.required);
                this.empresaForm.get(`${formControl}.validadeVisto`)?.addValidators(Validators.required);
            } else {
                this.setForeigner(formControl, false);
                this.empresaForm.get(`${formControl}.numeroVisto`)?.removeValidators(Validators.required);
                this.empresaForm.get(`${formControl}.validadeVisto`)?.removeValidators(Validators.required);
            }
        } else {
            this.setForeigner(formControl, false);
            this.empresaForm.get(`${formControl}.numeroVisto`)?.removeValidators(Validators.required);
            this.empresaForm.get(`${formControl}.validadeVisto`)?.removeValidators(Validators.required);
        }
        this.empresaForm.get(`${formControl}.numeroVisto`)?.updateValueAndValidity();
        this.empresaForm.get(`${formControl}.validadeVisto`)?.updateValueAndValidity();
    }

    sociedadeComercialOnChange({ value }: SelectChangeEvent): void {
        const tipo = this.getTipoFromNome(value?.nome);
        this.empresaForm.patchValue({
            tipoPropriedade: tipoPropriedadeOptions.find(t => t.value === tipo)
        });
    }

    private getTipoFromNome(nome?: unknown): TipoPropriedade {
        const text = String(nome ?? '').toLowerCase();
        const isUnipessoal = /\bunipessoal\b/.test(text);
        return isUnipessoal ? TipoPropriedade.individual : TipoPropriedade.sociedade;
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

    /**     * Calculate total acoes percentage from all acionistas
     */
    getTotalAcoes(): number {
        let total = 0;
        this.acionistasArray.controls.forEach(control => {
            const acoes = control.get('acoes')?.value;
            if (acoes && !isNaN(acoes)) {
                total += Number(acoes);
            }
        });
        return total;
    }

    /**
     * Get remaining available acoes percentage
     */
    getRemainingAcoes(excludeIndex?: number): number {
        let total = 0;
        this.acionistasArray.controls.forEach((control, index) => {
            if (excludeIndex === undefined || index !== excludeIndex) {
                const acoes = control.get('acoes')?.value;
                if (acoes && !isNaN(acoes)) {
                    total += Number(acoes);
                }
            }
        });
        return 100 - total;
    }

    /**
     * Get maximum allowed acoes for a specific acionista
     */
    getMaxAcoesForAcionista(index: number): number {
        const currentValue = this.acionistasArray.at(index)?.get('acoes')?.value || 0;
        const remaining = this.getRemainingAcoes(index);
        return Math.min(100, remaining + currentValue);
    }

    /**
     * Validate total acoes percentage across all acionistas
     */
    private validateTotalAcoes(): void {
        const total = this.getTotalAcoes();
        const tipoPropriedade = this.empresaForm.get('tipoPropriedade')?.value?.value;

        // Update showAddBtnAcionistas based on total and tipo proprietade
        if (tipoPropriedade === TipoPropriedade.sociedade) {
            this.showAddBtnAcionistas = total < 100;
        }

        this.acionistasArray.controls.forEach((control, index) => {
            const acoesControl = control.get('acoes');

            if (acoesControl) {
                const currentValue = acoesControl.value;
                const remaining = this.getRemainingAcoes(index);

                // Get existing errors (non-custom ones)
                const existingErrors = acoesControl.errors || {};
                const errors: any = {};

                // Preserve built-in validator errors (required, min, max)
                if (existingErrors['required']) errors['required'] = existingErrors['required'];
                if (existingErrors['min']) errors['min'] = existingErrors['min'];
                if (existingErrors['max']) errors['max'] = existingErrors['max'];

                // Check if total exceeds 100%
                if (total > 100) {
                    errors['totalExceeds100'] = {
                        total: total,
                        max: 100
                    };
                }

                // Check if current value exceeds available percentage
                if (currentValue && currentValue > remaining) {
                    errors['maxExceeded'] = {
                        max: remaining,
                        actual: currentValue
                    };
                }

                // Set errors and mark as touched to show validation messages
                acoesControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
                if (Object.keys(errors).length > 0 && !acoesControl.touched) {
                    acoesControl.markAsTouched();
                }
            }
        });
    }

    /**     * Generate a new form for a acionista.
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

    private generateAcionistaForm(isIndividual: boolean) {
        const formGroup = this._fb.group({
            nome: [null, [Validators.required, Validators.minLength(3)]],
            nif: [null, [Validators.required]],
            tipoDocumento: [null, [Validators.required]],
            numeroDocumento: [, [Validators.required]],
            telefone: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            acoes: [isIndividual ? 100 : null, [Validators.required, Validators.min(0.01), Validators.max(100)]],
            agregadoFamilia: [null, [Validators.required]],
            relacaoFamilia: [null, [Validators.required]],
            sectionTitle: [`Acionista n.º ${this.acionistasArray.length + 1}`],
            local: [null, [Validators.required]],
            municipio: new FormControl({ value: null, disabled: true }),
            postoAdministrativo: new FormControl({ value: null, disabled: true }),
            suco: new FormControl({ value: null, disabled: true }),
            aldeia: [null, [Validators.required]],
        });

        // Subscribe to acoes value changes to trigger validation
        formGroup.get('acoes')?.valueChanges.subscribe(() => {
            this.validateTotalAcoes();
        });

        return formGroup;
    }

    get acionistasArray(): FormArray {
        return this.empresaForm.get('acionistas') as FormArray;
    }

    addAcionistaForm() {
        // Prevent adding if TipoPropriedade is individual
        const tipoPropriedade = this.empresaForm.get('tipoPropriedade')?.value?.value;
        if (tipoPropriedade === TipoPropriedade.individual) {
            return;
        }
        this.validateTotalAcoes();

        this.acionistasArray.push(this.generateAcionistaForm(false));
        const idx = this.acionistasArray.length - 1;
        this.listaAldeiaAcionista[idx] = [...this.originalAldeias];
    }

    removeAcionistaForm(index: number) {
        if (this.acionistasArray.length > 1) {
            this.acionistasArray.removeAt(index);
            // Revalidate acoes after removal
            setTimeout(() => this.validateTotalAcoes(), 0);
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

    aldeiaAcionistaFilter(event: any, index: number): void {
        this.setupAcionistaAldeiaSearch(index);
        const query = event.filter?.trim() || '';
        this.acionistaAldeiaSearchSubjects[index].next(query);
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
            this.empresaForm.get('dataRegisto')?.invalid || this.uploadedDocs.length < 3
        );
    }

    disableStepProprietario(): boolean {
        return !!(
            this.empresaForm.get('tipoPropriedade')?.invalid ||
            this.acionistasArray.invalid ||
            this.getTotalAcoes() !== 100);
    }

    disableStepGerente(): boolean {
        return !!(
            this.empresaForm.get('gerente.nome')?.invalid ||
            this.empresaForm.get('gerente.email')?.invalid ||
            this.empresaForm.get('gerente.morada.local')?.invalid ||
            this.empresaForm.get('gerente.morada.aldeia')?.invalid);
    }

    disableStepConta(): boolean {
        return !!(
            this.empresaForm.get('utilizador.gerente')?.invalid ||
            this.empresaForm.get('utilizador.email')?.invalid ||
            this.empresaForm.get('utilizador.password')?.invalid);
    }

    getCurrentPosition(): void {
        if (!navigator.geolocation) {
            console.warn('Geolocalização não suportada');
            return;
        }

        const options: PositionOptions = {
            enableHighAccuracy: true, // tenta usar GPS
            timeout: 15000,           // espera até 15s
            maximumAge: 0             // não usar localização em cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.empresaForm.get('latitude')?.setValue(position.coords.latitude);
                this.empresaForm.get('longitude')?.setValue(position.coords.longitude);
            },
            (error) => {
                console.error('Erro de geolocalização:', error.code, error.message);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert('Permissão de localização negada. Autorize o acesso à localização nas definições do navegador.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        // normalmente corresponde ao kCLErrorLocationUnknown no iOS
                        alert('Localização indisponível. Tente deslocar-se para o exterior, activar Wi-Fi/GPS e tentar novamente.');
                        break;
                    case error.TIMEOUT:
                        alert('Tempo limite excedido ao obter a localização. Tente novamente.');
                        break;
                }
            },
            options
        );
    }

    onRepresentanteTipoChange({ value }: SelectChangeEvent): void {
        switch (value) {
            case 'Empresa':
                this.empresaForm.get('representante')?.get('nomeEmpresa')?.setValidators([Validators.required, Validators.minLength(3)]);
                this.empresaForm.get('representante')?.get('nome')?.setValidators([Validators.required, Validators.minLength(3)]);
                break;

            case 'Individual':
                this.empresaForm.get('representante')?.get('nome')?.setValidators([Validators.required, Validators.minLength(3)]);
                this.empresaForm.get('representante')?.get('nomeEmpresa')?.clearValidators();
                this.empresaForm.get('representante')?.get('nomeEmpresa')?.setValue(null);
                break;
        }

        this.empresaForm.get('representante')?.get('nomeEmpresa')?.updateValueAndValidity();
        this.empresaForm.get('representante')?.get('nome')?.updateValueAndValidity();
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

    private setUtilizadorEmail(): void {
        this.empresaForm.get('gerente')?.get('email')?.valueChanges.subscribe(email => {
            this.empresaForm.get('utilizador')?.get('email')?.setValue(email);
        });
    }

    setForeigner(field: string, value: boolean) {
        const key = `${field}Foreigner` as keyof Register;
        (this as any)[key] = value;
    }

    private initForm(): void {
        this.empresaForm = this._fb.group({
            nome: [null, [Validators.required, Validators.minLength(3)]],
            nif: [null, [Validators.required]],
            sede: this._fb.group({
                local: [null, [Validators.required]],
                municipio: new FormControl({ value: null, disabled: true }),
                postoAdministrativo: new FormControl({ value: null, disabled: true }),
                suco: new FormControl({ value: null, disabled: true }),
                aldeia: [null, [Validators.required]],
            }),
            sociedadeComercial: [null, [Validators.required]],
            numeroRegistoComercial: [null, [Validators.required]],
            capitalSocial: [null, [Validators.required]],
            dataRegisto: [null, [Validators.required]],
            telemovel: [null, [Validators.required]],
            telefone: [null, Validators.required],
            tipoPropriedade: new FormControl({ value: null, disabled: true }, Validators.required),
            acionistas: this._fb.array([]),
            totalTrabalhadores: [null, [Validators.required, Validators.min(1)]],
            volumeNegocioAnual: [null, Validators.required],
            balancoTotalAnual: [null, [Validators.required]],
            latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
            longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
            email: [null, [Validators.required, Validators.email]],
            gerente: this._fb.group({
                nome: [null, Validators.required],
                telefone: [null, Validators.required],
                email: [null, [Validators.required, Validators.email]],
                tipoDocumento: [null, [Validators.required]],
                numeroDocumento: [, [Validators.required]],
                nacionalidade: [null, [Validators.required]],
                numeroVisto: [null],
                validadeVisto: [null],
                naturalidade: [null, [Validators.required]],
                estadoCivil: [null, [Validators.required]],
                morada: this._fb.group({
                    local: [null, [Validators.required]],
                    municipio: new FormControl({ value: null, disabled: true }),
                    postoAdministrativo: new FormControl({ value: null, disabled: true }),
                    suco: new FormControl({ value: null, disabled: true }),
                    aldeia: [null, [Validators.required]],
                }),
            }),
            representante: this._fb.group({
                tipo: [null, [Validators.required]],
                nomeEmpresa: [null],
                nome: [null],
                pai: [null, [Validators.required]],
                mae: [null, [Validators.required]],
                dataNascimento: [null, [Validators.required]],
                estadoCivil: [null, [Validators.required]],
                nacionalidade: [null, [Validators.required]],
                numeroVisto: [null],
                validadeVisto: [null],
                naturalidade: [null, [Validators.required]],
                telefone: [null, [Validators.required]],
                email: [null, [Validators.required, Validators.email]],
                tipoDocumento: [null, [Validators.required]],
                numeroDocumento: [, [Validators.required]],
                morada: this._fb.group({
                    local: [null, [Validators.required]],
                    municipio: new FormControl({ value: null, disabled: true }),
                    postoAdministrativo: new FormControl({ value: null, disabled: true }),
                    suco: new FormControl({ value: null, disabled: true }),
                    aldeia: [null, [Validators.required]],
                }),
            }),
            utilizador: this._fb.group({
                email: new FormControl({ value: null, disabled: true }),
                password: [null, [Validators.required, Validators.minLength(6)]],
            }),
        });
    }
}
