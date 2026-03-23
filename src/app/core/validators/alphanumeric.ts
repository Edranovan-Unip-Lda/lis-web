import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function alphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }
        const valid = /^[a-zA-Z0-9]+$/.test(control.value);
        return valid ? null : { alphanumeric: true };
    };
}
