import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from 'src/app/models/anuncio';
import { Area } from 'src/app/models/area';
import { ServiciosAnuncioService } from 'src/app/services/servicios-anuncio.service';
import { ServiciosAreaService } from 'src/app/services/servicios-area.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Rol } from 'src/app/models/rol';
import { RolService } from 'src/app/services/rol.service';

import Quill from 'quill'
import BlotFormatter from 'quill-blot-formatter'
Quill.register('modules/blotFormatter', BlotFormatter)



@Component({
  selector: 'creacion-noticia',
  templateUrl: './creacion-noticia.component.html',
  styleUrls: ['./creacion-noticia.component.css']
})
export class CreacionNoticiaComponent implements OnInit {
  @ViewChild('exampleModal', { static: false }) modal: ElementRef<any> | undefined;

  editorConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    plugins: 'lists link image table wordcount',
    height: '950',
    autoresize: 'ON'
  }


  Anuncio: Anuncio;
  files: { base64: string,  id: number, type: string, name:string }[] = [];
  accion!:string;

  edicion_vista:string = 'vista';
  idArea:any;
  date!:Date;

  infoArea:Area = new Area();
  personaActual:any;
  destinatarios:Array<Rol>;

  quillEditorModules = {};


  sessionStorage: Storage;
  constructor(private sanitizer: DomSanitizer, 
              private serviciosAnuncio: ServiciosAnuncioService,
              private activatedRoute: ActivatedRoute, 
              private router: Router, 
              private serviciosArea: ServiciosAreaService,
              private toast: ToastrService,
              private rolService:RolService) {

    this.Anuncio = new Anuncio();
    this.files = [];
    this.destinatarios = new Array<Rol>();
    this.sessionStorage = sessionStorage;

    this.quillEditorModules = {
      blotFormatter: {}
    }

  }

  ngOnInit(): void {
    this.cargarDestinatarios();
    this.edicion_vista = 'vista';
   this.activatedRoute.params.subscribe(
    params=>{
      this.idArea = params['idArea'];
      this.cargarinfoArea();
      if(params['idAnuncio']=="0"){
        this.accion = 'new';
        this.files = [];
      }
      else{
        this.files = [];
        this.accion = 'update';
        this.cargarAnuncio(params['idArea'],params['idAnuncio']);
        
      }
    }

   )
  }

  contenido() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.Anuncio.descripcion;

    const tableElement: HTMLElement = tempElement.querySelector('table')!;

    if (tableElement) {
      const clonedTableElement = tableElement.cloneNode(true) as HTMLElement;
      if (tableElement.parentNode) {
        tableElement.parentNode.replaceChild(clonedTableElement, tableElement);
      }

      clonedTableElement.classList.add('table', 'table-bordered', 'table-striped');
    }

    // Get the modified HTML string
    this.Anuncio.descripcion = tempElement.innerHTML;
  }

  sanitizeHtml(html: string): SafeHtml {
    this.contenido();
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

 onFileSelected(event: any) {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result as string;
      this.files.push({ 'base64': base64, 'id': this.files.length + 1, 'type': file.type, 'name': file.name });
    };
    reader.readAsDataURL(file);
  }
}

  sanitizeUrl(base64: string): SafeUrl {
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(base64);
    return safeUrl;
  }

  eliminarArchivo(id: number) {
    const index = this.files.findIndex(t => t.id === id);
    if (index != -1) {
      this.files.splice(index, 1);
      this.files.forEach((file, index) => file.id = index + 1);
    }
  }

  downloadFile(base64: string, filename: string) {
    const blob = this.base64ToBlob(base64);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    link.click();
    
    // Clean up the URL object after the download is initiated
    URL.revokeObjectURL(url);
  }
  
  base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'application/octet-stream' });
    return blob;
  }

  edicionYvista(){
  
    if(this.edicion_vista == 'edicion'){
      this.edicion_vista = 'vista';
    }
    else{
      this.edicion_vista = 'edicion';
    }
  }

  //Metodos Rest

  crearAnuncio(anuncio: Anuncio){
     this.date = new Date();
     anuncio.fechaDesde = this.date.toLocaleDateString();
    anuncio.recursos = this.files.map(file=>{return {base64:file.base64, type:file.type, name:file.name}});
    console.log(anuncio);
    this.serviciosAnuncio.postAnuncio(anuncio, this.idArea).subscribe(
      result=>{
        //alert(result.msg);
        this.toast.success('El Anuncio se creo Correctamente', 'Nuevo Anuncio')
        this.router.navigate(['vista-areas']);
      },
      error=>{
        console.log(error);
      }
    )

  }

  cargarAnuncio(idArea:any, idAnuncio:any){
    this.serviciosAnuncio.getAnuncio(idArea,idAnuncio).subscribe(
      result=>{
        Object.assign(this.Anuncio, result);
        this.files = result.recursos;
        console.log(this.Anuncio)
        //redirijo los destinatarios
        for (let index = 0; index < this.Anuncio.destinatarios.length; index++) {
          this.Anuncio.destinatarios[index] =  this.destinatarios.find(r=>(r._id == this.Anuncio.destinatarios[index]._id))!
        }
      },
      error=>{
        console.log(error);
      }
    )

  }

  modificarAnuncio(idArea:any, idAnuncio:any, Anuncio:Anuncio){
    Anuncio.recursos = this.files.map(file => {
      return { base64: file.base64, type: file.type, name: file.name };
    });
    this.serviciosAnuncio.putAnuncio(idArea,idAnuncio,Anuncio).subscribe(
      result=>{
        //alert(result.msg);
        this.toast.success('El Anuncio se Modifico Correctamente', 'Se Modifico el Anuncio')
        // Update the local Anuncio object with modified data
        Object.assign(this.Anuncio, result);
        Object.assign(this.files, result.recursos)
        // Reload the data from the backend
        this.cargarAnuncio(idArea, idAnuncio);
      },
      error=>{
        console.log(error);
      }
    )
  }


  

  eliminarAnuncio(idArea:any, idAnuncio:any){
    this.serviciosAnuncio.deleteAnuncio(idArea,idAnuncio).subscribe(
      result=>{
        //alert(result.msg);
        this.toast.error('El Anuncio se Elimino Correctamente', 'Elimidado')
        this.closeModal();
        this.router.navigate(['vista-areas',this.idArea]);
      },
      error=>{
        console.log(error);
        
      }
    )

  }

  volver(){
    this.router.navigate(['vista-areas',this.idArea]);
  }

  //MODULOS EXTRAS PARA EL FUNCIONAMIENTO DE FUNCIONES ESPECIALES
  
  closeModal() {
    if (this.modal && this.modal.nativeElement) {
      const modalElement: HTMLElement = this.modal.nativeElement;
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (modalBackdrop) {
        modalBackdrop.parentNode?.removeChild(modalBackdrop);
      }
    }
  }

  cargarinfoArea(){
    this.serviciosArea.getArea(this.idArea).subscribe(
      result=>{
        Object.assign(this.infoArea, result);
        this.personaActual = result.responsables.find((persona:any) => persona._id === this.sessionStorage.getItem('userid'));

      },
      error=>{
        console.log(error);
      }
    )
  }
  
   cargarDestinatarios(){
    this.destinatarios = new Array<Rol>();
    let result:any = this.rolService.getRoles().toPromise().then(
      result=>{
        let unRol = new Rol();
        result.forEach((element:any) => {
          Object.assign(unRol, element);
          this.destinatarios.push(unRol);
          unRol = new Rol();
        });
      },
    ).catch(
      error=>{
        console.log("Error al obtener las roles.")
      }
    )
  }
}
