import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator function to check if the value of one form control is greater than another.
 * @param greaterField The name of the form control that should have a greater value.
 * @param lesserField The name of the form control that should have a lesser value.
 * @returns A ValidatorFn that returns a validation error if the condition is not met.
 */
export function greaterThanValidator(greaterField: string, lesserField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const greater = control.get(greaterField)?.value;
        const lesser = control.get(lesserField)?.value;

        if (greater == null || lesser == null) {
            return null;
        }

        return Number(greater) > Number(lesser)
            ? null
            : { greaterThan: { greaterField, lesserField } };
    };
}
