const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.fade-in').forEach((el) => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  obs.observe(el);
});

const GOOGLE_FORM_CONFIG = {
  // Replace with your Google Form "formResponse" endpoint
  formAction: 'https://docs.google.com/forms/d/e/1FAIpQLSf3vF4XCEYmsnPwg5ldDNoIBwY40u8qDvhmAHCkD1tBCrZDQA/formResponse',
  fields: {
    parentName: 'entry.1888711343',
    childAge: 'entry.488885004',
    startDate: 'entry.1094695771',
    phone: 'entry.964629371',
    message: 'entry.794793296'
  }
};

const form = document.querySelector('#inquiry-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = document.querySelector('#form-success');
    const failure = document.querySelector('#form-failure');
    if (success) success.style.display = 'none';
    if (failure) failure.style.display = 'none';

    const formData = new FormData(form);

    if (!GOOGLE_FORM_CONFIG.formAction || !Object.values(GOOGLE_FORM_CONFIG.fields).every(Boolean)) {
      if (failure) {
        failure.textContent = 'Form is not connected yet. Please use "Email Instead" until Google Form mapping is configured.';
        failure.style.display = 'block';
      }
      return;
    }

    const payload = new URLSearchParams();
    payload.append(GOOGLE_FORM_CONFIG.fields.parentName, formData.get('parentName') || '');
    payload.append(GOOGLE_FORM_CONFIG.fields.childAge, formData.get('childAge') || '');
    payload.append(GOOGLE_FORM_CONFIG.fields.startDate, formData.get('startDate') || '');
    payload.append(GOOGLE_FORM_CONFIG.fields.phone, formData.get('phone') || '');
    payload.append(GOOGLE_FORM_CONFIG.fields.message, formData.get('message') || '');

    try {
      await fetch(GOOGLE_FORM_CONFIG.formAction, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload.toString()
      });
      form.reset();
      if (success) success.style.display = 'block';
    } catch (err) {
      if (failure) {
        failure.textContent = 'Something went wrong while sending your inquiry. Please try again or use "Email Instead".';
        failure.style.display = 'block';
      }
    }
  });
}

const modal = document.querySelector('#lightbox');
if (modal) {
  const modalImg = modal.querySelector('img');
  document.querySelectorAll('[data-lightbox]').forEach((img) => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modal.showModal();
    });
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
}
