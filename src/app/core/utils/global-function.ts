import { i18nOptions } from "../i18n/translate-ref";
import { AplicanteStatus, AplicanteType, AreaRepresentante, AuditEntity, AuditType, CaraterizacaoEstabelecimento, Categoria, NivelRisco, QuantoAtividade, Role, Status, TipoAto, TipoDocumento, TipoEmpresa, TipoEstabelecimento, TipoNacionalidade, TipoPedidoCadastro, TipoPedidoLicenca, TipoPedidoVistoria, TipoPropriedade } from "../models/enums";

export const maxFileSizeUpload = 20 * 1024 * 1024;

export function calculateCommercialLicenseTax(areaM2: number, T_MIN: number, T_MAX: number): number {
    if (areaM2 >= 900) {
        return T_MAX;
    }

    const blocks = Math.ceil(areaM2 / 100);
    const tax = blocks * T_MIN;

    return Math.min(tax, T_MAX);
}

/**
  * Maps an array of objects to an array of objects with only id and name properties.
  *
  * @param array The array of objects to be mapped.
  * @returns An array of objects with only id and name properties.
  */
export function mapToIdAndName(array: any[]): { id: number, name: string }[] {
    return array.map(item => {
        return {
            id: item.id,
            name: item.name
        };
    });
}

export function mapToIdAndNome(array: any[]): { id: number, nome: string }[] {
    return array.map(item => {
        return {
            id: item.id,
            nome: item.nome
        };
    });
}

export function mapToGrupoAtividade(array: any[]): { id: number, codigo: string, descricao: string }[] {
    return array.map(item => {
        return {
            id: item.id,
            codigo: item.codigo,
            descricao: item.descricao,
        };
    });
}

export function mapToAtividadeEconomica(array: any[]): { id: number, codigo: string, descricao: string, tipoRisco: NivelRisco }[] {
    return array.map(item => {
        return {
            id: item.id,
            codigo: item.codigo,
            descricao: item.descricao,
            tipoRisco: item.tipoRisco,
            grupoAtividade: {
                id: item.grupoAtividade.id,
                codigo: item.grupoAtividade.codigo,
                descricao: item.grupoAtividade.descricao,
            }
        };
    });
}

export function mapToTaxa(array: any[]): { id: number, categoria: string, tipo: string, ato: string, montanteMinimo: number, montanteMaximo: number }[] {
    return array.map(item => {
        return {
            id: item.id,
            categoria: item.categoria,
            tipo: item.tipo,
            ato: item.ato,
            montanteMinimo: item.montanteMinimo,
            montanteMaximo: item.montanteMaximo,
        };
    });
}

// Option labels are translation keys resolved on access (see i18nOptions) — bind these arrays as-is.
export const statusOptions: any[] = i18nOptions('status', [
    { value: Status.active, icon: 'bi bi-fw bi-shield-check', color: 'text-green-500' },
    { value: Status.pending, icon: 'bi bi-fw bi-pause-circle', color: 'text-yellow-500' },
    { value: Status.disabled, icon: 'bi bi-fw bi-ban', color: 'text-red-500' },
]);

export const roleOptions: any[] = i18nOptions('enum.Role', [
    { value: Role.admin }, { value: Role.manager }, { value: Role.chief }, { value: Role.staff }, { value: Role.client },
]);

export const nivelRiscoOptions: any[] = i18nOptions('enum.NivelRisco', [
    { value: NivelRisco.baixo }, { value: NivelRisco.medio }, { value: NivelRisco.alto },
]);

// Values are persisted as-is (Portuguese free text); only the label is translated.
export const estadoCivilOptions: any[] = i18nOptions('options.estadoCivil', [
    { value: 'Solteiro(a)', key: 'solteiro' },
    { value: 'Casado(a)', key: 'casado' },
    { value: 'Divorciado(a)', key: 'divorciado' },
    { value: 'Viúvo(a)', key: 'viuvo' },
]);

export const applicationTypesOptions: any[] = i18nOptions('enum.AplicanteType', [
    { value: AplicanteType.cadastro }, { value: AplicanteType.licenca },
]);

export const categoryTpesOptions: any[] = i18nOptions('enum.Categoria', [
    { value: Categoria.comercial }, { value: Categoria.industrial },
]);

