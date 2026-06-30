import { DOCUMENT } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SeoService } from './seo.service';
import { SiteNavComponent } from './site-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteNavComponent],
  template: `
    @if (preloaderVisible) {
      <div
        class="preloader"
        [class.preloader--finishing]="preloaderFinishing"
        role="status"
        aria-live="polite"
        aria-label="Φόρτωση EON Group"
      >
        <span class="preloader__frame" aria-hidden="true"></span>
        <div class="preloader__content">
          <div class="preloader__logo" aria-label="EON Group">
            <span>EON</span>
            <b>Group</b>
          </div>
          <p class="preloader__text">Loading</p>
          <div
            class="preloader__bar"
            role="progressbar"
            aria-label="Πρόοδος φόρτωσης"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-valuenow]="preloaderProgress"
          >
            <span [style.width.%]="preloaderProgress"></span>
          </div>
        </div>
      </div>
    }
    <a class="skip-link" href="#main-content">Μετάβαση στο κύριο περιεχόμενο</a>
    <app-site-nav></app-site-nav>
    <router-outlet></router-outlet>
  `
})
export class AppShellComponent implements OnDestroy, OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private domReady = false;
  private readonly timers: number[] = [];
  private progressInterval = 0;
  private readonly preloaderFallbackMs = 700;
  private readonly preloaderExitMs = 260;
  preloaderFinishing = false;
  preloaderProgress = 8;
  preloaderVisible = true;

  constructor(seo: SeoService) {
    seo.init();
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      this.preloaderVisible = false;
      return;
    }

    this.document.body.classList.add('is-preloading');
    this.ngZone.runOutsideAngular(() => this.startPreloader());
  }

  ngOnDestroy(): void {
    this.clearPreloaderTimers();
    this.document.body.classList.remove('is-preloading', 'is-preloader-finishing');
  }

  private startPreloader(): void {
    this.progressInterval = window.setInterval(() => {
      const cap = this.domReady ? 96 : 82;
      this.ngZone.run(() => {
        this.preloaderProgress = Math.min(cap, this.preloaderProgress + (this.domReady ? 8 : 4));
      });
    }, 40);

    const completeWhenReady = () => {
      if (this.domReady) {
        return;
      }

      this.domReady = true;
      this.ngZone.run(() => this.finishPreloader());
    };

    if (this.document.readyState !== 'loading') {
      completeWhenReady();
      return;
    }

    this.document.addEventListener('DOMContentLoaded', completeWhenReady, { once: true });
    this.timers.push(window.setTimeout(completeWhenReady, this.preloaderFallbackMs));
  }

  private finishPreloader(): void {
    if (this.preloaderFinishing) {
      return;
    }

    this.clearPreloaderTimers();
    this.preloaderProgress = 100;
    this.preloaderFinishing = true;
    this.document.body.classList.add('is-preloader-finishing');

    this.timers.push(window.setTimeout(() => {
      this.preloaderVisible = false;
      this.document.body.classList.remove('is-preloading', 'is-preloader-finishing');
    }, this.preloaderExitMs));
  }

  private clearPreloaderTimers(): void {
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = 0;
    }

    while (this.timers.length > 0) {
      const timer = this.timers.pop();

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    }
  }
}
