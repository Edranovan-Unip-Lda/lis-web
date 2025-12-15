import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GrupoAtividade } from '../models/data-master.model';
import { AplicanteType, Categoria } from '../models/enums';

@Injectable({
    providedIn: 'root'
})
export class DataMasterService {
    protected apiUrl = `${environment.url}/data`;

    constructor(
        private http: HttpClient,
    ) { }

    save(type: string, form: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${type}`, form).pipe(take(1));
    }


    update(type: string, id: number, form: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${type}/${id}`, form).pipe(take(1));
    }

    delete(type: string, id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${type}/${id}`).pipe(take(1));
    }

    getRoles(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/roles`).pipe(take(1));
    }

    getMunicipios(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/municipios`).pipe(take(1));
    }

    getPostosByMunicipio(municipioId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/municipios/${municipioId}/listaPostoAdministrativo`).pipe(take(1));
    }

    getPostoById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/postos/${id}?projection=withMunicipio`).pipe(take(1));
    }

    getPostos(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'nome,asc')
            .set('projection', 'withMunicipio');
        return this.http.get(this.apiUrl + '/postos', { params });
    }

    getSucosByPosto(postoId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/postos/${postoId}/listaSuco`).pipe(take(1));
    }

    getSucoById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/sucos/${id}?projection=withPostoAdministrativo`).pipe(take(1));
    }

    getSucos(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'nome,asc')
            .set('projection', 'withPostoAdministrativo');
        return this.http.get<any>(`${this.apiUrl}/sucos`, { params }).pipe(take(1));
    }

    getAldeiasBySuco(sucoId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/sucos/${sucoId}/listaAldeia`).pipe(take(1));
    }

    getAldeias(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'nome,asc')
            .set('projection', 'withSuco');
        return this.http.get<any>(`${this.apiUrl}/aldeias`, { params }).pipe(take(1));
    }

    getAllAldeias(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/aldeias`).pipe(take(1));
    }

    getAldeiaById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/aldeias/${id}?projection=withSuco`).pipe(take(1));
    }

    searchPostosByNome(nome: string): Observable<any> {
        let params = new HttpParams()
            .set('nome', nome)
            .set('projection', 'withMunicipio');
        return this.http.get<any>(`${this.apiUrl}/postos/search/findByNomeContainingIgnoreCase`, { params }).pipe(take(1));
    }


    searchAldeiasByNome(nome: string): Observable<any> {
        let params = new HttpParams()
            .set('nome', nome)
            .set('projection', 'withSuco');
        return this.http.get<any>(`${this.apiUrl}/aldeias/search/findByNomeContainingIgnoreCase`, { params }).pipe(take(1));
    }

    getPageGrupoAtividade(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'codigo,asc')
        return this.http.get<any>(`${this.apiUrl}/grupo-atividades`, { params }).pipe(take(1));
    }

    getAllGrupoAtividade(): Observable<GrupoAtividade[]> {
        return this.http.get<GrupoAtividade[]>(`${this.apiUrl}/grupo-atividades`).pipe(take(1));
    }

    getAllGrupoAtividadeByTipo(tipo: Categoria): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/grupo-atividades/search/findByTipo?tipo=${tipo}`).pipe(take(1));
    }

    getClassesByGrupoId(grupoId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/grupo-atividades/${grupoId}/classes?projection=withGrupo`).pipe(take(1));
    }

    getPageClasseAtividade(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'codigo,asc')
        return this.http.get<any>(`${this.apiUrl}/classe-atividades?projection=withGrupo`, { params }).pipe(take(1));
    }

    getAllClasseAtividadeByTipo(tipo: Categoria): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/classe-atividades/search/findByTipo?tipo=${tipo}&projection=withGrupo`).pipe(take(1));
    }

    getAllClasseAtividade(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/classe-atividades?projection=withGrupo`).pipe(take(1));
    }

    getClasseAtividadeById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/classe-atividades/${id}?projection=withGrupo`).pipe(take(1));
    }

    getTipoRisco(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'id,asc')
        return this.http.get<any>(`${this.apiUrl}/tipo-risco`, { params }).pipe(take(1));
    }

    getTaxa(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'id,desc')
        return this.http.get<any>(`${this.apiUrl}/taxas`, { params }).pipe(take(1));
    }

    getAllTaxaByCategoriaAndTipo(categoria: Categoria, tipo: AplicanteType): Observable<any> {
        let params = new HttpParams()
            .set('categoria', categoria)
            .set('tipo', tipo);
        return this.http.get<any>(`${this.apiUrl}/taxas/search/findByCategoriaAndTipo`, { params }).pipe(take(1));
    }

    getSociedadeComercial(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'id,desc')
        return this.http.get<any>(`${this.apiUrl}/sociedade-comercial`, { params }).pipe(take(1));
    }

    getPageDirecao(page = 0, size = 50): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'id,desc')
        return this.http.get<any>(`${this.apiUrl}/direcoes`, { params }).pipe(take(1));
    }

}
