import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditUserModalComponent } from './edit-user-modal.component';

@NgModule({
  declarations: [EditUserModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,  // Importa ReactiveFormsModule aquí
    IonicModule
  ],
  exports: [EditUserModalComponent]
})
export class EditUserModalModule {}
