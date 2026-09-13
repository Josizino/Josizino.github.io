/* ============================================================
   contact.js — validated message composer.

   This site is static: there is no server to receive a form. So
   the form never pretends to send anything. A valid submission
   opens the visitor's own email app with the message filled in,
   and the status line says exactly that. A copy button covers
   visitors with no mail app configured.
   ============================================================ */

const TO = 'josegmatoswork@gmail.com';
const MAX_MESSAGE = 1500;   // mailto bodies are truncated past ~2000 chars in some clients

const RULES = {
  name(v) {
    if (!v.trim()) return 'Enter your name.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
  email(v, input) {
    if (!v.trim()) return 'Enter your email address.';
    if (input.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
      return 'Enter a valid email address, like name@example.com.';
    }
    return '';
  },
  message(v) {
    if (!v.trim()) return 'Enter a message.';
    if (v.trim().length < 20) return 'Message must be at least 20 characters.';
    if (v.length > MAX_MESSAGE) return `Message must be ${MAX_MESSAGE} characters or fewer.`;
    return '';
  },
};

export function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return () => {};

  const status = document.getElementById('formStatus');
  const copyBtn = document.getElementById('copyMessage');
  const counter = document.getElementById('messageCount');
  const ac = new AbortController();
  const on = (el, type, fn) => el?.addEventListener(type, fn, { signal: ac.signal });

  // Native bubbles are replaced by inline messages tied with aria-describedby.
  form.noValidate = true;

  const field = (name) => form.elements.namedItem(name);

  const check = (name) => {
    const input = field(name);
    const msg = RULES[name](input.value, input);
    const err = document.getElementById(`err-${name}`);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  };

  const setStatus = (state, text) => {
    if (!status) return;
    status.dataset.state = state;
    status.textContent = text;
    form.dispatchEvent(new CustomEvent('contact:state', { bubbles: true, detail: { state } }));
  };

  const compose = () => {
    const name = field('name').value.trim();
    const email = field('email').value.trim();
    const message = field('message').value.trim();
    return {
      subject: `Portfolio enquiry from ${name}`,
      body: `${message}\n\n${name}\n${email}`,
    };
  };

  // Validate a field once the visitor has left it, then live.
  for (const name of Object.keys(RULES)) {
    const input = field(name);
    on(input, 'blur', () => { input.dataset.touched = '1'; check(name); });
    on(input, 'input', () => { if (input.dataset.touched) check(name); });
  }

  on(field('message'), 'input', () => {
    if (counter) counter.textContent = `${field('message').value.length} / ${MAX_MESSAGE}`;
  });

  on(form, 'submit', (e) => {
    e.preventDefault();
    const results = Object.keys(RULES).map((name) => {
      field(name).dataset.touched = '1';
      return check(name);
    });
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      setStatus('invalid', 'Some fields need attention before the message can be composed.');
      return;
    }
    const { subject, body } = compose();
    window.location.href =
      `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('ready',
      'Your email app should now open with this message filled in. Nothing is sent from this site. ' +
      'If no app opened, use "Copy message" and email ' + TO + ' directly.');
  });

  on(copyBtn, 'click', async () => {
    const { subject, body } = compose();
    try {
      await navigator.clipboard.writeText(`To: ${TO}\nSubject: ${subject}\n\n${body}`);
      setStatus('copied', 'Message copied. Paste it into an email to ' + TO + '.');
    } catch {
      setStatus('invalid', 'Copying was blocked by the browser. Email ' + TO + ' directly.');
    }
  });

  return () => ac.abort();
}
