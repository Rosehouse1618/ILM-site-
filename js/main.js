// ===================================
// Main Public Site JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 iLm Website - Starting initialization...');
  
  // Initialize website features
  initializeWebsite();
});

function initializeWebsite() {
  // Critical setup first
  setupMobileMenu();
  setupFormHandling();
  setupAccessibility();
  
  // Gallery and UI features
  setTimeout(() => {
    setupLazyLoading();
    setupGalleryNavigation();
    setupImageLightbox();
    loadPublicGallery();
  }, 100);
  
  // GDPR and analytics (non-critical)
  setTimeout(() => {
    setupGDPRCompliance();
    setupAnalytics();
  }, 300);
}

// ===================================
// MOBILE MENU FUNCTIONALITY
// ===================================
function setupMobileMenu() {
  const menuCheckbox = document.getElementById('menuToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav a');

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (menuCheckbox) menuCheckbox.checked = false;
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuCheckbox) menuCheckbox.checked = false;
    });
  });
}

// ===================================
// FORM HANDLING
// ===================================
function setupFormHandling() {
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }
  
  // Booking Form
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    setupBookingForm();
  }
}

async function handleContactForm(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Here you would send the data to your backend
    console.log('Contact form data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    form.reset();
    
  } catch (error) {
    console.error('Error submitting form:', error);
    showNotification('Error sending message. Please try again.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

// ===================================
// BOOKING FORM
// ===================================
function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  
  // Setup field validations
  const phoneInput = form.querySelector('input[type="tel"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', validatePhoneNumber);
  }
  
  const emailInput = form.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.addEventListener('input', validateEmailAddress);
  }
  
  // Setup guarantor toggle
  const needsGuarantor = form.querySelector('#needsGuarantor');
  if (needsGuarantor) {
    needsGuarantor.addEventListener('change', toggleGuarantorFields);
  }
  
  form.addEventListener('submit', handleBookingSubmit);
}

function toggleGuarantorFields() {
  const guarantorFields = document.getElementById('guarantorFields');
  if (this.checked) {
    guarantorFields.style.display = 'block';
    guarantorFields.querySelectorAll('input').forEach(input => {
      input.required = true;
    });
  } else {
    guarantorFields.style.display = 'none';
    guarantorFields.querySelectorAll('input').forEach(input => {
      input.required = false;
    });
  }
}

function validatePhoneNumber(e) {
  const value = e.target.value;
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length > 11) {
    e.target.value = cleanValue.slice(0, 11);
  }
  
  if (cleanValue.length === 11 && !cleanValue.startsWith('0')) {
    showFieldError(e.target, 'UK phone numbers should start with 0');
  } else {
    clearFieldError(e.target);
  }
}

function validateEmailAddress(e) {
  const email = e.target.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email && !emailRegex.test(email)) {
    showFieldError(e.target, 'Please enter a valid email address');
  } else {
    clearFieldError(e.target);
  }
}

