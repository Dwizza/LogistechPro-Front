import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:8080/api/admin/users';

    constructor(private http: HttpClient) { }

    /** Create a new warehouse manager */
    createWarehouseManager(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/warehouse-managers`, data);
    }

    /** Get all warehouse managers */
    getWarehouseManagers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/warehouse-managers`);
    }

    /** Update an existing warehouse manager */
    updateWarehouseManager(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/warehouse-managers/${id}`, data);
    }

    /** Delete a warehouse manager */
    deleteWarehouseManager(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/warehouse-managers/${id}`);
    }

    /** Get current authenticated user details */
    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`);
    }
}
