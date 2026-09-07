import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** A `lis_dm_sociedade_comercial` master-data row as the forms hold it (only `nome` is matched). */
export interface SociedadeComercialLike {
    nome?: string | null;
}

/**
 * Normalize for comparison: strip diacritics, lowercase, and collapse every non-alphanumeric run to a single
 * space. Punctuation therefore stops mattering — "Alda, Unipessoal Lda" and "Alda Unipessoal Lda" are equal.
 */
const normalizeWords = (value: unknown): string[] =>
    (value ?? '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean);

/** True when `words` ends with exactly the `suffix` sequence (whole-word comparison, no substrings). */
const endsWithWords = (words: string[], suffix: string[]): boolean =>
    suffix.length > 0 &&
    suffix.length <= words.length &&
    suffix.every((word, i) => words[words.length - suffix.length + i] === word);

/**
 * Validator: rejects a company name that ends with a commercial-company legal form ("Alda Lda",
 * "Alda, Unipessoal Lda") — that belongs in the "Tipo de Sociedade Comercial" field instead.
 *
 * Matching is **whole-word and suffix-anchored**, which is what keeps a legitimate name like "Alda" or "Caldas"
 * valid: a plain substring test matches the 3-letter master-data row "LDA" inside them. Only the trailing words
 * are considered, so "Lda Trading Group" is fine. Only the `nome` column is matched — `acronimo` holds "S.A.",
 * whose two-letter form would collide with the surname "Sá".
 *
 * @param listProvider must be a FUNCTION, not an array: both forms build their FormGroup before the resolver
 *        data is assigned, so a list captured at construction time would always be empty.
 * @param originalNome optional provider of the company's stored name (edit form). When the value is unchanged,
 *        the check is skipped — records saved before this rule existed stay editable.
 */
export function sociedadeComercialNameValidator(
    listProvider: () => SociedadeComercialLike[] | null | undefined,
    originalNome?: () => string | null | undefined
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const words = normalizeWords(control.value);
        if (!words.length) {
            return null;
        }

        const original = originalNome?.()?.toString().trim();
        if (original && control.value?.toString().trim() === original) {
            return null;
        }

        // Longest match wins: "Alda Unipessoal Lda" hits both "LDA" and "Unipessoal Lda" — report only the latter.
        const matched = (listProvider() ?? [])
            .map(s => ({ nome: (s?.nome ?? '').toString().trim(), suffix: normalizeWords(s?.nome) }))
            .filter(entry => endsWithWords(words, entry.suffix))
            .sort((a, b) => b.suffix.length - a.suffix.length)[0];

        return matched ? { sociedadeComercialInName: { matched: [matched.nome] } } : null;
    };
}
