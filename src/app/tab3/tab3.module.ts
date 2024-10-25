import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { ActualizarCentroModalComponent } from '../actualizar-centro-modal/actualizar-centro-modal.component'; // Importar modal

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab3PageRoutingModule,
  ],
  declarations: [
    Tab3Page,
    ActualizarCentroModalComponent, // Declarar el componente modal
  ],
})
export class Tab3PageModule {}
