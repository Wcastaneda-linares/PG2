import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
})
export class EditUserModalComponent implements OnInit {
  editUserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    // Inicializar editUserForm en el constructor
    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Aquí puedes cargar datos si es necesario
  }

  guardarCambios() {
    if (this.editUserForm.valid) {
      this.modalCtrl.dismiss(this.editUserForm.value);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
