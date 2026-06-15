import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContactSectionComponent } from './contact-section.component';
import { SiteFooterComponent } from './site-footer.component';
import { SiteNavComponent } from './site-nav.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink, SiteNavComponent, ContactSectionComponent, SiteFooterComponent],
  templateUrl: './about-page.component.html'
})
export class AboutPageComponent {
  readonly values = [
    {
      title: 'Κάνουμε αυτά που λέμε',
      description: 'Μπαίνουμε σε κάθε συνεργασία με καθαρό scope, απλή επικοινωνία και δουλειά που μπορείς να δεις να προχωράει.'
    },
    {
      title: 'Έχουμε γούστο και τεχνική',
      description: 'Συνδυάζουμε δυνατό design, σωστή υλοποίηση και πρακτική σκέψη ώστε η ιστοσελίδα να δείχνει και να δουλεύει σωστά.'
    },
    {
      title: 'Μένουμε χρήσιμοι μετά',
      description: 'Δεν παραδίδουμε απλώς αρχεία. Δίνουμε βάση για SEO, βελτιώσεις, καμπάνιες και επόμενα βήματα ανάπτυξης.'
    }
  ];
}
