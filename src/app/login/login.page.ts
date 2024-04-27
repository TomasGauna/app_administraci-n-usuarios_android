import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  clave = '';
  mostrarSpinner = false;
  mensajeError = '';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
  }

  ingresar()
  {
    this.mostrarSpinner = true;
    this.auth.login(this.email, this.clave)?.then(()=>{
      this.auth.mostrarToastExito('Ingresando...');
      this.mostrarSpinner = false;
      this.router.navigateByUrl('home');
    })
    .catch(error =>
    {
      setTimeout(()=>{
        this.mostrarSpinner = false;
        switch(error.code)
        {
          case 'auth/invalid-email':
            this.mensajeError =  "Email inválido.";
          break;
          case 'auth/missing-password':
            this.mensajeError = "Contraseña inválida.";
          break;
          case 'auth/invalid-login-credentials':
            this.mensajeError = 'Email y/o contraseña incorrectos.';
          break;
        }
        this.auth.mostrarToastError(this.mensajeError);
      }, 2000);
    });
  }

  limpiarCampos()
  {
    this.email = '';
    this.clave = '';
  }
}
