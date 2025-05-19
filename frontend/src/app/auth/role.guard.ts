import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const allowedRoles = route.data['allowedRoles'] as Array<string>;

    if (this.authService.hasRole(allowedRoles)) {
      return true;
    }

    // Si no tiene el rol adecuado, redirigir a la página principal
    this.router.navigate(['/tables']);
    return false;
  }
}
