import { Kpis } from '@/core/models/entities.model';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'stats-widget',
    standalone: true,
    template: ` <div class="col-span-12 md:col-span-4">
            <div class="card relative h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Aplicante em progresso</span>
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
                <img class="absolute inline-block" style="bottom: 14px; right: 12px" src="/images/ecommerce-dashboard/rate.svg" />
            </div>
        </div>
        <div class="col-span-12 md:col-span-4">
            <div class="card relative h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Total Certificados e Licenças emitidos (Ativos)</span>
                <div class="flex justify-between">
                    <div class="flex justify-between items-center pt-4">
                        <div class="flex justify-center items-center h-8 min-w-20 rounded p-2 mr-4 text-black" style="margin-right: 12px; background-color: #0bd18a; box-shadow: 0px 6px 20px rgba(11, 209, 138, 0.3)">
                            <span class="leading-tight text-2xl">
                                {{ kpisData?.licencasAtivas }}
                            </span>
                        </div>
                        <div class="leading-loose text-3xl">
                        </div>
                    </div>
                </div>
                <img class="absolute" style="bottom: 14px; right: 12px" src="/images/ecommerce-dashboard/value.svg" />
            </div>
        </div>
        <div class="col-span-12 md:col-span-4">
            <div class="card relative h-28 rounded-xl !p-4">
                <span class="text-sm font-medium leading-none">Total Empresa registradas</span>
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
                <img class="absolute" style="bottom: 14px; right: 12px" src="/images/ecommerce-dashboard/quantity.svg" />
            </div>
        </div>`,
    host: {
        class: 'col-span-12 grid grid-cols-12 gap-4'
    }
})
export class StatsWidget { 
    @Input() kpisData: Kpis | undefined;
}
