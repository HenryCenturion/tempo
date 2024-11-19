import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from "./shared/components/header/header.component";
import {AuthService} from "./iam/services/auth.service";
import {NgIf} from "@angular/common";
import {GoogleAnalyticsService} from "./shared/services/google-analytics.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [GoogleAnalyticsService]
})
export class AppComponent {
  title = 'dtaquito';

  constructor(private authService: AuthService, private googleAnalyticsService: GoogleAnalyticsService) {}

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}
