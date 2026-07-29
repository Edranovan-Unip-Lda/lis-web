import { Documento, User } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { AuthenticationService, FileUploadService, UserService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { mapToIdAndName, mapToIdAndNome, maxFileSizeUpload, roleOptions, statusOptions } from '@/core/utils/global-function';
import { mustMatch } from '@/core/validators/must-match';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { Image } from 'primeng/image';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'user-create',
    standalone: true,
    imports: [Select, InputText, TextareaModule, CommonModule, FileUploadModule, ButtonModule, InputGroupModule, RippleModule, ReactiveFormsModule, PasswordModule, MessageModule, SelectButtonModule, InputTextModule, Toast, Image, Skeleton],
    templateUrl: './user-form.html',
    providers: [MessageService]
})
export class UserCreate implements OnDestroy {
    userForm!: FormGroup;
    roleList: any[] = [];
    direcaoList: any[] = [];
    loading = false;
    userData!: User;
    isNew = false;
    statusOptions = statusOptions;
    roleOptions = roleOptions;
    messages = signal<any[]>([]);
    username!: string;
    showCategoria = false;
    isDirector = false;
    maxFileSize = maxFileSizeUpload;
    uploadURLDocs = signal(`${environment.apiUrl}/documentos`);
    signatureDoc!: Documento;
    loadingRemoveBtn = false;
    // Object URL of the fetched signature image (auth-protected blob); null when none/loading.
    signatureImageUrl = signal<string | null>(null);
    // True while the signature blob is being fetched, so the UI can show a skeleton.
    signatureImageLoading = signal(false);
    private destroyRef = inject(DestroyRef);

    constructor(
        private _fb: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
        private messageService: MessageService,
        private documentoService: DocumentosService,
        private fileUploadService: FileUploadService,
    ) { }

    ngOnInit() {
        this.initForm();
        this.uploadURLDocs.set(`${environment.apiUrl}/documentos/${this.authService.currentUserValue.username}/upload`);

        this.userData = this.route.snapshot.data['userData'];

        this.direcaoList = mapToIdAndNome((this.route.snapshot.data['direcaoList']?._embedded?.direcoes ?? []));

        this.isNew = !this.userData;

        if (!this.isNew) {
            this.roleList = mapToIdAndName((this.route.snapshot.data['roleList']?._embedded?.roles ?? []) || []);


            this.userData.password = ''; // Do not show password in edit form

            this.userForm.patchValue(this.userData);
            // The direcao select is optionValue="id" — the patch above leaves the whole Direcao
            // object in the control; normalize to a scalar id for every role (null-safe).
            this.userForm.get('direcao')?.setValue(this.userData.direcao?.id ?? null);

            if (this.userData.role.name === Role.manager || this.userData.role.name === Role.chief || this.userData.role.name === Role.staff) {
                this.showCategoria = true;
                this.userForm.get('direcao')?.setValidators(Validators.required);
            }

            this.userForm.patchValue({
                role: this.userData.role.name
            });

            this.username = this.userData.username;
            this.userForm.get('username')?.disable();


            if (this.userData.role.name === Role.client) {
                this.userForm.get('role')?.disable();
            }

            if (this.userData.role.name === Role.manager) {
                this.isDirector = true
                this.signatureDoc = this.userData.signature;
                if (this.signatureDoc) {
                    this.loadSignatureImage(this.signatureDoc.id);
                }
            } else {
                this.isDirector = false;
            }

        } else {
            this.roleList = mapToIdAndName((this.route.snapshot.data['roleList']?._embedded?.roles ?? []) || []).filter(item => item.name !== Role.client);
        }
    }

