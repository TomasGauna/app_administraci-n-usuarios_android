import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut, fetchSignInMethodsForEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  email = '';

  constructor(private auth: Auth, private toastController: ToastController) {}

  login(email: string, password: string)
  {
    let ret;

    try
    {
      this.email = email;
      ret = signInWithEmailAndPassword(this.auth, email, password);
    }
    catch(error)
    {
      console.log("Error al loguearse: ", error);

      ret = null;
    }

    return ret;
  }

  loginAnonimo()
  {
    let ret;

    try
    {
      ret = signInAnonymously(this.auth);
    }
    catch(error)
    {
      console.log("Error al loguearse: ", error);

      ret = null;
    }

    return ret;
  }

  logout()
  {
    let ret;

    try
    {
      ret = signOut(this.auth);
    }
    catch(error)
    {
      console.log("Error al desloguarse: ", error);

      ret = null;
    }

    return ret;
  }

  async signup(email: string, password: string)
  {
    let retorno;

    try
    {
      retorno = createUserWithEmailAndPassword(this.auth, email, password);
    }
    catch(error)
    {
      console.log("Error en register: ", error);
      retorno = null;
    }

    return retorno;
  }

  get_user()
  {
    return this.auth.currentUser;//para obtener el email acceder con .email. Para corroborar que te trajo algo, solo hace un if(user)
  }

  async verificarCorreoEnUso(email: string): Promise<boolean> {
    try {
      const result = await fetchSignInMethodsForEmail(this.auth, email);
      return result.length > 0;
    } catch (error) {
      console.error('Error al verificar el correo:', error);
      return false;
    }
  }

  async mostrarToastError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000, // Duración en milisegundos (3 segundos en este ejemplo)
      color: 'danger', // Color del toast (puedes personalizarlo)
      position: 'bottom', // Posición del toast (puedes cambiarlo)
    });
    toast.present();
  }

  async mostrarToastExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000, // Duración en milisegundos (3 segundos en este ejemplo)
      color: 'success', // Color del toast (puedes personalizarlo)
      position: 'bottom', // Posición del toast (puedes cambiarlo)
    });
    toast.present();
  }

  async mostrarToast(mensaje: string, colorReq : string, posicion : any, time : number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: time, // Duración en milisegundos (3 segundos en este ejemplo)
      color: colorReq, // Color del toast (puedes personalizarlo)
      position: posicion, // Posición del toast (puedes cambiarlo)
    });
    toast.present();
  }
}
