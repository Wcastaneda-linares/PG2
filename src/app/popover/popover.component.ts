import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  template: `
    <ion-list>
      <ion-item button (click)="selectSegment('user-management')">
        Gestión de Usuarios
      </ion-item>
      <ion-item button (click)="selectSegment('manage-posts')">
        Gestión de Publicaciones
      </ion-item>
      <ion-item button (click)="selectSegment('adoption-requests')">
        Solicitudes de Adopción
      </ion-item>
      <ion-item button (click)="selectSegment('reports')">
        Reportes
      </ion-item>
      
    </ion-list>
  `,
})
export class PopoverComponent {
  constructor(private popoverController: PopoverController) {}

  selectSegment(segment: string) {
    this.popoverController.dismiss(segment);
  }
}
