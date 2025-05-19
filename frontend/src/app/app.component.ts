import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { MainNavComponent } from './main-nav/main-nav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MainNavComponent],
})
export class AppComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;

  constructor(private router: Router, private authService: AuthService) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map((user) => !!user)
    );
  }

  ngOnInit(): void {
    // No initialization needed
  }
}
