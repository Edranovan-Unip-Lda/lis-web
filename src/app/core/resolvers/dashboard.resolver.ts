import { ResolveFn } from "@angular/router";
import { DashboardService } from "../services";
import { inject } from "@angular/core";
import { forkJoin, from, map } from "rxjs";

/**
 * Warm the exact Highcharts chunks the highcharts-angular directive loads on demand, while the router
 * still holds navigation. Identical dynamic-import specifiers dedupe to the same chunk, so resolving
 * them here guarantees they're cached before the charts mount.
 *
 * These MUST mirror what the runtime actually fetches, or the warm-up misses and the race survives:
 *   - 'highcharts/esm/highcharts'             → root instance loader (app.config.ts provideHighcharts)
 *   - 'highcharts/esm/modules/accessibility'  → root global module    (app.config.ts)
 *   - 'highcharts/esm/modules/exporting'      → root global module    (app.config.ts)
 *   - 'highcharts/esm/modules/map'            → dashboard partial module (empresa-map / dashboard providers)
 * The directive's "ready" signal only fires after core AND every configured module settle, so all of
 * them have to be cached — warming only some leaves the signal waiting on a network fetch.
 *
 * Why it matters: the directive creates each chart exactly once, `await delay(500)` after render, and
 * never retries (the Highcharts signal is read post-await, so it isn't tracked). On a cold hard-reload
 * the lazy bundle can miss that 500ms window and the chart is built with an undefined constructor —
 * blank forever until a full recreation (navigate away/back). Pre-warming removes the race while
 * keeping Highcharts out of the main bundle.
 *
 * Best-effort: a chunk hiccup must not block the dashboard, so it can't reject — the directive simply
 * falls back to its own lazy load.
 */
export const getDashboardData: ResolveFn<any> = () => {
    const service = inject(DashboardService);

    const highchartsReady = from(
        Promise.all([
            import('highcharts/esm/highcharts'),
            import('highcharts/esm/modules/accessibility'),
            import('highcharts/esm/modules/exporting'),
            import('highcharts/esm/modules/map'),
        ]).catch(() => null)
    );

    return forkJoin({
        data: service.getData(),
        _highcharts: highchartsReady,
    }).pipe(map(({ data }) => data));
}
