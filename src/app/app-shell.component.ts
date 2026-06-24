import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SeoService } from './seo.service';
import { SiteNavComponent } from './site-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteNavComponent],
  template: '<a class="skip-link" href="#main-content">Μετάβαση στο κύριο περιεχόμενο</a><app-site-nav></app-site-nav><router-outlet></router-outlet>'
})
export class AppShellComponent {
  constructor(seo: SeoService) {
    seo.init();
  }
}
