import localePt from '@angular/common/locales/pt';

// Angular ships no Tetum locale data. Tetum shares Portuguese number/plural rules, so clone `pt` and swap the
// calendar names and long date patterns (indices follow Angular's LocaleDataIndex).
const u = undefined;
const tet: unknown[] = [...localePt];

tet[0] = 'tet';
tet[3] = [
    ['D', 'S', 'T', 'K', 'K', 'S', 'S'],
    ['Dom', 'Seg', 'Ter', 'Kua', 'Kin', 'Ses', 'Sáb'],
    ['Domingu', 'Segunda', 'Tersa', 'Kuarta', 'Kinta', 'Sesta', 'Sábadu'],
    ['Dom', 'Seg', 'Ter', 'Kua', 'Kin', 'Ses', 'Sáb']
];
tet[4] = u;
tet[5] = [
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    ['Janeiru', 'Fevereiru', 'Marsu', 'Abríl', 'Maiu', 'Juñu', 'Jullu', 'Agostu', 'Setembru', 'Outubru', 'Novembru', 'Dezembru']
];
tet[6] = u;
tet[10] = ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'];

export default tet;
