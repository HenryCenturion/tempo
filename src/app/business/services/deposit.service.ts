import { Injectable } from '@angular/core';
import {environment} from "../../../environment/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DepositService {

  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  createDeposit(amount: any): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(`${this.baseUrl}/deposit/create-deposit?amount=${amount}`, {}, { headers, responseType: 'text' });
    }
  }

}
