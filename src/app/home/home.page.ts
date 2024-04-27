import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  usuarios: any;
  escaneado = '';
  esAdmin = false;///////////////////////
  mostrarSpinner = false;

  constructor(private firestore: Firestore, private auth: AuthService, private router: Router) {}

  ngOnInit() 
  {
    this.mostrarSpinner = true;
    FirestoreService.traerFs('altaUsuarios', this.firestore).subscribe((data)=>{
      this.usuarios = data
      this.mostrarSpinner = false;
    });

    FirestoreService.traerFs('usuarios', this.firestore).subscribe((data)=>{
      data.forEach((u)=>{
        if(this.auth.get_user()?.email === u.email && u.perfil === 'administrador')
        {
          this.esAdmin = true;
        }
      });
    });
  }

  salir()
  {
    this.mostrarSpinner = true;

    setTimeout(()=>{
      this.auth.logout();
      this.router.navigateByUrl('login');
      this.mostrarSpinner = false;
    }, 2000);
  }
}
