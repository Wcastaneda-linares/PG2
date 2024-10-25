// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = !!localStorage.getItem('authToken'); // Verificar autenticación

    if (!isAuthenticated) {
      this.router.navigate(['/login']); // Redirigir al login si no está autenticado
      return false;
    }
    return true;
  }
}
