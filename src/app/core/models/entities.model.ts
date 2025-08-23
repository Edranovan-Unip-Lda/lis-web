import { BaseModel } from "./base";
import { ClasseAtividade, Endereco, GrupoAtividade, Role } from "./data-master.model";
import { AplicanteStatus, AplicanteType, CaraterizacaoEstabelecimento, Categoria, FaturaStatus, NivelRisco, QuantoAtividade, TipoAto, TipoEmpresa, TipoEstabelecimento, TipoPedidoCadastro, TipoPedidoLicenca, TipoPedidoVistoria } from "./enums";

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

export interface Empresa extends BaseModel {
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
    estado: AplicanteStatus;
    empresa: Empresa;
    pedidoInscricaoCadastro: PedidoInscricaoCadastro;
    pedidoLicencaAtividade: PedidoAtividadeLicenca;
    pedidoStatus: string;
    faturaStatus: string;
    certificadoInscricaoCadastro: CertificadoCadastro;
    historicoStatus: HistoricoEstadoAplicante[];
    pedidoVistorias: PedidoVistoria[];
}

export interface CertificadoCadastro extends BaseModel {
    sociedadeComercial: string;
    numeroRegistoComercial: string;
    sede: Endereco;
    atividade: string;
    dataValidade: string;
    dataEmissao: string;
    nomeDiretorGeral: string;
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
    fatura: Fatura;
}

export interface PedidoAtividadeLicenca extends BaseModel {
    tipo: TipoPedidoLicenca;
    status: string;
    nomeEmpresa: string;
    empresaNumeroRegistoComercial: string;
    empresaSede: Endereco;
    tipoAtividade: GrupoAtividade;
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
    aplicante: Aplicante;
    fatura: Fatura;
}

export interface Pessoa extends BaseModel {
    nome: string;
    nacionalidade: string;
    naturalidade: string;
    morada: Endereco;
    telefone: string;
    email: string;
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
}