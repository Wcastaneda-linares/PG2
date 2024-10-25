import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LlenarInformacionPageRoutingModule } from './llenar-informacion-routing.module';

import { LlenarInformacionPage } from './llenar-informacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LlenarInformacionPageRoutingModule
  ],
  declarations: [LlenarInformacionPage]
})
export class LlenarInformacionPageModule {}
