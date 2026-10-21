type Translator = (key: string, params?: Record<string, unknown>) => string;

let translator: Translator = (key) => key;

/** Called once by LanguageService; the bound function reads the language signal, so callers inside a reactive
 *  context (templates, computed — e.g. p-select's label computed) re-evaluate on every switch. */
export function bindTranslator(fn: Translator): void {
    translator = fn;
}

/** Translate from plain TS (module constants, option getters) where DI is unavailable. */
export function t(key: string, params?: Record<string, unknown>): string {
    return translator(key, params);
}

export type I18nOption<V = any, X = {}> = X & { value: V; name: string };

/**
 * Static option list whose `name` (or `label`) is a getter resolving `<prefix>.<key ?? value>` on access. The
 * objects themselves never change, so forms that hold an option object (not just its value) keep their selection
 * across a language switch, and consumers bind the array exactly as before.
 */
export function i18nOptions<V, X extends object = {}>(
    prefix: string,
    entries: ReadonlyArray<X & { value: V; key?: string }>,
    labelProp: 'name' | 'label' = 'name'
): I18nOption<V, X>[] {
    return entries.map(({ key, ...rest }) =>
        Object.defineProperty({ ...rest }, labelProp, {
            enumerable: true,
            get: () => t(`${prefix}.${key ?? String(rest.value)}`)
        })
    ) as unknown as I18nOption<V, X>[];
}
