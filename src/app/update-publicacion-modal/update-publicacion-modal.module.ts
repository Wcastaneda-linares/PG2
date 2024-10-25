import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UpdatePublicacionModalComponent } from './update-publicacion-modal.component';  // Correcto

@NgModule({
  declarations: [UpdatePublicacionModalComponent],  // Declara el modal aquí
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [UpdatePublicacionModalComponent]  // Exporta si necesitas usarlo en otros módulos
})
export class UpdatePublicacionModalModule {}
