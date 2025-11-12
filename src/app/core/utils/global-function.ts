import { FormGroup, Validators } from "@angular/forms";
import { AplicanteType, AreaRepresentante, CaraterizacaoEstabelecimento, Categoria, NivelRisco, QuantoAtividade, Role, Status, TipoAto, TipoDocumento, TipoEmpresa, TipoEstabelecimento, TipoPedidoCadastro, TipoPedidoLicenca, TipoPedidoVistoria, TipoPropriedade } from "../models/enums";

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
            tipoRisco: item.tipoRisco
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

export const statusOptions: any[] = [
    { name: Status.active, value: Status.active, icon: 'bi bi-fw bi-shield-check', color: 'text-green-500' },
    { name: Status.pending, value: Status.pending, icon: 'bi bi-fw bi-pause-circle', color: 'text-yellow-500' },
    { name: Status.disabled, value: Status.disabled, icon: 'bi bi-fw bi-ban', color: 'text-red-500' },
];

export const roleOptions: any[] = [
    { name: 'Administrador', value: Role.admin },
    { name: 'Diretor', value: Role.manager },
    { name: 'Xefe Departamento', value: Role.chief },
    { name: 'Funcionário', value: Role.staff },
    { name: 'Empresa', value: Role.client },
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

export const tipoRelacaoFamiliaOptions: any[] = [
    { name: 'Marido', value: 'Marido' },
    { name: 'Esposa', value: 'Esposa' },
    { name: 'Filho(a)', value: 'Filho(a)' },
    { name: 'Pai', value: 'Pai' },
    { name: 'Mãe', value: 'Mãe' },
];

export const tipoDocumentoOptions: any[] = [
    { name: 'Bilhete de Identidade', value: TipoDocumento.bilheteIdentidade },
    { name: 'Passaporte', value: TipoDocumento.passaporte },
    { name: 'NIF (Nº TIN)', value: TipoDocumento.nif },
];

export const tipoPedidoAtividadeComercialOptions: any[] = [
    {
        name: 'Pedido de Licença',
        value: TipoPedidoLicenca.novo
    },
    {
        name: 'Pedido de Alteração de Licença',
        value: TipoPedidoLicenca.alteracao
    },
    {
        name: 'Pedido de Renovação de Licença',
        value: TipoPedidoLicenca.renovacao
    }
];

export const tipoArrendadorOptions: any[] = [
    {
        name: 'Estado',
        value: 'Estado'
    },
    {
        name: 'Empresa',
        value: 'Empresa'
    },
    {
        name: 'Individual',
        value: 'Individual'
    },
]

export const tipoPedidoAtividadeIndustrialOptions: any[] = [
    {
        name: 'Licença para Instalação',
        value: TipoPedidoLicenca.instalacao
    },
    {
        name: 'Licença para Exploração',
        value: TipoPedidoLicenca.exploracao
    },
    {
        name: 'Licença para Alteração',
        value: TipoPedidoLicenca.alteracao
    },
    {
        name: 'Licença para Renovação',
        value: TipoPedidoLicenca.renovacao
    },
]

export const stateOptions: any[] = [
    { label: 'SIM', value: true },
    { label: 'NAO', value: false }
];

export const tipoPedidoVistoriaComercialOptions: any[] = [
    {
        name: 'Vistoria previa',
        value: TipoPedidoVistoria.previa
    },
    {
        name: 'Vistoria subsequente',
        value: TipoPedidoVistoria.subsequente
    }
]

export const tipoPedidoVistoriaIndustrialOptions: any[] = [
    {
        name: 'Vistoria inicial para a instalação',
        value: TipoPedidoVistoria.inicial
    },
    {
        name: 'Vistoria para exploração',
        value: TipoPedidoVistoria.exploracao
    },
    {
        name: 'Vistoria subsequente',
        value: TipoPedidoVistoria.subsequente
    }
];

export const tipoAreaRepresentanteComercial: any[] = [
    {
        name: 'Representante do departamento governamental responsável pela área do Comércio',
        value: AreaRepresentante.comercio
    },
    {
        name: 'Representante da autoridade administrativa local',
        value: AreaRepresentante.autoridadeLocal
    },
    {
        name: 'Representante do órgão local da saúde',
        value: AreaRepresentante.saude
    },
    {
        name: 'Representante da entidade com competências inspetivas do departamento governamental responsável pela área do Trabalho',
        value: AreaRepresentante.trabalho
    },
    {
        name: 'Representante do serviço de bombeiros',
        value: AreaRepresentante.bombeiros
    },
];

export const tipoAreaRepresentanteIndustrial: any[] = [
    {
        name: 'Representante do Ministéio Obras Pública',
        value: AreaRepresentante.mop
    },
    {
        name: 'Representante da Autoridade Nacional Licenciamento Ambiental',
        value: AreaRepresentante.anla
    },
    {
        name: 'Representante do departamento governamental responsável pela área do Comércio',
        value: AreaRepresentante.comercio
    },
    {
        name: 'Representante da autoridade administrativa local',
        value: AreaRepresentante.autoridadeLocal
    },
    {
        name: 'Representante do órgão local da saúde',
        value: AreaRepresentante.saude
    },
    {
        name: 'Representante da entidade com competências inspetivas do departamento governamental responsável pela área do Trabalho',
        value: AreaRepresentante.trabalho
    },
    {
        name: 'Representante do serviço de bombeiros',
        value: AreaRepresentante.bombeiros
    },
]

export const tipoRepresentante: { name: string, value: string }[] = [
    {
        name: 'Empresa',
        value: 'Empresa'
    },
    {
        name: 'Individual',
        value: 'Individual'
    }
];

export const tipoLocalOptions: { name: string, value: string }[] = [
    {
        name: 'Comercial',
        value: 'Comercial'
    },
    {
        name: 'Residencial',
        value: 'Residencial'
    }
];
export const tipoEletricidadeOptions: { name: string, value: string }[] = [
    {
        name: 'Monofásico - (Single-phase)',
        value: 'Monofásico'
    },
    {
        name: 'Trifásico (Three-phase)',
        value: 'Trifásico'
    }
];

/**
 * Adjusts a given date for the timezone offset so that the local date is preserved.
 * Returns a string in the format "YYYY-MM-DD".
 * @param date The date to be adjusted
 * @returns A string representing the adjusted date in local time
 */
export function formatDateForLocalDate(date: Date): string {
    // Adjust for timezone offset so that local date is preserved
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const corrected = new Date(date.getTime() - offsetMs);

    return corrected.toISOString().split('T')[0];
}

export const pedidoLicencaDocumentsFields = [
    { name: 'documentoPropriedade', label: 'Documento comprovativo do direito de propriedade ' },
    { name: 'documentoImovel', label: 'Documento comprovativo de posse de imovel ' },
    { name: 'planoEmergencia', label: 'Plano de Emergência ' },
    { name: 'estudoAmbiental', label: 'Estudo de Impacto Ambiental' },
]