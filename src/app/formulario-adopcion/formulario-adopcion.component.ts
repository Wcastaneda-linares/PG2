import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-formulario-adopcion',
  templateUrl: './formulario-adopcion.component.html',
  styleUrls: ['./formulario-adopcion.component.scss'],
})
export class FormularioAdopcionComponent {
  nombreCompleto: string = '';
  telefono: string = '';
  direccion: string = '';
  tieneFamilia: string = '';
  tieneHijos: string = '';
  motivoAdopcion: string = '';
  identificacionURL: string = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  isUploading: boolean = false; // Indica si la subida está en proceso
  uploadProgress: number = 0; // Indicador de progreso

  constructor(
    private modalCtrl: ModalController, 
    private storage: AngularFireStorage
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    console.log('Archivo seleccionado:', file); // Verificar archivo seleccionado
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo de imagen (jpg, png, gif) o un documento PDF.');
      this.selectedFile = null;
      this.selectedFileName = ''; // Restablecer el nombre del archivo
      return;
    }
  
    const maxSizeInMB = 1;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert('El archivo no debe superar 1 MB de tamaño.');
      this.selectedFile = null;
      this.selectedFileName = ''; // Restablecer el nombre del archivo
      return;
    }
  
    this.selectedFile = file;
    this.selectedFileName = file.name; // Guardar el nombre del archivo
    console.log('Archivo validado y guardado:', this.selectedFile);
  }
  

 
  enviarSolicitud() {
    if (this.selectedFile) {
      const filePath = `documentos_identificacion/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);
  
      // Monitorear el progreso de la subida
      uploadTask.percentageChanges().subscribe(progress => {
        console.log('Progreso de la subida:', progress); // Verificar el progreso de la subida
      });
  
      // Subir la imagen y obtener la URL de descarga
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            console.log('URL del archivo subido:', url); // Verificar que la URL se obtiene
            this.identificacionURL = url;
            this.enviarSolicitudConImagen(); // Llamar a la función para enviar la solicitud
          }, error => {
            console.error('Error al obtener la URL del archivo:', error);
          });
        })
      ).subscribe();
    } else {
      alert('Por favor selecciona un archivo de identificación');
    }
  }

  enviarSolicitudConImagen() {
    if (this.nombreCompleto && this.telefono && this.direccion && this.motivoAdopcion && this.identificacionURL) {
      const data = {
        nombreCompleto: this.nombreCompleto,
        telefono: this.telefono,
        direccion: this.direccion,
        tieneFamilia: this.tieneFamilia,
        tieneHijos: this.tieneHijos,
        motivoAdopcion: this.motivoAdopcion,
        identificacionURL: this.identificacionURL,  // La URL del archivo se debe incluir aquí
      };
  
      console.log('Datos enviados a Firestore:', data);  // Verifica que la URL está en los datos
      this.modalCtrl.dismiss(data);  // Enviar la información completa con la URL
    } else {
      alert('Por favor completa todos los campos');
    }
  }
  

  

}
