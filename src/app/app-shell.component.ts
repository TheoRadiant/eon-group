import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteNavComponent } from './site-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteNavComponent],
  template: '<app-site-nav></app-site-nav><router-outlet></router-outlet>'
})
export class AppShellComponent {}
