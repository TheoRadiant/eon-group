import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { AppShellComponent } from './app/app-shell.component';
import { routes } from './app/app.routes';

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
