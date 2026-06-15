import { Routes } from '@angular/router';

import { AboutPageComponent } from './about-page.component';
import { AppComponent } from './app.component';
import { ContactPageComponent } from './contact-page.component';
import { ServiceDetailComponent } from './service-detail.component';
import { WorkPageComponent } from './work-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  {
    path: 'about',
    component: AboutPageComponent
  },
  {
    path: 'work',
    component: WorkPageComponent
  },
  {
    path: 'contact',
    component: ContactPageComponent
  },
  {
    path: 'ypiresies/:slug',
    component: ServiceDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
