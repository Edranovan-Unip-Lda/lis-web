import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

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

        // 1️⃣ documentoPropriedade
        if (get('documentoPropriedade') === true) {
            if (get('documentoPropriedadeFile') == null) {
                errors.documentoPropriedadeFileRequired = true;
            }
        }

        // 2️⃣ contratoArrendamento required if documentoPropriedade is false
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

export function autoVistoriaWithFilesValidator(
    fields: { name: string, label: string }[]
): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const errors: any = {};

        for (const field of fields) {
            const value = group.get(field.name)?.value;           // true | false | null
            const file = group.get(`${field.name}File`)?.value;   // file object or null
            const desc = group.get(`${field.name}Descricao`)?.value; // descricao text

            // 1️⃣ User must choose Yes/No (true/false)
            if (value === null || value === undefined) {
                errors[`${field.name}MissingYesNo`] = true;
                continue;
            }

            // 2️⃣ If YES → file required
            if (value === true) {
                if (!file || !file.nome) {
                    errors[`${field.name}FileRequired`] = true;
                }
            }

            // 3️⃣ If NO → descricao required
            if (value === false) {
                if (!desc || desc.trim() === '') {
                    errors[`${field.name}DescricaoRequired`] = true;
                }
            }
        }

        return Object.keys(errors).length ? errors : null;
    };
}