import { Injectable } from '@angular/core';
import { environment } from "../../../environment/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  getSubscriptionbyUserId(userId: string | null): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.baseUrl}/suscriptions?userId=${userId}`, { headers });
    }
  }

  updateSubscription(userId: string | null, newPlanType: string): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const params = new HttpParams()
        .set('userId', userId || '')
        .set('newPlanType', newPlanType);

      return this.http.put(`${this.baseUrl}/suscriptions/upgrade`, {}, {headers, params})
        .subscribe(
          (response: any) => {
            if (response && response.approval_url) {
              const paymentWindow = window.open(response.approval_url, 'Payment', 'width=1200,height=800');
              if (paymentWindow) {
                const interval = setInterval(() => {
                  if (paymentWindow.closed) {
                    clearInterval(interval);
                    location.reload();
                  }
                }, 1000);
              } else {

              }
            } else {

            }
          },
          (error: any) => {

          }
        );
    }
  }
}
