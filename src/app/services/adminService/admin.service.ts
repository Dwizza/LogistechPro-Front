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

    /** Get current authenticated user details */
    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`);
    }
}
