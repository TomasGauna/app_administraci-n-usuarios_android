import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-alta',
  templateUrl: './alta.page.html',
  styleUrls: ['./alta.page.scss'],
})
export class AltaPage implements OnInit {
  form: FormGroup;
  urlFoto : any = 'assets/usuario.png';
  abierta = false;
  fotoCapturada:any = null;
  toast = false;
  mensaje = '';

  nombre = '';
  apellido = '';
  dni:any;
  email = '';
  clave = '';
  rClave = '';
  perfil = '';
  mostrarSpinner = false;

  constructor(private angularFirestorage: AngularFireStorage, private auth: AuthService, private formBuilder: FormBuilder, private firestore: Firestore, private router: Router) 
  {
    this.form = this.formBuilder.group(
      {
        nombre: ['', [Validators.required, this.letrasValidator()]],
        apellido: ['', [Validators.required, this.letrasValidator()]],
        dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        email: ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), Validators.email]],
        clave: ['', [Validators.required, Validators.minLength(6)]],
        rClave: ['', [Validators.required, Validators.minLength(6)]]
      },
      {
        validator: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void 
  {
    this.stopScan();
  }

  async sacarFoto()
  {
    try
    {
      this.fotoCapturada = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100,
        webUseInput: true,
      });
      
      this.urlFoto = this.fotoCapturada.dataUrl;
    }
    catch(error)
    {
      console.error('error: ' + error);
    }
  }

  async checkPermission()
  {
    let ret = false;
    try
    {
      const status = await BarcodeScanner.checkPermission({force: true});
      if(status.granted)
      {
        ret = true;
      }
    }
    catch(error)
    { 
     alert(error);
    }

    return ret;
  }

  async startScan()
    {
      try
      {
        const permission = await this.checkPermission();
        if(!permission)
        {
          return;
        }

        this.abierta = true;
        await BarcodeScanner.hideBackground();
        document.querySelector('body')?.classList.add('scanner-active');
        const result = await BarcodeScanner.startScan();
        if(result?.hasContent)
        {
          this.rellenarInputs(result.content);
          BarcodeScanner.showBackground();
          document.querySelector('body')?.classList.add('scanner-active');
          this.abierta = false;
        }
      }
      catch(error)
      {
        alert(error);
        this.stopScan();
      }
  }

  async stopScan()
    {
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
      document.querySelector('body')?.classList.remove('scanner-active');
  }

  capitalizeFirstLetter(input: string): string 
  {
    const words = input.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length === 0) {
        return '';
      }
      const firstLetter = word[0].toUpperCase();
      const restOfTheWord = word.slice(1).toLowerCase();
      return firstLetter + restOfTheWord;
    });
    return capitalizedWords.join(' ');
  }

  rellenarInputs(string: string)
  {
    this.mostrarSpinner = true;
    setTimeout(()=>{
      let array = string.split("@");

      if(array.length === 9)
      {
        this.apellido = this.capitalizeFirstLetter(array[1]);
        this.nombre = this.capitalizeFirstLetter(array[2]);
        this.dni = parseInt(array[4]);
      }
      else
      {
        this.apellido = this.capitalizeFirstLetter(array[4]);
        this.nombre = this.capitalizeFirstLetter(array[5]);
        this.dni = parseInt(array[1]);
      }
      this.mostrarSpinner = false;
    }, 1500);
  }

  noWhitespaceValidator(): ValidatorFn 
  {
    return (control: AbstractControl): { [key: string]: any } | null => 
    {
      if (control.value && control.value.trim() === '') 
      {
        return { 'whitespace': true };
      }
      return null;
    };
  }

  letrasValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value) {
        const trimmedValue = value.trim();
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/.test(trimmedValue)) {
          return { 'invalido': true };
        }
      }
      return null;
    };
  }

  subir(obj:any)
  {
    try
    {
      const fecha = new Date().getTime();
      const storage = getStorage();
      const nombre =`usuarios/${this.nombre.replace(" ", "_")}_${this.dni}_${fecha}`;
      const storageRef = ref(storage, nombre);
      //this.mostrarSpinner = true;
      uploadString(storageRef as any, this.fotoCapturada.dataUrl as any, 'data_url')
      .then(()=>{
        const urlPromise = this.angularFirestorage.ref(nombre).getDownloadURL().toPromise();
        urlPromise.then((url: any) => 
        {
          let obj_ = {...obj, foto: url};
          FirestoreService.guardarFs('altaUsuarios', obj_, this.firestore);
          this.mostrarSpinner = false;
          this.auth.mostrarToastExito('Alta realizada con exito.');
          this.urlFoto = 'assets/perfil.png';
          this.fotoCapturada = null;
          this.nombre = '';
          this.apellido = '';
          this.dni = '';
          this.email = '';
          this.clave = '';
          this.perfil = '';
  
          this.router.navigateByUrl('home');
        });
      });
    }
    catch
    {
      this.mostrarSpinner = true;
      this.auth.mostrarToastError("Error al subir la foto...");
    }
  }

  guardar()
  {
    let obj:any;
    this.mostrarSpinner = true;

    if(this.form.valid && this.fotoCapturada != null)
    {
      obj = { nombres: this.nombre, apellidos: this.apellido, DNI: this.dni, correo: this.email };
    
      this.auth.verificarCorreoEnUso(this.email).then((response)=>{
        if(!response)
        {
          this.auth.signup(this.email, this.clave)
          .then(()=>{
            this.subir(obj);
          })
          .catch((error)=>{
            if(error.code === 'auth/email-already-in-use')
            {
              this.auth.mostrarToastError('El correo electrónico ya se encuentra en uso.');
            }
            this.mostrarSpinner = false;
          });
        }
        else
        {
          this.auth.mostrarToastError('El correo electrónico ya se encuentra en uso.');
        }
      });
    }
    else
    {
      if(this.fotoCapturada == null)
      {
        this.mensaje = '¡Debe tomar una foto!';
      }
      else
      {
        this.mensaje = 'Completar correctamente los campos indicados';  
      }

      this.mostrarSpinner = false;
      this.auth.mostrarToastError(this.mensaje);
    }
  }

  passwordMatchValidator(form: FormGroup) 
  {
    const password = form.get('clave')?.value;
    const confirmPassword = form.get('rClave')?.value;
  
    if (password !== confirmPassword) {
      form.get('rClave')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('rClave')?.setErrors(null);
    }
  }
}
