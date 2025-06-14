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