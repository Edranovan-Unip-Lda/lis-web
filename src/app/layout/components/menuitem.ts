import { AplicanteType, Categoria } from "@/core/models/enums";

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
        label: 'Varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'Painél',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'Empresa',
        icon: 'bi bi-fw bi-building-fill',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['empresa/list']

            },
            // {
            //     label: 'Criar',
            //     icon: 'pi pi-fw pi-plus',
            //     routerLink: ['empresa/create']
            // }
        ]
    },
    {
        label: 'Aplicante',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['application/list']
            },
            // {
            //     label: 'Criar',
            //     icon: 'pi pi-fw pi-plus',
            //     routerLink: ['application/create']
            // }
        ]
    },
    {
        label: 'Licenças e Certificados',
        items: [
            {
                label: 'Certificados de Inscricao no Cadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/certificados/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/certificados/industria']

                    }
                ]
            },
            {
                label: 'Alvara de Licenca para Exercicio da Atividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/licencas/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'Utilizador',
        icon: 'pi pi-fw pi-user',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['utilizador/list']
            },
            {
                label: 'Criar',
                icon: 'pi pi-fw pi-plus',
                routerLink: ['utilizador/create']
            }
        ]
    },
    {
        label: 'Dados Mestre',
        items: [
            {
                label: 'Funções (Roles)',
                icon: 'bi bi-fw bi-person-lock',
                routerLink: ['dados-mestre/roles']
            },
            {
                label: 'Taxas',
                icon: 'bi bi-fw bi-currency-dollar',
                routerLink: ['dados-mestre/taxa']
            },
            {
                label: 'Sociedade Comercial',
                icon: 'bi bi-fw bi-building',
                routerLink: ['dados-mestre/sociedade-comercial']
            },
            {
                label: 'Direção',
                icon: 'bi bi-fw bi-diagram-2',
                routerLink: ['dados-mestre/direcao']
            },
            {
                label: 'Atividade Economica',
                icon: 'bi bi-fw bi-activity',
                items: [
                    {
                        label: 'Grupo',
                        icon: 'bi bi-fw bi-bookmark',
                        routerLink: ['dados-mestre/atividade-economica/grupo']
                    },
                    {
                        label: 'Classe',
                        icon: 'bi bi-fw bi-bookmarks',
                        routerLink: ['dados-mestre/atividade-economica/classe']
                    },
                ]
            },
            {
                label: 'Localização',
                icon: 'bi bi-fw bi-pin-map',
                items: [
                    {
                        label: 'Municipio',
                        routerLink: ['dados-mestre/endereco/municipio']
                    },
                    {
                        label: 'Posto Administrativo',
                        routerLink: ['dados-mestre/endereco/posto-administrativo']
                    },
                    {
                        label: 'Suco',
                        routerLink: ['dados-mestre/endereco/suco']
                    },
                    {
                        label: 'Aldeia',
                        routerLink: ['dados-mestre/endereco/aldeia']
                    },
                ]
            },
        ]
    },
    {
        label: 'Historicos',
        items: [
            {
                label: 'Atividades',
                icon: 'bi bi-fw bi-activity'
            },
            {
                label: 'Autenticacao',
                icon: 'bi bi-fw bi-unlock'
            }
        ]
    }
];

export const model_manager: MenuItem[] = [
    {
        label: 'Varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'Painél',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'Empresa',
        icon: 'bi bi-fw bi-building-fill',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['empresa/list']

            },
        ]
    },
    {
        label: 'Aplicantes',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Atribuido',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['gestor/application/task']
            },
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['gestor/application/list']
            },
        ]
    },
    {
        label: 'Licenças e Certificados',
        items: [
            {
                label: 'Certificados de Inscricao no Cadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/certificados/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/certificados/industria']

                    }
                ]
            },
            {
                label: 'Alvara de Licenca para Exercicio da Atividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/licencas/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'Historicos',
        items: [
            {
                label: 'Atividades',
                icon: 'bi bi-fw bi-activity'
            },
            {
                label: 'Autenticacao',
                icon: 'bi bi-fw bi-unlock'
            }
        ]
    }
];

export const model_staff: MenuItem[] = [
    {
        label: 'Varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'Painél',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'Aplicantes',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Atribuido',
                icon: 'bi bi-fw bi-briefcase',
                routerLink: ['gestor/application/task']
            },
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['gestor/application/list']
            },
        ]
    },
    {
        label: 'Licenças e Certificados',
        items: [
            {
                label: 'Certificados de Inscricao no Cadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/certificados/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/certificados/industria']

                    }
                ]
            },
            {
                label: 'Alvara de Licenca para Exercicio da Atividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['gestor/licencas/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['gestor/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'Historicos',
        items: [
            {
                label: 'Atividades',
                icon: 'bi bi-fw bi-activity'
            },
            {
                label: 'Autenticacao',
                icon: 'bi bi-fw bi-unlock'
            }
        ]
    }
];

export const model_client: MenuItem[] = [
    {
        label: 'Varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'Início',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/home']
            }
        ]
    },
    {
        label: 'Aplicante',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['application/list']
            },
        ]
    },
    {
        label: 'Licenças e Certificados',
        items: [
            {
                label: 'Certificados de Inscricao no Cadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['licencas-certificados/certificados/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['licencas-certificados/certificados/industria']

                    }
                ]
            },
            {
                label: 'Alvara de Licenca para Exercicio da Atividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['licencas-certificados/licencas/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['licencas-certificados/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'Historicos',
        items: [
            {
                label: 'Autenticacao',
                icon: 'bi bi-fw bi-unlock'
            }
        ]
    }
];