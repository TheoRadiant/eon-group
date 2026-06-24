export const CONTACT_EMAIL = 'eongroupgr@gmail.com';

export type ContactFormStatus = 'idle' | 'sending' | 'sent' | 'error';

export type ContactFormPayload = {
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
  services?: string[];
};

const CONTACT_ENDPOINT = '/api/contact';

export async function submitContactPayload(payload: ContactFormPayload): Promise<ContactFormStatus> {
  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Contact request failed with status ${response.status}`);
  }

  return 'sent';
}

export async function submitContactEmail(event: Event): Promise<ContactFormStatus> {
  event.preventDefault();

  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) {
    return 'idle';
  }

  if (!form.reportValidity()) {
    return 'idle';
  }

  const data = new FormData(form);
  const getValue = (field: string) => String(data.get(field) ?? '').trim();
  const services = data
    .getAll('services')
    .map((service) => String(service).trim())
    .filter(Boolean);

  await submitContactPayload({
    name: getValue('name'),
    email: getValue('email'),
    phone: getValue('phone'),
    services,
    message: getValue('message'),
    company: getValue('company')
  });

  form.reset();

  return 'sent';
}
