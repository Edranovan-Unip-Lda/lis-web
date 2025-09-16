import { User } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { UserService } from '@/core/services';
import { categoryTpesOptions, mapToIdAndName, mapToIdAndNome, roleOptions, statusOptions } from '@/core/utils/global-function';
import { mustMatch } from '@/core/validators/must-match';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'user-create',
    standalone: true,
    imports: [Select, InputText, TextareaModule, CommonModule, FileUploadModule, ButtonModule, InputGroupModule, RippleModule, ReactiveFormsModule, PasswordModule, MessageModule, SelectButtonModule, InputTextModule],
    templateUrl: './user-form.html',
    providers: [MessageService]
})
export class UserCreate {
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

    constructor(
        private _fb: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.initForm();

        this.userData = this.route.snapshot.data['userData'];

        this.direcaoList = mapToIdAndNome(this.route.snapshot.data['direcaoList']._embedded.direcoes);

        this.isNew = !this.userData;

        if (!this.isNew) {
            this.roleList = mapToIdAndName(this.route.snapshot.data['roleList']._embedded.roles || []);


            this.userData.password = ''; // Do not show password in edit form

            this.userForm.patchValue(this.userData);

            if (this.userData.role.name === Role.manager || this.userData.role.name === Role.chief || this.userData.role.name === Role.staff) {
                this.showCategoria = true;
                this.userForm.get('direcao')?.setValue(this.userData.direcao.id);
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
        } else {
            this.roleList = mapToIdAndName(this.route.snapshot.data['roleList']._embedded.roles || []).filter(item => item.name !== Role.client);
        }
    }

    createUser(form: FormGroup) {
        if (form.valid) {
            this.loading = true;

            const formData = form.value;
            formData.role = this.roleList.find(item => item.name === formData.role);


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
                },
                error: (error) => {
                    this.loading = false;
                    console.log(error);
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

            if (formData.direcao) {
                formData.direcao = {
                    id: formData.direcao
                }
            }

            this.userService.update(this.username, formData).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.addMessage(true, 'User updated successfully');
                },
                error: (error) => {
                    this.loading = false;
                    console.log(error);
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
