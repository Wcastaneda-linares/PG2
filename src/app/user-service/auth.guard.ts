import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.authService.isLoggedIn(); // Verifica si el usuario está autenticado

    if (!isLoggedIn) {
      this.router.navigate(['/login']);  // Redirige al usuario a la página de login si no está autenticado
      return false;
    }
    return true;
  }
}
