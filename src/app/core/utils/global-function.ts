import { AplicanteStatus, AplicanteType, AreaRepresentante, CaraterizacaoEstabelecimento, Categoria, NivelRisco, QuantoAtividade, Role, Status, TipoAto, TipoDocumento, TipoEmpresa, TipoEstabelecimento, TipoNacionalidade, TipoPedidoCadastro, TipoPedidoLicenca, TipoPedidoVistoria, TipoPropriedade } from "../models/enums";

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

export const estadoCivilOptions: any[] = [
    {
        name: 'Solteiro(a)',
        value: 'Solteiro(a)'
    },
    {
        name: 'Casado(a)',
        value: 'Casado(a)'
    },
    {
        name: 'Divorciado(a)',
        value: 'Divorciado(a)'
    },
    {
        name: 'Viúvo(a)',
        value: 'Viúvo(a)'
    },
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

export const aplicanteStatusOptions: any[] = [
    {
        name: AplicanteStatus.aprovado.toString(),
        value: AplicanteStatus.aprovado
    },
    {
        name: AplicanteStatus.rejeitado.toString(),
        value: AplicanteStatus.rejeitado
    }
]

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

export const tipoNacionalidadeOptions: any[] = [
    {
        name: 'Timorense',
        value: TipoNacionalidade.timorense
    },
    {
        name: 'Estrangeiro',
        value: TipoNacionalidade.estrangeiro
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

export const tipoPedidoVitoriaAll: any[] = [
    {
        name: 'Vistoria previa',
        value: TipoPedidoVistoria.previa
    },
    {
        name: 'Vistoria subsequente',
        value: TipoPedidoVistoria.subsequente
    },
    {
        name: 'Vistoria inicial para a instalação',
        value: TipoPedidoVistoria.inicial
    },
    {
        name: 'Vistoria para exploração',
        value: TipoPedidoVistoria.exploracao
    },
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
    { name: 'documentoImovel', label: 'Documento comprovativo de posse de imovel ' },
    { name: 'planoEmergencia', label: 'Plano de Emergência ' },
];

export const autoVistoriaCommonFields: { name: string, label: string }[] = [
    {
        name: 'tipoLocal',
        label: 'A escolha do local deve staisfazer as exigencias da legislacao urbanistica, tendo em conta especialmente os planos urbanisticos existentes ou as indicacoes dadas pelas autoridades locais competentes:'
    },
    {
        name: 'acessoEstrada',
        label: ''
    },
    {
        name: 'superficie',
        label: ''
    },
    {
        name: 'larguraEstrada',
        label: ''
    },
    {
        name: 'escoamentoAguas',
        label: ''
    },
    {
        name: 'escoamentoAguas',
        label: ''
    },
    {
        name: 'tipoEletricidade',
        label: ''
    },
];

export const autoVistoriaComercialFields: { name: string, label: string }[] = [
    {
        name: 'separadosSexo',
        label: 'Separados por sexo:'
    },
    {
        name: 'lavatoriosComEspelho',
        label: 'Dispor de lavatorios com espelho:'
    },
    {
        name: 'comunicacaoVentilacao',
        label: 'Comunicacao direta para o exterior ou serem adotadas de dispositivos ventilacao artificial com continua renovacao do ar adequados a sua dimensao: '
    },
    {
        name: 'esgotoAguas',
        label: 'Ligadas a uma rede interna de esgotos que conduzzam as aguas residuais a sistemas adequados ao seu escoamento, nomeadamente atraves da rede publica ou, se esta nao existir, de um sistema de recolha e tratamento adequado ao volume e natureza dessas aguas: '
    },
    {
        name: 'paredesPavimentos',
        label: 'As paredes, pavimentos e tetos das instalacoes sanitarias devem ser revestidas demateriais resistentes, impermeaveis, nao inflamaveis e de facil limpeza:'
    },
    {
        name: 'zonasDestinadas',
        label: 'Nao podem situar-se junto das zonas destinadas a preparar e cozinhar alimentos ou a tomar refeicoes:'
    },
    {
        name: 'instalacoesFrigorificas',
        label: 'Instalações frigoríficas para refrigeração e conservação, caso aplicável:'
    },
    {
        name: 'sectoresLimpos',
        label: 'Separação de sectores limpos e sujos:'
    },
    {
        name: 'pisosParedes',
        label: 'Pisos e paredes - os edifícios devem ser providos de dispositivos de proteção contra insetos e roedores e concebidos de modo a permitir uma aplicação fácil das normas de higienização, e para esse efeito:'
    },
    {
        name: 'pisosResistentes',
        label: 'Os pisos devem ser resistentes, perfeitamente estanques, antiderrapantes e com inclinações da ordem dos 3 % e rede de esgotos apropriada para escoamento de líquido:'
    },
    {
        name: 'paredesInteriores',
        label: 'As paredes interiores e o piso devem possuir um revestimento lavável:'
    },
    {
        name: 'paredes3metros',
        label: 'As paredes vem possuir até 3 metros de altura e um revestimento resistente ao choque, impermeáveis, liso e imputrescível:'
    },
    {
        name: 'unioesParedes',
        label: 'As uniões das paredes com os tetos e os pisos devem ser arredondadas:'
    },
    {
        name: 'ventilacoesNecessarias',
        label: 'Em todos os locais deve ser assegurada a ventilação necessária:'
    },
    {
        name: 'iluminacao',
        label: 'A iluminação, natural ou artificial, deve ser adequada às características de cada local:'
    },
    {
        name: 'aguaPotavel',
        label: 'O estabelecimento deve ser provido de uma rede de água potável sob pressão, fria e/ou quente, em quantidade suficiente para cobrir as suas necessidades:'
    },
    {
        name: 'distribuicaoAgua',
        label: 'A rede de distribuição de águas deve ter o número necessário de dispositivos de saída de água para assegurar a limpeza e lavagem em todas as suas atividades, incluindo a higiene do pessoal:'
    },
    {
        name: 'redeDistribuicao',
        label: 'Pode existir uma rede de distribuição, devidamente sinalizada, de água não potável para geradores de vapor, instalações comerciais frigoríficas, bocas de incêndio, jardinagem e outros serviços auxiliares, desde que não haja comunicação entre esta e a de água potável:'
    },
    {
        name: 'redeEsgotos',
        label: 'A rede de esgotos, fossas ou tanques sépticos tem de permitir a fácil observação, limpeza e desinfeção e possuir válvulas sifonadas grelhas de proteção e caixas de recolha de gorduras:'
    },
    {
        name: 'equipamentoUtensilios',
        label: 'Todo o equipamento e utensílios devem ser em material inalterável e de fácil limpeza e desinfeção:'
    },
    {
        name: 'equipamentoPrimeirosSocorros',
        label: 'Equipados com equipamento de primeiros socorros:'
    },
    {
        name: 'recipientesLixo',
        label: 'Dispor de recipientes para o lixo, com tampa, colocados em locais de fácil acesso e devidamente sinalizados:'
    },
    {
        name: 'limpezaDiaria',
        label: 'A limpeza e desinfeção diária dos contentores é obrigatória e o lixo e demais resíduos devem ser removidos diariamente para local adequado de forma a serem transportados pelos serviços públicos de recolha de lixo:'
    },
];


export const autoVistoriaIndustrialFields: { name: string, label: string }[] = [
    {
        name: 'separadosSexo',
        label: 'Separados por sexo:'
    },
    {
        name: 'lavatoriosComEspelho',
        label: 'Dispor de lavatorios com espelho:'
    },
    {
        name: 'sanitasAutomaticaAgua',
        label: 'Dispor de sanitas, dotadas de descarga automatica de agua:'
    },
    {
        name: 'comunicacaoVentilacao',
        label: 'Comunicacao direta para o exterior ou serem adotadas de dispositivos ventilacao artificial com continua renovacao do ar adequados a sua dimensao:'
    },
    {
        name: 'esgotoAguas',
        label: 'Ligadas a uma rede interna de esgotos que conduzzam as aguas residuais a sistemas adequados ao seu escoamento, nomeadamente atraves da rede publica ou, se esta nao existir, de um sistema de recolha e tratamento adequado ao volume e natureza dessas aguas: '
    },
    {
        name: 'paredesPavimentos',
        label: 'As paredes, pavimentos e tetos das instalacoes sanitarias devem ser revestidas demateriais resistentes, impermeaveis, nao inflamaveis e de facil limpeza:'
    },
    {
        name: 'pisosParedes',
        label: 'Pisos e paredes - os edifícios devem ser providos de dispositivos de proteção contra insetos e roedores e concebidos de modo a permitir uma aplicação fácil das normas de higienização, e para esse efeito:'
    },
    {
        name: 'paredesInteriores',
        label: 'As paredes interiores e o piso devem possuir um revestimento lavável:'
    },
    {
        name: 'paredes3metros',
        label: 'As paredes vem possuir até 3 metros de altura e um revestimento resistente ao choque, impermeáveis, liso e imputrescível:'
    },
    {
        name: 'ventilacoesNecessarias',
        label: 'Em todos os locais deve ser assegurada a ventilação necessária:'
    },
    {
        name: 'iluminacao',
        label: 'A iluminação, natural ou artificial, deve ser adequada às características de cada local:'
    },
    {
        name: 'aguaPotavel',
        label: 'O estabelecimento deve ser provido de uma rede de água potável sob pressão, fria e/ou quente, em quantidade suficiente para cobrir as suas necessidades:'
    },
    {
        name: 'distribuicaoAgua',
        label: 'A rede de distribuição de águas deve ter o número necessário de dispositivos de saída de água para assegurar a limpeza e lavagem em todas as suas atividades, incluindo a higiene do pessoal:'
    },
    {
        name: 'redeDistribuicao',
        label: 'Pode existir uma rede de distribuição, devidamente sinalizada, de água não potável para geradores de vapor, instalações comerciais frigoríficas, bocas de incêndio, jardinagem e outros serviços auxiliares, desde que não haja comunicação entre esta e a de água potável:'
    },
    {
        name: 'redeEsgotos',
        label: 'A rede de esgotos, fossas ou tanques sépticos tem de permitir a fácil observação, limpeza e desinfeção e possuir válvulas sifonadas grelhas de proteção e caixas de recolha de gorduras:'
    },
    {
        name: 'maximoHigieneSeguranca',
        label: 'Garantir o maximo de higiene e seguranva dos trabalhadores:'
    },
    {
        name: 'equipamentoPrimeirosSocorros',
        label: 'Equipados com equipamento de primeiros socorros:'
    },
    {
        name: 'recipientesLixo',
        label: 'Dispor de recipientes para o lixo, com tampa, colocados em locais de fácil acesso e devidamente sinalizados:'
    },
    {
        name: 'limpezaDiaria',
        label: 'A limpeza e desinfeção diária dos contentores é obrigatória e o lixo e demais resíduos devem ser removidos diariamente para local adequado de forma a serem transportados pelos serviços públicos de recolha de lixo:'
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