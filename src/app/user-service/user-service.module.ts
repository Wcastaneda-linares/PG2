import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserServicePageRoutingModule } from './user-service-routing.module';

import { UserService } from './user-service.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserServicePageRoutingModule,
  ],
  declarations: [UserService],
})
export class UserServicePageModule {}
