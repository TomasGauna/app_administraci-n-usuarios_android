import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaPageRoutingModule } from './alta-routing.module';

import { AltaPage } from './alta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AltaPageRoutingModule
  ],
  declarations: [AltaPage]
})
export class AltaPageModule {}
