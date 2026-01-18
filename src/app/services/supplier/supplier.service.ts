import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier } from '../../models/supplier.model';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private readonly API_URL = 'http://localhost:8080/api/suppliers';

    constructor(private http: HttpClient) { }

    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.API_URL);
    }

    getSupplier(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.API_URL}/${id}`);
    }
}
