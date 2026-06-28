import { EmpresaService } from '@/core/services/empresa.service';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Async validator: checks an empresa NIF against the backend. Returns `{ nifTaken: true }` when an active
 * company already holds it. Pair the control with `updateOn: 'blur'` so it fires when the cursor leaves the
 * input (not on every keystroke). A failed check resolves to `null` — never block submission on a network error.
 *
 * @param originalNif optional provider of the company's current NIF (edit form). When the value is unchanged
 *        the check is skipped, so a company never flags its own NIF as taken.
 */
export function nifUniquenessValidator(
    empresaService: EmpresaService,
    originalNif?: () => string | null | undefined
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const value = control.value?.toString().trim();
        if (!value) {
            return of(null);
        }
        const original = originalNif?.()?.toString().trim();
        if (original && value === original) {
            return of(null);
        }
        return empresaService.checkNif(value).pipe(
            map(res => (res.available ? null : { nifTaken: true })),
            catchError(() => of(null))
        );
    };
}
