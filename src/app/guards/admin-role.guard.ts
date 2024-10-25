// admin-role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminRoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole'); // Obtener rol

    if (userRole === 'admin') {
      return true; // Permitir acceso si es administrador
    } else {
      this.router.navigate(['/tabs']); // Redirigir si no tiene rol de admin
      return false;
    }
  }
}
