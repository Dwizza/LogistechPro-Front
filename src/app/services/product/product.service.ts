import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product, ProductWarehouse } from '../../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly API_URL = 'http://localhost:8080/api/products';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.API_URL}/details`);
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        const payload = {
            sku: product.sku,
            name: product.name,
            category: product.category,
            avgPrice: product.avgPrice,
            active: true
        };
        return this.http.post<Product>(this.API_URL, payload);
    }

    updateProduct(id: number, product: Partial<Product>): Observable<Product> {
        const payload = {
            sku: product.sku,
            name: product.name,
            category: product.category,
            avgPrice: product.avgPrice,
            active: true
        };
        return this.http.put<Product>(`${this.API_URL}/${id}`, payload);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }

    getProductDetails(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.API_URL}/${id}/details`);
    }
}
