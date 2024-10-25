import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitudesAdopcionPageRoutingModule } from './solicitudes-adopcion-routing.module';

import { SolicitudesAdopcionPage } from './solicitudes-adopcion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitudesAdopcionPageRoutingModule
  ],
  declarations: [SolicitudesAdopcionPage]
})
export class SolicitudesAdopcionPageModule {}