export const aplicanteStatusOptions: any[] = i18nOptions('status', [
    { value: AplicanteStatus.aprovado }, { value: AplicanteStatus.rejeitado },
]);

export const tipoPedidoCadastroOptions: any[] = i18nOptions('enum.TipoPedidoCadastro', [
    { value: TipoPedidoCadastro.inicial }, { value: TipoPedidoCadastro.alteracao }, { value: TipoPedidoCadastro.anual },
]);

export const tipoEstabelecimentoOptions: any[] = i18nOptions('enum.TipoEstabelecimento', [
    { value: TipoEstabelecimento.principal }, { value: TipoEstabelecimento.delegacao }, { value: TipoEstabelecimento.sucursal },
]);

export const tipoEmpresaOptions: any[] = i18nOptions('enum.TipoEmpresa', [
    { value: TipoEmpresa.micro }, { value: TipoEmpresa.pequena }, { value: TipoEmpresa.media }, { value: TipoEmpresa.grande },
]);

export const tipoNacionalidadeOptions: any[] = i18nOptions('enum.TipoNacionalidade', [
    { value: TipoNacionalidade.timorense }, { value: TipoNacionalidade.estrangeiro },
]);

export const quantoAtividadeoptions: any[] = i18nOptions('enum.QuantoAtividade', [
    { value: QuantoAtividade.producao }, { value: QuantoAtividade.exploracao },
]);

export const caraterizacaEstabelecimentoOptions: any[] = i18nOptions('enum.CaraterizacaoEstabelecimento', [
    { value: CaraterizacaoEstabelecimento.kiosk }, { value: CaraterizacaoEstabelecimento.loja }, { value: CaraterizacaoEstabelecimento.armazem },
]);

export const tipoAtoOptions: any[] = i18nOptions('enum.TipoAto', [{ value: TipoAto.retalho }, { value: TipoAto.grosso }]);

export const tipoPropriedadeOptions: any[] = i18nOptions('enum.TipoPropriedade', [
    { value: TipoPropriedade.individual }, { value: TipoPropriedade.sociedade },
]);

export const tipoRelacaoFamiliaOptions: any[] = i18nOptions('options.relacaoFamilia', [
    { value: 'Marido', key: 'marido' },
    { value: 'Esposa', key: 'esposa' },
    { value: 'Filho(a)', key: 'filho' },
    { value: 'Pai', key: 'pai' },
    { value: 'Mãe', key: 'mae' },
]);

export const tipoDocumentoOptions: any[] = i18nOptions('enum.TipoDocumento', [
    { value: TipoDocumento.bilheteIdentidade }, { value: TipoDocumento.passaporte }, { value: TipoDocumento.nif },
]);

export const tipoPedidoAtividadeComercialOptions: any[] = i18nOptions('options.tipoPedidoAtividadeComercial', [
    { value: TipoPedidoLicenca.novo }, { value: TipoPedidoLicenca.alteracao }, { value: TipoPedidoLicenca.renovacao },
]);

export const tipoArrendadorOptions: any[] = i18nOptions('options.arrendador', [
    { value: 'Estado', key: 'estado' },
    { value: 'Empresa', key: 'empresa' },
    { value: 'Individual', key: 'individual' },
]);

export const tipoPedidoAtividadeIndustrialOptions: any[] = i18nOptions('options.tipoPedidoAtividadeIndustrial', [
    { value: TipoPedidoLicenca.instalacao }, { value: TipoPedidoLicenca.exploracao }, { value: TipoPedidoLicenca.alteracao }, { value: TipoPedidoLicenca.renovacao },
]);

export const stateOptions: any[] = i18nOptions('options.state', [{ value: true }, { value: false }], 'label');

export const tipoPedidoVitoriaAll: any[] = i18nOptions('enum.TipoPedidoVistoria', [
    { value: TipoPedidoVistoria.previa }, { value: TipoPedidoVistoria.subsequente }, { value: TipoPedidoVistoria.inicial }, { value: TipoPedidoVistoria.exploracao },
]);

export const tipoPedidoVistoriaComercialOptions: any[] = i18nOptions('enum.TipoPedidoVistoria', [
    { value: TipoPedidoVistoria.previa }, { value: TipoPedidoVistoria.subsequente },
]);

