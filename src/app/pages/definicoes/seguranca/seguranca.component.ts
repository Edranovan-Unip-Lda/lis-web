import { SecuritySettings } from '@/core/models/entities.model';
import { DefinicoesService } from '@/core/services';
import { DatePipe } from '@angular/common';
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
    imports: [FormsModule, DatePipe, ToggleSwitchModule, InputTextModule, ButtonModule, Message, ConfirmDialog, Toast],
    templateUrl: './seguranca.component.html',
    providers: [ConfirmationService, MessageService]
})
export class SegurancaComponent implements OnInit {
    private service = inject(DefinicoesService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private destroyRef = inject(DestroyRef);

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
                    this.loadError.set(typeof err === 'string' ? err : 'Não foi possível carregar as definições.');
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
                header: 'Confirmar',
                icon: 'pi pi-shield-check',
                message:
                    'Vai reativar a verificação em duas etapas para todos os utilizadores. Os próximos inícios de sessão passarão a exigir um código enviado por email. Deseja continuar?',
                acceptLabel: 'Sim, ativar',
                rejectLabel: 'Cancelar',
                accept: () => this.commit(true),
                reject: () => this.revert()
            });
            return;
        }

        if (!this.motivo.trim()) {
            this.motivoError.set(true);
            this.messageService.add({
                severity: 'warn',
                summary: 'Motivo obrigatório',
                detail: 'Indique o motivo antes de desativar a verificação em duas etapas. Nada foi alterado.'
            });
            this.revert();
            return;
        }
        this.motivoError.set(false);

        this.confirmationService.confirm({
            header: 'Zona de risco',
            icon: 'pi pi-exclamation-triangle',
            message:
                'Vai desativar a verificação em duas etapas para TODOS os utilizadores. O início de sessão passará a exigir apenas email e palavra-passe. Esta ação fica registada no histórico. Deseja continuar?',
            acceptLabel: 'Sim, desativar',
            rejectLabel: 'Cancelar',
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
                                  summary: 'Verificação em duas etapas ativada',
                                  detail: 'Os próximos inícios de sessão exigem um código enviado por email.'
                              }
                            : {
                                  severity: 'warn',
                                  summary: 'Verificação em duas etapas desativada',
                                  detail: 'O início de sessão passa a exigir apenas a palavra-passe.'
                              }
                    );
                },
                error: (err) => {
                    this.saving.set(false);
                    this.revert();
                    // The interceptor rethrows a plain string, not an HttpErrorResponse.
                    this.messageService.add({ severity: 'error', summary: 'Não foi possível guardar', detail: err });
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
