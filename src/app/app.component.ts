import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';  // Importar el plugin de Capacitor

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.backButtonEvent();
    });
  }

  // Control del botón de retroceso
  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const alert = await this.alertController.create({
        header: 'Salir',
        message: '¿Desea salir de la aplicación?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Salida cancelada');
            },
          },
          {
            text: 'Salir',
            handler: () => {
              App.exitApp(); // Usar el plugin de Capacitor para salir
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
