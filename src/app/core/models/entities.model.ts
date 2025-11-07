import { BaseModel } from "./base";
import { ClasseAtividade, Endereco, GrupoAtividade, PostoAdministrativo, Role } from "./data-master.model";
import { AplicanteStatus, AplicanteType, AreaRepresentante, CaraterizacaoEstabelecimento, Categoria, FaturaStatus, NivelRisco, QuantoAtividade, TipoAto, TipoEmpresa, TipoEstabelecimento, TipoPedidoCadastro, TipoPedidoLicenca, TipoPedidoVistoria, TipoPropriedade } from "./enums";

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
    direcao: Direcao;
}

export interface Direcao extends BaseModel {
    nome: Categoria;
    codigo: string;
}

export interface Empresa extends BaseModel {
    nome: string;
    nif: string;
    utilizador: User;
    gerente: Gerente;
    representante: Representante;
    numeroRegistoComercial: string;
    telefone: string;
    telemovel: string;
    sede: Endereco;
    sociedadeComercial: SociedadeComercial;
    capitalSocial: number;
    dataRegisto: Date;
    tipoPropriedade: TipoPropriedade;
    acionistas: Acionista[];
    email: string;
    totalTrabalhadores: number;
    volumeNegocioAnual: number;
    balancoTotalAnual: number;
    tipoEmpresa: TipoEmpresa;
    documentos: Documento[];
    longitude: number;
    latitude: number;
}

export interface Gerente extends BaseModel {
    nome: string;
    email: string;
    morada: Endereco;
    telefone: string;
    tipoDocumento: string;
    numeroDocumento: string;
}

export interface Representante extends BaseModel {
    tipo: string;
    nome: string;
    pai: string;
    mae: string;
    dataNascimento: string;
    estadoCivil: string;
    naturalidade: string;
    nacionalidade: string;
    morada: Endereco;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    telefone: string;
}

export interface Acionista extends BaseModel {
    nome: string;
    nif: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    acoes: number;
    endereco: Endereco;
    agregadoFamilia: string;
    relacaoFamilia: string;
    telefone: string;
}

export interface Aplicante extends BaseModel {
    tipo: AplicanteType;
    categoria: Categoria;
    numero: string;
    estado: AplicanteStatus;
    empresa: Empresa;
    pedidoInscricaoCadastro: PedidoInscricaoCadastro;
    pedidoLicencaAtividade: PedidoAtividadeLicenca;
    pedidoStatus: string;
    faturaStatus: string;
    historicoStatus: HistoricoEstadoAplicante[];
}

export interface CertificadoCadastro extends BaseModel {
    sociedadeComercial: string;
    numeroRegistoComercial: string;
    sede: Endereco;
    atividade: string;
    dataValidade: string;
    dataEmissao: string;
    nomeDiretorGeral: string;
    pedidoInscricaoCadastro: PedidoInscricaoCadastro;
}

export interface CertificadoLicencaAtividade extends BaseModel {
    sociedadeComercial: string;
    numeroRegistoComercial: string;
    nif: string;
    sede: Endereco;
    nivelRisco: NivelRisco;
    atividade: string;
    atividadeCodigo: string;
    dataValidade: string;
    dataEmissao: string;
    nomeDiretorGeral: string;
    pedidoLicencaAtividade: PedidoAtividadeLicenca;
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
    empresaNif: string;
    empresaGerente: string;
    empresaNumeroRegistoComercial: string;
    empresaEmail: string;
    empresaTelefone: string;
    empresaTelemovel: string;
    empresaSede: Endereco;
    categoria: string;
    tipoEmpresa: TipoEmpresa;
    quantoAtividade: QuantoAtividade;
    nomeEstabelecimento: string;
    localEstabelecimento: Endereco;
    tipoEstabelecimento: TipoEstabelecimento;
    caraterizacaoEstabelecimento: CaraterizacaoEstabelecimento;
    risco: NivelRisco;
    ato: TipoAto;
    classeAtividade: ClasseAtividade;
    alteracoes: string;
    dataEmissaoCertAnterior: string;
    observacao: string;
    documentos: Documento[];
    fatura: Fatura;
    certificadoInscricaoCadastro: CertificadoCadastro;
    aplicante: Aplicante;
    longitude: number;
    latitude: number;
}

export interface PedidoAtividadeLicenca extends BaseModel {
    tipo: TipoPedidoLicenca;
    status: string;
    nomeEmpresa: string;
    empresaNumeroRegistoComercial: string;
    empresaSede: Endereco;
    tipoAtividade: GrupoAtividade;
    classeAtividade: ClasseAtividade;
    risco: NivelRisco;
    estatutoSociedadeComercial: boolean;
    empresaNif: string;
    representante: Pessoa;
    gerente: Pessoa;
    planta: boolean;
    documentoPropriedade: boolean;
    documentoImovel: boolean;
    contratoArrendamento: boolean;
    planoEmergencia: boolean;
    estudoAmbiental: boolean;
    numEmpregosCriados: number;
    numEmpregadosCriar: number;
    reciboPagamento: boolean;
    outrosDocumentos: boolean;
    documentos: Documento[];
    arrendador: Arrendador;
    aplicante: Aplicante;
    fatura: Fatura;
    listaPedidoVistoria: PedidoVistoria[];
    certificadoLicencaAtividade: CertificadoLicencaAtividade;
}

