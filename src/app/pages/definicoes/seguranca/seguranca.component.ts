import { LanguageService, LocalizedDatePipe } from '@/core/i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { SecuritySettings } from '@/core/models/entities.model';
import { DefinicoesService } from '@/core/services';

import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Toast } from 'primeng/toast';

/**
 * Definições → Segurança. Today it hosts one control: the global 2FA switch.
 *
 * The switch renders SERVER state only (one-way binding + an interceptor on change), so a cancelled confirmation
 * or a failed request can never leave the UI showing a setting that isn't actually in effect.
 */
@Component({
    selector: 'app-seguranca',
    standalone: true,
    imports: [LocalizedDatePipe, FormsModule, ToggleSwitchModule, InputTextModule, ButtonModule, Message, ConfirmDialog, Toast, TranslatePipe],
    templateUrl: './seguranca.component.html',
    providers: [ConfirmationService, MessageService]
})
export class SegurancaComponent implements OnInit {
    private service = inject(DefinicoesService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private destroyRef = inject(DestroyRef);
    private i18n = inject(LanguageService);

    /** Server truth. Drives the warning banner, the metadata line and every revert. */
    settings = signal<SecuritySettings | null>(null);
    /**
     * What the switch currently shows. PrimeNG's toggle owns its own visual state the moment it is clicked, so
     * this must be a real two-way-bound value we can write back to — see revert().
     */
    otpEnabledUi = true;
    loading = signal(true);
    saving = signal(false);
    loadError = signal<string | null>(null);
    motivoError = signal(false);
    motivo = '';

    /** The setting as the server last reported it. Defaults to enabled — fail closed. */
    serverOtpEnabled(): boolean {
        return this.settings()?.otpEnabled ?? true;
    }

    ngOnInit(): void {
        this.service
            .getSecuritySettings()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (s) => {
                    this.apply(s);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    // Loaded explicitly rather than through a resolver: resolvers here swallow failures and
                    // return an empty shape, which on a security screen would render a silent lie.
                    this.loadError.set(typeof err === 'string' ? err : this.i18n.instant('definicoes.seguranca.loadError'));
                }
            });
    }

    /** Intercepts the switch: nothing is committed until the admin confirms. */
    requestToggle(next: boolean): void {
        // The widget has already flipped itself; mirror that so the binding has a value to move away from.
        this.otpEnabledUi = next;
        if (this.saving()) {
            this.revert();
            return;
        }
        if (next) {
            this.confirmationService.confirm({
                header: this.i18n.instant('common.confirm'),
                icon: 'pi pi-shield-check',
                message: this.i18n.instant('definicoes.seguranca.confirmEnable'),
                acceptLabel: this.i18n.instant('definicoes.seguranca.acceptEnable'),
                rejectLabel: this.i18n.instant('common.cancel'),
                accept: () => this.commit(true),
                reject: () => this.revert()
            });
            return;
        }

        if (!this.motivo.trim()) {
            this.motivoError.set(true);
            this.messageService.add({
                severity: 'warn',
                summary: this.i18n.instant('definicoes.seguranca.reasonRequired'),
                detail: this.i18n.instant('definicoes.seguranca.reasonRequiredDetail')
            });
            this.revert();
            return;
        }
        this.motivoError.set(false);

        this.confirmationService.confirm({
            header: this.i18n.instant('definicoes.seguranca.dangerZone'),
            icon: 'pi pi-exclamation-triangle',
            message: this.i18n.instant('definicoes.seguranca.confirmDisable'),
            acceptLabel: this.i18n.instant('definicoes.seguranca.acceptDisable'),
            rejectLabel: this.i18n.instant('common.cancel'),
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.commit(false),
            reject: () => this.revert()
        });
    }

    private commit(next: boolean): void {
        this.saving.set(true);
        this.service
            .setOtpEnabled(next, next ? undefined : this.motivo.trim())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (s) => {
                    this.apply(s);
                    this.motivo = '';
                    this.saving.set(false);
                    this.messageService.add(
                        next
                            ? {
                                  severity: 'success',
                                  summary: this.i18n.instant('definicoes.seguranca.enabledToast'),
                                  detail: this.i18n.instant('definicoes.seguranca.enabledToastDetail')
                              }
                            : {
                                  severity: 'warn',
                                  summary: this.i18n.instant('definicoes.seguranca.disabledToast'),
                                  detail: this.i18n.instant('definicoes.seguranca.disabledToastDetail')
                              }
                    );
                },
                error: (err) => {
                    this.saving.set(false);
                    this.revert();
                    // The interceptor rethrows a plain string, not an HttpErrorResponse.
                    this.messageService.add({ severity: 'error', summary: this.i18n.instant('definicoes.seguranca.saveError'), detail: err });
                }
            });
    }

    private apply(s: SecuritySettings): void {
        this.settings.set(s);
        this.otpEnabledUi = s.otpEnabled;
    }

    /**
     * Snaps the switch back to what the server actually holds, after a cancel, a validation failure or an error.
     *
     * Deferred on purpose. NgModel has already pushed the user's click into otpEnabledUi, so assigning the same
     * value back in the same tick is not a change and Angular never writes it to the widget — the switch would
     * keep showing a state the server never accepted, which is exactly how a "saved" setting silently isn't.
     */
    private revert(): void {
        setTimeout(() => (this.otpEnabledUi = this.serverOtpEnabled()));
    }
}