    createUser(form: FormGroup) {
        if (form.valid) {
            this.loading = true;

            const formData = form.value;
            formData.role = this.roleList.find(item => item.name === formData.role);
            formData.signature = this.signatureDoc;


            if (formData.direcao) {
                formData.direcao = {
                    id: formData.direcao
                }
            }

            this.userService.save(formData).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.addMessage(true, `User created successfully and verification link sent to ${response.email}`);
                    this.userForm.reset();
                    // Clear the staged signature too — it belongs to the user just created.
                    this.signatureDoc = undefined!;
                    this.revokeSignatureImage();
                },
                error: (error) => {
                    this.loading = false;
                    this.addMessage(false, error);
                }
            });
        }
    }

    updateUser(form: FormGroup) {
        if (form.valid) {
            this.loading = true;

            const formData = form.getRawValue();
            formData.role = this.roleList.find(item => item.name === formData.role);
            formData.username = this.username;
            formData.signature = this.signatureDoc;

            if (formData.direcao) {
                formData.direcao = {
                    id: formData.direcao
                }
            }

            this.userService.update(this.username, formData).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.addMessage(true, 'User updated successfully');
                    // Swap the transient signature (id: null) for the persisted one so a second
                    // save re-references it by id instead of creating another documento row.
                    if (response?.signature) {
                        this.signatureDoc = response.signature;
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.addMessage(false, error);
                }
            });
        }
    }

    addMessage(isSuccess: boolean, detail: string) {
        if (isSuccess) {
            this.messages.set([
                { severity: 'success', content: detail, icon: 'pi pi-check-circle' },
            ]);
        } else {
            this.messages.set([
                { severity: 'error', content: 'Desculpe, algo deu errado. Tente novamente ou procure o administrador do sistema para mais informações.', icon: 'pi pi-times-circle' },
            ]);
        }
    }

    roleOnChange(event: any) {
        if (event.value !== Role.client && event.value !== Role.admin) {
            this.showCategoria = true;
            this.userForm.get('direcao')?.setValidators(Validators.required);
        } else {
            this.userForm.get('direcao')?.clearAsyncValidators();
            this.showCategoria = false;
        }

        event.value === Role.manager ? this.isDirector = true : this.isDirector = false;
    }

    // Routes through HttpClient (interceptor adds auth + CSRF) instead of PrimeNG's native XHR.
    onUploadDocs(event: any, uploader?: FileUpload) {
        this.fileUploadService.upload<Documento[]>(this.uploadURLDocs(), event.files, 'post', 'files')
            .pipe(finalize(() => uploader?.clear()))
            .subscribe({
                next: (docs) => {
                    if (docs && docs.length > 0) {
                        this.signatureDoc = docs[0];
                        // The upload returns a transient Documento (id: null) — it is only fetchable
                        // by id after a save, so preview from the just-selected local file instead.
                        this.revokeSignatureImage();
                        this.signatureImageUrl.set(URL.createObjectURL(event.files[0]));
                    }
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Sucesso',
                        detail: 'Arquivos carregado com sucesso!'
                    });
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Falha no carregamento do arquivo!'
                    });
                }
            });
    }

    removeDoc() {
        this.loadingRemoveBtn = true;
        this.userService.deleteSignature(this.userData.username).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Sucesso',
                    detail: 'Arquivo foi removido com sucesso!'
                });
                this.signatureDoc = undefined!;
                this.revokeSignatureImage();
            },
            error: error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Falha no removero arquivo!'
                });
            },
            complete: () => this.loadingRemoveBtn = false
        });
    }

    // Fetch the signature blob from the auth-protected /documentos/{id} endpoint and
    // expose it as an object URL for <p-image> preview.
    private loadSignatureImage(id: number) {
        this.signatureImageLoading.set(true);
        this.documentoService.downloadById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: blob => {
                this.revokeSignatureImage();
                this.signatureImageUrl.set(URL.createObjectURL(blob));
                this.signatureImageLoading.set(false);
            },
            error: () => {
                this.signatureImageUrl.set(null);
                this.signatureImageLoading.set(false);
            },
        });
    }

    private revokeSignatureImage() {
        const url = this.signatureImageUrl();
        if (url) {
            URL.revokeObjectURL(url);
        }
        this.signatureImageUrl.set(null);
    }

    ngOnDestroy() {
        this.revokeSignatureImage();
    }

    bytesToMBs(value: number): string {
        if (!value && value !== 0) return '';
        const mb = value / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    }

    private initForm(): void {
        this.userForm = this._fb.group({
            id: [''],
            firstName: new FormControl(null, [Validators.required]),
            lastName: new FormControl(null, [Validators.required]),
            email: new FormControl(null, [Validators.required, Validators.email]),
            username: new FormControl(null, [Validators.required]),
            password: new FormControl(null),
            confirmPassword: new FormControl(null),
            role: new FormControl(null, [Validators.required]),
            status: new FormControl('pending', [Validators.required]),
            direcao: new FormControl(null),
        }, {
            validators: mustMatch('password', 'confirmPassword')
        });
    }
}
