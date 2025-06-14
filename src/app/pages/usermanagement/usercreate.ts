import { User } from '@/core/models/entities.model';
import { UserService } from '@/core/services';
import { mapToIdAndName, roleOptions, statusOptions } from '@/core/utils/global-function';
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
    userForm: FormGroup;
    roleList: any[];
    loading = false;
    userData: User;
    isNew = false;
    statusOptions = statusOptions;
    roleOptions = roleOptions;
    messages = signal<any[]>([]);
    username!: string;

    constructor(
        private _fb: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute,
    ) {
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
        }, {
            validators: mustMatch('password', 'confirmPassword')
        });
        this.roleList = mapToIdAndName(this.route.snapshot.data['roleList']._embedded.roles || []);

        this.userData = this.route.snapshot.data['userData'];
        this.isNew = !this.userData;

        if (!this.isNew) {
            this.userData.password = ''; // Do not show password in edit form
            this.userData.role = {
                id: this.userData.role.id,
                name: this.userData.role.name
            };
            this.userForm.patchValue(this.userData);
            this.username = this.userData.username;
            this.userForm.get('username')?.disable()
        }

    }

    ngOnInit() {
    }

    createUser(form: FormGroup) {
        if (form.valid) {
            this.loading = true;

            this.userService.save(form.value).subscribe({
                next: (response) => {
                    this.loading = false;
                    console.log(response);
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
            console.log(form.value);
            form.value.username = this.username;
            this.userService.update(this.username, form.value).subscribe({
                next: (response) => {
                    this.loading = false;
                    console.log(response);
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
                { severity: 'error', content: detail, icon: 'pi pi-times-circle' },
            ]);
        }
    }
}
