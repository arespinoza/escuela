import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario';

import { LoginService } from 'src/app/services/login.service';
import { SpinnerVisibilityService } from 'ng-http-loader';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userform: Usuario = new Usuario(); //usuario mapeado al formulario
  msglogin!:string; // mensaje que indica si no paso el loguin
  returnUrl!: string;

  
  constructor(private loginService:LoginService,
              private route:ActivatedRoute,
              private router:Router,
              private spinner: SpinnerVisibilityService) {

  }
  
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }


  login(){
    this.spinner.show();

    this.loginService.login(this.userform.username, this.userform.password).subscribe(
    (result) => {
        var user = result;
        if (user.status == 1){

            //guardamos el user en cookies en el cliente
            sessionStorage.setItem("token", user.token);
            sessionStorage.setItem("rol", user.rol);
            sessionStorage.setItem("user", user.username);
            sessionStorage.setItem("userid", user.userid);
            this.spinner.hide();

            //redirigimos a home o a pagina que llamo
            this.router.navigateByUrl(this.returnUrl);
        } else {
          this.spinner.hide();

            //usuario no encontrado muestro mensaje en la vista
            this.msglogin="Credencial incorrecta..";
            this.userform.username="";
            this.userform.password="";
        }
    },
    (error) => {
      alert("Error de conexion");
      console.log("error en conexion");
      console.log(error);
    });
  }





}
