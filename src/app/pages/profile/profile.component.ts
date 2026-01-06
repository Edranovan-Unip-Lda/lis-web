import { User } from '@/core/models/entities.model';
import { UserService } from '@/core/services';
import { mustMatch } from '@/core/validators/must-match';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-profile',
  imports: [InputText, Button, Message, ReactiveFormsModule, PasswordModule, InputTextModule, Toast],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [MessageService]
})
export class ProfileComponent {
  userForm!: FormGroup;
  loading = false;
  userData!: User;
  messages = signal<any[]>([]);
  username!: string;
  showCategoria = false;
  isDirector = false;

  constructor(
    private _fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.initForm();
    // Load user data here and patch the form
    this.userData = this.route.snapshot.data['userData'];
    if (this.userData) {
      this.username = this.userData.username;
      this.userForm.patchValue({
        id: this.userData.id,
        firstName: this.userData.firstName,
        lastName: this.userData.lastName,
        email: this.userData.email,
      });
    }
  }

  updateUser(form: FormGroup) {
    this.loading = true;
    if (form.valid) {
      this.userService.updateProfile(this.username, form.value).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado com sucesso!' });
        },
        error: (err) => {
          this.loading = false;
          this.userForm.get('currentPassword')?.reset();
          this.userForm.get('newPassword')?.reset();
          this.userForm.get('confirmPassword')?.reset();
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: err });
        },
        complete: () => {
          this.loading = false;
          this.userForm.get('currentPassword')?.reset();
          this.userForm.get('newPassword')?.reset();
          this.userForm.get('confirmPassword')?.reset();
        }
      });
    }
  }


  private initForm(): void {
    this.userForm = this._fb.group({
      id: [null],
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      currentPassword: new FormControl(null),
      newPassword: new FormControl(null),
      confirmPassword: new FormControl(null),
    }, {
      validators: mustMatch('newPassword', 'confirmPassword')
    });
  }
}
