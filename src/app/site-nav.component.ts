import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { serviceSummaries } from './service-content';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-nav.component.html'
})
export class SiteNavComponent implements OnInit {
  readonly services = serviceSummaries;
  mobileMenuOpen = false;
  navHidden = false;
  navScrolled = false;
  private lastScrollY = 0;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined' || this.mobileMenuOpen) {
      return;
    }

    const nextScrollY = Math.max(window.scrollY, 0);
    const isScrollingDown = nextScrollY > this.lastScrollY;

    this.navScrolled = nextScrollY > 24;

    if (nextScrollY < 24 || !isScrollingDown) {
      this.navHidden = false;
    } else if (nextScrollY > 120 && isScrollingDown) {
      this.navHidden = true;
    }

    this.lastScrollY = nextScrollY;
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.lastScrollY = Math.max(window.scrollY, 0);
    this.navScrolled = this.lastScrollY > 24;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.navHidden = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
