import { Categoria } from '@/core/models/enums';

interface MenuItem {
    label?: string;
    icon?: string;
    routerLink?: string[];
    queryParams?: any;
    url?: string[];
    target?: '_blank' | '_self' | '_parent' | '_top';
    routerLinkActiveOptions?: { [key: string]: any };
    items?: MenuItem[];
    separator?: boolean;
    visible?: boolean;
    disabled?: boolean;
    command?: (event?: any) => void;
    class?: string;
    style?: string;
    styleClass?: string;
    id?: string;
    urlTarget?: '_blank' | '_self' | '_parent' | '_top';
}

export const model_admin: MenuItem[] = [
    {
        label: 'menu.varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'menu.painel',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'menu.empresa',
        icon: 'bi bi-fw bi-building-fill',
        items: [
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['empresa/list']

            },
            // {
            //     label: 'menu.criar',
            //     icon: 'pi pi-fw pi-plus',
            //     routerLink: ['empresa/create']
            // }
        ]
    },
    {
        label: 'menu.aplicante',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['application/list']
            },
            // {
            //     label: 'menu.criar',
            //     icon: 'pi pi-fw pi-plus',
            //     routerLink: ['application/create']
            // }
        ]
    },
    {
        label: 'menu.licencasCertificados',
        items: [
            {
                label: 'menu.certificadosCadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/certificados/comercio']
                    },
                    {
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/certificados/industria']

                    }
                ]
            },
            {
                label: 'menu.alvaraAtividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/licencas/comercio']
                    },
                    {
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'menu.utilizador',
        icon: 'pi pi-fw pi-user',
        items: [
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['utilizador/internal/list'],
            },
            {
                label: 'menu.empresa',
                icon: 'pi pi-fw pi-list',
                routerLink: ['utilizador/empresa/list'],
            },
            {
                label: 'menu.criar',
                icon: 'pi pi-fw pi-plus',
                routerLink: ['utilizador/create']
            }
        ]
    },
    {
        label: 'menu.relatorios',
        icon: 'pi pi-fw pi-chart-bar',
        items: [
            {
                label: 'menu.empresas',
                icon: 'bi bi-fw bi-building',
                routerLink: ['relatorios/empresa']
            },
            {
                label: 'menu.aplicantes',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['relatorios/aplicante']
            },
            {
                label: 'menu.licencasCertificados',
                icon: 'bi bi-fw bi-journal-check',
                routerLink: ['relatorios/licencas-certificados']
            },
            {
                label: 'menu.receitas',
                icon: 'bi bi-fw bi-currency-dollar',
                routerLink: ['relatorios/receitas']
            },
            {
                label: 'menu.exportacoes',
                icon: 'bi bi-fw bi-file-earmark-zip',
                routerLink: ['relatorios/exportacoes']
            }
        ]
    },
    {
        label: 'menu.dadosMestre',
        items: [
            {
                label: 'menu.funcoes',
                icon: 'bi bi-fw bi-person-lock',
                routerLink: ['dados-mestre/roles']
            },
            {
                label: 'menu.taxas',
                icon: 'bi bi-fw bi-currency-dollar',
                routerLink: ['dados-mestre/taxa']
            },
            {
                label: 'menu.sociedadeComercial',
                icon: 'bi bi-fw bi-building',
                routerLink: ['dados-mestre/sociedade-comercial']
            },
            {
                label: 'menu.direcao',
                icon: 'bi bi-fw bi-diagram-2',
                routerLink: ['dados-mestre/direcao']
            },
            {
                label: 'menu.atividadeEconomica',
                icon: 'bi bi-fw bi-activity',
                items: [
                    {
                        label: 'menu.grupo',
                        icon: 'bi bi-fw bi-bookmark',
                        routerLink: ['dados-mestre/atividade-economica/grupo']
                    },
                    {
                        label: 'menu.classe',
                        icon: 'bi bi-fw bi-bookmarks',
                        routerLink: ['dados-mestre/atividade-economica/classe']
                    },
                ]
            },
            {
                label: 'menu.localizacao',
                icon: 'bi bi-fw bi-pin-map',
                items: [
                    {
                        label: 'menu.municipio',
                        routerLink: ['dados-mestre/endereco/municipio']
                    },
                    {
                        label: 'menu.postoAdministrativo',
                        routerLink: ['dados-mestre/endereco/posto-administrativo']
                    },
                    {
                        label: 'menu.suco',
                        routerLink: ['dados-mestre/endereco/suco']
                    },
                    {
                        label: 'menu.aldeia',
                        routerLink: ['dados-mestre/endereco/aldeia']
                    },
                ]
            },
        ]
    },
    {
        label: 'menu.historicos',
        items: [
            {
                label: 'menu.autenticacoes',
                icon: 'bi bi-fw bi-unlock',
                routerLink: ['historicos/autenticacoes']
            },
            {
                label: 'menu.acoes',
                icon: 'bi bi-fw bi-activity',
                routerLink: ['historicos/acoes']
            },
        ]
    },
    {
        label: 'menu.definicoes',
        items: [
            {
                label: 'menu.seguranca',
                icon: 'bi bi-fw bi-shield-lock',
                routerLink: ['definicoes/seguranca']
            },
        ]
    }
];

