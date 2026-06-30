import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { inject } from '@vercel/analytics';

import { AppShellComponent } from './app/app-shell.component';
import { routes } from './app/app.routes';

// Initialize Vercel Web Analytics
inject();

bootstrapApplication(AppShellComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    )
  ]
}).catch((error) => console.error(error));
