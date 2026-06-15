import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { serviceSummaries } from './service-content';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-nav.component.html'
})
export class SiteNavComponent implements OnInit, OnDestroy {
  readonly services = serviceSummaries;
  mobileMenuOpen = false;
  navHidden = false;
  private lastScrollY = 0;

  private readonly handleScroll = (): void => {
    if (typeof window === 'undefined' || this.mobileMenuOpen) {
      return;
    }

    const nextScrollY = Math.max(window.scrollY, 0);
    const isScrollingDown = nextScrollY > this.lastScrollY;

    if (nextScrollY < 24 || !isScrollingDown) {
      this.navHidden = false;
    } else if (nextScrollY > 120 && isScrollingDown) {
      this.navHidden = true;
    }

    this.lastScrollY = nextScrollY;
  };

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.lastScrollY = Math.max(window.scrollY, 0);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('scroll', this.handleScroll);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.navHidden = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
