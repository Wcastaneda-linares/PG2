import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { DocumentViewerModalPageComponent } from '../components/document-viewer-modal-page/document-viewer-modal-page.component';
import { AngularFirestore } from '@angular/fire/compat/firestore'; 
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';  // Asegúrate de tener esta línea
import { EmailService } from '../services/email.service';



@Component({
  selector: 'app-solicitudes-modal',
  templateUrl: './solicitudes-modal.component.html',
  styleUrls: ['./solicitudes-modal.component.scss'],
})
export class SolicitudesModalComponent {
  @Input() solicitud: any;  // Recibir la solicitud como un input
  identificacionURLSanitizada: SafeResourceUrl | undefined;
  user: any; 
  public publicacion: any; // Define la propiedad para los datos de la publicación
  public datosSolicitante: any; // Define la propiedad para los datos del solicitante


  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,  // Inyecta AlertController
    private firestore: AngularFirestore,  // Inyecta AngularFirestore
    private emailService: EmailService,
    
  ) {}

  ngOnInit() {

    
    if (this.solicitud && this.solicitud.identificacionURL) {
      this.identificacionURLSanitizada = this.sanitizer.bypassSecurityTrustResourceUrl(this.solicitud.identificacionURL);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async abrirDocumento(documentURL: string) {
    const modal = await this.modalCtrl.create({
      component: DocumentViewerModalPageComponent,
      componentProps: { documentURL },
      cssClass: 'custom-modal-class'  // Clase personalizada para controlar el tamaño del modal
    });
    return await modal.present();
  }

  // Método para recargar la solicitud desde Firestore
recargarSolicitud(id: string) {
  this.firestore.collection('solicitudes_adopcion').doc(id).valueChanges().subscribe(data => {
    this.solicitud = data;
  });
}

 
async aprobarSolicitud(solicitud: any) {
  const alert = await this.alertController.create({
    header: 'Aprobar Solicitud',
    message: '¿Estás seguro de que deseas aprobar esta solicitud?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Aprobar',
        handler: () => {
          // Actualiza el estado de la solicitud a 'Aprobada'
          this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Aprobada' })
            .then(() => {
              solicitud.estado = 'Aprobada';
              this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido aprobada.');

              // Obtener detalles de la publicación desde Firestore
              this.firestore.collection('publicaciones').doc(solicitud.idMascota).get().subscribe((publicacionSnapshot: any) => {
                const publicacion = publicacionSnapshot.data(); // Datos de la publicación (dueño, mascota, etc.)
                console.log('Datosssssssssssssssss de la publicación:', publicacion);

                // Datos del solicitante (que ya tienes en solicitud)
                const destinatario = solicitud.nombreUsuarioSolicitante; // Correo del solicitante
                const asunto = `¡Tu solicitud de adopción para ${solicitud.nombreMascota} ha sido aprobada!`;

                let detallesContacto;
                if (publicacion.tipoDonante === 'centro') {
                  // Si el tipo de donante es un centro, usar los datos del centro
                  detallesContacto = `
                    <li><strong>Nombre del dueño (Centro):</strong> ${publicacion.nombreCentro || 'No especificado'}</li>
                    <li><strong>Correo electrónico (Centro):</strong> ${publicacion.correoCentro || 'No especificado'}</li>
                    <li><strong>Teléfono de contacto (Centro):</strong> ${publicacion.telefonoCentro || 'No especificado'}</li>
                  `;
                } else {
                  // Si el tipo de donante es particular, usar los datos del donante
                  detallesContacto = `
                    <li><strong>Nombre del donante (Particular):</strong> ${publicacion.donante.nombre || 'No especificado'}</li>
                    <li><strong>Dirección del donante:</strong> ${publicacion.donante.direccion || 'No especificado'}</li>
                    <li><strong>Correo electrónico:</strong> ${publicacion.correo || 'No especificado'}</li>
                    <li><strong>Teléfono de contacto:</strong> ${publicacion.donante.numeroContacto || 'No especificado'}</li>
                  `;
                }

                const contenidoHtml = `
                  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2 style="color: #1a73e8;">¡Felicidades ${solicitud.nombreCompleto}!</h2>
                    <p>Tu solicitud de adopción para la mascota <strong>${solicitud.nombreMascota}</strong> ha sido <strong>aprobada</strong>.</p>
                    <p>A continuación te presentamos los detalles del dueño actual de la mascota para que puedas coordinar la adopción:</p>
                    <ul style="list-style: none; padding: 0;">
                      ${detallesContacto}
                    </ul>
                    <p>¡Gracias por tu compromiso y por brindarle un hogar a esta mascota!</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <footer style="font-size: 12px; color: #888;">
                      <p>Este correo ha sido enviado automáticamente por <strong>Aplicación de Adopción de Mascotas</strong>. No respondas a este mensaje.</p>
                      <p>© 2024 Aplicación Móvil. Todos los derechos reservados.</p>
                    </footer>
                  </div>
                `;

                // Enviar el correo electrónico al solicitante
                this.emailService.sendEmail(destinatario, asunto, contenidoHtml).subscribe(
                  (response: any) => {
                    console.log('Correo enviado con éxito:', response);
                  },
                  (error: any) => {
                    console.error('Error al enviar el correo:', error);
                  }
                );
              });
            })
            .catch((error) => {
              console.error('Error al actualizar el estado de la solicitud:', error);
            });
        },
      },
    ],
  });
  await alert.present();
}



  
async rechazarSolicitud(solicitud: any) {
  const alert = await this.alertController.create({
    header: 'Rechazar Solicitud',
    message: '¿Estás seguro de que deseas rechazar esta solicitud?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Rechazar',
        handler: () => {
          this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Rechazada' })
            .then(() => {
              // Actualiza localmente el estado de la solicitud
              solicitud.estado = 'Rechazada';
              this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido rechazada.');

              // Obtener detalles de la publicación desde Firestore para obtener información sobre la mascota
              this.firestore.collection('publicaciones').doc(solicitud.idMascota).get().subscribe((publicacionSnapshot: any) => {
                const publicacion = publicacionSnapshot.data();

                // Datos del solicitante (que ya tienes en solicitud)
                const destinatario = solicitud.nombreUsuarioSolicitante; // Correo del solicitante
                const asunto = `Solicitud de adopción para ${solicitud.nombreMascota} ha sido rechazada`;

                const contenidoHtml = `
                  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2 style="color: #e53935;">Lamentamos informarte, ${solicitud.nombreCompleto}</h2>
                    <p>Tu solicitud de adopción para la mascota <strong>${solicitud.nombreMascota}</strong> ha sido <strong>rechazada</strong>.</p>
                    <p>Apreciamos tu interés en adoptar a ${solicitud.nombreMascota}, pero en este momento la solicitud no ha sido aprobada.</p>
                    <p>Te animamos a continuar buscando otras oportunidades para brindar un hogar a una mascota. Puedes seguir explorando más mascotas disponibles en nuestra aplicación móvil.</p>
                    <p>Gracias por tu comprensión y por tu compromiso con la adopción responsable.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <footer style="font-size: 12px; color: #888;">
                      <p>Este correo ha sido enviado automáticamente por <strong>Aplicación de Adopción de Mascotas</strong>. No respondas a este mensaje.</p>
                      <p>© 2024 Aplicación Móvil. Todos los derechos reservados.</p>
                    </footer>
                  </div>
                `;

                // Enviar el correo electrónico al solicitante
                this.emailService.sendEmail(destinatario, asunto, contenidoHtml).subscribe(
                  (response: any) => {
                    console.log('Correo de rechazo enviado con éxito:', response);
                  },
                  (error: any) => {
                    console.error('Error al enviar el correo de rechazo:', error);
                  }
                );
              });
            })
            .catch((error) => {
              console.error('Error al actualizar el estado de la solicitud:', error);
            });
        },
      },
    ],
  });
  await alert.present();
}


  enviarNotificacion(userId: string, mensaje: string) {
    const notificacion = {
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
    };

    this.firestore.collection('users').doc(userId).update({
      notificaciones: firebase.firestore.FieldValue.arrayUnion(notificacion)  // Usar FieldValue correctamente
    }).then(() => {
      console.log('Notificación enviada con éxito');
    }).catch(error => {
      console.error('Error al enviar notificación: ', error);
    });
  }

  descargarDocumento(url: string) {
    fetch(url)
      .then(response => response.blob())  // Convertir la respuesta en un Blob
      .then(blob => {
        const link = document.createElement('a');
        const objectURL = URL.createObjectURL(blob);
        link.href = objectURL;
        link.download = 'documento_identificacion';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectURL);  // Liberar el objeto Blob después de la descarga
      })
      .catch(error => {
        console.error('Error al descargar el archivo:', error);
      });
  }
}
