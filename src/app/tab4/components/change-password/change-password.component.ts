import { Component } from '@angular/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor() { }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Lógica para cambiar la contraseña
  }

}