export const tipoPedidoVistoriaIndustrialOptions: any[] = i18nOptions('enum.TipoPedidoVistoria', [
    { value: TipoPedidoVistoria.inicial }, { value: TipoPedidoVistoria.exploracao }, { value: TipoPedidoVistoria.subsequente },
]);

export const tipoAreaRepresentanteComercial: any[] = i18nOptions('enum.AreaRepresentante', [
    { value: AreaRepresentante.comercio },
    { value: AreaRepresentante.autoridadeLocal },
    { value: AreaRepresentante.saude },
    { value: AreaRepresentante.trabalho },
    { value: AreaRepresentante.bombeiros },
]);

export const tipoAreaRepresentanteIndustrial: any[] = i18nOptions('enum.AreaRepresentante', [
    { value: AreaRepresentante.mop },
    { value: AreaRepresentante.anla },
    { value: AreaRepresentante.industria },
    { value: AreaRepresentante.autoridadeLocal },
    { value: AreaRepresentante.saude },
    { value: AreaRepresentante.trabalho },
    { value: AreaRepresentante.bombeiros },
]);

export const tipoRepresentante: { name: string, value: string }[] = i18nOptions('options.representante', [
    { value: 'Empresa', key: 'empresa' },
    { value: 'Individual', key: 'individual' },
]);

export const tipoLocalOptions: { name: string, value: string }[] = i18nOptions('options.tipoLocal', [
    { value: 'Comercial', key: 'comercial' },
    { value: 'Residencial', key: 'residencial' },
]);

export const tipoEletricidadeOptions: { name: string, value: string }[] = i18nOptions('options.eletricidade', [
    { value: 'Monofásico', key: 'mono' },
    { value: 'Trifásico', key: 'tri' },
]);

/**
 * Adjusts a given date for the timezone offset so that the local date is preserved.
 * Returns a string in the format "YYYY-MM-DD".
 * @param date The date to be adjusted
 * @returns A string representing the adjusted date in local time
 */
// CHANGED: null-safe — draft saves legitimately carry empty dates (e.g. arrendador dataInicio/dataFim).
export function formatDateForLocalDate(date: Date | null | undefined): string | null {
    if (!date) return null;
    // Adjust for timezone offset so that local date is preserved
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const corrected = new Date(date.getTime() - offsetMs);

    return corrected.toISOString().split('T')[0];
}

// `label` is a translation key, rendered with `| translate`.
export const pedidoLicencaDocumentsFields = [
    { name: 'documentoImovel', label: 'application.atividade.pedido.docs.documentoImovel' },
    { name: 'planoEmergencia', label: 'application.atividade.pedido.docs.planoEmergencia' },
];

export const autoVistoriaCommonFields: { name: string, label: string }[] = [
    {
        name: 'tipoLocal',
        label: 'application.vistoria.fields.legislacaoUrbanistica'
    },
    {
        name: 'acessoEstrada',
        label: 'application.vistoria.fields.acessoEstrada'
    },
    {
        name: 'superficie',
        label: 'application.vistoria.fields.larguraEstrada'
    },
    {
        name: 'larguraEstrada',
        label: 'application.vistoria.fields.larguraEstrada'
    },
    {
        name: 'escoamentoAguas',
        label: 'application.vistoria.fields.escoamentoAguas'
    },
    {
        name: 'escoamentoAguas',
        label: 'application.vistoria.fields.escoamentoAguas'
    },
    {
        name: 'tipoEletricidade',
        label: 'application.vistoria.fields.tipoEletricidade'
    },
];

// Sim/Não checklist items shared by every category (items 1, a, b, c) — same file/descricao rules as the category lists.
export const autoVistoriaChecklistCommonFields: { name: string, label: string }[] = [
    { name: 'legislacaoUrbanistica', label: 'application.vistoria.fields.legislacaoUrbanistica' },
    { name: 'acessoEstrada', label: 'application.vistoria.fields.acessoEstrada' },
    { name: 'escoamentoAguas', label: 'application.vistoria.fields.escoamentoAguas' },
    { name: 'alimentacaoEnergia', label: 'application.vistoria.fields.alimentacaoEnergia' },
];

