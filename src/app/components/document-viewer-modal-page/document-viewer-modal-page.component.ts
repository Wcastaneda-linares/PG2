import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-document-viewer-modal-page',
  templateUrl: './document-viewer-modal-page.component.html',
  styleUrls: ['./document-viewer-modal-page.component.scss'],
})
export class DocumentViewerModalPageComponent {
  @Input() documentURL: string | undefined;
  documentURLSanitizada: SafeResourceUrl | undefined;  // Asegúrate de definir esta propiedad

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.documentURL) {
      console.log('URL del documento:', this.documentURL);  // Verificar la URL
      console.log('Tipo de documento: Imagen -', this.esImagen(), 'PDF -', this.esPDF());
      this.documentURLSanitizada = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentURL);  // Sanitiza la URL
      console.log('URL sanitizada:', this.documentURLSanitizada);
    }
  }
  
  cerrarModal() {
    this.modalCtrl.dismiss();  // Cerrar el modal
  }

  esImagen(): boolean {
    const extension = this.obtenerExtension(this.documentURL || '');
    return extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif';
  }
  
  esPDF(): boolean {
    const extension = this.obtenerExtension(this.documentURL || '');
    return extension === 'pdf';
  }
  
  obtenerExtension(url: string): string | null {
    // Remover los parámetros de la URL (todo después de '?')
    const urlSinParametros = url.split('?')[0];
    // Extraer la extensión del archivo
    const extension = urlSinParametros.split('.').pop()?.toLowerCase();
    return extension || null;
  }
  
}
