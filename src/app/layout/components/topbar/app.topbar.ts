import { NotificacaoDto } from '@/core/models/entities.model';
import { AuthenticationService, NotificacaoService } from '@/core/services';
import { AppBreadcrumb } from '@/layout/components/app.breadcrumb';
import { AppSidebar } from '@/layout/components/app.sidebar';
import { LayoutService } from '@/layout/service/layout.service';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Ripple } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { filter, Subscription } from 'rxjs';
import { ToggleButton } from 'primeng/togglebutton';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, FormsModule, Ripple, ButtonModule, AppBreadcrumb, AppSidebar, OverlayBadge],
    templateUrl: './app.topbar.html',
    host: {
        class: 'layout-topbar'
    }
})
export class AppTopbar {
    menu: MenuItem[] = [];

    @ViewChild('searchinput') searchInput!: ElementRef<HTMLElement>;

    @ViewChild('menubutton') menuButton!: ElementRef<HTMLElement>;

    @ViewChild(AppSidebar) appSidebar!: AppSidebar;

    el = inject(ElementRef);
    user: any;
    searchBarActive = computed(() => this.layoutService.layoutState().searchBarActive);
    private routerSubscription?: Subscription;
    notifications: NotificacaoDto[] = [];
    unreadCount: number = 0;
    checked: boolean = false;
    darkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

    constructor(
        public layoutService: LayoutService,
        private authenticationService: AuthenticationService,
        private authService: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        private notificacaoService: NotificacaoService,
    ) {
        this.user = this.authService.currentUserValue;
    }

    ngOnInit() {
        // Load notifications on initial load
        this.notifications = this.route.snapshot.data['notifications'] || [];
        this.unreadCount = this.notifications.length;

        // Subscribe to route changes and reload notifications on every navigation
        this.routerSubscription = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.loadNotifications();
            });

    }

    ngOnDestroy() {
        // Clean up subscription to prevent memory leaks
        this.routerSubscription?.unsubscribe();
    }


    signOut() {
        this.authenticationService.logout();
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    activateSearch(el: HTMLElement | null = null) {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: true
        }));
        setTimeout(() => {
            this.searchInput.nativeElement?.focus();
        }, 250);
    }

    deactivateSearch() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: false
        }));

    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    onSidebarButtonClick() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            rightMenuVisible: true
        }));
    }

    onNotificationButtonClick() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            rightMenuActive: true,
        }));

        if (this.unreadCount > 0) {
            this.notificacaoService.markAllAsRead();
            this.unreadCount = 0;
        }
    }

    toggleDarkMode() {
        this.executeDarkModeToggle();
    }

    executeDarkModeToggle() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    private loadNotifications() {
        this.notificacaoService.getUnread().subscribe({
            next: (data) => {
                this.notifications = data;
                this.unreadCount = data.length;
            }
        });
    }
}
