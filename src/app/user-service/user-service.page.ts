import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-user-service',
  templateUrl: './user-service.page.html',
  styleUrls: ['./user-service.page.scss'],
})
export class UserService implements OnInit {
  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    console.log('UserServiceComponent inicializado');

  }

  async getDetails(uid: string): Promise<any> {
    try {
      const doc = await this.firestore.collection('users').doc(uid).ref.get();
      if (doc.exists) {
        return doc.data(); // Retorna los datos del usuario, incluyendo el rol.
      } else {
        console.warn('Usuario no encontrado.');
        return null; // Maneja el caso en que no se encuentre el usuario.
      }
    } catch (error) {
      console.error('Error al obtener detalles del usuario: ', error);
      return null;
    }
  }
}