export const autoVistoriaComercialFields: { name: string, label: string }[] = [
    {
        name: 'separadosSexo',
        label: 'application.vistoria.fields.separadosSexo'
    },
    {
        name: 'lavatoriosComEspelho',
        label: 'application.vistoria.fields.lavatoriosComEspelho'
    },
    {
        name: 'comunicacaoVentilacao',
        label: 'application.vistoria.fields.comunicacaoVentilacao'
    },
    {
        name: 'esgotoAguas',
        label: 'application.vistoria.fields.esgotoAguas'
    },
    {
        name: 'paredesPavimentos',
        label: 'application.vistoria.fields.paredesPavimentos'
    },
    {
        name: 'zonasDestinadas',
        label: 'application.vistoria.fields.zonasDestinadas'
    },
    {
        name: 'instalacoesFrigorificas',
        label: 'application.vistoria.fields.instalacoesFrigorificas'
    },
    {
        name: 'sectoresLimpos',
        label: 'application.vistoria.fields.sectoresLimpos'
    },
    {
        name: 'pisosParedes',
        label: 'application.vistoria.fields.pisosParedes'
    },
    {
        name: 'pisosResistentes',
        label: 'application.vistoria.fields.pisosResistentes'
    },
    {
        name: 'paredesInteriores',
        label: 'application.vistoria.fields.paredesInteriores'
    },
    {
        name: 'paredes3metros',
        label: 'application.vistoria.fields.paredes3metros'
    },
    {
        name: 'unioesParedes',
        label: 'application.vistoria.fields.unioesParedes'
    },
    {
        name: 'ventilacoesNecessarias',
        label: 'application.vistoria.fields.ventilacoesNecessarias'
    },
    {
        name: 'iluminacao',
        label: 'application.vistoria.fields.iluminacao'
    },
    {
        name: 'aguaPotavel',
        label: 'application.vistoria.fields.aguaPotavel'
    },
    {
        name: 'distribuicaoAgua',
        label: 'application.vistoria.fields.distribuicaoAgua'
    },
    {
        name: 'redeDistribuicao',
        label: 'application.vistoria.fields.redeDistribuicao'
    },
    {
        name: 'redeEsgotos',
        label: 'application.vistoria.fields.redeEsgotos'
    },
    {
        name: 'equipamentoUtensilios',
        label: 'application.vistoria.fields.equipamentoUtensilios'
    },
    {
        name: 'equipamentoPrimeirosSocorros',
        label: 'application.vistoria.fields.equipamentoPrimeirosSocorros'
    },
    {
        name: 'recipientesLixo',
        label: 'application.vistoria.fields.recipientesLixo'
    },
    {
        name: 'limpezaDiaria',
        label: 'application.vistoria.fields.limpezaDiaria'
    },
];


export const autoVistoriaIndustrialFields: { name: string, label: string }[] = [
    {
        name: 'separadosSexo',
        label: 'application.vistoria.fields.separadosSexo'
    },
    {
        name: 'lavatoriosComEspelho',
        label: 'application.vistoria.fields.lavatoriosComEspelho'
    },
    {
        name: 'sanitasAutomaticaAgua',
        label: 'application.vistoria.fields.sanitasAutomaticaAgua'
    },
    {
        name: 'comunicacaoVentilacao',
        label: 'application.vistoria.fields.comunicacaoVentilacao'
    },
    {
        name: 'esgotoAguas',
        label: 'application.vistoria.fields.esgotoAguas'
    },
    {
        name: 'paredesPavimentos',
        label: 'application.vistoria.fields.paredesPavimentos'
    },
    {
        name: 'pisosParedes',
        label: 'application.vistoria.fields.pisosParedes'
    },
    {
        name: 'paredesInteriores',
        label: 'application.vistoria.fields.paredesInteriores'
    },
    {
        name: 'paredes3metros',
        label: 'application.vistoria.fields.paredes3metros'
    },
    {
        name: 'ventilacoesNecessarias',
        label: 'application.vistoria.fields.ventilacoesNecessarias'
    },
    {
        name: 'iluminacao',
        label: 'application.vistoria.fields.iluminacao'
    },
    {
        name: 'aguaPotavel',
        label: 'application.vistoria.fields.aguaPotavel'
    },
    {
        name: 'distribuicaoAgua',
        label: 'application.vistoria.fields.distribuicaoAgua'
    },
    {
        name: 'redeDistribuicao',
        label: 'application.vistoria.fields.redeDistribuicao'
    },
    {
        name: 'redeEsgotos',
        label: 'application.vistoria.fields.redeEsgotos'
    },
    {
        name: 'maximoHigieneSeguranca',
        label: 'application.vistoria.fields.maximoHigieneSeguranca'
    },
    {
        name: 'equipamentoPrimeirosSocorros',
        label: 'application.vistoria.fields.equipamentoPrimeirosSocorros'
    },
    {
        name: 'recipientesLixo',
        label: 'application.vistoria.fields.recipientesLixo'
    },
    {
        name: 'limpezaDiaria',
        label: 'application.vistoria.fields.limpezaDiaria'
    },
];

