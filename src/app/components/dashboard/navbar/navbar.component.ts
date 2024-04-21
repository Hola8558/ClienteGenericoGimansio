import { Component, HostListener, ViewChild  } from '@angular/core';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LoginService } from '../../login/login.service';
import { filter } from 'rxjs/operators';
import { RutinasService } from '../rutinas/rutinas.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  @ViewChild('drawer') drawer!: MatDrawer;

  estadoReceptorNewRutina$ = this.rutinasService.estadoMenuShowRutina$;
  ocultarNavBar = false;

  public title = 'Inicio';
  public isMenuOpen: boolean = false;

  public mobileQuery: MediaQueryList;
  public isSmallScreen: boolean = false;

  public name : string;
  public shouldApplyNewStyle = false;

  private _mobileQueryListener: () => void;

  constructor(private media: MediaMatcher, private router: Router, private loginService : LoginService,private rutinasService : RutinasService, private breakpointObserver: BreakpointObserver, private activatedRoute: ActivatedRoute) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => {
      // Cambiar el valor de `mode` según el tamaño de la pantalla aquí
      //this.drawer.mode = this.mobileQuery.matches ? 'over' : 'side';
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.name = `${this.loginService.secion.nombre}`;


    if (localStorage.getItem("rutaActiva")){
      this.title = localStorage.getItem("rutaActiva")!;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Lógica para determinar si se debe aplicar el nuevo estilo
    this.shouldApplyNewStyle = window.scrollY > 50; // Cambia 50 según tus necesidades
  }

  applyAnimation: boolean = true;

  toggleAnimation() {
    this.applyAnimation = !this.applyAnimation;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('nivel');
    this.router.navigate(['']);
  }

  setLastViewNav( ruta : string ){
    localStorage.setItem("rutaActiva", ruta);
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });

    this.estadoReceptorNewRutina$.subscribe((estado) => {
      this.ocultarNavBar = estado;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Obtener el título de la ruta activa
      const child = this.activatedRoute.firstChild;
      if (child) {
        child.data.subscribe(data => {
          // Actualizar el título
          this.title = (data['title'] as string) || 'Inicio';
        });
      }
    });
  }

}
