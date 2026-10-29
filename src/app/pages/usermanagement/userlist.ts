import { LanguageService, LocalizedDatePipe } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { User } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe, StatusLabelPipe } from '@/core/pipes/custom.pipe';
import { UserService } from '@/core/services';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button, ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';

@Component({
    selector: 'user-list',
    standalone: true,
    imports: [StatusLabelPipe, LocalizedDatePipe, TableModule, InputText, Button, ButtonDirective, IconField, InputIcon, RouterModule, Tag, StatusSeverityPipe, StatusIconPipe, Toast, Paginator, TranslatePipe],
    templateUrl: './userlist.html',
    providers: [MessageService]
})
export class UserList {
    users: User[] = [];
    usersCached: User[] = [];
    private searchSubject = new Subject<string>();
    private searchSubscription: any;
    dataIsFetching = false;
    roles!: string;
    page = 0;
    size = 50;
    totalData = 0;
    isInternal = false;
    private i18n = inject(LanguageService);

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private service: UserService,
        private messageService: MessageService,
    ) { }

    ngOnInit() {
        this.users = this.route.snapshot.data['userPage'].content;
        this.totalData = this.route.snapshot.data['userPage'].totalElements;
        this.usersCached = this.users;
        // Roles come from the route type (internal vs empresa list), shared by paging and search.
        this.isInternal = this.route.snapshot.data['type'] === 'internal';
        this.roles = this.isInternal ? [Role.admin, Role.manager, Role.chief, Role.staff].join(',') : Role.client;
        this.setupSearch();
    }

    ngOnDestroy(): void {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    onPageChange(event: any): void {
        this.dataIsFetching = true;
        this.page = event.page;
        this.size = event.rows;
        this.getData(this.page, this.size);
    }

    onGlobalFilter(table: Table, event: Event): void {
        const query = (event.target as HTMLInputElement).value;
        this.searchSubject.next(query);
    }

    navigateToCreateUser() {
        this.router.navigate(['utilizador/create']);
    }

    private getData(page: number, size: number): void {
        this.service.getPagination(this.roles, page, size).subscribe({
            next: (response) => {
                this.users = response.content;
                this.usersCached = response.content;
                this.totalData = response.totalElements;
                this.dataIsFetching = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.i18n.instant('toast.error'),
                    detail: error
                });
                this.dataIsFetching = false;
            }
        });
    }

    private setupSearch(): void {
        this.searchSubscription = this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(query => {
                if (query.length >= 3) {
                    this.dataIsFetching = true;
                    return this.service.search(query, this.roles).pipe(
                        catchError(error => {
                            this.messageService.add({
                                severity: 'error',
                                summary: this.i18n.instant('toast.error'),
                                detail: error
                            });
                            return of(this.usersCached);
                        })
                    );
                } else if (query.length === 0) {
                    this.dataIsFetching = true;
                    return of(this.usersCached);
                }
                return of(null);
            })
        ).subscribe(result => {
            if (result) {
                this.users = result;
            }
            this.dataIsFetching = false;
        });
    }
}
