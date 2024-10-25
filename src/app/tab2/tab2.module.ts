import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { FormularioAdopcionComponent } from '../formulario-adopcion/formulario-adopcion.component';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { DocumentViewerModalPageComponent } from '../components/document-viewer-modal-page/document-viewer-modal-page.component';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    
  ],
  providers: [SocialSharing],
  declarations: [Tab2Page, FormularioAdopcionComponent, DocumentViewerModalPageComponent]
})
export class Tab2PageModule {}
