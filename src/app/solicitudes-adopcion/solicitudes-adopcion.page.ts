import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-solicitudes-adopcion',
  templateUrl: './solicitudes-adopcion.page.html',
  styleUrls: ['./solicitudes-adopcion.page.scss'],
})
export class SolicitudesAdopcionPage {
  solicitudes: any[] = [];  // Array para almacenar las solicitudes de adopción

  constructor(
    private firestore: AngularFirestore,
    private toastController: ToastController
  ) {
    this.obtenerSolicitudes();
  }

  async obtenerSolicitudes() {
    try {
      this.firestore.collection('solicitudes_adopcion').valueChanges().subscribe((solicitudes) => {
        this.solicitudes = solicitudes;
      });
    } catch (error) {
      console.error('Error al obtener las solicitudes: ', error);
      this.mostrarToast('Error al cargar las solicitudes');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}
