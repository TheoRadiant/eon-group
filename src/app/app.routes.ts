import { Routes } from '@angular/router';

import { AboutPageComponent } from './about-page.component';
import { AppComponent } from './app.component';
import { ContactPageComponent } from './contact-page.component';
import { ServiceDetailComponent } from './service-detail.component';
import { WorkPageComponent } from './work-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    data: {
      seo: {
        title: 'EON Group | Κατασκευή ιστοσελίδων από 300€ στην Ελλάδα',
        description: 'Η EON Group δημιουργεί οικονομικά, μοντέρνα και responsive websites για επιχειρήσεις στην Ελλάδα, με SEO-friendly δομή, web support και digital marketing.',
        path: '/',
        type: 'website',
        keywords: ['κατασκευή ιστοσελίδων', 'web design Ελλάδα', 'responsive websites', 'SEO δομή', 'digital marketing']
      }
    }
  },
  {
    path: 'about',
    component: AboutPageComponent,
    data: {
      seo: {
        title: 'Σχετικά με την EON Group | Web design και digital marketing',
        description: 'Γνώρισε την EON Group, την ομάδα που σχεδιάζει, υλοποιεί και υποστηρίζει ιστοσελίδες, eshop και digital marketing για επιχειρήσεις στην Ελλάδα.',
        path: '/about',
        type: 'website',
        keywords: ['EON Group', 'εταιρεία web design', 'κατασκευή ιστοσελίδων Ελλάδα', 'digital marketing Ελλάδα']
      }
    }
  },
  {
    path: 'work',
    component: WorkPageComponent,
    data: {
      seo: {
        title: 'Έργα EON Group | Παραδείγματα ιστοσελίδων και custom λύσεων',
        description: 'Δες ενδεικτικά έργα της EON Group σε custom ιστοσελίδες, WordPress, Elementor, CRM, AI agent και συστήματα κρατήσεων.',
        path: '/work',
        type: 'website',
        keywords: ['έργα web design', 'portfolio ιστοσελίδων', 'custom ιστοσελίδες', 'WordPress Elementor']
      }
    }
  },
  {
    path: 'contact',
    component: ContactPageComponent,
    data: {
      seo: {
        title: 'Επικοινωνία | Ζήτησε πρόταση από την EON Group',
        description: 'Στείλε brief στην EON Group για νέα ιστοσελίδα, eshop, redesign, web support ή digital marketing και λάβε καθαρή πρόταση.',
        path: '/contact',
        type: 'website',
        keywords: ['επικοινωνία web design', 'πρόταση ιστοσελίδας', 'κόστος ιστοσελίδας', 'EON Group email']
      }
    }
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
