import { Kpis, Receita } from '@/core/models/entities.model';
import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'stats-widget',
    standalone: true,
    imports: [CurrencyPipe],
    template: ` <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card relative h-full min-h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Aplicante em progresso (atual)</span>
                <div class="flex justify-between">
                    <div class="flex justify-between items-center pt-4">
                        <div class="flex justify-center items-center h-8 min-w-20 rounded p-2 mr-4 text-black" style="background-color: #fc6161; box-shadow: 0px 6px 20px rgba(252, 97, 97, 0.3)">
                            <span class="leading-tight text-2xl">
                                {{ kpisData?.aplicantesEmCurso }}
                            </span>
                        </div>
                        <div class="leading-loose text-3xl"></div>
                    </div>
                </div>
                <img class="absolute inline-block" style="bottom: 14px; right: 12px" src="/images/rate.svg" />
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card relative h-full min-h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Total Certificados e Licenças emitidos ({{ kpisData?.year ?? 'todos os anos' }})</span>
                <div class="flex justify-between">
                    <div class="flex justify-between items-center pt-4">
                        <div class="flex justify-center items-center h-8 min-w-20 rounded p-2 mr-4 text-black" style="margin-right: 12px; background-color: #0bd18a; box-shadow: 0px 6px 20px rgba(11, 209, 138, 0.3)">
                            <span class="leading-tight text-2xl">
                                {{ kpisData?.certificadosEmitidos }}
                            </span>
                        </div>
                        <div class="leading-loose text-3xl">
                        </div>
                    </div>
                </div>
                <img class="absolute" style="bottom: 14px; right: 12px" src="/images/value.svg" />
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card relative h-full min-h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Total Empresa registradas ({{ kpisData?.year ?? 'todos os anos' }})</span>
                <div class="flex justify-between">
                    <div class="flex justify-between items-center pt-4">
                        <div class="flex justify-center items-center h-8 min-w-20 rounded p-2 mr-4 text-black" style="background-color: #00d0de; box-shadow: 0px 6px 20px rgba(0, 208, 222, 0.3)">
                            <span class="leading-tight text-2xl">
                                {{ kpisData?.empresasRegistradas }}
                            </span>
                        </div>
                        <div class="leading-loose text-3xl"></div>
                    </div>
                </div>
                <img class="absolute" style="bottom: 14px; right: 12px" src="/images/quantity.svg" />
            </div>
        </div>
        <!-- Receitas: follows the year filter (receita.year is null when "Todos" is selected) -->
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card relative h-full min-h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Total Receitas ({{ receita?.year ?? 'todos os anos' }})</span>
                <div class="flex items-center pt-4">
                    <div class="flex justify-center items-center h-8 min-w-20 rounded p-2 text-black" style="background-color: #b18cff; box-shadow: 0px 6px 20px rgba(177, 140, 255, 0.3)">
                        <span class="leading-tight text-2xl">{{ receita?.totalGeral ?? 0 | currency }}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-1 pt-3 text-xs text-muted-color">
                    <span class="flex items-center gap-2">
                        <span class="inline-block w-2 h-2 rounded-full" style="background-color: #3b82f6"></span>
                        Comercial <span class="font-medium text-color">{{ receita?.totalComercial ?? 0 | currency }}</span>
                    </span>
                    <span class="flex items-center gap-2">
                        <span class="inline-block w-2 h-2 rounded-full" style="background-color: #f59e0b"></span>
                        Industrial <span class="font-medium text-color">{{ receita?.totalIndustrial ?? 0 | currency }}</span>
                    </span>
                </div>
            </div>
        </div>`,
    host: {
        class: 'col-span-12 grid grid-cols-12 gap-4'
    }
})
export class StatsWidget {
    @Input() kpisData: Kpis | undefined;
    @Input() receita: Receita | undefined;
}
