import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, Scroll as RouterScroll } from '@angular/router';
import { Subscription } from 'rxjs';

import { CONTACT_EMAIL, ContactFormStatus, submitContactPayload } from './contact-email';
import { serviceSummaries } from './service-content';

const TOP_REVEAL_OFFSET = 36;
const HIDE_AFTER_OFFSET = 120;
const SCROLL_DELTA = 4;

type LeadStep = 1 | 2 | 3;

type LeadServiceOption = {
  value: string;
  title: string;
  description: string;
  icon: string;
};

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-nav.component.html'
})
export class SiteNavComponent implements OnDestroy, OnInit {
  private readonly router = inject(Router);
  @ViewChild('mobileMenuPanel') private mobileMenuPanel?: ElementRef<HTMLElement>;
  @ViewChild('mobileMenuClose') private mobileMenuClose?: ElementRef<HTMLButtonElement>;
  @ViewChild('leadDialogPanel') private leadDialogPanel?: ElementRef<HTMLElement>;
  @ViewChild('leadDialogClose') private leadDialogClose?: ElementRef<HTMLButtonElement>;
  readonly leadServiceOptions: LeadServiceOption[] = [
    {
      value: 'Website Design',
      title: 'Website Design',
      description: 'Νέα ιστοσελίδα, redesign, landing page ή eshop.',
      icon: 'fa-display'
    },
    {
      value: 'Web Support',
      title: 'Web Support',
      description: 'Συντήρηση, αλλαγές, bugs, βελτιώσεις και συνέχεια.',
      icon: 'fa-screwdriver-wrench'
    },
    {
      value: 'Digital Marketing',
      title: 'Digital Marketing',
      description: 'Google Ads, social media, campaigns και μικρά videos.',
      icon: 'fa-bullhorn'
    },
    {
      value: 'Other',
      title: 'Other',
      description: 'Κάτι πιο ειδικό ή συνδυασμός υπηρεσιών.',
      icon: 'fa-plus'
    }
  ];
  readonly services = serviceSummaries;
  readonly contactEmail = CONTACT_EMAIL;
  mobileMenuOpen = false;
  leadDialogOpen = false;
  leadStep: LeadStep = 1;
  leadFormStatus: ContactFormStatus = 'idle';
  leadSelectedService = '';
  leadOtherService = '';
  leadName = '';
  leadEmail = '';
  leadPhone = '';
  navHidden = false;
  navScrolled = false;
  private lastScrollY = 0;
  private previousMobileFocus?: HTMLElement | null;
  private previousFocus?: HTMLElement | null;
  private routeSubscription?: Subscription;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateNavState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateNavState(true);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeLeadDialog();
    this.closeMobileMenu();
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.updateNavState(true);
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mobileMenuOpen = false;
        this.updateNavState(true);
        return;
      }

      if (event instanceof RouterScroll) {
        window.requestAnimationFrame(() => this.updateNavState(true));
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggleMobileMenu(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
      return;
    }

    if (typeof document !== 'undefined') {
      this.previousMobileFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.style.overflow = 'hidden';
    }

    this.mobileMenuOpen = true;
    this.navHidden = false;

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.mobileMenuClose?.nativeElement.focus(), 0);
    }
  }

  closeMobileMenu(): void {
    const shouldRestoreFocus = this.mobileMenuOpen;
    this.mobileMenuOpen = false;

    if (!this.leadDialogOpen && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    if (shouldRestoreFocus) {
      this.previousMobileFocus?.focus();
    }

    this.previousMobileFocus = null;
  }

  get leadFormStatusMessage(): string {
    if (this.leadFormStatus === 'sending') {
      return 'Στέλνουμε το μήνυμά σου...';
    }

    if (this.leadFormStatus === 'sent') {
      return 'Ευχαριστούμε! Το μήνυμα στάλθηκε επιτυχώς. Θα επικοινωνήσουμε σύντομα.';
    }

    if (this.leadFormStatus === 'error') {
      return 'Κάτι πήγε στραβά. Δοκίμασε ξανά ή στείλε μας email απευθείας.';
    }

    return '';
  }

  get leadServiceLabel(): string {
    if (this.leadSelectedService !== 'Other') {
      return this.leadSelectedService;
    }

    return this.leadOtherService.trim() || 'Other';
  }

  get leadDialogTitle(): string {
    if (this.leadFormStatus === 'sent') {
      return this.leadName ? `Ευχαριστούμε, ${this.leadName}.` : 'Ευχαριστούμε.';
    }

    if (this.leadStep === 2) {
      return 'Πώς να σε βρούμε;';
    }

    if (this.leadStep === 3) {
      return 'Τελευταίο: τηλέφωνο.';
    }

    return 'Τι ψάχνεις αυτή τη στιγμή;';
  }

  get leadProgress(): number {
    if (this.leadFormStatus === 'sent') {
      return 100;
    }

    return Math.round((this.leadStep / 3) * 100);
  }

  get canContinueFromServiceStep(): boolean {
    if (!this.leadSelectedService) {
      return false;
    }

    if (this.leadSelectedService === 'Other') {
      return this.leadOtherService.trim().length > 1;
    }

    return true;
  }

  openLeadDialog(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }

    if (typeof document !== 'undefined') {
      this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.style.overflow = 'hidden';
    }

    this.navHidden = false;
    this.resetLeadFlow();
    this.leadDialogOpen = true;

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.focusLeadDialog(), 0);
    }
  }

  closeLeadDialog(): void {
    this.leadDialogOpen = false;

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    this.previousFocus?.focus();
    this.previousFocus = null;
  }

  selectLeadService(value: string): void {
    this.leadSelectedService = value;

    if (value !== 'Other') {
      this.leadOtherService = '';
    }
  }

  updateLeadOtherService(value: string): void {
    this.leadOtherService = value;
  }

  goToLeadStep(step: LeadStep): void {
    this.leadStep = step;
  }

  continueFromServiceStep(): void {
    if (!this.canContinueFromServiceStep) {
      return;
    }

    this.leadStep = 2;
  }

  saveLeadIdentity(event: Event, name: string, email: string): void {
    event.preventDefault();

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) {
      return;
    }

    this.leadName = name.trim();
    this.leadEmail = email.trim();
    this.leadStep = 3;
  }

  async sendLeadFlow(event: Event, phone: string): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement) || !form.reportValidity()) {
      return;
    }

    this.leadPhone = phone.trim();
    this.leadFormStatus = 'sending';

    try {
      this.leadFormStatus = await submitContactPayload({
        name: this.leadName,
        email: this.leadEmail,
        phone: this.leadPhone,
        services: [this.leadServiceLabel],
        message: [
          'Lead captured from the full-screen project popup.',
          '',
          `Looking for: ${this.leadServiceLabel}`,
          `Phone: ${this.leadPhone}`
        ].join('\n')
      });
    } catch {
      this.leadFormStatus = 'error';
    }
  }

  onLeadDialogKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const panel = this.leadDialogPanel?.nativeElement;

    if (!panel) {
      return;
    }

    this.trapFocus(event, panel);
  }

  onMobileMenuKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const panel = this.mobileMenuPanel?.nativeElement;

    if (!panel) {
      return;
    }

    this.trapFocus(event, panel);
  }

  private resetLeadFlow(): void {
    this.leadStep = 1;
    this.leadFormStatus = 'idle';
    this.leadSelectedService = '';
    this.leadOtherService = '';
    this.leadName = '';
    this.leadEmail = '';
    this.leadPhone = '';
  }

  private focusLeadDialog(): void {
    this.leadDialogClose?.nativeElement.focus();
  }

  private trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('hidden') && element.offsetParent !== null);

    if (focusable.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private updateNavState(forceVisible = false): void {
    if (typeof window === 'undefined') {
      return;
    }

    const nextScrollY = Math.max(window.scrollY, document.documentElement.scrollTop, 0);
    const maxScrollY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const delta = nextScrollY - this.lastScrollY;
    const isScrollingDown = delta > SCROLL_DELTA;
    const isScrollingUp = delta < -SCROLL_DELTA;
    const isAtTop = nextScrollY <= TOP_REVEAL_OFFSET;
    const isAtBottom = maxScrollY > 0 && nextScrollY >= maxScrollY - 2;

    this.navScrolled = nextScrollY > 24;

    if (forceVisible || this.mobileMenuOpen || isAtTop || isScrollingUp) {
      this.navHidden = false;
    } else if ((isScrollingDown || isAtBottom) && nextScrollY > HIDE_AFTER_OFFSET) {
      this.navHidden = true;
    }

    this.lastScrollY = nextScrollY;
  }
}
