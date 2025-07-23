export enum Role {
    admin = 'ROLE_ADMIN',
    staff = 'ROLE_STAFF',
    client = 'ROLE_CLIENT'
}

export enum Status {
    active = 'active',
    pending = 'pending',
    disabled = 'disabled'
}

export enum AplicanteType {
    cadastro = 'CADASTRO',
    licenca = 'ATIVIDADE',
}

export enum Categoria {
    com = 'COM',
    ind = 'IND',
    comercial = 'COMERCIAL',
    industrial = 'INDUSTRIAL',
}

export enum NivelRisco {
    baixo = 'BAIXO',
    medio = 'MEDIO',
    alto = 'ALTO'
}

export enum TipoPedidoCadastro {
    inicial = 'INICIAL',
    alteracao = 'ALTERACAO',
    anual = 'ANUAL'
}

export enum TipoEstabelecimento {
    principal = 'PRINCIPAL',
    delegacao = 'DELEGACAO',
    sucursal = 'SUCURSAL'
}

export enum CaraterizacaoEstabelecimento {
    kiosk = 'KIOSK',
    loja = 'LOJA',
    armazem = 'ARMAZEM'
}

export enum TipoAto {
    retalho = 'RETALHO',
    grosso = 'GROSSO'
}

export enum TipoEmpresa {
    micro = 'MICROEMPRESA',
    pequena = 'PEQUENA_EMPRESA',
    media = 'MEDIA_EMPRESA',
    grande = 'GRANDE_EMPRESA'
}