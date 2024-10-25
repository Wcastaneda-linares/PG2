import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarCentroModalPageRoutingModule } from './registrar-centro-modal-routing.module';

import { RegistrarCentroModalPage } from './registrar-centro-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarCentroModalPageRoutingModule
  ],
  declarations: [RegistrarCentroModalPage]
})
export class RegistrarCentroModalPageModule {}
