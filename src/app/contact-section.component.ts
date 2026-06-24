import { Component } from '@angular/core';

import { CONTACT_EMAIL, ContactFormStatus, submitContactEmail } from './contact-email';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  templateUrl: './contact-section.component.html'
})
export class ContactSectionComponent {
  readonly contactEmail = CONTACT_EMAIL;
  contactStatus: ContactFormStatus = 'idle';

  get contactStatusMessage(): string {
    if (this.contactStatus === 'sent') {
      return 'Το μήνυμα στάλθηκε. Θα επικοινωνήσουμε σύντομα.';
    }

    if (this.contactStatus === 'error') {
      return 'Κάτι πήγε στραβά. Δοκίμασε ξανά ή στείλε μας email απευθείας.';
    }

    return '';
  }

  async sendContactEmail(event: Event): Promise<void> {
    this.contactStatus = 'sending';

    try {
      this.contactStatus = await submitContactEmail(event);
    } catch {
      this.contactStatus = 'error';
    }
  }
}
