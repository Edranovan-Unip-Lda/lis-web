import { User } from '@/core/models/entities.model';
import { Role } from '@/core/models/enums';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { UserService } from '@/core/services';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
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
    imports: [TableModule, InputText, Button, IconField, InputIcon, RouterModule, Tag, StatusSeverityPipe, StatusIconPipe, TitleCasePipe, DatePipe, Toast, Paginator],
    templateUrl: './userlist.html',
    providers: [MessageService]
})
export class UserList {
    users: User[] = [];
    usersCached: User[] = [];
    private searchSubject = new Subject<string>();
    private searchSubscription: any;
    dataIsFetching = false;
    roles!: string | null;
    page = 0;
    size = 50;
    totalData = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private service: UserService,
        private messageService: MessageService,
    ) {
        this.users = this.route.snapshot.data['userPage'].content;
        this.totalData = this.route.snapshot.data['userPage'].totalElements;
        this.usersCached = this.users;
        this.roles = this.route.snapshot.queryParamMap.get('roles');
    }

    ngOnInit() {
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
        if (this.roles) {
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
                        summary: 'Erro',
                        detail: error
                    });
                    this.dataIsFetching = false;
                }
            });
        } else {
            this.service.getPagination(Role.client, page, size).subscribe({
                next: (response) => {
                    this.users = response.content;
                    this.usersCached = response.content;
                    this.totalData = response.totalElements;
                    this.dataIsFetching = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: error
                    });
                    this.dataIsFetching = false;
                }
            });
        }

    }

    private setupSearch(): void {
        this.searchSubscription = this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(query => {
                if (query.length >= 3) {
                    this.dataIsFetching = true;

                    if (this.roles) {
                        return this.service.search(query, this.roles).pipe(
                            catchError(error => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Erro',
                                    detail: error
                                });
                                return of(this.usersCached);
                            })
                        );
                    } else {
                        return this.service.search(query, Role.client).pipe(
                            catchError(error => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Erro',
                                    detail: error
                                });
                                return of(this.usersCached);
                            })
                        );
                    }

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
