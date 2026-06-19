import { Component } from '@angular/core';

import { SiteFooterComponent } from './site-footer.component';
import { SiteNavComponent } from './site-nav.component';

type ProjectItem = {
  number: string;
  name: string;
  tags: string;
  description: string;
  visual: string;
  image: string;
  imageAlt: string;
  link: string;
  linkLabel: string;
};

@Component({
  selector: 'app-work-page',
  standalone: true,
  imports: [SiteNavComponent, SiteFooterComponent],
  templateUrl: './work-page.component.html'
})
export class WorkPageComponent {
  readonly projects: ProjectItem[] = [
    {
      number: '01',
      name: 'Elites Realty Group',
      tags: 'ΠΡΟΣΑΡΜΟΣΜΕΝΗ ΙΣΤΟΣΕΛΙΔΑ, AI AGENT, CRM, ΣΥΣΤΗΜΑ ΚΡΑΤΗΣΕΩΝ',
      description: 'Σχεδιάσαμε και υλοποιήσαμε custom ιστοσελίδα από το μηδέν, με ενσωμάτωση AI agent, πλήρες CRM και ολοκληρωμένο σύστημα κρατήσεων για real estate εμπειρία υψηλού επιπέδου.',
      visual: 'elites',
      image: '/assets/elites.jpg',
      imageAlt: 'Παραθαλάσσιες κατοικίες και ακτογραμμή για το Elites Realty Group',
      link: 'https://staging.elitesrealtygroup.com/',
      linkLabel: 'Δες το project'
    },
    {
      number: '02',
      name: 'Entomecta',
      tags: 'WORDPRESS, ELEMENTOR, ΠΟΛΥΣΕΛΙΔΗ ΙΣΤΟΣΕΛΙΔΑ',
      description: 'Δημιουργήσαμε πολυσέλιδη ιστοσελίδα σε WordPress και Elementor, με καθαρή δομή υπηρεσιών, προσαρμοστική εμπειρία και περιεχόμενο οργανωμένο για γρήγορη πλοήγηση.',
      visual: 'entomecta',
      image: '/assets/entomecta.png',
      imageAlt: 'Αρχική σελίδα Entomecta για απεντομώσεις και απολυμάνσεις',
      link: 'https://entomecta.pcnetweb.eu/',
      linkLabel: 'Δες το project'
    }
  ];
}
