import { Documento } from "@/core/models/entities.model";
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { FileUploadService } from "./file-upload.service";

@Injectable({ providedIn: 'root' })
export class DocumentosService {
    protected apiUrl = `${environment.apiUrl}/documentos`;
    private readonly fileUploadService = inject(FileUploadService);

    constructor(
        private http: HttpClient,
    ) { }

    downloadById(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' as 'blob' });
    }

    // #8: public endpoint that only serves signature images (used by the public certificate-verification page).
    downloadSignatureById(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/signature/${id}`, { responseType: 'blob' as 'blob' });
    }

    upload(username: string, file: File | Blob, fileName: string): Observable<any> {
        const formData = new FormData();
        formData.append('files', file, fileName);
        return this.http.post(`${this.apiUrl}/${username}/upload`, formData);
    }

    /**
     * ROLE_ADMIN only: swaps the stored file of an application document in place — the returned Documento keeps
     * its id and `coluna` slot, so nothing needs re-linking to the pedido/auto vistoria.
     * Goes through FileUploadService so the auth cookie + CSRF header ride along.
     */
    replaceById(id: number, file: File): Observable<Documento> {
        return this.fileUploadService.upload<Documento>(`${this.apiUrl}/${id}/replace`, [file], 'put', 'file');
    }

    deleteById(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