export interface Arrendador extends BaseModel {
    nome: string;
    endereco: Endereco;
    tipoDocumento: string;
    numeroDocumento: string;
    areaTotalTerreno: number;
    areaTotalConstrucao: number;
    dataInicio: Date;
    dataFim: Date;
    valorRendaMensal: number;
}

export interface Pessoa extends BaseModel {
    nome: string;
    nacionalidade: string;
    naturalidade: string;
    morada: Endereco;
    telefone: string;
    email: string;
    estadoCivil: string;
}


export interface Fatura extends BaseModel {
    status: FaturaStatus;
    atoFatura: number;
    nomeEmpresa: string;
    sociedadeComercial: string;
    taxas: Taxa[];
    superficie: number;
    total: number;
    sede: string;
    nif: string;
    nivelRisco: NivelRisco;
    recibo: Documento | null;
}

export interface Taxa extends BaseModel {
    id: number;
    ato: string;
    montante: number;
    faturas: Fatura[];
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

export interface HistoricoEstadoAplicante extends BaseModel {
    status: AplicanteStatus;
    descricao: string;
    alteradoPor: string;
    dataAlteracao: Date;
}

export interface PedidoVistoria extends BaseModel {
    jornada: number;
    tipoVistoria: TipoPedidoVistoria;
    status: string;

    nomeEmpresa: string;
    empresaNif: string;
    empresaGerente: string;
    empresaNumeroRegistoComercial: string;
    empresaEmail: string;
    empresaTelefone: string;
    empresaTelemovel: string;
    empresaSede: Endereco;

    nomeEstabelecimento: string;
    localEstabelecimento: Endereco;

    tipoEmpresa: TipoEmpresa;
    tipoEstabelecimento: CaraterizacaoEstabelecimento;
    risco: NivelRisco;
    atividade: TipoAto;
    classeAtividade: ClasseAtividade;
    tipoAtividade: QuantoAtividade;
    alteracoes: string;
    observacao: string;
    fatura: Fatura;
    // listaAutoVistoria: AutoVistoria[];
    autoVistoria: AutoVistoria;
}

export interface AutoVistoria extends BaseModel {
    status: string;
    numeroProcesso: string;
    local: Endereco;
    localEstabelecimento: Endereco;
    requerente: RequerenteAutoVistoria;
    membrosEquipaVistoria: Participante[];
    nomeAtuante: string;
    legislacaoUrbanistica: boolean;
    accessoEstrada: boolean;
    escoamentoAguas: boolean;
    alimentacaoEnergia: boolean;
    seperadosSexo: boolean;
    lavatoriosComEspelho: boolean;
    sanitasAutomaticaAgua: boolean;
    comunicacaoVentilacao: boolean;
    esgotoAguas: boolean;
    paredesPavimentos: boolean;
    zonasDestinadas: boolean;
    instalacoesFrigorificas: boolean;
    sectoresLimpos: boolean;
    pisosParedes: boolean;
    pisosResistentes: boolean;
    paredesInteriores: boolean;
    paredes3metros: boolean;
    unioesParedes: boolean;
    ventilacoesNecessarias: boolean;
    iluminacao: boolean;
    aguaPotavel: boolean;
    distribuicaoAgua: boolean;
    redeDistribuicao: boolean;
    redeEsgotos: boolean;
    maximoHigieneSeguranca: boolean;
    equipamentoUtensilios: boolean;
    equipamentoPrimeirosSocorros: boolean;
    recipientesLixo: boolean;
    limpezaDiaria: boolean;
    descreverIrregularidades: string;
    aptoAberto: boolean;
    comDeficiencias: boolean;
    recomendacoes: string;
    prazo: number;
    documentos: Documento[];
    funcionario: User;
}

export interface RequerenteAutoVistoria extends BaseModel {
    denominacaoSocial: string;
    numeroRegistoComercial: string;
    sede: Endereco;
    nif: string;
    gerente: string;
    telefone: string;
    email: string;
    classeAtividade: ClasseAtividade;
    nomeRepresentante: string;
    pai: string;
    mae: string;
    dataNascimento: string;
    estadoCivil: string;
    naturalidade: string;
    nacionalidade: string;
    postoAdministrativo: PostoAdministrativo;
    regiao: string;
    tipoDocumento: string;
    numeroDocumento: string;
    residencia: Endereco;
}

export interface Participante extends BaseModel {
    nome: string;
    areaRepresentante: AreaRepresentante;
    cargo: string;
    telemovel: string;
    tipoDocumento: string;
    numeroDocumento: string;
}