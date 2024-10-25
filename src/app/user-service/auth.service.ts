import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async reautenticarUsuario(currentPassword: string): Promise<void> {
    const user = await this.afAuth.currentUser;
  
    if (user && user.email) {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
  
      try {
        await reauthenticateWithCredential(user, credential);
        console.log('Usuario reautenticado con éxito.');
      } catch (error) {
        console.error('Error al reautenticar:', error);
        throw new Error('Error al reautenticar. Verifica tu contraseña actual.');
      }
    } else {
      throw new Error('Usuario no autenticado.');
    }
  }

  loginWithGoogle() {
    return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  async cambiarContrasena(newPassword: string): Promise<void> {
    const user = await this.afAuth.currentUser;
  
    if (user) {
      try {
        await user.updatePassword(newPassword);
        console.log('Contraseña cambiada con éxito.');
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        throw error;
      }
    } else {
      throw new Error('Usuario no autenticado.');
    }
  }

  

  // Verifica si el usuario está autenticado
  async isLoggedIn(): Promise<boolean> {
    const user = await firstValueFrom(this.afAuth.authState.pipe(map(user => !!user)));
    return user;
  }

  // Cerrar sesión del usuario
  logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('usuario');
        this.afAuth.signOut().then(() => {
          this.router.navigate(['/login']);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
