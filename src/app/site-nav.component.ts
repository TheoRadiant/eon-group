import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, Scroll as RouterScroll } from '@angular/router';
import { Subscription } from 'rxjs';

import { serviceSummaries } from './service-content';

const TOP_REVEAL_OFFSET = 36;
const HIDE_AFTER_OFFSET = 120;
const SCROLL_DELTA = 4;

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-nav.component.html'
})
export class SiteNavComponent implements OnDestroy, OnInit {
  private readonly router = inject(Router);
  readonly services = serviceSummaries;
  mobileMenuOpen = false;
  navHidden = false;
  navScrolled = false;
  private lastScrollY = 0;
  private routeSubscription?: Subscription;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateNavState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateNavState(true);
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
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.navHidden = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
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
