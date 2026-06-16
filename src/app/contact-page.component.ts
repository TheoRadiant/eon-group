import { Component } from '@angular/core';

import { SiteFooterComponent } from './site-footer.component';
import { SiteNavComponent } from './site-nav.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [SiteNavComponent, SiteFooterComponent],
  templateUrl: './contact-page.component.html'
})
export class ContactPageComponent {}
