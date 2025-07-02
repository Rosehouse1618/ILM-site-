// admin.js – Modular admin dashboard logic

/* global supabase */
// IMPORTANT: ensure Supabase SDK is loaded globally via CDN

// --- Supabase credentials (public ANON key) ---
const SUPABASE_URL = 'https://nrnbfevlbakvdeaswbbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybmJmZXZsYmFrdmRlYXN3YmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTIzODgsImV4cCI6MjA2NDM4ODM4OH0.3V7rTYNwxSsKA0etRgNgxvUgoULmqvppVtmSY9Hzr3M';

// Initialize client once DOM ready & Supabase loaded
let supabaseClient;
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Supabase global to be available
  if (!window.supabase) {
    console.error('Supabase SDK not found. Make sure CDN script is included before admin.js');
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Route protection
  await guardRoute();

  // Setup sidebar listeners
  setupSidebar();

  // Load default section
  loadSection('overview');
});

// --------------------------------------------
//            ROUTE GUARD / AUTH
// --------------------------------------------
async function guardRoute() {
  try {
    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
      // Not authenticated -> redirect to login page
      window.location.href = '../admin.html';
      return;
    }
  } catch (err) {
    console.error('Failed to verify session', err);
    window.location.href = '../admin.html';
  }
}

// --------------------------------------------
//                 SIDEBAR UI
// --------------------------------------------
function setupSidebar() {
  const buttons = document.querySelectorAll('.sidebar button[data-section]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      loadSection(section);
      // highlight
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// --------------------------------------------
//           DYNAMIC SECTION LOADER
// --------------------------------------------
async function loadSection(section) {
  const main = document.getElementById('main');
  if (!main) return;

  // Show loading placeholder
  main.innerHTML = `<p style="padding:40px;text-align:center;">Loading ${section}…</p>`;

  try {
    const res = await fetch(`pages/${section}.html`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    main.innerHTML = html;

    // Dispatch custom event so section scripts can hook
    document.dispatchEvent(new CustomEvent('section:loaded', { detail: { section } }));
  } catch (err) {
    console.error('loadSection error', err);
    main.innerHTML = `<div style="padding:40px;text-align:center;color:#c00;">Failed to load section: ${section}<br><small>${err.message}</small></div>`;
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
}

// Section initializers mapping
const SECTION_INIT = {
  overview: () => { if (typeof initializeDashboard === 'function') initializeDashboard(); },
  bookings: () => { if (typeof initializeDashboard === 'function') initializeDashboard(); },
  users: () => { if (typeof refreshStudents === 'function') refreshStudents(); },
  gallery: () => { if (typeof initializeGallery === 'function') initializeGallery(); },
  analytics: () => { if (typeof loadAnalyticsData === 'function') loadAnalyticsData(); }
};

// Run init when section loaded
document.addEventListener('section:loaded', (e) => {
  const section = e.detail.section;
  if (SECTION_INIT[section]) {
    // Delay slightly to ensure DOM inserted
    setTimeout(() => SECTION_INIT[section](), 0);
  }
});