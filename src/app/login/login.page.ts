import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { AuthService } from '../user-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public email: string = '';
  public password: string = '';
  public errorMessage: string = '';
  signupForm: any;

  constructor(
    private navCtrl: NavController,
    public fireService: FireserviceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verifica si el usuario ya está autenticado y realiza el logout automáticamente
    this.authService.isLoggedIn().then(isAuthenticated => {
      if (isAuthenticated) {
        this.authService.logout().then(() => {
          console.log('Sesión cerrada automáticamente');
        });
      }
    });
  }

  async onSubmit() {
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'El correo electrónico no tiene un formato válido.';
      return;
    }

    try {
      const userCredential = await this.fireService.login({
        email: this.email,
        password: this.password,
      });

      const user = userCredential.user;

      if (user) {
        localStorage.setItem('usuario', user.email || '');
        this.navCtrl.navigateForward('/tabs/tab1');
        this.errorMessage = '';
        this.limpiarFormulario(); // Limpia el formulario una vez que el usuario inicia sesión
      }
    } catch (error: any) {
      this.errorMessage = this.formatErrorMessage(error.code);
      console.error(error);
    }
  }

  // Limpia el formulario de inicio de sesión
  limpiarFormulario() {
    this.email = '';
    this.password = '';
    this.errorMessage = '';
  }

  validateEmail() {
    if (this.email && !this.isValidEmail(this.email)) {
      this.errorMessage = 'El correo electrónico no tiene un formato válido.';
    } else {
      this.errorMessage = '';
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async loginWithGoogle() {
    try {
      const result = await this.authService.loginWithGoogle();
      console.log('Login successful:', result);
      this.router.navigate(['/tabs/tab1']);
    } catch (error) {
      console.error('Login failed:', error);
      this.errorMessage = 'Error al iniciar sesión con Google.';
    }
  }

  registro() {
    this.navCtrl.navigateForward('/signup');
  }

  private formatErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No se encontró el usuario.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      default:
        return 'Ocurrió un error al iniciar sesión. Intente nuevamente.';
    }
  }
}