export const randomColors: { [key: string]: { bg: string, shadow: string } } = {
    'GRANDE': { bg: 'rgb(251, 191, 36)', shadow: 'rgba(251, 191, 36, 0.3)' },        // amber-400
    'MÉDIA': { bg: 'rgb(34, 197, 94)', shadow: 'rgba(34, 197, 94, 0.3)' },          // green-500
    'PEQUENA': { bg: 'rgb(59, 130, 246)', shadow: 'rgba(59, 130, 246, 0.3)' },      // blue-500
    'MICRO': { bg: 'rgb(234, 179, 8)', shadow: 'rgba(234, 179, 8, 0.3)' },          // yellow-500
    'ENIN': { bg: 'rgb(168, 85, 247)', shadow: 'rgba(168, 85, 247, 0.3)' },      // purple-500
    'LDA': { bg: 'rgb(236, 72, 153)', shadow: 'rgba(236, 72, 153, 0.3)' },      // pink-500
    'Empresa Pública': { bg: 'rgb(14, 165, 233)', shadow: 'rgba(14, 165, 233, 0.3)' }, // sky-500
    'Sociedade Anonima': { bg: 'rgb(99, 102, 241)', shadow: 'rgba(99, 102, 241, 0.3)' }, // indigo-500
    'Unipessoal Lda': { bg: 'rgb(249, 115, 22)', shadow: 'rgba(249, 115, 22, 0.3)' }, // orange-500
    'Ativos': { bg: 'rgb(34, 197, 94)', shadow: 'rgba(34, 197, 94, 0.3)' },          // green-500
    'Expirados': { bg: 'rgb(239, 68, 68)', shadow: 'rgba(239, 68, 68, 0.3)' },      // red-500
};

export const listaMunicipios: [string, string, number][] = [
    ['Aileu', 'tl-al', 0], ['Ainaro', 'tl-an', 0], ['Atauro', 'tl-at', 0], ['Baucau', 'tl-bc', 0], ['Bobonaro', 'tl-bb', 0],
    ['Covalima', 'tl-cl', 0], ['Dili', 'tl-dl', 0], ['Ermera', 'tl-er', 0], ['Liquiça', 'tl-lq', 0],
    ['Lautem', 'tl-bt', 0], ['Manatuto', 'tl-mt', 0], ['Manufahi', 'tl-mf', 0], ['Oecusse', 'tl-oe', 0], ['Viqueque', 'tl-vq', 0]
]

export const listaAuditType: { name: string, value: AuditType }[] = i18nOptions('enum.AuditType', [
    { value: AuditType.initial }, { value: AuditType.update },
]);

export const listaAuditEntity: { name: AuditEntity, value: AuditEntity }[] = [
    {
        name: AuditEntity.user,
        value: AuditEntity.user
    },
    {
        name: AuditEntity.role,
        value: AuditEntity.role
    },
    {
        name: AuditEntity.aplicante,
        value: AuditEntity.aplicante
    },
    {
        name: AuditEntity.empresa,
        value: AuditEntity.empresa
    },
    {
        name: AuditEntity.pedidoInscricaoCadastro,
        value: AuditEntity.pedidoInscricaoCadastro
    },
    {
        name: AuditEntity.certificadoInscricaoCadastro,
        value: AuditEntity.certificadoInscricaoCadastro
    },
    {
        name: AuditEntity.pedidoLicencaAtividade,
        value: AuditEntity.pedidoLicencaAtividade
    },
    {
        name: AuditEntity.certificadoLicencaAtividade,
        value: AuditEntity.certificadoLicencaAtividade
    },
    {
        name: AuditEntity.pedidoVistoria,
        value: AuditEntity.pedidoVistoria
    },
    {
        name: AuditEntity.autoVistoria,
        value: AuditEntity.autoVistoria
    },
];