async function handleBookingSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';
  
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add application ID
    data.applicationId = generateApplicationId();
    data.submittedAt = new Date().toISOString();
    
    console.log('Booking submission:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to success page
    window.location.href = '/booking-success.html';
    
  } catch (error) {
    console.error('Error submitting booking:', error);
    showNotification('Error submitting application. Please try again.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

function generateApplicationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ILM-${timestamp}-${random}`.toUpperCase();
}

// ===================================
// LAZY LOADING
// ===================================
function setupLazyLoading() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        if (img.classList.contains('gallery-card')) {
          const bgImage = img.style.backgroundImage || img.getAttribute('data-bg');
          if (bgImage) {
            img.style.backgroundImage = bgImage;
            img.classList.remove('lazy-loading');
            img.classList.add('loaded');
          }
        } else {
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
          }
        }
        
        observer.unobserve(img);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  document.querySelectorAll('.lazy-image, .gallery-card').forEach(img => {
    imageObserver.observe(img);
  });
}

// ===================================
// GALLERY NAVIGATION
// ===================================
function setupGalleryNavigation() {
  const galleryArrows = document.querySelectorAll('.gallery-arrow');
  
  galleryArrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      const gallery = arrow.parentElement.querySelector('.gallery-scroll');
      if (!gallery) return;
      
      const firstCard = gallery.querySelector('.gallery-card');
      if (!firstCard) return;
      
      const cardWidth = firstCard.offsetWidth + 16;
      const direction = arrow.classList.contains('left') ? -1 : 1;
      
      gallery.scrollBy({
        left: direction * cardWidth * 2,
        behavior: 'smooth'
      });
    });
  });
}

// ===================================
// IMAGE LIGHTBOX
// ===================================
function setupImageLightbox() {
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  
  if (!lightbox || !lightboxImage || !closeBtn || !prevBtn || !nextBtn) return;
  
  let currentImageIndex = 0;
  const images = [];
  
  galleryCards.forEach((card, index) => {
    const bgImage = card.style.backgroundImage;
    if (bgImage) {
      const imageUrl = bgImage.slice(5, -2);
      images.push({
        url: imageUrl,
        alt: `Gallery image ${index + 1}`
      });
      
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openLightbox(index));
    }
  });

  function openLightbox(index) {
    currentImageIndex = index;
    lightboxImage.src = images[currentImageIndex].url;
    lightboxImage.alt = images[currentImageIndex].alt;
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }

  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateLightboxImage();
  }
  
  function updateLightboxImage() {
    lightboxImage.src = images[currentImageIndex].url;
    lightboxImage.alt = images[currentImageIndex].alt;
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrevImage);
  nextBtn.addEventListener('click', showNextImage);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrevImage();
        break;
      case 'ArrowRight':
        showNextImage();
        break;
    }
  });
}

// ===================================
// PUBLIC GALLERY
// ===================================
async function loadPublicGallery() {
  const galleryContainer = document.querySelector('.gallery-scroll');
  if (!galleryContainer) return;
  
  try {
    // Gallery images array
    const galleryImages = [
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454270/roseHouseGallery/chess_scene_qvq6hh.jpg', category: 'common' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454271/roseHouseGallery/arch_scene_1_epqfmw.jpg', category: 'architecture' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454272/roseHouseGallery/feature_wall_yellow_qh0plh.jpg', category: 'interior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454274/roseHouseGallery/stair_window_wgikju.jpg', category: 'architecture' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454275/roseHouseGallery/golden_stairs_pbozfd.jpg', category: 'interior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454276/roseHouseGallery/chandelier_jtzbwh.jpg', category: 'interior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454277/roseHouseGallery/victorion_ceiling_1_knyeqw.jpg', category: 'architecture' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454278/roseHouseGallery/outside_window_scene_kjgjwv.jpg', category: 'exterior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454279/roseHouseGallery/view_from_window_tn3xqz.jpg', category: 'view' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454280/roseHouseGallery/bedroom_1_d9gdmd.jpg', category: 'bedroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454282/roseHouseGallery/glitter_blue_room_ioyqzd.jpg', category: 'bedroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454283/roseHouseGallery/yellow_room_1_ixmjwp.jpg', category: 'bedroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454284/roseHouseGallery/room_cookie_wall_vz6aov.jpg', category: 'bedroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454285/roseHouseGallery/yellow_room_2_desk_view_bhxcft.jpg', category: 'study' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454287/roseHouseGallery/dining_scene_hqqhba.jpg', category: 'dining' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454288/roseHouseGallery/modern_kitchen_j7mwep.jpg', category: 'kitchen' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454289/roseHouseGallery/zone_kitchen_vabkaq.jpg', category: 'kitchen' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454290/roseHouseGallery/games_theatre_room_2_vk1qwz.jpg', category: 'recreation' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454291/roseHouseGallery/foosball_jqjjfm.jpg', category: 'recreation' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454292/roseHouseGallery/pray_scene_1_sjwhqe.jpg', category: 'prayer' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454293/roseHouseGallery/prayer_room_1_uy3t67.jpg', category: 'prayer' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454294/roseHouseGallery/outside_3_gzgqmu.jpg', category: 'exterior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454295/roseHouseGallery/out_view_1_r0xkzn.jpg', category: 'exterior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454296/roseHouseGallery/outside_4_rmwnaf.jpg', category: 'exterior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454297/roseHouseGallery/stairs_yellow_ppkxnf.jpg', category: 'interior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454298/roseHouseGallery/stairs_red_1_iy20j5.jpg', category: 'interior' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454299/roseHouseGallery/shower_1_dhtakz.jpg', category: 'bathroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454300/roseHouseGallery/modern_bathroom_2_fyj8aq.jpg', category: 'bathroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454301/roseHouseGallery/en_suite_wkhbhc.jpg', category: 'bathroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454302/roseHouseGallery/disabled_toilet_qfnzw9.jpg', category: 'bathroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454303/roseHouseGallery/sink_view_xdirfk.jpg', category: 'bathroom' },
      { url: 'https://res.cloudinary.com/ilm-student-halls/image/upload/v1734454304/roseHouseGallery/laundry_nh22xi.jpg', category: 'utilities' }
    ];
    
    renderGallery(galleryImages);
    
  } catch (error) {
    console.error('Error loading gallery:', error);
    renderFallbackGallery();
  }
}

function renderGallery(images) {
  const galleryContainer = document.querySelector('.gallery-scroll');
  if (!galleryContainer) return;
  
  const galleryHTML = images.map((image, index) => `
    <div class="gallery-card" 
         style="background-image: url('${image.url}')"
         data-category="${image.category}"
         role="img"
         aria-label="Gallery image ${index + 1}">
      <div class="gallery-card-text">View</div>
    </div>
  `).join('');
  
  galleryContainer.innerHTML = galleryHTML;
}

function renderFallbackGallery() {
  const galleryContainer = document.querySelector('.gallery-scroll');
  if (!galleryContainer) return;
  
  galleryContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Gallery images are temporarily unavailable. Please check back later.</p>';
}

// ===================================
// ACCESSIBILITY
// ===================================
function setupAccessibility() {
  // Skip to main content
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.className = 'skip-to-main';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add ARIA labels
  const nav = document.querySelector('nav');
  if (nav) nav.setAttribute('role', 'navigation');
  
  const main = document.querySelector('main') || document.querySelector('.container');
  if (main) main.setAttribute('role', 'main');
  
  const footer = document.querySelector('footer');
  if (footer) footer.setAttribute('role', 'contentinfo');
}

// ===================================
// GDPR COMPLIANCE
// ===================================
function setupGDPRCompliance() {
  const hasConsent = localStorage.getItem('gdpr-consent');
  if (!hasConsent) {
    showCookieConsent();
  }
}

function showCookieConsent() {
  const banner = document.createElement('div');
  banner.className = 'gdpr-consent-banner';
  banner.innerHTML = `
    <div class="consent-content">
      <div class="consent-text">
        <h4>We value your privacy</h4>
        <p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.</p>
      </div>
      <div class="consent-actions">
        <button class="btn-consent-accept" onclick="acceptCookies()">Accept</button>
        <button class="btn-consent-decline" onclick="declineCookies()">Decline</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
}

window.acceptCookies = function() {
  localStorage.setItem('gdpr-consent', 'accepted');
  localStorage.setItem('gdpr-consent-date', new Date().toISOString());
  document.querySelector('.gdpr-consent-banner')?.remove();
  setupAnalytics();
};

window.declineCookies = function() {
  localStorage.setItem('gdpr-consent', 'declined');
  localStorage.setItem('gdpr-consent-date', new Date().toISOString());
  document.querySelector('.gdpr-consent-banner')?.remove();
};

// ===================================
// ANALYTICS
// ===================================
function setupAnalytics() {
  const consent = localStorage.getItem('gdpr-consent');
  if (consent !== 'accepted') return;
  
  // Track page views
  trackPageView();
  
  // Track user interactions
  document.addEventListener('click', (e) => {
    if (e.target.matches('a, button')) {
      trackEvent('click', {
        element: e.target.tagName,
        text: e.target.textContent.slice(0, 50)
      });
    }
  });
}

function trackPageView() {
  const data = {
    page: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
  
  console.log('Page view tracked:', data);
}

function trackEvent(action, details) {
  const data = {
    action,
    details,
    timestamp: new Date().toISOString()
  };
  
  console.log('Event tracked:', data);
}

// ===================================
// UTILITIES
// ===================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type} show`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('error');
  
  const error = document.createElement('span');
  error.className = 'field-error';
  error.textContent = message;
  
  field.parentElement.appendChild(error);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const error = field.parentElement.querySelector('.field-error');
  if (error) error.remove();
}