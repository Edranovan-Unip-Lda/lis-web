import { Component, effect, inject, OnDestroy } from '@angular/core';
import { DrawerModule } from "primeng/drawer";
import { LayoutService } from "@/layout/service/layout.service";
import { DatePickerModule } from "primeng/datepicker";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NotificacaoDto } from '@/core/models/entities.model';
import { NotificacaoService } from '@/core/services';
import { TimeAgoPipe } from '@/core/pipes/custom.pipe';

@Component({
    selector: 'app-profile-menu',
    imports: [DrawerModule, DatePickerModule, FormsModule, CommonModule, TimeAgoPipe],
    standalone: true,
    templateUrl: './notification.html'
})
export class AppProfileMenu {
    layoutService = inject(LayoutService);
    notifications: NotificacaoDto[] = [];
    page = 0;
    size = 10;

    private previousRightMenuState = false;

    constructor(
        private notificacaoService: NotificacaoService,
    ) {
        // Use Angular effect to watch for rightMenuActive changes
        effect(() => {
            const isOpen = this.layoutService.layoutState().rightMenuActive;

            // Only fetch when drawer transitions from closed to open
            if (isOpen && !this.previousRightMenuState) {
                this.fetchNotifications();
            }

            this.previousRightMenuState = isOpen;
        });
    }

    private fetchNotifications(): void {

        this.notificacaoService.getAll(this.page, this.size).subscribe({
            next: (response) => {
                this.notifications = response.content || response;
                console.log('Notifications fetched:', response);
            }
        });
    }

    setClassByStatus(item: NotificacaoDto): any {
        return {
            'bg-blue-100 text-blue-600': item.aplicanteStatus === 'SUBMETIDO',
            'bg-yellow-100 text-yellow-600': item.aplicanteStatus === 'REVISTO'
                || item.aplicanteStatus === 'ATRIBUIDO' || item.aplicanteStatus === 'REVISAO',
            'bg-red-100 text-red-600': item.aplicanteStatus === 'REJEITADO',
            'bg-green-100 text-green-600': item.aplicanteStatus === 'APROVADO'
        }

    }

    get rightMenuVisible() {
        return this.layoutService.layoutState().rightMenuActive;
    }

    set rightMenuVisible(val: boolean) {
        this.layoutService.layoutState.update((prev) => ({ ...prev, rightMenuActive: val }));
    }
}