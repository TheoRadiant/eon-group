import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-footer.component.html'
})
export class SiteFooterComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private cleanupFooterReveal?: () => void;
  private footerRevealFrame = 0;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const host = this.elementRef.nativeElement;
      const footer = host.querySelector<HTMLElement>('.footer');
      const previousSection = host.previousElementSibling as HTMLElement | null;

      if (!footer || !previousSection) {
        return;
      }

      const updateFooterReveal = () => {
        const uncoveredHeight = window.innerHeight - previousSection.getBoundingClientRect().bottom;
        const revealThreshold = Math.min(180, window.innerHeight * 0.18);

        if (uncoveredHeight >= revealThreshold) {
          footer.classList.add('footer--revealed');
        }
      };

      const scheduleFooterReveal = () => {
        if (this.footerRevealFrame) {
          return;
        }

        this.footerRevealFrame = window.requestAnimationFrame(() => {
          this.footerRevealFrame = 0;
          updateFooterReveal();
        });
      };

      updateFooterReveal();
      window.addEventListener('scroll', scheduleFooterReveal, { passive: true });
      window.addEventListener('resize', scheduleFooterReveal);

      this.cleanupFooterReveal = () => {
        window.removeEventListener('scroll', scheduleFooterReveal);
        window.removeEventListener('resize', scheduleFooterReveal);

        if (this.footerRevealFrame) {
          window.cancelAnimationFrame(this.footerRevealFrame);
          this.footerRevealFrame = 0;
        }
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanupFooterReveal?.();
  }
}
