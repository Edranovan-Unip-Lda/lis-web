import { ValidatorFn, AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export function mustMatch(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const formGroup = control as FormGroup;

        const passwordControl = formGroup.get(passwordControlName);
        const confirmPasswordControl = formGroup.get(confirmPasswordControlName);

        if (!passwordControl || !confirmPasswordControl) {
            return null;
        }

        const confirmErrors = confirmPasswordControl.errors;

        // Check for existing errors other than mustMatch
        if (confirmErrors && Object.keys(confirmErrors).some(key => key !== 'mustMatch')) {
            return null;
        }

        // ✅ Allow empty passwords (skip validation)
        if (!passwordControl.value && !confirmPasswordControl.value) {
            confirmPasswordControl.setErrors(null);
            return null;
        }

        if (passwordControl.value !== confirmPasswordControl.value) {
            confirmPasswordControl.setErrors({ ...confirmErrors, mustMatch: true });
        } else {
            // Remove mustMatch error while preserving other errors
            if (confirmErrors) {
                delete confirmErrors['mustMatch'];
                confirmPasswordControl.setErrors(Object.keys(confirmErrors).length ? confirmErrors : null);
            } else {
                confirmPasswordControl.setErrors(null);
            }
        }

        return null;
    };
}

export function pedidoAtividadeWithFilesValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const errors: any = {};

        const get = (name: string) => group.get(name)?.value;

        // 1️⃣ All main fields except "documentoPropriedade" must be true + have file
        ['planta', 'documentoImovel', 'planoEmergencia', 'estudoAmbiental'].forEach(field => {
            if (get(field) !== true) errors[`${field}Required`] = true;
            if (get(`${field}File`) == null) errors[`${field}FileRequired`] = true;
        });

        // 2️⃣ documentoPropriedade
        if (get('documentoPropriedade') === true) {
            if (get('documentoPropriedadeFile') == null) {
                errors.documentoPropriedadeFileRequired = true;
            }
        }

        // 3️⃣ contratoArrendamento required if documentoPropriedade is false
        if (get('documentoPropriedade') === false) {
            if (get('contratoArrendamento') !== true) {
                errors.contratoArrendamentoRequired = true;
            }
            if (get('contratoArrendamentoFile') == null) {
                errors.contratoArrendamentoFileRequired = true;
            }
        }

        return Object.keys(errors).length ? errors : null;
    };
}