import { Aldeia, Role } from '@/core/models/data-master.model';
import { RecaptchaAction, TipoNacionalidade, TipoPropriedade } from '@/core/models/enums';
import { DataMasterService } from '@/core/services/data-master.service';
import { EmpresaService } from '@/core/services/empresa.service';
import { estadoCivilOptions, maxFileSizeUpload, tipoDocumentoOptions, tipoNacionalidadeOptions, tipoPropriedadeOptions, tipoRelacaoFamiliaOptions, tipoRepresentante } from '@/core/utils/global-function';
import { alphanumericValidator } from '@/core/validators/alphanumeric';
import { greaterThanValidator } from '@/core/validators/greater-than';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

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
    styleUrls: ['./register.component.scss']
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
    listaAldeiaAcionista: any[][] = [];
    uploadedDocs: any[] = [];
    // B1: registration session token, opened on first file select; authorizes staging uploads + finalize.
    sessionToken: string | null = null;
    // Draft autosave: a recoverable draft was found in localStorage → show the continue/start-fresh banner.
    draftAvailable = false;
    private readonly destroyRef = inject(DestroyRef);
    private static readonly DRAFT_KEY = 'lis:register:draft';
    private static readonly DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;   // discard drafts older than 24h entirely
    private static readonly SESSION_SAFE_AGE_MS = 25 * 60 * 1000;     // beyond this, the 30-min session is unsafe
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
    acceptedFileTypes = 'application/pdf,image/jpeg,image/jpg,image/png';
    // Printed resumo (official PDF layout): absolute logo URL so it resolves inside the ngxPrint window.
    printLogoUrl = `${window.location.origin}/images/logo.png`;
    today = new Date();

    constructor(
        private _fb: FormBuilder,
        private route: ActivatedRoute,
        private dataMasterService: DataMasterService,
        private empresaService: EmpresaService,
        private recaptchaV3Service: ReCaptchaV3Service
    ) { }


    ngOnInit() {
        this.initForm();

        this.aldeias = (this.route.snapshot.data['aldeiasResolver']?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, value: a.id }));

        this.listaSociedadeComercial = (this.route.snapshot.data['listaSociedadeComercial']?._embedded?.sociedadeComercial ?? []).map((s: any) => ({ nome: s.nome, value: s.id }));
        // Re-validate now that the list is loaded
        this.empresaForm.get('nome')?.updateValueAndValidity();
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

        this.setUtilizadorEmail();
        this.setupAldeiaSearch();
        this.setupGerenteAldeiaSearch();
        this.setupRepresentanteAldeiaSearch();

        this.setupDraftAutosave();
        this.maybeOfferDraft();
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
                    this.aldeias = (response?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, value: a.id }));
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
                    this.gerenteListaAldeias = (response?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, value: a.id }));
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
                    this.representanteListaAldeias = (response?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, value: a.id }));
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
                        this.listaAldeiaAcionista[index] = (response?._embedded?.aldeias ?? []).map((a: any) => ({ nome: a.nome, value: a.id }));
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
            formData.utilizador.email = formData.gerente.email;

            // B1: the session + the 6 documents were already established/uploaded while the form was filled.
            // Finalize is a small JSON call carrying the staged document refs + the session token.
            formData.sessionToken = this.sessionToken;
            formData.documentRefs = this.uploadedDocs.map(d => d.ref);
            this.empresaService.finalize(formData).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.isSuccess = true;
                    this.emailVerification = response.utilizador.email;
                    this.empresaForm.reset();
                    this.uploadedDocs = [];
                    this.sessionToken = null;
                    this.clearDraft(); // registration done — drop any saved draft
                    this.setNotification();
                },
                error: (error) => {
                    this.loading = false;
                    this.isError = true;
                    this.errorMessage = error;
                }
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
            nif: [null, [Validators.required, alphanumericValidator()]],
            tipoDocumento: [null, [Validators.required]],
            numeroDocumento: [null, [Validators.required, alphanumericValidator()]],
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

    /** Open the registration session once (verify reCAPTCHA → sessionToken), then reuse it for every upload. */
    private ensureSession(): Observable<string> {
        if (this.sessionToken) return of(this.sessionToken);
        return this.recaptchaV3Service.execute(RecaptchaAction.registerEmpresa).pipe(
            switchMap(token => this.empresaService.verifyRecaptcha(token)),
            map(res => (this.sessionToken = res.sessionToken))
        );
    }

    onSelect(e: FileSelectEvent) {
        // e.files may be a FileList (array-like, not an Array) — normalize before iterating.
        const files = Array.from(e.files ?? []);
        // Bootstrap the session on the first selection, then stage each file immediately and independently.
        this.ensureSession().subscribe({
            next: () => files.forEach(file => this.stageOne(file)),
            error: () => {
                this.isError = true;
                this.errorMessage = 'Falha na verificação reCAPTCHA. Tente novamente.';
            }
        });
    }

    private stageOne(file: File) {
        const entry: any = {
            file,
            name: file.name,
            size: file.size,
            __key: `${file.name}-${file.size}-${(file as any).lastModified}`,
            ref: null,
            status: 'uploading'
        };
        this.uploadedDocs = [...this.uploadedDocs, entry];
        this.empresaService.stageDocument(file, this.sessionToken!).subscribe({
            next: h => { entry.ref = h.ref; entry.status = 'done'; },
            error: () => { entry.status = 'error'; }
        });
    }

    onFileRemove(e: { file: any }) {
        const item = e.file;
        // Best-effort: drop the staged object server-side too (lifecycle rule is the backstop).
        if (item.ref && this.sessionToken) {
            this.empresaService.deleteStagedDocument(item.ref, this.sessionToken).subscribe({ error: () => { } });
        }
        const key = item.__key ?? `${item.name}-${item.size}-${item.lastModified}`;
        this.uploadedDocs = this.uploadedDocs.filter(f => (f.__key ?? `${f.name}-${f.size}-${f.lastModified}`) !== key);
    }

    // Fired when the "clear" button is pressed
    onFileClear() {
        const token = this.sessionToken;
        if (token) {
            this.uploadedDocs.forEach(d => {
                if (d.ref) this.empresaService.deleteStagedDocument(d.ref, token).subscribe({ error: () => { } });
            });
        }
        this.uploadedDocs = [];
    }

    /** Step is valid only when all 6 documents finished staging (have a ref). */
    allDocsStaged(): boolean {
        return this.uploadedDocs.length === 6 && this.uploadedDocs.every(d => d.status === 'done' && !!d.ref);
    }

    // ---- Draft autosave (continue after reload) ------------------------------------------------------------

    /** Persist a small draft (form JSON minus password + staged doc refs + session token) on every change. */
    private setupDraftAutosave(): void {
        this.empresaForm.valueChanges.pipe(
            debounceTime(800),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => this.saveDraft());
    }

    private saveDraft(): void {
        if (this.empresaForm.pristine) return; // nothing meaningful typed yet
        const raw = this.empresaForm.getRawValue();
        if (raw.utilizador) raw.utilizador = { ...raw.utilizador, password: null }; // never persist the password
        const draft = {
            savedAt: Date.now(),
            form: raw,
            sessionToken: this.sessionToken,
            docs: this.uploadedDocs
                .filter(d => d.ref && d.status === 'done')
                .map(d => ({ name: d.name, size: d.size, ref: d.ref, __key: d.__key })),
        };
        try {
            localStorage.setItem(Register.DRAFT_KEY, JSON.stringify(draft));
        } catch { /* quota / private mode — non-fatal */ }
    }

    /** Read a non-expired draft. Drops session+docs if older than the session window (form fields are kept). */
    private readDraft(): any | null {
        try {
            const raw = localStorage.getItem(Register.DRAFT_KEY);
            if (!raw) return null;
            const draft = JSON.parse(raw);
            if (!draft?.savedAt || Date.now() - draft.savedAt > Register.DRAFT_MAX_AGE_MS) {
                this.clearDraft();
                return null;
            }
            if (Date.now() - draft.savedAt > Register.SESSION_SAFE_AGE_MS) {
                draft.sessionToken = null; // the 30-min session/staged files are likely gone — make the user re-attach
                draft.docs = [];
            }
            return draft;
        } catch {
            this.clearDraft();
            return null;
        }
    }

    private maybeOfferDraft(): void {
        this.draftAvailable = !!this.readDraft();
    }

    /** "Continuar": restore the form (rebuilding the acionistas array first), plus fresh staged docs/session. */
    restoreDraft(): void {
        const draft = this.readDraft();
        if (!draft) { this.draftAvailable = false; return; }
        const data = draft.form ?? {};

        // 0) JSON turned Date objects into ISO strings — revive them so the p-datepickers can render again.
        this.reviveDates(data);

        // 1) Rebuild the acionistas FormArray to the saved size before patching (patchValue can't grow an array).
        const savedAcionistas: any[] = data.acionistas ?? [];
        // Setting tipoPropriedade fires the handler that clears + pushes one acionista.
        this.empresaForm.get('tipoPropriedade')?.setValue(data.tipoPropriedade ?? null, { emitEvent: true });
        while (this.acionistasArray.length < savedAcionistas.length) {
            this.acionistasArray.push(this.generateAcionistaForm(false));
        }
        while (this.acionistasArray.length > savedAcionistas.length) {
            this.acionistasArray.removeAt(this.acionistasArray.length - 1);
        }
        this.acionistasArray.controls.forEach((_, idx) => this.listaAldeiaAcionista[idx] = [...this.originalAldeias]);

        // 2) Patch every field (acionistas controls now exist). emitEvent:false so we don't immediately re-save.
        this.empresaForm.patchValue(data, { emitEvent: false });
        this.empresaForm.markAsDirty();

        // 3) Restore the staged documents + session if still within the safe window.
        if (draft.sessionToken && draft.docs?.length) {
            this.sessionToken = draft.sessionToken;
            this.uploadedDocs = draft.docs.map((d: any) => ({ ...d, status: 'done' }));
        }

        this.draftAvailable = false;
    }

    /** "Começar de novo": drop the draft (and best-effort delete any staged docs it referenced). */
    discardDraft(): void {
        const draft = this.readDraft();
        if (draft?.sessionToken && draft?.docs?.length) {
            draft.docs.forEach((d: any) =>
                this.empresaService.deleteStagedDocument(d.ref, draft.sessionToken).subscribe({ error: () => { } }));
        }
        this.clearDraft();
        this.draftAvailable = false;
    }

    private clearDraft(): void {
        try { localStorage.removeItem(Register.DRAFT_KEY); } catch { /* non-fatal */ }
    }

    /** Convert the persisted ISO-string dates back into Date objects the DatePickers can bind. */
    private reviveDates(data: any): void {
        const toDate = (v: any) => (v ? new Date(v) : v);
        data.dataRegisto = toDate(data.dataRegisto);
        if (data.gerente) data.gerente.validadeVisto = toDate(data.gerente.validadeVisto);
        if (data.representante) {
            data.representante.dataNascimento = toDate(data.representante.dataNascimento);
            data.representante.validadeVisto = toDate(data.representante.validadeVisto);
        }
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
            this.empresaForm.get('dataRegisto')?.invalid || !this.allDocsStaged()
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

    private sociedadeComercialNameValidator(): ValidatorFn {
        const normalize = (v: unknown) =>
            (v ?? '')
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim()
                .toLowerCase();
        return (control: AbstractControl): ValidationErrors | null => {
            const raw = normalize(control.value);
            if (!raw) return null;
            const list: any[] = this.listaSociedadeComercial || [];
            const matched = list
                .map(s => (s?.nome ?? '').toString().trim())
                .filter(nome => !!nome && raw.includes(normalize(nome)));
            return matched.length ? { sociedadeComercialInName: { matched } } : null;
        };
    }

    private initForm(): void {
        this.empresaForm = this._fb.group({
            nome: [null, [Validators.required, Validators.minLength(3), this.sociedadeComercialNameValidator()]],
            nif: [null, [Validators.required, alphanumericValidator()]],
            sede: this._fb.group({
                local: [null, [Validators.required]],
                municipio: new FormControl({ value: null, disabled: true }),
                postoAdministrativo: new FormControl({ value: null, disabled: true }),
                suco: new FormControl({ value: null, disabled: true }),
                aldeia: [null, [Validators.required]],
            }),
            sociedadeComercial: [null, [Validators.required]],
            numeroRegistoComercial: [null, [Validators.required, alphanumericValidator()]],
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
                numeroDocumento: [null, [Validators.required, alphanumericValidator()]],
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
                numeroDocumento: [null, [Validators.required, alphanumericValidator()]],
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
        }, { validators: greaterThanValidator('volumeNegocioAnual', 'balancoTotalAnual') });
    }
}
