const INSTAGRAM_PROFILE = 'https://www.instagram.com/buzzingbeezdaycare/';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadInstagramEmbedScript() {
  if (document.querySelector('script[data-instagram-embed]')) {
    if (window.instgrm) window.instgrm.Embeds.process();
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.instagram.com/embed.js';
  script.dataset.instagramEmbed = 'true';
  script.onload = () => {
    if (window.instgrm) window.instgrm.Embeds.process();
  };
  document.body.appendChild(script);
}

async function loadInstagramFeed() {
  const container = document.querySelector('#instagram-feed');
  if (!container) return;

  const fallback = `<p class="instagram-embed-fallback">See our latest posts on <a href="${INSTAGRAM_PROFILE}" target="_blank" rel="noopener noreferrer">Instagram</a>.</p>`;

  try {
    const response = await fetch('data/instagram-posts.json');
    if (!response.ok) throw new Error('Could not load Instagram posts');
    const data = await response.json();
    const posts = Array.isArray(data.posts) ? data.posts.slice(0, 3) : [];
    if (!posts.length) throw new Error('No Instagram posts configured');

    container.innerHTML = posts.map((post) => {
      const permalink = `${post.url}${post.url.includes('?') ? '&' : '?'}utm_source=ig_embed&utm_campaign=loading`;
      const label = escapeHtml(post.caption || 'View this post on Instagram');
      const url = escapeHtml(post.url);
      const permalinkAttr = escapeHtml(permalink);
      return `<blockquote class="instagram-media" data-instgrm-permalink="${permalinkAttr}" data-instgrm-version="14"><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></blockquote>`;
    }).join('');

    container.removeAttribute('aria-busy');
    loadInstagramEmbedScript();
  } catch {
    container.innerHTML = fallback;
    container.removeAttribute('aria-busy');
  }
}

loadInstagramFeed();

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
    email: 'emailAddress',
    parentName: 'entry.1888711343',
    childAge: 'entry.488885004',
    startDate: 'entry.1094695771', // Google date field base key
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
    payload.append(GOOGLE_FORM_CONFIG.fields.email, formData.get('email') || '');
    payload.append(GOOGLE_FORM_CONFIG.fields.parentName, formData.get('parentName') || '');
    payload.append(GOOGLE_FORM_CONFIG.fields.childAge, formData.get('childAge') || '');
    const startDateValue = String(formData.get('startDate') || '');
    if (startDateValue) {
      const [year, month, day] = startDateValue.split('-');
      payload.append(`${GOOGLE_FORM_CONFIG.fields.startDate}_year`, year || '');
      payload.append(`${GOOGLE_FORM_CONFIG.fields.startDate}_month`, month || '');
      payload.append(`${GOOGLE_FORM_CONFIG.fields.startDate}_day`, day || '');
    }
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
