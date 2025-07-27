import { AplicanteType, CaraterizacaoEstabelecimento, Categoria, NivelRisco, QuantoAtividade, Role, Status, TipoAto, TipoDocumento, TipoEmpresa, TipoEstabelecimento, TipoPedidoCadastro, TipoPropriedade } from "../models/enums";

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

export function mapToAtividadeEconomica(array: any[]): { id: number, codigo: string, descricao: string }[] {
    return array.map(item => {
        return {
            id: item.id,
            codigo: item.codigo,
            descricao: item.descricao
        };
    });
}

export function mapToTaxa(array: any[]): { id: number, ato: string, montante: number }[] {
    return array.map(item => {
        return {
            id: item.id,
            ato: item.ato,
            montante: item.montante
        };
    });
}

export const statusOptions: any[] = [
    { name: Status.active, value: Status.active, icon: 'bi bi-fw bi-shield-check', color: 'text-green-500' },
    { name: Status.pending, value: Status.pending, icon: 'bi bi-fw bi-pause-circle', color: 'text-yellow-500' },
    { name: Status.disabled, value: Status.disabled, icon: 'bi bi-fw bi-ban', color: 'text-red-500' },
];

export const roleOptions: any[] = [
    { name: 'Admin', value: Role.admin },
    { name: 'User', value: Role.staff },
    { name: 'Guest', value: Role.client }
];

export const nivelRiscoOptions: any[] = [
    { name: 'Baixo', value: NivelRisco.baixo },
    { name: 'Medio', value: NivelRisco.medio },
    { name: 'Alto', value: NivelRisco.alto }
];

export const applicationTypesOptions: any[] = [
    {
        name: 'Inscrição no Cadastro',
        value: AplicanteType.cadastro
    },
    {
        name: 'Licenca para Exercicio de Atividade',
        value: AplicanteType.licenca
    }
];
export const categoryTpesOptions: any[] = [
    {
        name: 'Comercial',
        value: Categoria.comercial
    },
    {
        name: 'Industrial',
        value: Categoria.industrial
    }
];

export const tipoPedidoCadastroOptions: any[] = [
    {
        name: 'Inscrição Inicial',
        value: TipoPedidoCadastro.inicial
    },
    {
        name: 'Alteração',
        value: TipoPedidoCadastro.alteracao
    },
    {
        name: 'Atualização Anual',
        value: TipoPedidoCadastro.anual
    },
];

export const tipoEstabelecimentoOptions: any[] = [
    {
        name: 'Estabelecimento Principal',
        value: TipoEstabelecimento.principal
    },
    {
        name: 'Delegação',
        value: TipoEstabelecimento.delegacao
    },
    {
        name: 'Sucursal',
        value: TipoEstabelecimento.sucursal
    },
]

export const tipoEmpresaOptions: any[] = [
    {
        name: 'Microempresa',
        value: TipoEmpresa.micro
    },
    {
        name: 'Pequena Empresa',
        value: TipoEmpresa.pequena
    },
    {
        name: 'Média Empresa',
        value: TipoEmpresa.media
    },
    {
        name: 'Grande Empresa',
        value: TipoEmpresa.grande
    },
];

export const quantoAtividadeoptions: any[] = [
    {
        name: 'Produção',
        value: QuantoAtividade.producao
    },
    {
        name: 'Exploração',
        value: QuantoAtividade.exploracao
    },
]

export const caraterizacaEstabelecimentoOptions: any[] = [
    {
        name: 'Kiosk',
        value: CaraterizacaoEstabelecimento.kiosk
    },
    {
        name: 'Loja',
        value: CaraterizacaoEstabelecimento.loja
    },
    {
        name: 'Armazém',
        value: CaraterizacaoEstabelecimento.armazem
    },
];

export const tipoAtoOptions: any[] = [
    { name: 'Venda a retalho', value: TipoAto.retalho },
    { name: 'Venda a grosso', value: TipoAto.grosso },
];

export const tipoPropriedadeOptions: any[] = [
    { name: 'Empresário em Nome Individual', value: TipoPropriedade.individual },
    { name: 'Sociedade por Quotas', value: TipoPropriedade.sociedade },
];

export const tipoDocumentoOptions: any[] = [
    { name: 'Bilhete de Identidade', value: TipoDocumento.bilheteIdentidade },
    { name: 'Cartão de Eleitoral', value: TipoDocumento.eleitoral },
    { name: 'Passaporte', value: TipoDocumento.passaporte },
    { name: 'Carta de Condução', value: TipoDocumento.cartaConducao },
];