import { BaseModel } from "./base";
import { Endereco, Role } from "./data-master.model";
import { AplicanteType, CaraterizacaoEstabelecimento, Categoria, FaturaStatus, NivelRisco, QuantoAtividade, TipoAto, TipoEmpresa, TipoEstabelecimento, TipoPedidoCadastro } from "./enums";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: Role;
    jwtSession: string;
    status: string;
    oneTimePassword: string;
    updatedAt: Date;
}

export interface Empresa {
    nome: string;
    nif: string;
    utilizador: User;
    gerente: string;
    numeroRegistoComercial: string;
    telefone: string;
    telemovel: string;
    sede: Endereco;
    sociedadeComercial: SociedadeComercial;
}

export interface Requerente {
    denominacaoSocial: string | null;
    numeroRegisto: string | null;
    sede: string | null;
    nif: string | null;
    gerente: string | null;
    telefone: string | null;
    email: string | null;
    classificacaoAtividade: string | null;
    nomeRepresentante: string | null;
    pai: string | null;
    mae: string | null;
    dataNascimento: string | null;
    estadoCivil: string | null;
    natural: string | null;
    postoAdministrativo: string | null;
    municipio: string | null;
    documentacaoIdentificacao: string | null;
    residencia: string | null;
}

export interface Participantes {
    representanteComercio: string | null;
    cargoComercio: string | null;
    representanteAutoridadeLocal: string | null;
    cargoAutoridadeLocal: string | null;
    representanteSaude: string | null;
    cargoSaude: string | null;
    representanteTrabalho: string | null;
    cargoTrabalho: string | null;
    representanteBombeiros: string | null;
    cargoBombeiros: string | null;
}

export interface Aplicante extends BaseModel {
    tipo: AplicanteType;
    categoria: Categoria;
    numero: string;
    estado: string;
    empresa: Empresa;
    empresaDto: Empresa
    pedido: PedidoInscricaoCadastro;
    pedidoInscricaoCadastroDto: PedidoInscricaoCadastro
    pedidoStatus: string;
    faturaStatus: string;
}

export interface VistoriaComercialRequestForm {
    numeroProcesso: string | null;
    dataHora: string | null;
    local: string | null;
    funcionario: string | null;
    requerente: Requerente;
    participantes: Participantes;
    nomeAtuante: string | null;
    legislacaoUrbanistica: boolean | null;
    accessoEstrada: boolean | null;
    escoamentoAguas: boolean | null;
    alimentacaoEnergia: boolean | null;
    seperadosSexo: boolean | null;
    lavatoriosComEspelho: boolean | null;
    comunicacaoVentilacao: boolean | null;
    esgotoAguas: boolean | null;
    paredesPavimentos: boolean | null;
    zonasDestinadas: boolean | null;
    instalacoesFrigorificas: boolean | null;
    sectoresLimpos: boolean | null;
    pisosParedes: boolean | null;
    pisosResistentes: boolean | null;
    paredesInteriores: boolean | null;
    paredes3metros: boolean | null;
    unioesParedes: boolean | null;
    ventilacoesNecessarias: boolean | null;
    iluminacao: boolean | null;
    aguaPotavel: boolean | null;
    distribuicaoAguaNaoPotavel: boolean | null;
    redeEsgotos: boolean | null;
    equipamentoUtensilios: boolean | null;
    equipamentoPrimeirosSocorros: boolean | null;
    recipientesLixo: boolean | null;
    limpezaDiaria: boolean | null;
    descreverIrregularidades: string | null;
    aptoAberto: boolean | null;
    comDeficiencias: boolean | null;
    recomendacoes: string | null;
    prazo: string | null;
    documental: boolean | null;
    membrosEquipaVistoria: Participantes;
}


export interface PedidoInscricaoCadastro {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    status: string;
    tipoPedidoCadastro: TipoPedidoCadastro;
    nomeEmpresa: string;
    nif: string;
    gerente: string;
    numeroRegistoComercial: string;
    email: string;
    telefone: string;
    telemovel: string;
    sede: Endereco;
    categoria: string;
    tipoEmpresa: TipoEmpresa;
    quantoAtividade: QuantoAtividade;
    nomeEstabelecimento: string;
    localEstabelecimento: string;
    tipoEstabelecimento: TipoEstabelecimento;
    caraterizacaoEstabelecimento: CaraterizacaoEstabelecimento;
    risco: NivelRisco;
    ato: TipoAto;
    tipoAtividade: AtividadeEconomica;
    atividadePrincipal: AtividadeEconomica;
    alteracoes: string;
    dataEmissaoCertAnterior: string;
    observacao: string;
    fatura: Fatura;
}


export interface Fatura extends BaseModel {
    status: FaturaStatus;
    atoFatura: number;
    nomeEmpresa: string;
    sociedadeComercial: string;
    atividadeDeclarada: AtividadeEconomica;
    atividadeDeclaradaCodigo: string;
    taxas: Taxa[];
    superficie: number;
    total: number;
    sede: string;
    nif: string;
    nivelRisco: NivelRisco;
    recibo: Documento;
}

export interface Taxa extends BaseModel {
    id: number;
    ato: string;
    montante: number;
    faturas: Fatura[];
}

export interface AtividadeEconomica extends BaseModel {
    codigo: string;
    descricao: string;
    tipo: Categoria;
    tipoRisco: NivelRisco;
    listaPedidoInscricaoCadastro: PedidoInscricaoCadastro[];
    listaPedidoInscricaoCadastroAtividadePrincipal: PedidoInscricaoCadastro[];
}

export interface SociedadeComercial extends BaseModel {
    nome: string;
    acronimo: string;
}

export interface Documento extends BaseModel {
    nome: string;
    caminho: string;
    extensao: string;
    descricao: string;
    tipo: string;
    tamanho: string;
}