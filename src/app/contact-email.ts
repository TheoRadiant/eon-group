export const CONTACT_EMAIL = 'eongroupgr@gmail.com';

export type ContactFormStatus = 'idle' | 'sending' | 'sent' | 'error';

const CONTACT_ENDPOINT = '/api/contact';

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
  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: getValue('name'),
      email: getValue('email'),
      message: getValue('message'),
      company: getValue('company')
    })
  });

  if (!response.ok) {
    throw new Error(`Contact request failed with status ${response.status}`);
  }

  form.reset();

  return 'sent';
}