export const model_manager: MenuItem[] = [
    {
        label: 'menu.varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'menu.painel',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'menu.empresa',
        icon: 'bi bi-fw bi-building-fill',
        items: [
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['empresa/list']

            },
        ]
    },
    {
        label: 'menu.aplicantes',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'menu.atribuido',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['gestor/application/task']
            },
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['gestor/application/list']
            },
        ]
    },
    {
        label: 'menu.licencasCertificados',
        items: [
            {
                label: 'menu.certificadosCadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        // id = the Direcao this entry belongs to; AppMenu drops the other one for non-admins.
                        id: Categoria.comercial,
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/certificados/comercio']
                    },
                    {
                        id: Categoria.industrial,
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/certificados/industria']

                    }
                ]
            },
            {
                label: 'menu.alvaraAtividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        id: Categoria.comercial,
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/licencas/comercio']
                    },
                    {
                        id: Categoria.industrial,
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'menu.relatorios',
        icon: 'pi pi-fw pi-chart-bar',
        items: [
            {
                label: 'menu.empresas',
                icon: 'bi bi-fw bi-building',
                routerLink: ['relatorios/empresa']
            },
            {
                label: 'menu.aplicantes',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['relatorios/aplicante']
            },
            {
                label: 'menu.licencasCertificados',
                icon: 'bi bi-fw bi-journal-check',
                routerLink: ['relatorios/licencas-certificados']
            },
            {
                label: 'menu.receitas',
                icon: 'bi bi-fw bi-currency-dollar',
                routerLink: ['relatorios/receitas']
            },
            {
                label: 'menu.exportacoes',
                icon: 'bi bi-fw bi-file-earmark-zip',
                routerLink: ['relatorios/exportacoes']
            }
        ]
    },
    // {
    //     label: 'menu.historicos',
    //     items: [
    //         {
    //             label: 'Atividades',
    //             icon: 'bi bi-fw bi-activity'
    //         },
    //         {
    //             label: 'Autenticacao',
    //             icon: 'bi bi-fw bi-unlock'
    //         }
    //     ]
    // }
];

export const model_staff: MenuItem[] = [
    {
        label: 'menu.varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'menu.painel',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'menu.aplicantes',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'menu.atribuido',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['gestor/application/task']
            },
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['gestor/application/list']
            },
        ]
    },
    {
        label: 'menu.licencasCertificados',
        items: [
            {
                label: 'menu.certificadosCadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        // id = the Direcao this entry belongs to; AppMenu drops the other one for non-admins.
                        id: Categoria.comercial,
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/certificados/comercio']
                    },
                    {
                        id: Categoria.industrial,
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/certificados/industria']

                    }
                ]
            },
            {
                label: 'menu.alvaraAtividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        id: Categoria.comercial,
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/licencas/comercio']
                    },
                    {
                        id: Categoria.industrial,
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'menu.relatorios',
        icon: 'pi pi-fw pi-chart-bar',
        items: [
            {
                label: 'menu.empresas',
                icon: 'bi bi-fw bi-building',
                routerLink: ['relatorios/empresa']
            },
            {
                label: 'menu.aplicantes',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['relatorios/aplicante']
            },
            {
                label: 'menu.licencasCertificados',
                icon: 'bi bi-fw bi-journal-check',
                routerLink: ['relatorios/licencas-certificados']
            },
            {
                label: 'menu.receitas',
                icon: 'bi bi-fw bi-currency-dollar',
                routerLink: ['relatorios/receitas']
            },
            {
                label: 'menu.exportacoes',
                icon: 'bi bi-fw bi-file-earmark-zip',
                routerLink: ['relatorios/exportacoes']
            }
        ]
    },
    // {
    //     label: 'menu.historicos',
    //     items: [
    //         {
    //             label: 'Atividades',
    //             icon: 'bi bi-fw bi-activity'
    //         },
    //         {
    //             label: 'Autenticacao',
    //             icon: 'bi bi-fw bi-unlock'
    //         }
    //     ]
    // }
];

export const model_client: MenuItem[] = [
    {
        label: 'menu.varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'menu.inicio',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/home']
            }
        ]
    },
    {
        label: 'menu.aplicante',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'menu.lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['application/list']
            },
        ]
    },
    {
        label: 'menu.licencasCertificados',
        items: [
            {
                label: 'menu.certificadosCadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['licencas-certificados/certificados/comercio']
                    },
                    {
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['licencas-certificados/certificados/industria']

                    }
                ]
            },
            {
                label: 'menu.alvaraAtividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'menu.comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['licencas-certificados/licencas/comercio']
                    },
                    {
                        label: 'menu.industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['licencas-certificados/licencas/industria']
                    }
                ]
            }
        ]
    },
    // {
    //     label: 'menu.historicos',
    //     items: [
    //         {
    //             label: 'Autenticacao',
    //             icon: 'bi bi-fw bi-unlock'
    //         }
    //     ]
    // }
];