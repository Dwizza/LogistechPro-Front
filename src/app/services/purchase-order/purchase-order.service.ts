import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseOrder } from '../../models/purchase-order.model';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/purchase-orders';

    getPurchaseOrders(): Observable<PurchaseOrder[]> {
        return this.http.get<PurchaseOrder[]>(this.apiUrl);
    }

    getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
        return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
    }

    createPurchaseOrder(data: PurchaseOrder): Observable<PurchaseOrder> {
        return this.http.post<PurchaseOrder>(this.apiUrl, data);
    }

    approvePurchaseOrder(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/approve/${id}`, {});
    }

    cancelPurchaseOrder(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/cancel/${id}`, {});
    }

    receivePurchaseOrder(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/receive/${id}`, {});
    }
}
