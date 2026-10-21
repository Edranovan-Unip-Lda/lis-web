// Verifies src/i18n/{pt,tet,en}.json share one key set with no empty values (pt is the reference), and that every
// literal key used in src/app (`'a.b' | translate`, instant('a.b'), t('a.b'), i18nOptions prefixes excluded)
// exists. `--review` also writes i18n-tet-review.csv (key, pt, tet) for a native-speaker pass over the Tetum text.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LANGS = ['pt', 'tet', 'en'];
const flatten = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object' && !Array.isArray(v) ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
    );
const dicts = Object.fromEntries(
    LANGS.map((l) => [l, new Map(flatten(JSON.parse(readFileSync(new URL(`../src/i18n/${l}.json`, import.meta.url)))))])
);

const errors = [];
for (const lang of LANGS) {
    for (const [key, value] of dicts[lang]) {
        if (!dicts.pt.has(key)) errors.push(`${lang}: extra key ${key}`);
        if (value === '' || value == null) errors.push(`${lang}: empty ${key}`);
    }
    for (const key of dicts.pt.keys()) if (!dicts[lang].has(key)) errors.push(`${lang}: missing ${key}`);
}

const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : /\.(ts|html)$/.test(e.name) && !e.name.endsWith('.spec.ts') ? [join(dir, e.name)] : []
    );
const KEY_REFS = [/'([a-z][\w]*(?:\.[\w-]+)+)'\s*\|\s*translate/g, /\b(?:instant|t)\(\s*'([a-z][\w]*(?:\.[\w-]+)+)'/g];
const srcRoot = new URL('../src/app', import.meta.url).pathname;
for (const file of walk(srcRoot)) {
    const text = readFileSync(file, 'utf8');
    for (const re of KEY_REFS)
        for (const [, key] of text.matchAll(re))
            if (!dicts.pt.has(key) && ![...dicts.pt.keys()].some((k) => k.startsWith(key + '.')))
                errors.push(`unknown key ${key} in ${file.slice(srcRoot.length + 1)}`);
}

if (process.argv.includes('--review')) {
    const esc = (v) => `"${String(Array.isArray(v) ? v.join(' | ') : v).replaceAll('"', '""')}"`;
    const rows = [...dicts.pt].map(([k, pt]) => [k, pt, dicts.tet.get(k)].map(esc).join(','));
    writeFileSync('i18n-tet-review.csv', '﻿key,pt,tet\n' + rows.join('\n') + '\n');
    console.log(`i18n-tet-review.csv: ${rows.length} rows`);
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}
console.log(`i18n OK: ${dicts.pt.size} keys × ${LANGS.length} languages`);
