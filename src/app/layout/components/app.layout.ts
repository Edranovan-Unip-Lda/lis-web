import { AppProfileMenu } from "@/layout/components/app.profilemenu";
import { LayoutService } from '@/layout/service/layout.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerService } from "ngx-spinner";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { filter, Subscription } from 'rxjs';
import { AppBreadcrumb } from './app.breadcrumb';
import { AppConfigurator } from './app.configurator';
import { AppSidebar } from './app.sidebar';
import { AppTopbar } from './topbar/app.topbar';


@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, RouterModule, AppConfigurator, AppBreadcrumb, ToastModule, AppProfileMenu, NgxSpinnerComponent],
    template: `
        <div class="layout-container" [ngClass]="containerClass">
            <div class="layout-content-wrapper">
                <div app-topbar></div>

                <div class="content-breadcrumb">
                    <div app-breadcrumb></div>
                </div>

                <div class="layout-content">
                <ngx-spinner [template]="logo"></ngx-spinner>
                    <router-outlet></router-outlet>
                </div>

                <div class="layout-mask"></div>
            </div>
            <app-profile-menu />
            <app-configurator />
            <p-toast />
        </div>
    `,
    providers: [MessageService]
})
export class AppLayout implements OnDestroy {
    overlayMenuOpenSubscription: Subscription;

    menuOutsideClickListener: any;

    menuScrollListener: any;

    @ViewChild(AppSidebar) appSidebar!: AppSidebar;

    @ViewChild(AppTopbar) appTopbar!: AppTopbar;

    logo: string = `<img src="/images/rdtl.png" alt="logo" width="200" heigth="200" class="opacity-60">`;
    notifications = inject(ActivatedRoute).snapshot.data['notifications'];

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router,
        private spinner: NgxSpinnerService,
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }
            if ((this.layoutService.isHorizontal() || this.layoutService.isSlim() || this.layoutService.isSlimPlus()) && !this.menuScrollListener) {
                this.menuScrollListener = this.renderer.listen(this.appTopbar.appSidebar.appMenu.menuContainer.nativeElement, 'scroll', (event) => {
                    if (this.layoutService.isDesktop()) {
                        this.hideMenu();
                    }
                });
            }
            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.hideMenu();
        });
    }

    ngOnInit(): void {
        this.router.events.subscribe((event: Event) => {

            switch (true) {
                case event instanceof NavigationStart: {
                    this.spinner.show();
                    break;
                }

                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    this.spinner.hide();
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    isOutsideClicked(event: any) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarButtonEl = document.querySelector('.topbar-start > button');

        return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        this.layoutService.reset();
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }

        if (this.menuScrollListener) {
            this.menuScrollListener();
            this.menuScrollListener = null;
        }

        this.unblockBodyScroll();
    }
    get containerClass() {
        const layoutConfig = this.layoutService.layoutConfig();
        const layoutState = this.layoutService.layoutState();

        return {
            'layout-light': !layoutConfig.darkTheme,
            'layout-dark': layoutConfig.darkTheme,
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.staticMenuMobileActive,
            'layout-sidebar-active': layoutState.sidebarActive,
            'layout-sidebar-anchored': layoutState.anchored
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }
}
