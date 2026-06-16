import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ContactSectionComponent } from './contact-section.component';
import { ServiceDetail, serviceDetails } from './service-content';
import { SiteFooterComponent } from './site-footer.component';
import { SiteNavComponent } from './site-nav.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink, SiteNavComponent, ContactSectionComponent, SiteFooterComponent],
  templateUrl: './service-detail.component.html'
})
export class ServiceDetailComponent implements AfterViewInit, OnDestroy, OnInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly route = inject(ActivatedRoute);
  private revealObserver?: IntersectionObserver;
  private routeSubscription?: Subscription;
  currentSlug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly services = serviceDetails;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.currentSlug = params.get('slug') ?? '';
    });
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const shell = this.elementRef.nativeElement.querySelector<HTMLElement>('.site-shell');
      const revealItems = Array.from(
        this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-reveal]')
      );

      if (!shell || revealItems.length === 0) {
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
    this.routeSubscription?.unsubscribe();
  }

  get service(): ServiceDetail {
    return this.services.find((item) => item.slug === this.currentSlug) ?? this.services[0];
  }
}
