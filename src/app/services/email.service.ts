// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendEmail(to: string, subject: string, htmlContent: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': environment.brevoApiKey
    });

    const emailData = {
      sender: { email: 'noreplymascotas@gmail.com', name: 'Aplicación Móvil para la Adopción de Mascotas' },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
    };

    return this.http.post(`${this.apiUrl}/smtp/email`, emailData, { headers });
  }
}