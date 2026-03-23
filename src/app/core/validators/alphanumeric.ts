import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator function to check if the value of a form control is alphanumeric.
 * @returns A ValidatorFn that returns a validation error if the value is not alphanumeric.
 */
export function alphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }
        const valid = /^[a-zA-Z0-9]+$/.test(control.value);
        return valid ? null : { alphanumeric: true };
    };
}
