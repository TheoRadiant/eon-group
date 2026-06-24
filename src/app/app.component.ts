import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ServiceSummary, serviceSummaries } from './service-content';
import { SiteFooterComponent } from './site-footer.component';

type ProjectItem = {
  number: string;
  name: string;
  tags: string;
  description: string;
  visual: string;
  image?: string;
  imageAlt?: string;
  link?: string;
  linkLabel?: string;
};

type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

type WhyItem = {
  title: string;
  description: string;
};

type PricingPackage = {
  name: string;
  label: string;
  title: string;
  price: string;
  description: string;
  includes: string[];
};

type PricingTheme = 'business' | 'eshops' | 'support';

type PricingCategory = {
  name: string;
  theme: PricingTheme;
  packages: PricingPackage[];
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, SiteFooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private revealObserver?: IntersectionObserver;
  private heroScrollCleanup?: () => void;
  private heroScrollFrame = 0;
  selectedPricingCategoryIndex = 0;
  selectedPricingIndex = 0;
  serviceCursor = {
    visible: false,
    x: 0,
    y: 0
  };

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const shell = this.elementRef.nativeElement.querySelector<HTMLElement>('.site-shell');
      const revealItems = Array.from(
        this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-reveal]')
      );

      if (!shell) {
        return;
      }

      this.setupHeroScrollEffect(shell);

      if (revealItems.length === 0) {
        return;
      }

      shell.classList.add('is-reveal-ready');

      if (!('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
        return;
      }

      this.revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: '0px 0px -12% 0px',
          threshold: 0.16
        }
      );

      revealItems.forEach((item) => this.revealObserver?.observe(item));
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.heroScrollCleanup?.();
  }

  private setupHeroScrollEffect(shell: HTMLElement): void {
    const hero = shell.querySelector<HTMLElement>('.hero');

    if (!hero) {
      return;
    }

    const getOpenFrame = () => {
      if (window.innerWidth <= 700) {
        return { frame: 0, radius: 0 };
      }

      if (window.innerWidth <= 960) {
        return { frame: 0.96, radius: 10 };
      }

      if (window.innerHeight <= 800) {
        return { frame: 1, radius: 11 };
      }

      return { frame: 1.5, radius: 16 };
    };

    const updateHeroFrame = () => {
      const progress = Math.min(Math.max(window.scrollY / 260, 0), 1);
      const open = getOpenFrame();
      const remaining = 1 - progress;

      shell.style.setProperty('--hero-scroll-progress', progress.toFixed(3));
      shell.style.setProperty('--hero-bg-fade', progress.toFixed(3));
      shell.style.setProperty('--hero-frame-size', `${(open.frame * remaining).toFixed(3)}rem`);
      shell.style.setProperty('--hero-radius', `${(open.radius * remaining).toFixed(2)}px`);
    };

    const scheduleHeroFrame = () => {
      if (this.heroScrollFrame) {
        return;
      }

      this.heroScrollFrame = window.requestAnimationFrame(() => {
        this.heroScrollFrame = 0;
        updateHeroFrame();
      });
    };

    updateHeroFrame();
    window.addEventListener('scroll', scheduleHeroFrame, { passive: true });
    window.addEventListener('resize', scheduleHeroFrame);

    this.heroScrollCleanup = () => {
      window.removeEventListener('scroll', scheduleHeroFrame);
      window.removeEventListener('resize', scheduleHeroFrame);

      if (this.heroScrollFrame) {
        window.cancelAnimationFrame(this.heroScrollFrame);
        this.heroScrollFrame = 0;
      }
    };
  }

  get selectedPricingCategory(): PricingCategory {
    return this.pricingCategories[this.selectedPricingCategoryIndex];
  }

  get selectedPricingPackage(): PricingPackage {
    return this.selectedPricingCategory.packages[this.selectedPricingIndex];
  }

  selectPricingCategory(index: number): void {
    const nextIndex = Number.isFinite(index) ? Math.round(index) : 0;

    this.selectedPricingCategoryIndex = Math.max(0, Math.min(nextIndex, this.pricingCategories.length - 1));
    this.selectedPricingIndex = 0;
  }

  selectPricingPackage(index: number): void {
    const nextIndex = Number.isFinite(index) ? Math.round(index) : 0;
    const maxPackageIndex = this.selectedPricingCategory.packages.length - 1;

    this.selectedPricingIndex = Math.max(0, Math.min(nextIndex, maxPackageIndex));
  }

  showServiceCursor(event: MouseEvent): void {
    this.moveServiceCursor(event);
    this.serviceCursor.visible = true;
  }

  moveServiceCursor(event: MouseEvent): void {
    this.serviceCursor.x = event.clientX;
    this.serviceCursor.y = event.clientY;
  }

  hideServiceCursor(): void {
    this.serviceCursor.visible = false;
  }

  readonly services: ServiceSummary[] = serviceSummaries;

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

  readonly whyItems: WhyItem[] = [
    {
      title: 'Προσιτή εκκίνηση',
      description: 'Ξεκινάμε από καθαρό πακέτο, χωρίς περιττή πολυπλοκότητα και με ξεκάθαρο scope από την αρχή.'
    },
    {
      title: 'Design που πουλάει',
      description: 'Δεν φτιάχνουμε απλώς όμορφες σελίδες. Δίνουμε προτεραιότητα σε ροή, εμπιστοσύνη και μετατροπές.'
    },
    {
      title: 'Συνέχεια μετά το λανσάρισμα',
      description: 'Η σελίδα μπορεί να συνδεθεί με SEO, ads, analytics και καμπάνιες ώστε να εξελίσσεται μαζί με την επιχείρηση.'
    }
  ];

  readonly process: ProcessStep[] = [
    {
      step: '01',
      title: 'Στόχοι και ανάγκες',
      description: 'Καταγράφουμε τι χρειάζεται η επιχείρηση, ποιο κοινό στοχεύει και ποια ενέργεια θέλουμε να κάνει ο επισκέπτης.'
    },
    {
      step: '02',
      title: 'Κατεύθυνση σχεδιασμού',
      description: 'Στήνουμε την αισθητική, τη δομή της αρχικής και το περιεχόμενο με τρόπο που να είναι καθαρό και πειστικό.'
    },
    {
      step: '03',
      title: 'Υλοποίηση',
      description: 'Υλοποιούμε προσαρμοστικές σελίδες, βελτιστοποιούμε ταχύτητα και ετοιμάζουμε τη βασική SEO υποδομή.'
    },
    {
      step: '04',
      title: 'Λανσάρισμα και υποστήριξη',
      description: 'Παραδίδουμε την ιστοσελίδα, κάνουμε τους τελικούς ελέγχους και προτείνουμε τα επόμενα βήματα για προώθηση.'
    }
  ];

  readonly pricingCategories: PricingCategory[] = [
    {
      name: 'Εταιρικές Ιστοσελίδες',
      theme: 'business',
      packages: [
        {
          name: 'Μία Σελίδα',
          label: 'Εταιρικές ιστοσελίδες',
          title: 'Μονοσέλιδη ιστοσελίδα από 300€',
          price: '300€',
          description: 'Καθαρή μονοσέλιδη παρουσία για νέες επιχειρήσεις, επαγγελματίες και υπηρεσίες που χρειάζονται άμεσα δυνατή ψηφιακή εικόνα.',
          includes: [
            'Προσαρμοστική μονοσέλιδη ιστοσελίδα',
            'Καθαρή αρχική ενότητα',
            'Φόρμα επικοινωνίας',
            'SEO βασική δομή',
            'Περιεχόμενο έτοιμο για Google'
          ]
        },
        {
          name: 'Πολυσέλιδο',
          label: 'Ανάπτυξη με WordPress',
          title: 'Ιστοσελίδα από 800€',
          price: '800€',
          description: 'Πιο ολοκληρωμένη πολυεπίπεδη ιστοσελίδα σε WordPress / Elementor, με περισσότερες σελίδες, ιστολόγιο και έτοιμη δομή για ανάπτυξη περιεχομένου.',
          includes: [
            'Περισσότερες σελίδες',
            'Στήσιμο ιστολογίου',
            'Πολυεπίπεδη δομή',
            'Κατασκευή σε WordPress / Elementor',
            '6 άρθρα περιλαμβάνονται',
            '1 χρόνος δωρεάν φιλοξενία',
            '1 κύκλος αλλαγών ιστοσελίδας',
            'Σωστό SEO'
          ]
        },
        {
          name: 'Ειδική Λύση',
          label: 'Προσαρμοσμένη κατασκευή',
          title: 'Προσαρμοσμένες λύσεις',
          price: 'Προσφορά',
          description: 'Για ιστοσελίδες με τιμή κατόπιν προσφοράς που χρειάζονται προσαρμοσμένο κώδικα, ειδικές ροές, διασυνδέσεις, κρατήσεις, πίνακες διαχείρισης ή πιο σύνθετη λειτουργικότητα.',
          includes: [
            'Προσαρμοσμένη UX δομή',
            'Επιλογές προσαρμοσμένου κώδικα',
            'Διασυνδέσεις και αυτοματισμοί',
            'Πλάνο υψηλής απόδοσης',
            'Αρχιτεκτονική έτοιμη για SEO'
          ]
        }
      ]
    },
    {
      name: 'Ηλεκτρονικά Καταστήματα',
      theme: 'eshops',
      packages: [
        {
          name: '1 Προϊόν',
          label: 'Ηλεκτρονικό κατάστημα εκκίνησης',
          title: 'Ηλεκτρονικό κατάστημα ενός προϊόντος από 500€',
          price: '500€',
          description: 'Μικρό ηλεκτρονικό κατάστημα για ένα προϊόν, με καθαρή παρουσίαση, WooCommerce ολοκλήρωση αγοράς και προσαρμοστική εμπειρία αγοράς.',
          includes: [
            '1 σελίδα προϊόντος',
            'Στήσιμο WooCommerce',
            'Διάταξη προϊόντος σε Elementor',
            'Καλάθι και ολοκλήρωση αγοράς',
            'Βασικές πληρωμές/αποστολές',
            'SEO βασική δομή'
          ]
        },
        {
          name: 'Έως 50 Προϊόντα',
          label: 'WooCommerce ανάπτυξη',
          title: 'Ηλεκτρονικό κατάστημα έως 50 προϊόντα από 1200€',
          price: '1200€',
          description: 'Πλήρες ηλεκτρονικό κατάστημα WooCommerce / Elementor για έως 50 προϊόντα, με κατηγορίες, καθαρή πλοήγηση και βάση για πωλήσεις.',
          includes: [
            'Έως 50 προϊόντα',
            'WooCommerce / Elementor',
            'Κατηγορίες προϊόντων',
            'Ροή καλαθιού και αγοράς',
            'Στήσιμο πληρωμών/αποστολών',
            'Προσαρμοστικές σελίδες προϊόντων',
            'Σωστό SEO',
            '1 κύκλος αλλαγών ιστοσελίδας'
          ]
        },
        {
          name: 'Ειδικό Κατάστημα',
          label: 'Σύνθετο ηλεκτρονικό κατάστημα',
          title: 'Προσαρμοσμένο ηλεκτρονικό κατάστημα',
          price: 'Προσφορά',
          description: 'Για πιο σύνθετα ηλεκτρονικά καταστήματα με τιμή κατόπιν προσφοράς, προσαρμοσμένες λειτουργίες, αυτοματισμούς, ERP/CRM διασυνδέσεις, ειδικούς καταλόγους ή σύνθετες ροές αγοράς.',
          includes: [
            'Προσαρμοσμένη λογική πωλήσεων',
            'ERP / CRM διασυνδέσεις',
            'Προχωρημένη δομή καταλόγου',
            'Προσαρμοσμένες ροές αγοράς',
            'Πλάνο απόδοσης και SEO'
          ]
        }
      ]
    },
    {
      name: 'Πακέτα Υποστήριξης',
      theme: 'support',
      packages: [
        {
          name: 'Basic Support',
          label: 'Υποστήριξη ιστοσελίδας',
          title: 'Basic Support από 50€/μήνα',
          price: '50€/μήνα',
          description: 'Ιδανικό για μικρές επιχειρηματικές ιστοσελίδες, portfolio και εταιρικές παρουσιάσεις που χρειάζονται απλή, σταθερή υποστήριξη χωρίς πολλές μηνιαίες αλλαγές.',
          includes: [
            'Βασικές ενημερώσεις και συντήρηση',
            '1 backup ιστοσελίδας τον μήνα',
            '1 αλλαγή περιεχομένου τον μήνα',
            'Μηνιαία υποστήριξη μέσω ticket',
            'Απάντηση ticket έως 24 ώρες'
          ]
        },
        {
          name: 'E-shop Support',
          label: 'Υποστήριξη e-shop',
          title: 'E-shop Support από 100€/μήνα',
          price: '100€/μήνα',
          description: 'Ιδανικό για WooCommerce ιστοσελίδες, e-shops, booking platforms και websites που έχουν ενεργούς πελάτες και χρειάζονται πιο άμεση τεχνική υποστήριξη.',
          includes: [
            'Ενημερώσεις και συντήρηση ιστοσελίδας',
            'Τακτικά backups',
            'Αλλαγές προϊόντων ή περιεχομένου',
            'Priority support',
            'Απάντηση ticket έως 4 ώρες',
            'Κατάλληλο για ενεργά online stores'
          ]
        },
        {
          name: 'Custom Support',
          label: 'Custom υποστήριξη',
          title: 'Custom Website Support',
          price: 'Προσφορά',
          description: 'Ιδανικό για custom-coded websites, προηγμένες πλατφόρμες, web applications και επιχειρήσεις με πιο σύνθετες τεχνικές ανάγκες. Η τιμή δίνεται κατόπιν ελέγχου του website και του επιπέδου υποστήριξης.',
          includes: [
            'Υποστήριξη βάσει συγκεκριμένων αναγκών',
            'Συντήρηση custom κώδικα',
            'Bug fixing και τεχνικές βελτιώσεις',
            'Priority support',
            'Απάντηση ticket έως 2 ώρες',
            'Ευέλικτο μηνιαίο πλάνο'
          ]
        }
      ]
    }
  ];
}
