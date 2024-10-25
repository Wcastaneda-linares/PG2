import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InformacionModalPageRoutingModule } from './informacion-modal-routing.module';

import { InformacionModalPage } from './informacion-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InformacionModalPageRoutingModule
  ],
  declarations: [InformacionModalPage]
})
export class InformacionModalPageModule {}
