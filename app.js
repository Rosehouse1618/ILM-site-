// ===================================
// Enhanced iLm Student Halls Website
// ===================================

class ILMWebsite {
  constructor() {
    // Only run essential initialization immediately
    this.initializeEssentials();
  }

  initializeEssentials() {
    // Critical functions that need to run immediately
    this.setupMobileMenu();
    this.setupFormHandling();
    
    // Show loading indicator for smooth transitions
    this.showPageLoadingIndicator();
    
    // Defer heavy operations
    this.deferHeavyOperations();
  }

  init() {
    // This method is now called after DOM is ready
    console.log('🚀 iLm Website - Starting optimized initialization...');
    
    // Critical setup first
    this.setupAccessibility();
    this.setupMobileGallery();
    
    // Defer non-critical operations
    setTimeout(() => {
      this.setupLazyLoading();
      this.setupPullToRefresh();
      this.setupGalleryNavigation();
      this.setupImageLightbox();
    }, 100);
    
    // Defer GDPR and analytics (least critical for page transitions)
    setTimeout(() => {
      this.setupGDPRCompliance();
      this.setupSecureSubmissions();
    }, 300);
    
    // Load gallery last to prevent blocking
    setTimeout(() => {
      loadPublicGallery();
      setTimeout(() => {
        this.addPrivacyLinks();
      }, 500);
    }, 500);
    
    // Hide loading indicator
    setTimeout(() => {
      this.hidePageLoadingIndicator();
    }, 800);
    
    console.log('✅ iLm Website - Optimized initialization complete');
  }

  deferHeavyOperations() {
    // Defer cache operations to prevent blocking page load
    setTimeout(() => {
      this.clearBrowserCache();
    }, 1000);
    
    // Defer non-essential analytics
    setTimeout(() => {
      this.initializePrivacyAnalytics();
    }, 2000);
  }

  showPageLoadingIndicator() {
    // Add a subtle loading indicator
    if (document.querySelector('.page-loading-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'page-loading-indicator';
    indicator.innerHTML = `
      <div class="loading-bar"></div>
      <style>
        .page-loading-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(47, 41, 112, 0.1);
          z-index: 9999;
          pointer-events: none;
        }
        
        .loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #2F2970, #4B2996);
          width: 0%;
          animation: loadingProgress 0.8s ease-out forwards;
        }
        
        @keyframes loadingProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .page-loading-indicator.complete {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      </style>
    `;
    
    document.body.insertBefore(indicator, document.body.firstChild);
  }

  hidePageLoadingIndicator() {
    const indicator = document.querySelector('.page-loading-indicator');
    if (indicator) {
      indicator.classList.add('complete');
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 300);
    }
  }

  // ===================================
  // LAZY LOADING FOR IMAGES
  // ===================================
  setupLazyLoading() {
    // Create intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.classList.contains('gallery-card')) {
            // Handle background images for gallery cards
            const bgImage = img.style.backgroundImage || img.getAttribute('data-bg');
            if (bgImage) {
              img.style.backgroundImage = bgImage;
              img.classList.remove('lazy-loading');
              img.classList.add('loaded');
            }
          } else {
            // Handle regular img elements
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

    // Observe all lazy loading elements
    document.querySelectorAll('.lazy-image, .gallery-card').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ===================================
  // IMAGE DESCRIPTION HELPER
  // ===================================
  getImageDescription(imageUrl, index) {
    // Extract meaningful descriptions from image URLs
    const filename = imageUrl.split('/').pop().toLowerCase();
    
    // Map common image patterns to descriptions
    const descriptions = {
      'chess': 'Chess game area for student recreation',
      'arch': 'Beautiful architectural features of the building',
      'feature_wall': 'Modern interior design feature wall',
      'stair_window': 'Natural lighting through stairway windows',
      'golden_stairs': 'Elegant golden staircase interior',
      'chandelier': 'Decorative chandelier in common area',
      'victorion_ceiling': 'Victorian-style ceiling details',
      'outside_window': 'Exterior view from student room window',
      'view_from_window': 'Scenic view from accommodation windows',
      'bedroom': 'Comfortable student bedroom accommodation',
      'glitter_blue_room': 'Modern blue-themed student room',
      'yellow_room': 'Bright yellow-themed student bedroom',
      'room_cookie': 'Cozy student room with personal touches',
      'study_desk': 'Dedicated study area in student room',
      'dining': 'Communal dining area for students',
      'modern_kitchen': 'Fully equipped modern kitchen facilities',
      'zone_kitchen': 'Kitchen facilities in accommodation zone',
      'games_theatre_room': 'Entertainment and games room',
      'foosball': 'Foosball table in recreation area',
      'pray_scene': 'Prayer and spiritual reflection area',
      'prayer_room': 'Dedicated Islamic prayer room',
      'outside': 'Exterior view of Rose House building',
      'out_view': 'External view of student accommodation',
      'stairs': 'Interior staircase and circulation areas',
      'shower': 'Modern bathroom and shower facilities',
      'modern_bathroom': 'Contemporary bathroom amenities',
      'en_suite': 'Private en-suite bathroom facilities',
      'disabled_toilet': 'Accessible bathroom facilities',
      'sink': 'Bathroom sink and washing facilities',
      'laundry': 'On-site laundry facilities for students'
    };
    
    // Find matching description
    for (const [key, description] of Object.entries(descriptions)) {
      if (filename.includes(key)) {
        return description;
      }
    }
    
    // Default description
    return `Student accommodation facility ${index}`;
  }

  // ===================================
  // IMAGE LIGHTBOX FUNCTIONALITY
  // ===================================
  setupImageLightbox() {
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    if (!lightbox || !lightboxImage || !closeBtn || !prevBtn || !nextBtn) {
      console.warn('Lightbox elements not found');
      return;
    }
    
    let currentImageIndex = 0;
    const images = [];
    
    // Extract image URLs from gallery cards
    galleryCards.forEach((card, index) => {
      const bgImage = card.style.backgroundImage;
      if (bgImage) {
        const imageUrl = bgImage.slice(5, -2); // Remove url(" and ")
        images.push({
          url: imageUrl,
          alt: `iLm Halal Student Halls - ${this.getImageDescription(imageUrl, index + 1)}`
        });
        
        // Make gallery cards clickable
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
          openLightbox(index);
        });
      }
    });

    const openLightbox = (index) => {
      currentImageIndex = index;
      lightboxImage.src = images[currentImageIndex].url;
      lightboxImage.alt = images[currentImageIndex].alt;
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    };

    const showPrevImage = () => {
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      lightboxImage.src = images[currentImageIndex].url;
      lightboxImage.alt = images[currentImageIndex].alt;
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    };

    const showNextImage = () => {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      lightboxImage.src = images[currentImageIndex].url;
      lightboxImage.alt = images[currentImageIndex].alt;
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    };

    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Close when clicking outside the image
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
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

    // Touch/swipe navigation for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) {
        showNextImage(); // Swipe left = next image
      }
      if (touchEndX > touchStartX + 50) {
        showPrevImage(); // Swipe right = previous image
      }
    };
  }

  // ===================================
  // MOBILE GALLERY WITH SWIPE SUPPORT
  // ===================================
  setupMobileGallery() {
    const galleryScrolls = document.querySelectorAll('.gallery-scroll');
    
    galleryScrolls.forEach(gallery => {
      let startX = 0;
      let scrollLeft = 0;
      let isDown = false;
      
      // Touch events for swipe
      gallery.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - gallery.offsetLeft;
        scrollLeft = gallery.scrollLeft;
      });
      
      gallery.addEventListener('touchmove', (e) => {
        if (!startX) return;
        e.preventDefault();
        const x = e.touches[0].pageX - gallery.offsetLeft;
        const walk = (x - startX) * 2;
        gallery.scrollLeft = scrollLeft - walk;
      });
      
      gallery.addEventListener('touchend', () => {
        startX = 0;
      });
      
      // Mouse events for desktop drag
      gallery.addEventListener('mousedown', (e) => {
        isDown = true;
        gallery.style.cursor = 'grabbing';
        startX = e.pageX - gallery.offsetLeft;
        scrollLeft = gallery.scrollLeft;
      });
      
      gallery.addEventListener('mouseleave', () => {
        isDown = false;
        gallery.style.cursor = 'grab';
      });
      
      gallery.addEventListener('mouseup', () => {
        isDown = false;
        gallery.style.cursor = 'grab';
      });
      
      gallery.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gallery.offsetLeft;
        const walk = (x - startX) * 2;
        gallery.scrollLeft = scrollLeft - walk;
      });
    });
  }

  // ===================================
  // ENHANCED GALLERY NAVIGATION
  // ===================================
  setupGalleryNavigation() {
    const galleryArrows = document.querySelectorAll('.gallery-arrow');
    
    galleryArrows.forEach(arrow => {
      arrow.addEventListener('click', () => {
        const gallery = arrow.parentElement.querySelector('.gallery-scroll');
        if (!gallery) return;
        
        const firstCard = gallery.querySelector('.gallery-card');
        if (!firstCard) return;
        
        const cardWidth = firstCard.offsetWidth + 16; // 16px gap
        const direction = arrow.classList.contains('left') ? -1 : 1;
        
        gallery.scrollBy({
          left: direction * cardWidth * 2,
          behavior: 'smooth'
        });
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const gallery = document.querySelector('.gallery-scroll:focus');
      if (gallery) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          gallery.scrollBy({ left: -300, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          gallery.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    });
  }

  // ===================================
  // PULL-TO-REFRESH FUNCTIONALITY
  // ===================================
  setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pullChange = 0;
    let pullStarted = false;
    
    // Create pull-to-refresh indicator
    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-to-refresh';
    pullIndicator.textContent = 'Pull to refresh';
    document.body.appendChild(pullIndicator);

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
        pullStarted = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!pullStarted || window.scrollY > 0) return;
      
      currentY = e.touches[0].pageY;
      pullChange = currentY - startY;
      
      if (pullChange > 0) {
        e.preventDefault();
        if (pullChange > 80) {
          pullIndicator.textContent = 'Release to refresh';
          pullIndicator.classList.add('active');
        } else {
          pullIndicator.textContent = 'Pull to refresh';
          pullIndicator.classList.remove('active');
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (pullStarted && pullChange > 80) {
        // Trigger refresh
        pullIndicator.textContent = 'Refreshing...';
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
      pullStarted = false;
      pullChange = 0;
      pullIndicator.classList.remove('active');
    });
  }

  // ===================================
  // MOBILE MENU FUNCTIONALITY
  // ===================================
  setupMobileMenu() {
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

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuCheckbox && menuCheckbox.checked) {
        menuCheckbox.checked = false;
      }
    });
  }

  // ===================================
  // FORM HANDLING IMPROVEMENTS
  // ===================================
  setupFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Skip forms that have specific handlers (booking form)
      if (form.id === 'bookingForm' || form.id === 'comprehensive-booking-form') {
        return; // Let specific handlers manage these forms
      }

      // Add loading states for general forms only
      form.addEventListener('submit', (e) => {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton && !submitButton.dataset.handledBySpecific) {
          // Store original text
          if (!submitButton.dataset.originalText) {
            submitButton.dataset.originalText = submitButton.textContent;
          }
          
          submitButton.disabled = true;
          submitButton.textContent = 'Submitting...';
          
          // Reset after timeout as fallback
          setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || 'Submit';
          }, 10000);
        }
      });

      // Real-time validation for general forms
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Remove existing error styling
    field.classList.remove('error');
    
    // Get existing error message
    let errorEl = field.parentNode.querySelector('.error-message');
    if (errorEl) errorEl.remove();

    // Validation rules
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      message = 'This field is required';
    } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
      isValid = false;
      message = 'Please enter a valid phone number';
    }

    if (!isValid) {
      field.classList.add('error');
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = message;
      field.parentNode.appendChild(errorEl);
    }

    return isValid;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^[\+]?[\d\s\-\(\)]{10,}$/.test(phone);
  }

  // ===================================
  // ACCESSIBILITY IMPROVEMENTS
  // ===================================
  setupAccessibility() {
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary);
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content id if not exists
    const mainContent = document.querySelector('main, .hero, section');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }

    // Enhanced focus indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  // ===================================
  // GDPR COMPLIANCE & DATA PROTECTION
  // ===================================
  setupGDPRCompliance() {
    this.clearExistingBanners();
    
    const consent = this.getConsent();
    if (consent) {
      this.applyConsentPreferences(consent);
      return;
    }
    
    if (!document.querySelector('.gdpr-consent-banner')) {
    this.createCookieConsent();
    }
    
    this.createPrivacyCenter();
    this.setupDataProtectionIndicators();
    this.addPrivacyLinks();
    
    // Initialize privacy-compliant analytics
    this.initializePrivacyAnalytics();
  }

  clearExistingBanners() {
    // Remove any existing consent banners
    document.querySelectorAll('.gdpr-consent-banner').forEach(banner => banner.remove());
    document.querySelectorAll('.privacy-preference-center').forEach(center => center.remove());
    
    // Reset body overflow in case it was locked
    document.body.style.overflow = '';
  }

  createCookieConsent() {
    // Check if user has already given consent
    if (localStorage.getItem('gdpr-consent')) {
      return;
    }

    // Check if banner already exists to prevent duplicates
    if (document.querySelector('.gdpr-consent-banner')) {
      return;
    }

    const consentBanner = document.createElement('div');
    consentBanner.className = 'gdpr-consent-banner';
    consentBanner.innerHTML = `
      <div class="consent-content">
        <div class="consent-text">
          <h4>🍪 We Value Your Privacy</h4>
          <p>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
        </div>
        <div class="consent-actions">
          <button class="btn-consent-accept" type="button">Accept All</button>
          <button class="btn-consent-customize" type="button">Customize</button>
          <button class="btn-consent-decline" type="button">Decline</button>
        </div>
      </div>
      <style>
        .gdpr-consent-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #2F2970 0%, #4B2996 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: inherit;
        }
        
        .consent-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        
        .consent-text h4 {
          margin: 0 0 8px 0;
          color: white;
          font-size: 1.2em;
        }
        
        .consent-text p {
          margin: 0;
          color: rgba(255,255,255,0.9);
          font-size: 0.95em;
          line-height: 1.4;
        }
        
        .consent-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }
        
        .consent-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9em;
        }
        
        .btn-consent-accept {
          background: #4CAF50;
          color: white;
        }
        
        .btn-consent-accept:hover {
          background: #45a049;
          transform: translateY(-1px);
        }
        
        .btn-consent-customize {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .btn-consent-customize:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        
        .btn-consent-decline {
          background: transparent;
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .btn-consent-decline:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .consent-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          
          .consent-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .consent-actions button {
            padding: 8px 16px;
            font-size: 0.85em;
          }
        }
      </style>
    `;

    document.body.appendChild(consentBanner);

    // Handle consent actions with direct event listeners
    const acceptBtn = consentBanner.querySelector('.btn-consent-accept');
    const customizeBtn = consentBanner.querySelector('.btn-consent-customize');
    const declineBtn = consentBanner.querySelector('.btn-consent-decline');

    const self = this; // Preserve context

    acceptBtn.addEventListener('click', function() {
      console.log('Accept All clicked');
      self.setConsent({
            necessary: true,
            functional: true,
            analytics: true,
            marketing: true
          });
      // Force remove banner
      if (consentBanner && consentBanner.parentNode) {
        consentBanner.parentNode.removeChild(consentBanner);
      }
      // Also remove any other consent banners
      document.querySelectorAll('.gdpr-consent-banner').forEach(banner => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      });
      console.log('Banner should be removed now');
    });

    declineBtn.addEventListener('click', function() {
      console.log('Decline clicked');
      self.setConsent({
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false
          });
      // Force remove banner
      if (consentBanner && consentBanner.parentNode) {
        consentBanner.parentNode.removeChild(consentBanner);
      }
      // Also remove any other consent banners
      document.querySelectorAll('.gdpr-consent-banner').forEach(banner => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      });
      console.log('Banner should be removed now');
    });

    customizeBtn.addEventListener('click', function() {
      console.log('Customize clicked');
      self.showPrivacyCenter();
    });
  }

  removeBanner(banner) {
    if (banner && banner.parentNode) {
      banner.remove();
    }
    // Also remove any other consent banners that might exist
    document.querySelectorAll('.gdpr-consent-banner').forEach(b => b.remove());
  }

  createPrivacyCenter() {
    // Remove existing privacy center to prevent duplicates
    const existingCenter = document.getElementById('privacyCenter');
    if (existingCenter) {
      existingCenter.remove();
    }

    const privacyCenter = document.createElement('div');
    privacyCenter.className = 'privacy-preference-center';
    privacyCenter.id = 'privacyCenter';
    privacyCenter.style.display = 'none'; // Initially hidden
    privacyCenter.innerHTML = `
      <div class="privacy-modal">
        <div class="privacy-header">
          <h3>🛡️ Privacy Preference Center</h3>
          <button class="privacy-close" aria-label="Close">&times;</button>
        </div>
        <div class="privacy-content">
          <div class="privacy-intro">
            <p>We respect your privacy. Choose which cookies you want to allow. You can change these settings at any time.</p>
            <div class="privacy-summary">
              <span class="privacy-summary-item">
                <strong>Data Stored Locally:</strong> Your preferences are saved on your device only
              </span>
            </div>
          </div>

          <div class="privacy-section">
            <div class="privacy-section-header">
              <h4>🔧 Necessary Cookies</h4>
              <span class="privacy-count" id="necessary-count">2 cookies</span>
            </div>
            <p>These cookies are essential for the website to function properly and cannot be disabled.</p>
            <div class="privacy-details">
              <button class="privacy-details-toggle" data-section="necessary">View Details</button>
              <div class="privacy-details-content" id="necessary-details" style="display: none;">
                <ul>
                  <li><strong>gdpr-consent:</strong> Stores your cookie preferences</li>
                  <li><strong>session-security:</strong> Protects against spam and fraud</li>
                </ul>
              </div>
            </div>
            <label class="privacy-toggle">
              <input type="checkbox" checked disabled>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Always Active</span>
            </label>
          </div>
          
          <div class="privacy-section">
            <div class="privacy-section-header">
              <h4>⚙️ Functional Cookies</h4>
              <span class="privacy-count" id="functional-count">0 cookies</span>
            </div>
            <p>These cookies enable enhanced functionality and personalization like remembering your preferences.</p>
            <div class="privacy-details">
              <button class="privacy-details-toggle" data-section="functional">View Details</button>
              <div class="privacy-details-content" id="functional-details" style="display: none;">
                <ul>
                  <li><strong>user-preferences:</strong> Saves your site preferences (theme, language)</li>
                  <li><strong>form-autosave:</strong> Temporarily saves form data to prevent loss</li>
                </ul>
              </div>
            </div>
            <label class="privacy-toggle">
              <input type="checkbox" id="functional-cookies">
              <span class="toggle-slider"></span>
              <span class="toggle-label">Enable</span>
            </label>
          </div>
          
          <div class="privacy-section">
            <div class="privacy-section-header">
              <h4>📊 Analytics Cookies</h4>
              <span class="privacy-count" id="analytics-count">0 cookies</span>
            </div>
            <p>These cookies help us understand how visitors interact with our website by collecting anonymous information.</p>
            <div class="privacy-details">
              <button class="privacy-details-toggle" data-section="analytics">View Details</button>
              <div class="privacy-details-content" id="analytics-details" style="display: none;">
                <ul>
                  <li><strong>Google Analytics:</strong> Tracks page views, user journey, and site performance</li>
                  <li><strong>Heat mapping:</strong> Anonymous tracking of click patterns and scrolling</li>
                  <li><strong>Performance metrics:</strong> Site speed and error tracking</li>
                </ul>
                <p><small>📍 <strong>Note:</strong> Currently disabled - no analytics cookies are active</small></p>
              </div>
            </div>
            <label class="privacy-toggle">
              <input type="checkbox" id="analytics-cookies">
              <span class="toggle-slider"></span>
              <span class="toggle-label">Enable</span>
            </label>
          </div>
          
          <div class="privacy-section">
            <div class="privacy-section-header">
              <h4>🎯 Marketing Cookies</h4>
              <span class="privacy-count" id="marketing-count">0 cookies</span>
            </div>
            <p>These cookies are used to deliver personalized advertisements and measure ad campaign effectiveness.</p>
            <div class="privacy-details">
              <button class="privacy-details-toggle" data-section="marketing">View Details</button>
              <div class="privacy-details-content" id="marketing-details" style="display: none;">
                <ul>
                  <li><strong>Facebook Pixel:</strong> Tracks conversions and enables retargeting</li>
                  <li><strong>Google Ads:</strong> Measures ad performance and enables remarketing</li>
                  <li><strong>Social Media:</strong> Enables social sharing and social login features</li>
                </ul>
                <p><small>📍 <strong>Note:</strong> Currently disabled - no marketing cookies are active</small></p>
              </div>
            </div>
            <label class="privacy-toggle">
              <input type="checkbox" id="marketing-cookies">
              <span class="toggle-slider"></span>
              <span class="toggle-label">Enable</span>
            </label>
          </div>

          <div class="privacy-data-rights">
            <h4>🔒 Your Data Rights</h4>
            <div class="privacy-rights-buttons">
              <button class="privacy-action-btn" id="export-data">📥 Export My Data</button>
              <button class="privacy-action-btn" id="delete-data">🗑️ Delete My Data</button>
              <button class="privacy-action-btn" id="view-data">👀 View Stored Data</button>
            </div>
          </div>
        </div>
        <div class="privacy-actions">
          <button class="btn-privacy-save">Save Preferences</button>
          <button class="btn-privacy-accept-all">Accept All</button>
          <button class="btn-privacy-reject-all">Reject All (except necessary)</button>
        </div>
        <div class="privacy-footer">
          <p><small>Last updated: January 2025 | <a href="/policies" target="_blank">Privacy Policy</a> | <a href="#" id="reset-preferences">Reset to Default</a></small></p>
      </div>
      </div>
      
      <style>
        .privacy-preference-center {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: inherit;
        }
        
        .privacy-modal {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .privacy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid #eee;
          background: linear-gradient(135deg, #2F2970 0%, #4B2996 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }
        
        .privacy-header h3 {
          margin: 0;
          font-size: 1.4em;
        }
        
        .privacy-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.3s ease;
        }
        
        .privacy-close:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .privacy-content {
          padding: 25px;
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .privacy-section {
          margin-bottom: 25px;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fafafa;
        }
        
        .privacy-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .privacy-section h4 {
          margin: 0;
          color: #2F2970;
          font-size: 1.1em;
        }
        
        .privacy-count {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: 500;
        }
        
        .privacy-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 15px;
          cursor: pointer;
        }
        
        .toggle-slider {
          width: 50px;
          height: 24px;
          background: #ccc;
          border-radius: 12px;
          position: relative;
          transition: background 0.3s ease;
        }
        
        .toggle-slider::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }
        
        .privacy-toggle input:checked + .toggle-slider {
          background: #4CAF50;
        }
        
        .privacy-toggle input:checked + .toggle-slider::after {
          transform: translateX(26px);
        }
        
        .privacy-toggle input:disabled + .toggle-slider {
          background: #2F2970;
        }
        
        .privacy-actions {
          padding: 20px 25px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        
        .privacy-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn-privacy-save {
          background: #2F2970;
          color: white;
        }
        
        .btn-privacy-save:hover {
          background: #4B2996;
          transform: translateY(-1px);
        }
        
        .btn-privacy-accept-all {
          background: #4CAF50;
          color: white;
        }
        
        .btn-privacy-accept-all:hover {
          background: #45a049;
          transform: translateY(-1px);
        }
        
        .btn-privacy-reject-all {
          background: #f44336;
          color: white;
        }
        
        .btn-privacy-reject-all:hover {
          background: #da190b;
          transform: translateY(-1px);
        }
        
        .privacy-details-toggle {
          background: none;
          border: 1px solid #2F2970;
          color: #2F2970;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          margin: 10px 0;
          transition: all 0.3s ease;
        }
        
        .privacy-details-toggle:hover {
          background: #2F2970;
          color: white;
        }
        
        .privacy-details-content {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
          border: 1px solid #ddd;
        }
        
        .privacy-data-rights {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        
        .privacy-rights-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        
        .privacy-action-btn {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.3s ease;
        }
        
        .privacy-action-btn:hover {
          background: #e0e0e0;
        }
        
        .privacy-footer {
          padding: 15px 25px;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        
        @media (max-width: 768px) {
          .privacy-modal {
            margin: 10px;
            max-height: 95vh;
          }
          
          .privacy-actions {
            flex-direction: column;
          }
          
          .privacy-actions button {
            width: 100%;
          }
        }
      </style>
    `;

    document.body.appendChild(privacyCenter);

    // Enhanced event handling
    this.setupPrivacyCenterEvents(privacyCenter);
  }

  setupPrivacyCenterEvents(privacyCenter) {
    // Wait for DOM to be ready
    setTimeout(() => {
      const self = this; // Preserve context
      
      // Get button elements
    const saveBtn = privacyCenter.querySelector('.btn-privacy-save');
    const acceptAllBtn = privacyCenter.querySelector('.btn-privacy-accept-all');
      const rejectAllBtn = privacyCenter.querySelector('.btn-privacy-reject-all');
    const closeBtn = privacyCenter.querySelector('.privacy-close');

      console.log('Setting up privacy center events:', {
        saveBtn: !!saveBtn,
        acceptAllBtn: !!acceptAllBtn,
        rejectAllBtn: !!rejectAllBtn,
        closeBtn: !!closeBtn
      });

      // Details toggle handlers
      privacyCenter.querySelectorAll('.privacy-details-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          const section = toggle.dataset.section;
          const details = document.getElementById(`${section}-details`);
          const isOpen = details.style.display !== 'none';
          
          details.style.display = isOpen ? 'none' : 'block';
          toggle.textContent = isOpen ? 'View Details' : 'Hide Details';
          toggle.setAttribute('aria-expanded', !isOpen);
        });
      });

      // Data rights handlers
      const exportBtn = document.getElementById('export-data');
      const deleteBtn = document.getElementById('delete-data');
      const viewBtn = document.getElementById('view-data');
      const resetBtn = document.getElementById('reset-preferences');

      if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.exportUserData();
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.deleteUserData();
        });
      }

      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.viewStoredData();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.resetPreferences();
        });
      }

      // Save preferences
      if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Save preferences clicked');
          
      const preferences = {
        necessary: true,
            functional: document.getElementById('functional-cookies')?.checked || false,
            analytics: document.getElementById('analytics-cookies')?.checked || false,
            marketing: document.getElementById('marketing-cookies')?.checked || false
          };
          
          console.log('Saving preferences:', preferences);
          self.setConsent(preferences);
          
          // Force hide privacy center
          const privacyCenter = document.getElementById('privacyCenter');
          if (privacyCenter) {
            privacyCenter.style.display = 'none';
          }
          document.body.style.overflow = '';
          
          // Remove any consent banners
          document.querySelectorAll('.gdpr-consent-banner').forEach(banner => {
            if (banner.parentNode) {
              banner.parentNode.removeChild(banner);
            }
          });
          
          console.log('Privacy center should be closed now');
          self.showSecurityAlert('✅ Privacy preferences saved successfully!', 'success');
        });
      }

      // Accept all
      if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Accept all clicked');
          
          // Update checkboxes first
          const functionalCheck = document.getElementById('functional-cookies');
          const analyticsCheck = document.getElementById('analytics-cookies');
          const marketingCheck = document.getElementById('marketing-cookies');
          
          if (functionalCheck) functionalCheck.checked = true;
          if (analyticsCheck) analyticsCheck.checked = true;
          if (marketingCheck) marketingCheck.checked = true;
          
          self.setConsent({
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true
      });
          
          // Force hide privacy center
          const privacyCenter = document.getElementById('privacyCenter');
          if (privacyCenter) {
            privacyCenter.style.display = 'none';
          }
          document.body.style.overflow = '';
          
          // Remove any consent banners
          document.querySelectorAll('.gdpr-consent-banner').forEach(banner => {
            if (banner.parentNode) {
              banner.parentNode.removeChild(banner);
            }
          });
          
          console.log('Privacy center should be closed now');
          self.showSecurityAlert('✅ All cookies accepted!', 'success');
        });
      }

      // Reject all (except necessary)
      if (rejectAllBtn) {
        rejectAllBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Reject all clicked');
          
          // Update checkboxes first
          const functionalCheck = document.getElementById('functional-cookies');
          const analyticsCheck = document.getElementById('analytics-cookies');
          const marketingCheck = document.getElementById('marketing-cookies');
          
          if (functionalCheck) functionalCheck.checked = false;
          if (analyticsCheck) analyticsCheck.checked = false;
          if (marketingCheck) marketingCheck.checked = false;
          
          self.setConsent({
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false
          });
          
          // Force hide privacy center
          const privacyCenter = document.getElementById('privacyCenter');
          if (privacyCenter) {
            privacyCenter.style.display = 'none';
          }
          document.body.style.overflow = '';
          
          // Remove any consent banners
          document.querySelectorAll('.gdpr-consent-banner').forEach(banner => {
            if (banner.parentNode) {
              banner.parentNode.removeChild(banner);
            }
          });
          
          console.log('Privacy center should be closed now');
          self.showSecurityAlert('✅ Only necessary cookies enabled!', 'success');
        });
      }

      // Close
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Close clicked');
          
          // Force hide privacy center
          const privacyCenter = document.getElementById('privacyCenter');
          if (privacyCenter) {
            privacyCenter.style.display = 'none';
          }
      document.body.style.overflow = '';
          
          console.log('Privacy center should be closed now');
        });
      }

      // Close when clicking outside
      privacyCenter.addEventListener('click', (e) => {
        if (e.target === privacyCenter) {
          this.hidePrivacyCenter();
        }
      });

      // Update cookie counts when preferences change
      privacyCenter.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => this.updateCookieCounts());
      });
    }, 100);
  }

  updateCookieCounts() {
    // Update cookie counts based on current settings
    const consent = this.getConsent() || {};
    
    document.getElementById('necessary-count').textContent = '2 cookies';
    document.getElementById('functional-count').textContent = consent.functional ? '2 cookies' : '0 cookies';
    document.getElementById('analytics-count').textContent = consent.analytics ? '3 cookies' : '0 cookies';
    document.getElementById('marketing-count').textContent = consent.marketing ? '5 cookies' : '0 cookies';
      }

  exportUserData() {
    const userData = {
      consentPreferences: this.getConsent(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith('gdpr-') || key.startsWith('ilm-')) {
          acc[key] = localStorage.getItem(key);
  }
        return acc;
      }, {}),
      note: 'This is all the data we store about you locally. No data is sent to external servers without your explicit consent through our booking form.'
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilm-user-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showSecurityAlert('Your data has been exported successfully.', 'success');
  }

  deleteUserData() {
    const confirmDelete = confirm(
      'Are you sure you want to delete all your stored data? This will:\n\n' +
      '• Remove all cookie preferences\n' +
      '• Clear any saved form data\n' +
      '• Reset all privacy settings\n\n' +
      'You will need to set your preferences again on your next visit.'
    );

    if (confirmDelete) {
      // Clear all user-related data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('gdpr-') || key.startsWith('ilm-') || key.startsWith('user-')) {
          localStorage.removeItem(key);
        }
      });

      this.showSecurityAlert('All your data has been deleted successfully.', 'success');
      
      // Refresh the page after a delay
    setTimeout(() => {
        window.location.reload();
      }, 2000);
  }
  }

  viewStoredData() {
    const storedData = Object.keys(localStorage).reduce((acc, key) => {
      if (key.startsWith('gdpr-') || key.startsWith('ilm-')) {
        acc[key] = localStorage.getItem(key);
      }
      return acc;
    }, {});

    const modal = document.createElement('div');
    modal.className = 'data-view-modal';
    modal.innerHTML = `
      <div class="data-view-content">
        <div class="data-view-header">
          <h3>📋 Your Stored Data</h3>
          <button class="data-view-close">&times;</button>
            </div>
        <div class="data-view-body">
          <p>Here's all the data we store about you locally on your device:</p>
          <pre class="data-view-json">${JSON.stringify(storedData, null, 2)}</pre>
          <p><small><strong>Note:</strong> This data stays on your device and is not sent to our servers unless you explicitly submit a booking form.</small></p>
          </div>
        <div class="data-view-actions">
          <button class="btn-export-this">Export This Data</button>
          <button class="btn-close-view">Close</button>
          </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Handle close actions
    modal.querySelectorAll('.data-view-close, .btn-close-view').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = '';
      });
    });

    // Handle export
    modal.querySelector('.btn-export-this').addEventListener('click', () => {
      this.exportUserData();
      modal.remove();
      document.body.style.overflow = '';
      });
    }

  resetPreferences() {
    const confirmReset = confirm('Reset all privacy preferences to default settings?');
    if (confirmReset) {
      localStorage.removeItem('gdpr-consent');
      this.showSecurityAlert('Privacy preferences reset to default.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  // ===================================
  // SECURE FORM SUBMISSIONS
  // ===================================
  setupSecureSubmissions() {
    document.querySelectorAll('form').forEach(form => {
      this.enhanceFormSecurity(form);
    });
  }

  enhanceFormSecurity(form) {
    // Skip booking forms - they have their own submission handling
    if (form.id === 'bookingForm' || form.id === 'comprehensive-booking-form') {
      // Still add security features but don't interfere with submission
      this.addHoneypotField(form);
      this.trackUserBehavior(form);
      return;
    }

    // Add CSRF protection
    const csrfToken = this.generateCSRFToken();
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Add honeypot field for spam protection
    this.addHoneypotField(form);

    // Add rate limiting
    let submitCount = 0;
    const maxSubmits = 3;
    const timeWindow = 60000; // 1 minute

    form.addEventListener('submit', (e) => {
      // Check for spam before processing
      if (this.detectSpam(form)) {
        e.preventDefault();
        
        // Check if user has already been flagged once (give second chance)
        const previousAttempt = form.dataset.spamFlagged;
        
        if (!previousAttempt) {
          // First time flagged - give user a chance to try again
          form.dataset.spamFlagged = 'true';
          this.showSecurityAlert(
            'Security check triggered. Please review your information and try again. If you continue to have issues, please contact us directly.',
            'warning'
          );
          
          // Add helpful instructions
          setTimeout(() => {
            this.showSecurityAlert(
              'Tips: Ensure your message doesn\'t contain excessive links or repeated characters. Take your time filling out the form.',
              'info'
            );
          }, 3000);
          
          // Reset button state for general forms
          const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || 'Submit';
          }
          
          return;
        } else {
          // Second attempt also flagged - offer manual contact option
          this.showSpamBypassDialog(form);
          return;
        }
      }

      submitCount++;
      
      if (submitCount > maxSubmits) {
        e.preventDefault();
        this.showSecurityAlert('Too many submission attempts. Please wait before trying again.');
        
        // Reset button state
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText || 'Submit';
        }
        
        return;
      }

      // Reset counter after time window
      setTimeout(() => {
        submitCount = Math.max(0, submitCount - 1);
      }, timeWindow);
    });

    // Add encryption indicators (skip enquire form)
    if (!form.classList.contains('enquire-form')) {
      this.addEncryptionIndicators(form);
    }

    // Track user behavior for spam detection
    this.trackUserBehavior(form);
  }

  generateCSRFToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  addEncryptionIndicators(form) {
    const indicator = document.createElement('div');
    indicator.className = 'encryption-indicator';
    indicator.innerHTML = `
      <div class="security-features">
        <span class="security-feature">🔐 256-bit SSL Encryption</span>
        <span class="security-feature">🛡️ CSRF Protection</span>
        <span class="security-feature">⚡ Rate Limited</span>
      </div>
    `;
    
    form.insertBefore(indicator, form.firstChild);
  }

  // ===================================
  // TWO-FACTOR AUTHENTICATION
  // ===================================
  initiateTwoFactorAuth(form) {
    const email = form.querySelector('input[type="email"]').value;
    const phone = form.querySelector('input[type="tel"]').value;

    if (!email && !phone) {
      this.showSecurityAlert('Email or phone number required for verification.');
      return;
    }

    this.show2FAModal(form, email, phone);
  }

  show2FAModal(form, email, phone) {
    const modal = document.createElement('div');
    modal.className = 'two-factor-modal';
    modal.innerHTML = `
      <div class="tfa-content">
        <div class="tfa-header">
          <h3>🔐 Verify Your Identity</h3>
          <p>For security, we need to verify your identity before processing your booking.</p>
        </div>
        
        <div class="tfa-methods">
          ${email ? `<button class="tfa-method" data-method="email">
            📧 Send code to ${this.maskEmail(email)}
          </button>` : ''}
          
          ${phone ? `<button class="tfa-method" data-method="sms">
            📱 Send code to ${this.maskPhone(phone)}
          </button>` : ''}
        </div>
        
        <div class="tfa-code-section" style="display: none;">
          <label for="verification-code">Enter verification code:</label>
          <input type="text" id="verification-code" maxlength="6" placeholder="000000">
          <button class="btn-verify-code">Verify & Submit</button>
        </div>
        
        <button class="tfa-cancel">Cancel</button>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Handle method selection
    modal.querySelectorAll('.tfa-method').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        this.send2FACode(method, email, phone);
        
        modal.querySelector('.tfa-methods').style.display = 'none';
        modal.querySelector('.tfa-code-section').style.display = 'block';
      });
    });

    // Handle code verification
    modal.querySelector('.btn-verify-code').addEventListener('click', () => {
      const code = modal.querySelector('#verification-code').value;
      if (this.verify2FACode(code)) {
        modal.remove();
        document.body.style.overflow = '';
        this.submitSecureForm(form);
      } else {
        this.showSecurityAlert('Invalid verification code. Please try again.');
      }
    });

    // Handle cancel
    modal.querySelector('.tfa-cancel').addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
  }

  send2FACode(method, email, phone) {
    // In a real implementation, this would send to your backend
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('2fa-code', code);
    sessionStorage.setItem('2fa-timestamp', Date.now().toString());

    // Simulate sending
    this.showSecurityAlert(`Verification code sent via ${method === 'email' ? 'email' : 'SMS'}`);
    
    // In development, log the code
    console.log('2FA Code (development only):', code);
  }

  verify2FACode(enteredCode) {
    const storedCode = sessionStorage.getItem('2fa-code');
    const timestamp = parseInt(sessionStorage.getItem('2fa-timestamp'));
    const now = Date.now();
    
    // Code expires after 5 minutes
    if (now - timestamp > 300000) {
      this.showSecurityAlert('Verification code has expired. Please request a new one.');
      return false;
    }

    return enteredCode === storedCode;
  }

  submitSecureForm(form) {
    // Clear 2FA data
    sessionStorage.removeItem('2fa-code');
    sessionStorage.removeItem('2fa-timestamp');

    // Show success message
    this.showSecurityAlert('✅ Identity verified. Submitting your booking...', 'success');

    // Actually submit the form (or send to your backend)
    form.submit();
  }

  maskEmail(email) {
    const [name, domain] = email.split('@');
    const maskedName = name.length > 2 ? 
      name.substring(0, 2) + '*'.repeat(name.length - 2) : 
      name;
    return `${maskedName}@${domain}`;
  }

  maskPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
    }
    return phone;
  }

  showSecurityAlert(message, type = 'warning') {
    const alert = document.createElement('div');
    alert.className = `security-alert security-alert-${type}`;
    
    let icon = '⚠️';
    switch(type) {
      case 'success': icon = '✅'; break;
      case 'error': icon = '❌'; break;
      case 'info': icon = 'ℹ️'; break;
    }
    
    alert.innerHTML = `
      <div class="alert-content">
        <span>${icon} ${message}</span>
        <button class="alert-close">&times;</button>
      </div>
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
      alert.classList.add('show');
    }, 100);

    setTimeout(() => {
      alert.remove();
    }, type === 'info' ? 7000 : 5000); // Info messages stay longer

    alert.querySelector('.alert-close').addEventListener('click', () => {
      alert.remove();
    });
  }

  addHoneypotField(form) {
    // Create invisible honeypot field
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website'; // Common bot target
    honeypot.style.cssText = `
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      opacity: 0 !important;
      height: 0 !important;
      width: 0 !important;
      border: none !important;
      background: transparent !important;
      pointer-events: none;
    `;
    honeypot.setAttribute('tabindex', '-1');
    honeypot.setAttribute('autocomplete', 'off');
    honeypot.setAttribute('aria-hidden', 'true');
    
    form.appendChild(honeypot);
  }

  detectSpam(form) {
    // Check honeypot field
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.log('Spam detected: Honeypot field filled');
      return true; // Bot filled the honeypot
    }

    // Check for suspicious content (but be less aggressive)
    const textFields = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
    
    for (let field of textFields) {
      const value = field.value.toLowerCase();
      
      // Check for spam keywords (reduced list, more targeted)
      const spamKeywords = [
        'viagra', 'casino', 'lottery', 'make money fast', 'free money',
        'investment opportunity', 'click here now', 'congratulations you won',
        'urgent response required', 'limited time offer'
      ];

      // Only flag if multiple spam keywords or very obvious spam
      const spamKeywordCount = spamKeywords.filter(keyword => value.includes(keyword)).length;
      if (spamKeywordCount >= 2) {
        console.log('Spam detected: Multiple spam keywords');
        return true;
      }

      // Check for excessive URLs (more lenient)
      const urlPattern = /(https?:\/\/[^\s]+)/gi;
      const urls = (value.match(urlPattern) || []).length;
      
      if (urls > 5) { // Increased from 2 to 5
        console.log('Spam detected: Too many URLs');
        return true;
      }

      // Check for excessive emails (more lenient)
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const emails = (value.match(emailPattern) || []).length;
      
      if (emails > 3) { // Increased from 1 to 3
        console.log('Spam detected: Too many email addresses');
        return true;
      }

      // Check for repeated characters (more lenient)
      if (/(.)\1{10,}/.test(value)) { // Increased from 4 to 10
        console.log('Spam detected: Excessive repeated characters');
        return true;
      }
    }

    // Check submission timing (more lenient for genuine users)
    const formStartTime = form.dataset.startTime;
    if (formStartTime) {
      const timeTaken = Date.now() - parseInt(formStartTime);
      if (timeTaken < 1000) { // Reduced from 3000ms to 1000ms (1 second)
        console.log('Spam detected: Submitted too quickly');
        return true;
      }
    }

    // Check for robot-like typing patterns (only if we have data)
    const suspiciousFields = form.querySelectorAll('[data-suspicious-typing="true"]');
    if (suspiciousFields.length > 0) {
      // Only flag if ALL text fields show suspicious typing
      const textFieldsCount = form.querySelectorAll('input[type="text"], textarea').length;
      if (suspiciousFields.length === textFieldsCount && textFieldsCount > 1) {
        console.log('Spam detected: Robot-like typing pattern');
        return true;
      }
    }

    // All checks passed
    return false;
  }

  trackUserBehavior(form) {
    // Track when user starts interacting with form
    const firstInput = form.querySelector('input, textarea, select');
    if (firstInput) {
      firstInput.addEventListener('focus', () => {
        if (!form.dataset.startTime) {
          form.dataset.startTime = Date.now().toString();
        }
      }, { once: true });
    }

    // Track mouse movements (but don't penalize mobile users)
    let mouseMovements = 0;
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    if (!isMobile) {
      form.addEventListener('mousemove', () => {
        mouseMovements++;
        form.dataset.mouseMovements = mouseMovements.toString();
      });
    } else {
      // For mobile users, set a default value so they're not penalized
      form.dataset.mouseMovements = '10';
    }

    // Track typing patterns (more lenient analysis)
    form.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(field => {
      let keystrokes = 0;
      let typingSpeed = [];
      let lastKeyTime = 0;

      field.addEventListener('keydown', (e) => {
        keystrokes++;
        const currentTime = Date.now();
        
        if (lastKeyTime > 0) {
          const timeDiff = currentTime - lastKeyTime;
          typingSpeed.push(timeDiff);
          
          // Only analyze after significant typing (more than 10 keystrokes)
          if (typingSpeed.length > 10) {
            const avgSpeed = typingSpeed.reduce((a, b) => a + b) / typingSpeed.length;
            const variance = typingSpeed.reduce((acc, speed) => acc + Math.pow(speed - avgSpeed, 2), 0) / typingSpeed.length;
            
            // Much more restrictive criteria for flagging as suspicious
            // Very consistent timing under 30ms with very low variance
            if (variance < 5 && avgSpeed < 30 && typingSpeed.length > 20) {
              field.dataset.suspiciousTyping = 'true';
            }
          }
        }
        
        lastKeyTime = currentTime;
        field.dataset.keystrokes = keystrokes.toString();
      });
    });

    // Add touch event tracking for mobile to show user engagement
    if (isMobile) {
      let touchCount = 0;
      form.addEventListener('touchstart', () => {
        touchCount++;
        form.dataset.touchInteractions = touchCount.toString();
      });
    }
  }

  showSpamBypassDialog(form) {
    const dialog = document.createElement('div');
    dialog.className = 'spam-bypass-dialog';
    dialog.innerHTML = `
      <div class="bypass-content">
        <div class="bypass-header">
          <h3>⚠️ Security Check</h3>
          <p>Our security system has flagged your submission. If you're a genuine user experiencing this issue, we apologize for the inconvenience.</p>
        </div>
        
        <div class="bypass-options">
          <h4>What would you like to do?</h4>
          
          <button class="bypass-option-btn" data-action="contact">
            📞 Contact Us Directly
            <small>Call or email us with your inquiry</small>
          </button>
          
          <button class="bypass-option-btn" data-action="retry">
            🔄 Try Again
            <small>Clear form data and start fresh</small>
          </button>
          
          <button class="bypass-option-btn" data-action="simple">
            ✉️ Send Simple Message
            <small>Use a basic contact form</small>
          </button>
        </div>
        
        <button class="bypass-close">Close</button>
      </div>
    `;

    document.body.appendChild(dialog);
    document.body.style.overflow = 'hidden';

    // Handle options
    dialog.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      
      switch(action) {
        case 'contact':
          window.location.href = '#contact';
          break;
          
        case 'retry':
          form.reset();
          delete form.dataset.spamFlagged;
          delete form.dataset.startTime;
          this.showSecurityAlert('Form cleared. Please try again.', 'success');
          break;
          
        case 'simple':
          // Redirect to simple contact form
          window.location.href = 'index.html#contact';
          break;
      }
      
      if (action) {
        dialog.remove();
        document.body.style.overflow = '';
      }
    });

    dialog.querySelector('.bypass-close').addEventListener('click', () => {
      dialog.remove();
      document.body.style.overflow = '';
    });
  }

  // ===================================
  // CACHE MANAGEMENT
  // ===================================
  clearBrowserCache() {
    // Clear localStorage items that might cause issues
    try {
      // Remove old cache items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('ilm-cache-') || key.startsWith('website-cache-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Add current version marker
      localStorage.setItem('ilm-cache-version', 'v2024-01-15');
      
      // Force reload stylesheets with cache busting
      this.refreshStylesheets();
      
    } catch (error) {
      console.warn('Cache clearing limited due to browser restrictions');
    }
    
    // Add manual cache refresh function to window
    window.forceCacheRefresh = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload(true);
    };
    
    // Add cache status indicator
    this.addCacheStatusIndicator();
  }

  refreshStylesheets() {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(link => {
      const href = link.href;
      if (href && !href.includes('?v=')) {
        link.href = href + (href.includes('?') ? '&' : '?') + 'v=' + Date.now();
      }
    });
  }

  addCacheStatusIndicator() {
    // Add a small indicator for cache status (only visible in console)
    const cacheVersion = localStorage.getItem('ilm-cache-version');
    const isLatest = cacheVersion === 'v2024-01-15';
    
    if (!isLatest) {
      console.warn('⚠️ Cache may be outdated. Run forceCacheRefresh() if experiencing issues.');
    } else {
      console.log('✅ Cache version current');
    }
    
    // Add debug info to help with troubleshooting
    window.ilmDebugInfo = {
      cacheVersion: cacheVersion,
      lastCacheUpdate: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isLatest: isLatest
    };
  }

  showPrivacyCenter() {
    const center = document.getElementById('privacyCenter');
    if (center) {
      center.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Load current preferences
      const consent = this.getConsent();
      if (consent) {
        document.getElementById('functional-cookies').checked = consent.functional;
        document.getElementById('analytics-cookies').checked = consent.analytics;
        document.getElementById('marketing-cookies').checked = consent.marketing;
      }
      
      // Update cookie counts
      this.updateCookieCounts();
    }
  }

  hidePrivacyCenter() {
    const center = document.getElementById('privacyCenter');
    if (center) {
      center.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  removeCookieConsent() {
    const banner = document.querySelector('.gdpr-consent-banner');
    if (banner) banner.remove();
  }

  setConsent(preferences) {
    const consentData = {
      functional: preferences.functional !== false,
      analytics: preferences.analytics === true,
      marketing: preferences.marketing === true,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    
    localStorage.setItem('ilm_consent', JSON.stringify(consentData));
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData)); // Legacy compatibility
    
    // Apply preferences immediately
    this.applyConsentPreferences(consentData);
    
    // Initialize or disable analytics based on consent
    if (consentData.analytics) {
      this.initializePrivacyAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Track consent choice (anonymous)
    this.trackConsentChoice(preferences);
    
    console.log('✅ Consent preferences saved:', consentData);
  }

  getConsent() {
    const stored = localStorage.getItem('gdpr-consent');
    return stored ? JSON.parse(stored) : null;
  }

  showConsentConfirmation() {
    const notification = document.createElement('div');
    notification.className = 'consent-confirmation';
    notification.innerHTML = `
      <div class="confirmation-content">
        <span>✅ Privacy preferences saved</span>
        <button class="confirmation-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.remove();
    }, 3000);

    notification.querySelector('.confirmation-close').addEventListener('click', () => {
      notification.remove();
    });
  }

  setupDataProtectionIndicators() {
    // Add GDPR compliance indicators to forms (only if not already present)
    document.querySelectorAll('form').forEach(form => {
      // Check if indicator already exists
      if (form.querySelector('.gdpr-indicator')) {
        return; // Skip if already has indicator
      }
      
      const indicator = document.createElement('div');
      indicator.className = 'gdpr-indicator';
      
      // Only add indicator to the enquire form, not all forms
      if (form.classList.contains('enquire-form')) {
        indicator.innerHTML = `
          <div class="privacy-notice">
            <span class="privacy-icon">🛡️</span>
            <div class="privacy-text">
              <p class="data-usage-notice">
                Your privacy matters to us. We process your data in accordance with our 
                <a href="/policies" target="_blank">Privacy Policy</a> and never share 
                your personal information with third parties.
              </p>
            </div>
          </div>
        `;
        form.appendChild(indicator);
      }
    });

    // Add privacy link to footer if not exists
    this.addPrivacyLinks();
  }

  addPrivacyLinks() {
    console.log('🔗 Adding privacy links to footer...');
    
    const attemptToAddLinks = () => {
      // Target the Quick Links section specifically
      const quickLinksSection = document.querySelector('.footer-col:nth-child(2) ul');
      
      if (!quickLinksSection) {
        console.log('❌ Quick Links section not found in footer, retrying...');
        // Try again after a short delay
        setTimeout(attemptToAddLinks, 500);
        return;
      }
      
      // Check if Privacy Preferences link already exists
      const existingPrivacyLink = Array.from(quickLinksSection.querySelectorAll('a')).find(link => 
        link.textContent.includes('Privacy Preferences')
      );
      
      if (existingPrivacyLink) {
        console.log('✅ Privacy Preferences link already exists in footer');
        return;
      }
      
      // Create and add Privacy Preferences link
      const privacyLi = document.createElement('li');
      const privacyLink = document.createElement('a');
      privacyLink.href = '#privacy-center';
      privacyLink.textContent = 'Privacy Preferences';
      
      const self = this; // Preserve context
      privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Privacy Preferences link clicked from footer');
        self.showPrivacyCenter();
      });
      
      privacyLink.style.cursor = 'pointer';
      
      privacyLi.appendChild(privacyLink);
      quickLinksSection.appendChild(privacyLi);
      
      console.log('✅ Privacy Preferences link added to footer Quick Links');
    };

    // Try immediately, and if that fails, try again after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attemptToAddLinks);
    } else {
      attemptToAddLinks();
    }
  }

  trackUserConsent() {
    // Monitor consent changes and update tracking accordingly
    const consent = this.getConsent();
    
    if (consent && consent.analytics) {
      console.log('Analytics tracking enabled');
      // Initialize analytics here (Google Analytics, etc.)
    }
    
    if (consent && consent.marketing) {
      console.log('Marketing tracking enabled');
      // Initialize marketing pixels here (Facebook, Google Ads, etc.)
    }
  }

  enableAnalytics() {
    // Example: Google Analytics initialization
    // window.gtag('consent', 'update', {
    //   'analytics_storage': 'granted'
    // });
    console.log('Analytics enabled - would initialize Google Analytics, heat mapping, etc.');
  }

  enableMarketing() {
    // Example: Marketing pixels initialization
    console.log('Marketing enabled - would initialize Facebook Pixel, Google Ads, etc.');
  }

  initializePrivacyAnalytics() {
    console.log('🔒 Initializing privacy-compliant analytics system...');
    
    // Only initialize if user has given analytics consent
    const consent = this.getConsent();
    if (!consent || !consent.analytics) {
      console.log('📊 Analytics consent not granted, skipping initialization');
      return;
    }
    
    // Initialize privacy-focused tracking
    this.setupUserExperienceTracking();
    this.setupPerformanceMonitoring();
    this.setupAccessibilityTracking();
    this.setupErrorTracking();
    this.setupUserJourneyMapping();
    
    console.log('✅ Privacy-compliant analytics initialized');
  }

  setupUserExperienceTracking() {
    // Track user experience metrics with privacy in mind
    const sessionId = this.generateSessionId();
    
    // Page performance metrics (anonymous)
    this.trackPagePerformance();
    
    // User engagement patterns (anonymized)
    this.trackUserEngagement();
    
    // Feature usage analytics
    this.trackFeatureUsage();
    
    // Form completion analytics
    this.trackFormAnalytics();
  }

  trackPagePerformance() {
    if (!window.performance) return;
    
    const performanceData = {
      timestamp: Date.now(),
      page: this.anonymizePage(window.location.pathname),
      sessionId: this.getSessionId(),
      metrics: {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        windowLoaded: performance.timing.loadEventEnd - performance.timing.navigationStart,
        firstPaint: null,
        largestContentfulPaint: null,
        cumulativeLayoutShift: null
      }
    };
    
    // Get Web Vitals if available
    if ('PerformanceObserver' in window) {
      // First Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          performanceData.metrics.firstPaint = entries[0].startTime;
        }
      }).observe({ entryTypes: ['paint'] });
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceData.metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        performanceData.metrics.cumulativeLayoutShift = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // Store performance data (anonymized)
    setTimeout(() => {
      this.storeAnalyticsData('performance', performanceData);
    }, 2000);
  }

  trackUserEngagement() {
    let engagementData = {
      sessionId: this.getSessionId(),
      page: this.anonymizePage(window.location.pathname),
      startTime: Date.now(),
      interactions: {
        clicks: 0,
        scrolls: 0,
        keystrokes: 0,
        timeOnPage: 0,
        maxScrollDepth: 0
      },
      features: {
        galleryViewed: false,
        bookingFormStarted: false,
        bookingFormCompleted: false,
        contactFormUsed: false,
        faqAccessed: false,
        privacySettingsOpened: false
      }
    };
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        engagementData.interactions.maxScrollDepth = Math.min(maxScroll, 100);
      }
      engagementData.interactions.scrolls++;
    }, { passive: true });
    
    // Track clicks (anonymized)
    document.addEventListener('click', (e) => {
      engagementData.interactions.clicks++;
      
      // Track feature usage
      const target = e.target.closest('[data-analytics]');
      if (target) {
        const feature = target.getAttribute('data-analytics');
        if (engagementData.features.hasOwnProperty(feature)) {
          engagementData.features[feature] = true;
        }
      }
    });
    
    // Track keystrokes (count only, no content)
    document.addEventListener('keydown', () => {
      engagementData.interactions.keystrokes++;
    });
    
    // Save engagement data when user leaves
    window.addEventListener('beforeunload', () => {
      engagementData.interactions.timeOnPage = Date.now() - engagementData.startTime;
      this.storeAnalyticsData('engagement', engagementData);
    });
    
    // Also save periodically
    setInterval(() => {
      engagementData.interactions.timeOnPage = Date.now() - engagementData.startTime;
      this.storeAnalyticsData('engagement', { ...engagementData });
    }, 30000);
  }

  trackFeatureUsage() {
    // Track which features are used most
    const featureTracking = {
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      features: {}
    };
    
    // Gallery interactions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-card')) {
        featureTracking.features.galleryImageClick = (featureTracking.features.galleryImageClick || 0) + 1;
      }
      
      if (e.target.closest('.lightbox-overlay')) {
        featureTracking.features.lightboxUsage = (featureTracking.features.lightboxUsage || 0) + 1;
      }
      
      // FAQ interactions
      if (e.target.closest('.accordion-title')) {
        featureTracking.features.faqExpansion = (featureTracking.features.faqExpansion || 0) + 1;
      }
      
      // Navigation usage
      if (e.target.closest('nav a')) {
        const section = e.target.getAttribute('href')?.replace('#', '') || 'unknown';
        featureTracking.features[`nav_${section}`] = (featureTracking.features[`nav_${section}`] || 0) + 1;
      }
      
      // Privacy center usage
      if (e.target.closest('.privacy-preference-center')) {
        featureTracking.features.privacyCenter = (featureTracking.features.privacyCenter || 0) + 1;
      }
    });
    
    // Save feature data periodically
    setInterval(() => {
      if (Object.keys(featureTracking.features).length > 0) {
        this.storeAnalyticsData('features', { ...featureTracking });
        featureTracking.features = {}; // Reset after storing
      }
    }, 60000);
  }

  trackFormAnalytics() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      let formData = {
        sessionId: this.getSessionId(),
        formId: form.id || form.className || 'unknown',
        startTime: null,
        interactions: [],
        completionStages: [],
        errors: [],
        abandoned: false,
        completed: false
      };
      
      // Track form start
      const firstInteraction = (e) => {
        if (!formData.startTime) {
          formData.startTime = Date.now();
          this.storeAnalyticsData('form_start', { 
            sessionId: formData.sessionId,
            formId: formData.formId,
            timestamp: formData.startTime 
          });
        }
      };
      
      form.addEventListener('focus', firstInteraction, { once: true });
      form.addEventListener('input', firstInteraction, { once: true });
      
      // Track field interactions (anonymized)
      form.addEventListener('input', (e) => {
        const field = e.target;
        if (field.type !== 'password') { // Never track password fields
          formData.interactions.push({
            field: field.name || field.id || 'unknown',
            type: field.type,
            timestamp: Date.now(),
            hasValue: field.value.length > 0
          });
        }
      });
      
      // Track form sections completion
      const sections = form.querySelectorAll('.form-section');
      sections.forEach((section, index) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              formData.completionStages.push({
                section: index,
                timestamp: Date.now()
              });
            }
          });
        }, { threshold: 0.5 });
        
        observer.observe(section);
      });
      
      // Track errors (anonymized)
      form.addEventListener('invalid', (e) => {
        formData.errors.push({
          field: e.target.name || e.target.id || 'unknown',
          type: e.target.type,
          timestamp: Date.now()
        });
      });
      
      // Track completion
      form.addEventListener('submit', (e) => {
        formData.completed = true;
        formData.completionTime = Date.now() - formData.startTime;
        this.storeAnalyticsData('form_completion', formData);
      });
      
      // Track abandonment
      window.addEventListener('beforeunload', () => {
        if (formData.startTime && !formData.completed) {
          formData.abandoned = true;
          formData.abandonTime = Date.now() - formData.startTime;
          this.storeAnalyticsData('form_abandonment', formData);
        }
      });
    });
  }

  setupPerformanceMonitoring() {
    // Monitor for performance issues
    const performanceIssues = {
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      issues: []
    };
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            performanceIssues.issues.push({
              type: 'long_task',
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        }
      }).observe({ entryTypes: ['longtask'] });
    }
    
    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        if (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.9) {
          performanceIssues.issues.push({
            type: 'high_memory_usage',
            usage: memInfo.usedJSHeapSize,
            limit: memInfo.jsHeapSizeLimit,
            timestamp: Date.now()
          });
        }
      }, 30000);
    }
    
    // Save performance issues
    window.addEventListener('beforeunload', () => {
      if (performanceIssues.issues.length > 0) {
        this.storeAnalyticsData('performance_issues', performanceIssues);
      }
    });
  }

  setupAccessibilityTracking() {
    // Track accessibility usage patterns
    const a11yData = {
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      indicators: {
        keyboardNavigation: false,
        screenReaderUsage: false,
        highContrast: false,
        reducedMotion: false,
        focusVisible: false
      }
    };
    
    // Detect keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        a11yData.indicators.keyboardNavigation = true;
      }
    });
    
    // Detect screen reader (heuristic)
    if (navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') || 
        navigator.userAgent.includes('VoiceOver')) {
      a11yData.indicators.screenReaderUsage = true;
    }
    
    // Detect accessibility preferences
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      a11yData.indicators.highContrast = true;
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      a11yData.indicators.reducedMotion = true;
    }
    
    // Detect focus-visible usage
    document.addEventListener('focusin', (e) => {
      if (e.target.matches(':focus-visible')) {
        a11yData.indicators.focusVisible = true;
      }
    });
    
    // Save accessibility data
    window.addEventListener('beforeunload', () => {
      this.storeAnalyticsData('accessibility', a11yData);
    });
  }

  setupErrorTracking() {
    const errorData = {
      sessionId: this.getSessionId(),
      errors: []
    };
    
    // JavaScript errors
    window.addEventListener('error', (e) => {
      errorData.errors.push({
        type: 'javascript',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });
    
    // Promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      errorData.errors.push({
        type: 'promise_rejection',
        reason: e.reason?.toString() || 'Unknown',
        timestamp: Date.now()
      });
    });
    
    // Save error data
    setInterval(() => {
      if (errorData.errors.length > 0) {
        this.storeAnalyticsData('errors', { ...errorData });
        errorData.errors = []; // Reset after storing
      }
    }, 30000);
  }

  setupUserJourneyMapping() {
    const journeyData = {
      sessionId: this.getSessionId(),
      startTime: Date.now(),
      pages: [],
      interactions: [],
      goals: {
        viewedGallery: false,
        startedBooking: false,
        completedBooking: false,
        viewedContact: false,
        readFAQ: false,
        customizedPrivacy: false
      }
    };
    
    // Track page views
    const trackPageView = () => {
      journeyData.pages.push({
        page: this.anonymizePage(window.location.pathname),
        timestamp: Date.now(),
        referrer: this.anonymizePage(document.referrer)
      });
    };
    
    trackPageView(); // Initial page
    
    // Track navigation (for SPAs)
    window.addEventListener('popstate', trackPageView);
    
    // Track goal completions
    document.addEventListener('click', (e) => {
      // Gallery goal
      if (e.target.closest('.gallery-card')) {
        journeyData.goals.viewedGallery = true;
      }
      
      // Booking goals
      if (e.target.closest('a[href*="booking"]')) {
        journeyData.goals.startedBooking = true;
      }
      
      // Contact goal
      if (e.target.closest('a[href*="contact"]')) {
        journeyData.goals.viewedContact = true;
      }
      
      // FAQ goal
      if (e.target.closest('.accordion-title')) {
        journeyData.goals.readFAQ = true;
      }
      
      // Privacy goal
      if (e.target.closest('.privacy-preference-center')) {
        journeyData.goals.customizedPrivacy = true;
      }
    });
    
    // Track form submission (booking completion)
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'comprehensive-booking-form') {
        journeyData.goals.completedBooking = true;
      }
    });
    
    // Save journey data
    window.addEventListener('beforeunload', () => {
      journeyData.sessionDuration = Date.now() - journeyData.startTime;
      this.storeAnalyticsData('user_journey', journeyData);
    });
  }

  storeAnalyticsData(type, data) {
    // Only store if analytics consent is given
    const consent = this.getConsent();
    if (!consent || !consent.analytics) {
      return;
    }
    
    try {
      const existingData = JSON.parse(localStorage.getItem('ilm_analytics') || '{}');
      if (!existingData[type]) {
        existingData[type] = [];
      }
      
      // Add anonymized data
      existingData[type].push({
        ...data,
        timestamp: data.timestamp || Date.now(),
        version: '2.0' // Analytics version for tracking changes
      });
      
      // Limit storage (keep last 100 entries per type)
      if (existingData[type].length > 100) {
        existingData[type] = existingData[type].slice(-100);
      }
      
      localStorage.setItem('ilm_analytics', JSON.stringify(existingData));
      
      // Also send to admin if configured
      this.sendToAdminDashboard(type, data);
      
    } catch (error) {
      console.error('Error storing analytics data:', error);
    }
  }

  sendToAdminDashboard(type, data) {
    // Send anonymized analytics to admin dashboard
    // This would typically go to your backend analytics service
    if (this.analyticsEndpoint) {
      fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data: this.anonymizeData(data),
          timestamp: Date.now()
        })
      }).catch(error => {
        console.log('Analytics upload deferred:', error.message);
      });
    }
  }

  anonymizePage(url) {
    // Remove sensitive information from URLs
    if (!url) return 'unknown';
    
    const path = url.replace(/https?:\/\/[^\/]+/, '');
    const cleanPath = path.split('?')[0]; // Remove query parameters
    
    // Map specific pages to categories
    const pageMap = {
      '/': 'home',
      '/index.html': 'home',
      '/booking.html': 'booking',
      '/contact.html': 'contact',
      '/policies.html': 'policies',
      '/admin-dashboard.html': 'admin',
      '/admin.html': 'admin_login'
    };
    
    return pageMap[cleanPath] || 'other';
  }

  anonymizeData(data) {
    // Remove or hash any potentially identifying information
    const anonymized = { ...data };
    
    // Remove IP addresses, exact timestamps, etc.
    delete anonymized.ip;
    delete anonymized.userAgent;
    
    // Round timestamps to nearest hour for privacy
    if (anonymized.timestamp) {
      anonymized.timestamp = Math.floor(anonymized.timestamp / 3600000) * 3600000;
    }
    
    return anonymized;
  }

  generateSessionId() {
    // Generate anonymous session ID
    if (!this.sessionId) {
      this.sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }
    return this.sessionId;
  }

  getSessionId() {
    return this.generateSessionId();
  }

  // Enhanced consent handling with analytics
  setConsent(preferences) {
    const consentData = {
      functional: preferences.functional !== false,
      analytics: preferences.analytics === true,
      marketing: preferences.marketing === true,
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    
    localStorage.setItem('ilm_consent', JSON.stringify(consentData));
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData)); // Legacy compatibility
    
    // Apply preferences immediately
    this.applyConsentPreferences(consentData);
    
    // Initialize or disable analytics based on consent
    if (consentData.analytics) {
      this.initializePrivacyAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Track consent choice (anonymous)
    this.trackConsentChoice(preferences);
    
    console.log('✅ Consent preferences saved:', consentData);
  }

  disableAnalytics() {
    // Clear existing analytics data
    localStorage.removeItem('ilm_analytics');
    
    // Clear session ID
    this.sessionId = null;
    
    console.log('🔒 Analytics disabled by user preference');
  }

  trackConsentChoice(preferences) {
    // Track consent patterns (completely anonymous)
    const consentStats = JSON.parse(localStorage.getItem('ilm_consent_stats') || '{}');
    
    const choice = `${preferences.functional ? 'F' : 'f'}${preferences.analytics ? 'A' : 'a'}${preferences.marketing ? 'M' : 'm'}`;
    consentStats[choice] = (consentStats[choice] || 0) + 1;
    consentStats.lastUpdated = Date.now();
    
    localStorage.setItem('ilm_consent_stats', JSON.stringify(consentStats));
  }

  applyConsentPreferences(consentData) {
    // Apply the consent preferences immediately
    console.log('Applying consent preferences:', consentData);
    
    // This would typically enable/disable various tracking scripts
    // For now, we just log the preferences
    if (consentData.functional) {
      console.log('✅ Functional cookies enabled');
    }
    
    if (consentData.analytics) {
      console.log('✅ Analytics cookies enabled');
    } else {
      console.log('❌ Analytics cookies disabled');
    }
    
    if (consentData.marketing) {
      console.log('✅ Marketing cookies enabled');
    } else {
      console.log('❌ Marketing cookies disabled');
    }
  }
}

// ===================================
// OPTIMIZED INITIALIZATION FOR SMOOTH TRANSITIONS
// ===================================

// Fast initialization for immediate page response
function initializePageTransitions() {
  // Add page transition styles for smooth navigation
  if (!document.getElementById('page-transition-styles')) {
    const styles = document.createElement('style');
    styles.id = 'page-transition-styles';
    styles.textContent = `
      /* Page transition optimization */
      body {
        transition: opacity 0.2s ease-in-out;
      }
      
      /* Prevent flash of unstyled content */
      .content-loading {
        opacity: 0.8;
      }
      
      /* Smooth link transitions */
      a {
        transition: color 0.2s ease, background-color 0.2s ease;
      }
      
             /* Optimized image loading - handled in main CSS */
    `;
    document.head.appendChild(styles);
  }
}

// Initialize immediately for fast response
initializePageTransitions();

// Main initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting optimized page initialization...');
  
  // Create website instance and start optimized init
  const website = new ILMWebsite();
  window.ilmWebsite = website;
  
  // Start the main initialization process
  website.init();
  
  // Add booking form specific functions (non-blocking)
  setTimeout(() => {
    if (document.getElementById('bookingForm')) {
      setupBookingForm();
      setupAdminPanel();
    }
  }, 200);
  
  // Add mobile-optimized image handling (deferred)
  setTimeout(() => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Skip critical images (logo, hero images) that should load immediately
            if (img.closest('.logo') || img.closest('.hero') || img.closest('.about-main-image')) {
              imageObserver.unobserve(img);
              return;
            }
            
            // Only set loading state for images that aren't already loaded
            if (!img.complete || img.naturalHeight === 0) {
              img.setAttribute('data-loaded', 'false');
              
              // Set loaded state after image loads
              img.onload = () => {
                img.setAttribute('data-loaded', 'true');
              };
            } else {
              // Image is already loaded, ensure it's visible
              img.setAttribute('data-loaded', 'true');
            }
            
            // Mobile-first image optimization
            if (window.innerWidth <= 768) {
              // Use smaller images for mobile
              if (img.dataset.mobileSrc) {
                img.src = img.dataset.mobileSrc;
              } else if (img.src && img.src.includes('cloudinary')) {
                // Auto-optimize Cloudinary images for mobile
                img.src = img.src.replace('/upload/', '/upload/w_400,f_auto,q_auto/');
              }
            }
            
            imageObserver.unobserve(img);
          }
        });
      });

      // Only observe gallery and non-critical images
      document.querySelectorAll('img').forEach(img => {
        // Skip logo and hero images
        if (!img.closest('.logo') && !img.closest('.hero') && !img.closest('.about-main-image')) {
          imageObserver.observe(img);
        }
      });
    }
  }, 400);
  
  console.log('✅ Optimized page initialization complete');
});

// ===================================
// BOOKING FORM SPECIFIC FUNCTIONS
// ===================================
function setupBookingForm() {
  // Generate application ID with new format: RH-ILM-########
  document.getElementById('applicationId').value = generateApplicationId();
  document.getElementById('submissionDate').value = new Date().toISOString();
  
  // Setup form validations and interactions
  setupFormInteractions();
}

function toggleGuarantorFields() {
  const checkbox = document.getElementById('provideGuarantorLater');
  const guarantorFields = document.getElementById('guarantorFields');
  const guarantorInputs = guarantorFields.querySelectorAll('input, textarea');
  
  if (checkbox.checked) {
    // Hide guarantor fields and remove required attribute
    guarantorFields.style.display = 'none';
    guarantorInputs.forEach(input => {
      input.removeAttribute('required');
      input.value = ''; // Clear any existing values
    });
  } else {
    // Show guarantor fields and add required attribute back
    guarantorFields.style.display = 'block';
    guarantorInputs.forEach(input => {
      if (input.id.includes('guarantor')) {
        input.setAttribute('required', 'required');
      }
    });
  }
}

function toggleOtherUniversity() {
  const universitySelect = document.getElementById('university');
  const otherUniversityInput = document.getElementById('otherUniversity');
  const otherUniversityLabel = document.getElementById('otherUniversityLabel');
  
  if (universitySelect.value === 'other') {
    otherUniversityInput.style.display = 'block';
    otherUniversityLabel.style.display = 'block';
    otherUniversityInput.setAttribute('required', 'required');
  } else {
    otherUniversityInput.style.display = 'none';
    otherUniversityLabel.style.display = 'none';
    otherUniversityInput.removeAttribute('required');
    otherUniversityInput.value = '';
  }
}

function setupFormInteractions() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  // Mark button as handled by specific handler
  const submitBtn = form.querySelector('.submit-booking-btn');
  if (submitBtn) {
    submitBtn.dataset.handledBySpecific = 'true';
  }

  // Form submission handling
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = form.querySelector('.submit-booking-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (!submitBtn || !btnText || !btnLoading) {
      console.error('Submit button elements not found');
      return;
    }
    
    // Prevent double submission
    if (submitBtn.disabled) {
      return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    // Function to reset button state
    const resetButton = () => {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    };

    // Basic spam detection for booking form
    const website = form.querySelector('input[name="website"]');
    if (website && website.value.trim() !== '') {
      resetButton();
      showFormError('Security check failed. Please try again or contact us directly.', true);
      return;
    }

    // Validate required fields
    const missingFields = validateBookingForm();
    if (missingFields.length > 0) {
      resetButton();
      showFormError('Please fill in all required fields: ' + missingFields.join(', '), true);
      return;
    }
    
    // Submit the form
    submitBookingForm(form, resetButton);
  });

  // Real-time validation for phone numbers
  const phoneInputs = form.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('blur', validatePhoneNumber);
  });

  // Email validation
  const emailInputs = form.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.addEventListener('blur', validateEmailAddress);
  });

  // Date validation
  const dateInputs = form.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    input.addEventListener('change', validateDate);
  });
}

function validateBookingForm() {
  const form = document.getElementById('bookingForm');
  const missingFields = [];
  
  // Check all required fields
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      const label = form.querySelector(`label[for="${field.id}"]`);
      const fieldName = label ? label.textContent.replace('*', '').trim() : field.name;
      missingFields.push(fieldName);
    }
  });
  
  return missingFields;
}

function validatePhoneNumber(e) {
  const input = e.target;
  const value = input.value.trim();
  
  if (value && !isValidPhoneNumber(value)) {
    showFieldError(input, 'Please enter a valid phone number (e.g., 07722440395 or +447722440395)');
  } else {
    clearFieldError(input);
  }
}

function validateEmailAddress(e) {
  const input = e.target;
  const value = input.value.trim();
  
  if (value && !isValidEmail(value)) {
    showFieldError(input, 'Please enter a valid email address');
  } else {
    clearFieldError(input);
  }
}

function validateDate(e) {
  const input = e.target;
  const selectedDate = new Date(input.value);
  const today = new Date();
  
  if (input.id === 'dateOfBirth') {
    const age = today.getFullYear() - selectedDate.getFullYear();
    if (age < 16 || age > 100) {
      showFieldError(input, 'Please enter a valid date of birth');
    } else {
      clearFieldError(input);
    }
  } else if (input.id === 'checkInDate') {
    if (selectedDate < today) {
      showFieldError(input, 'Check-in date cannot be in the past');
    } else {
      clearFieldError(input);
    }
  }
}

function isValidPhoneNumber(phone) {
  // UK mobile: 07xxxxxxxxx or +447xxxxxxxxx
  // International: +[country code][number]
  const ukMobile = /^(07\d{9}|(\+44)?7\d{9})$/;
  const international = /^\+\d{10,15}$/;
  const cleaned = phone.replace(/\s|-|\(|\)/g, '');
  
  return ukMobile.test(cleaned) || international.test(cleaned);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, message) {
  clearFieldError(field);
  
  field.classList.add('error');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

function showFormError(message, severe = false) {
  // Remove existing error
  const existingError = document.querySelector('.form-error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Create new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error-message';
  errorDiv.innerHTML = `
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span>${message}</span>
    </div>
  `;
  
  // Insert before submit button
  const submitSection = document.querySelector('.form-submit');
  submitSection.parentNode.insertBefore(errorDiv, submitSection);
  
  // Scroll to error
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);

  if (severe) {
    // For severe errors, redirect to error page instead of showing inline error
    window.location.href = '/error';
  }
}

async function submitBookingForm(form, resetButton) {
  try {
    const formData = new FormData(form);
    
    // Convert FormData to regular object for JSON submission
    const data = {};
    for (let [key, value] of formData.entries()) {
      // Handle checkboxes specially
      if (value === 'on') {
        data[key] = 'yes';
      } else {
      data[key] = value;
      }
    }
    
    // Check if form has action URL
    if (!form.action) {
      throw new Error('Form action URL not specified');
    }
    
    // Submit to Supabase Edge Function with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    // Get Supabase anon key for authentication
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybmJmZXZsYmFrdmRlYXN3YmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTIzODgsImV4cCI6MjA2NDM4ODM4OH0.3V7rTYNwxSsKA0etRgNgxvUgoULmqvppVtmSY9Hzr3M';
    
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseData = await response.json();
    
    if (response.ok && responseData.success) {
      // Store the application ID for the success page
      if (responseData.applicationId) {
        sessionStorage.setItem('lastApplicationId', responseData.applicationId);
      }
          showFormSuccess();
    } else {
      throw new Error(responseData.error || 'Submission failed');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    
    let errorMessage = 'There was an error submitting your application. Please try again or contact us directly.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Submission timed out. Please check your internet connection and try again.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // For severe errors, redirect to error page instead of showing inline error
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('HTTP 500') || error.message.includes('HTTP 404')) {
      showFormError(errorMessage, true);
    } else {
      showFormError(errorMessage);
    }
    
    // Reset button state
    if (resetButton) {
      resetButton();
    }
  }
}

function showFormSuccess() {
  // Get the application ID that was generated during form submission
  const applicationId = document.getElementById('applicationId')?.value || generateApplicationId();
  
  // Redirect to the dedicated success page with the application ID
  window.location.href = `/success?id=${encodeURIComponent(applicationId)}`;
}

// Helper function to generate application ID if not already set
function generateApplicationId() {
  // Generate 8 unique digits using timestamp and random number
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Take last 4 digits of timestamp + 4 random digits = 8 digits total
  const last4Timestamp = timestamp.slice(-4);
  const uniqueId = last4Timestamp + random;
  
  return `RH-ILM-${uniqueId}`;
}

// ===================================
// ADMIN PANEL FUNCTIONALITY
// ===================================
function setupAdminPanel() {
  // Check if we're on the booking page
  if (!document.getElementById('fillTestDataBtn')) return;
  
  // Load initial setting from admin dashboard
  loadTestDataButtonSetting();
  
  // Listen for setting changes from admin dashboard
  window.addEventListener('storage', function(e) {
    if (e.key === 'admin_setting_update') {
      try {
        const update = JSON.parse(e.newValue);
        if (update.setting === 'showTestDataButton') {
          updateTestDataButtonVisibility(update.value);
          showAdminNotification(`Test data button ${update.value ? 'enabled' : 'disabled'} by admin`);
        }
      } catch (error) {
        console.error('Error processing admin setting update:', error);
      }
    } else if (e.key === 'showTestDataBtn') {
      updateTestDataButtonVisibility(e.newValue === 'true');
    }
  });
}

function loadTestDataButtonSetting() {
  // Check admin dashboard setting first
  const adminSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
  let showButton = adminSettings.showTestDataButton;
  
  // Fallback to legacy setting
  if (showButton === undefined) {
    showButton = localStorage.getItem('showTestDataBtn') === 'true';
  }
  
  updateTestDataButtonVisibility(showButton);
}

function updateTestDataButtonVisibility(show) {
  const testButton = document.getElementById('fillTestDataBtn');
  if (testButton) {
    testButton.style.display = show ? 'inline-block' : 'none';
    
    // Update localStorage for consistency
    localStorage.setItem('showTestDataBtn', show);
    
    // Set up button functionality if it's being shown
    if (show && !testButton.hasAttribute('data-initialized')) {
      testButton.addEventListener('click', () => {
        fillFormWithTestData();
        showAdminNotification('✅ Test data filled successfully!');
      });
      testButton.setAttribute('data-initialized', 'true');
    }
  }
}

function showAdminNotification(message) {
  // Create and show a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-size: 14px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ===================================
// TEST DATA GENERATION
// ===================================
function generateTestData() {
  const firstNames = ['James', 'Mohammed', 'Ahmed', 'Ali', 'Hassan', 'Sarah', 'Fatima', 'Aisha', 'Zara', 'Omar', 'Yusuf', 'Ibrahim', 'Adam', 'Noor', 'Layla'];
  const lastNames = ['Smith', 'Johnson', 'Ahmed', 'Khan', 'Ali', 'Hassan', 'Sheikh', 'Rahman', 'Abbas', 'Shah', 'Malik', 'Hussain', 'Patel', 'Brown', 'Wilson'];
  const middleNames = ['', '', 'bin', 'ibn', 'Abdul', 'Al', '', '', '', ''];
  const universities = ['abertay', 'dundee', 'al-makhtoum', 'st-andrews', 'dundee-angus-college'];
  const courses = ['Computer Science', 'Business Management', 'Engineering', 'Medicine', 'Islamic Studies', 'Psychology', 'Law', 'Economics', 'Mathematics', 'Biology'];
  const nationalities = ['British', 'Pakistani', 'Indian', 'Bangladeshi', 'Nigerian', 'Turkish', 'Egyptian', 'Moroccan', 'Malaysian', 'Indonesian'];
  const roomTypes = ['single-no-wc', 'single-with-wc', 'single-en-suite', 'double-with-wc'];
  const contractLengths = ['full-year', 'semester', 'summer'];
  const dietaryReqs = ['halal', 'vegetarian', 'vegan', 'gluten-free'];
  const relationships = ['Parent', 'Guardian', 'Uncle', 'Aunt', 'Sibling', 'Sponsor'];
  
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomEmail = (firstName, lastName) => `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
  const randomPhone = () => {
    const formats = [
      `07${Math.floor(Math.random() * 900000000 + 100000000)}`,
      `+447${Math.floor(Math.random() * 900000000 + 100000000)}`,
      `+92${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`
    ];
    return random(formats);
  };
  
  const randomDate = (startYear = 1998, endYear = 2006) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };
  
  const randomCheckInDate = () => {
    const start = new Date();
    start.setDate(start.getDate() + 7); // At least 7 days from now
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1); // Up to 1 year from now
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };
  
  const randomAddress = () => {
    const streets = ['High Street', 'King Road', 'Queen Avenue', 'Park Lane', 'Church Street', 'Mill Road', 'Victoria Street', 'Station Road'];
    const cities = ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Edinburgh', 'Liverpool', 'Bristol', 'Leeds'];
    const postcodes = ['E1 4NS', 'B1 2JQ', 'M1 3DZ', 'G1 5RT', 'EH1 2NG', 'L1 6BX', 'BS1 4DJ', 'LS1 2TW'];
    
    return `${Math.floor(Math.random() * 999) + 1} ${random(streets)}, ${random(cities)} ${random(postcodes)}, UK`;
  };
  
  const firstName = random(firstNames);
  const lastName = random(lastNames);
  const middleName = random(middleNames);
  
  return {
    // Personal Information
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    dateOfBirth: randomDate(),
    gender: random(['male', 'female']),
    nationality: random(nationalities),
    passportNumber: `${random(['A', 'B', 'C', 'D'])}${Math.floor(Math.random() * 9000000) + 1000000}`,
    
    // Contact Information
    email: randomEmail(firstName, lastName),
    phone: randomPhone(),
    homeAddress: randomAddress(),
    
    // Academic Information
    university: random(universities),
    courseOfStudy: random(courses),
    studentId: `STU${Math.floor(Math.random() * 900000) + 100000}`,
    yearOfStudy: random(['1', '2', '3', '4', 'postgraduate']),
    
    // Accommodation Preferences
    roomType: random(roomTypes),
    checkInDate: randomCheckInDate(),
    contractLength: random(contractLengths),
    roomPreferences: random([
      'Quiet room preferred for studying',
      'Ground floor preferred',
      'Near bathroom facilities',
      'Good natural light',
      'Away from common areas',
      ''
    ]),
    
    // Additional Services
    parkingRequired: Math.random() > 0.7,
    bikeStorageRequired: Math.random() > 0.5,
    
    // Lifestyle & Dietary
    dietaryRequirements: Math.random() > 0.3 ? random(dietaryReqs) : '',
    medicalConditions: random([
      '', '', '', 'Asthma', 'Diabetes', 'Food allergies', 'Mild anxiety', ''
    ]),
    additionalInfo: random([
      'Looking forward to joining the community',
      'Excited about the halal environment',
      'Hope to meet like-minded students',
      'Appreciate the spiritual facilities',
      ''
    ]),
    
    // Reference Information
    referenceName: `Dr. ${random(firstNames)} ${random(lastNames)}`,
    referenceRelationship: random(['Teacher', 'Professor', 'Academic Supervisor', 'Employer', 'Mentor']),
    referenceEmail: `reference.${Math.floor(Math.random() * 999)}@university.edu`,
    referenceTelephone: randomPhone(),
    
    // Guarantor Information (sometimes delayed)
    provideGuarantorLater: Math.random() > 0.7,
    guarantorName: `${random(firstNames)} ${random(lastNames)}`,
    guarantorRelationship: random(relationships),
    guarantorEmail: `guarantor.${Math.floor(Math.random() * 999)}@email.com`,
    guarantorTelephone: randomPhone(),
    guarantorAddress: randomAddress(),
    
    // Emergency Contact
    emergencyName: `${random(firstNames)} ${random(lastNames)}`,
    emergencyRelation: random(relationships),
    emergencyPhone: randomPhone(),
    emergencyEmail: Math.random() > 0.3 ? `emergency.${Math.floor(Math.random() * 999)}@email.com` : '',
    
    // Terms & Conditions
    agreeTerms: true,
    agreePrivacy: true,
    agreeHalalPolicy: true
  };
}

function fillFormWithTestData() {
  const testData = generateTestData();
  const form = document.getElementById('bookingForm');
  
  if (!form) {
    console.error('Booking form not found');
    return;
  }
  
  // Fill form fields
  Object.keys(testData).forEach(key => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = testData[key];
      } else if (field.type === 'radio') {
        if (field.value === testData[key]) {
          field.checked = true;
        }
      } else {
        field.value = testData[key];
      }
    }
  });
  
  // Handle special cases
  
  // University selection
  const universitySelect = document.getElementById('university');
  if (universitySelect) {
    universitySelect.value = testData.university;
    toggleOtherUniversity();
  }
  
  // Guarantor fields visibility
  const provideGuarantorLaterCheckbox = document.getElementById('provideGuarantorLater');
  if (provideGuarantorLaterCheckbox) {
    provideGuarantorLaterCheckbox.checked = testData.provideGuarantorLater;
    toggleGuarantorFields();
  }
  
  // Additional services checkboxes
  const parkingCheckbox = form.querySelector('input[name="parkingRequired"]');
  if (parkingCheckbox) {
    parkingCheckbox.checked = testData.parkingRequired;
  }
  
  const bikeStorageCheckbox = form.querySelector('input[name="bikeStorageRequired"]');
  if (bikeStorageCheckbox) {
    bikeStorageCheckbox.checked = testData.bikeStorageRequired;
  }
  
  // Generate and fill application ID and submission date
  document.getElementById('applicationId').value = generateApplicationId();
  document.getElementById('submissionDate').value = new Date().toISOString();
  
  // Scroll to top of form
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  console.log('Form filled with test data:', testData);
}

// ===================================
// ERROR HANDLING & PERFORMANCE
// ===================================
window.addEventListener('error', (e) => {
  console.warn('Script error handled:', e.error);
});

// Preload critical resources
const preloadLinks = [
  'https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748189839/473148050_10160452160655951_3047339032063400229_n_gnkdpz.jpg'
];

preloadLinks.forEach(href => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = href;
  document.head.appendChild(link);
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} 

// Initialize gallery on page load
window.addEventListener('load', function() {
  setTimeout(initializeGallery, 2000); // Initialize after main dashboard
});

// Image URL preview functionality
document.addEventListener('DOMContentLoaded', function() {
  const imageUrlInput = document.getElementById('imageUrl');
  if (imageUrlInput) {
    imageUrlInput.addEventListener('input', function() {
      const url = this.value;
      const preview = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg');
      
      if (url && url.startsWith('http')) {
        previewImg.src = url;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });
  }
});

// ==========================================
// PUBLIC GALLERY FUNCTIONALITY
// ==========================================

// Initialize Supabase for public gallery
const SUPABASE_URL = 'https://nrnbfevlbakvdeaswbbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybmJmZXZsYmFrdmRlYXN3YmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTIzODgsImV4cCI6MjA2NDM4ODM4OH0.3V7rTYNwxSsKA0etRgNgxvUgoULmqvppVtmSY9Hzr3M';
    
// Initialize Supabase client for public use
let publicSupabase;
try {
  publicSupabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
  console.log('Supabase not available, using fallback gallery');
}

// Load gallery images from Supabase
async function loadPublicGallery() {
  try {
    console.log('🖼️ Loading gallery from Supabase...');
    
    if (!publicSupabase) {
      throw new Error('Supabase not available');
    }

    // Fetch visible images ordered by display_order and creation date
    const { data: images, error } = await publicSupabase
      .from('gallery_images')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Log detailed info for debugging
    console.log(`🖼️ Found ${images.length} visible images in database`);
    
    if (images.length === 0) {
      console.warn('⚠️ No visible images found. Check if images exist and have is_visible = true');
    } else {
      // Group by category for debugging
      const byCategory = images.reduce((acc, img) => {
        acc[img.category] = (acc[img.category] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Images by category:', byCategory);
      
      // Log any images with missing titles
      const untitled = images.filter(img => !img.title);
      if (untitled.length > 0) {
        console.warn(`⚠️ ${untitled.length} images without titles:`, untitled.map(img => `ID: ${img.id}`));
      }
    }

    // Fetch categories for proper organization
    const { data: categories, error: catError } = await publicSupabase
      .from('gallery_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (catError) {
      console.warn('⚠️ Error loading categories:', catError);
      // Continue with empty categories
    }

    renderPublicGallery(images, categories || []);
    console.log(`✅ Loaded ${images.length} gallery images from Supabase`);
    
  } catch (error) {
    console.error('❌ Error loading gallery from Supabase:', error);
    console.log('🔄 Using fallback gallery...');
    renderFallbackGallery();
  }
}

// Render gallery with Supabase images
function renderPublicGallery(images, categories) {
  const container = document.getElementById('galleryContainer');
  if (!container) {
    console.error('❌ Gallery container not found!');
    return;
  }

  if (images.length === 0) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 300px; color: #6c757d; font-style: italic;">
        No gallery images available at the moment.
      </div>
    `;
    return;
  }

  // Use the same ordering as admin dashboard: display_order first, then created_at
  const organizedImages = images
    .sort((a, b) => {
      // First sort by display_order (nulls last)
      const orderA = a.display_order || 999999;
      const orderB = b.display_order || 999999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If display_order is the same, sort by created_at (newest first)
      return new Date(b.created_at) - new Date(a.created_at);
  });

  console.log(`🎨 Rendering ${organizedImages.length} images in display_order sequence`);
  
  // Log the order for debugging
  organizedImages.slice(0, 10).forEach((img, index) => {
    console.log(`${index + 1}. "${img.title || 'Untitled'}" (Order: ${img.display_order || 'NULL'}, ID: ${img.id})`);
  });

  // Generate gallery HTML with better error handling
  const galleryHTML = organizedImages.map((image, index) => {
    // Validate image data
    if (!image.url) {
      console.warn(`⚠️ Image ${image.id} has no URL`);
      return '';
    }
    
    return `
    <div class="gallery-card" style="background-image:url('${image.url}')" 
         data-analytics="galleryImageClick"
           data-image-id="${image.id}"
           data-display-order="${image.display_order || 0}"
           title="${image.title || `Gallery Image ${index + 1}`} (Position: ${index + 1})">
      <div class="gallery-gradient"></div>
    </div>
    `;
  }).filter(html => html !== '').join('');

  container.innerHTML = galleryHTML;

  // Re-initialize gallery interactions
  initializeGalleryInteractions();
  
  console.log(`✅ Gallery rendered successfully with ${organizedImages.length} images in display_order sequence`);
}

// Fallback gallery with original hardcoded images
function renderFallbackGallery() {
  const container = document.getElementById('galleryContainer');
  if (!container) return;

  container.innerHTML = `
    <!-- Aesthetic Start: Chess and Beautiful Spaces -->
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299257/Chess_qmzmmn.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299255/arch_k7cttv.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394659/Feature_wall_bhpepb.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394659/Stair_window_vno2wr.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018688/Golden_Stairs_lrzkwx.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018689/Chandelier_xotmmh.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018688/Victorion_Ceiling_oenccu.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/Outside_window_mjeagx.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394655/View_from_window_fjic6a.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    
    <!-- Bedroom Pictures in Middle -->
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299255/bedroom_1_dfkkkk.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/glitter_blue_room_f1ask4.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394659/Room_7_tr1xwa.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/Bedroom_6_oy1pgn.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/yellow_room_hfgkto.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/yellow_room_2_rp2dp8.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/Room_1_window_mqc7la.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394655/Green_room_jdcmtq.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299255/room_cookie_abwuhz.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018689/Study_Desk_grqrnn.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    
    <!-- Common Areas and Facilities -->
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299255/dining_lyppqg.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394655/Dining_2_ygnhul.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018690/Modern_Kitchen_a6gsfi.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394657/Zone_1_kitchen_jkbdgd.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/zone_2_kitchen_uvujy2.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018692/Games_Theatre_room_e3yykl.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018690/Foosball_xtrc90.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    
    <!-- Prayer and Spiritual Areas -->
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/pray_scene_slztvd.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/Ptay_Seating_w6uvtx.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394655/Pray_mat_gvsfo0.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018691/Prayer_Room_chtjvw.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    
    <!-- Building and Exterior -->
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/Outside_pnfhj6.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394658/Out_view_xbxhcb.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/IMG_6916_kup8xj.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018692/Stairs_ifhhmn.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    
    <!-- Bathrooms and Utilities at End -->
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299254/zone_2_shower_w6q9kf.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/Shower_sjkefu.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018688/Modern_Bathroom_wa3ohq.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018688/En_Suite_bxq6yy.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748394656/Disabled_toilet_cj5nlw.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748018692/Sink_ykobes.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
    <div class="gallery-card" style="background-image:url('https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748299255/laundry_bzpiop.jpg')" data-analytics="galleryImageClick">
      <div class="gallery-gradient"></div>
    </div>
  `;

  // Re-initialize gallery interactions
  initializeGalleryInteractions();
}

// Initialize gallery interactions (scroll, lightbox, etc.)
function initializeGalleryInteractions() {
  console.log('🔄 Reinitializing gallery interactions...');
  
  // Get the ILM website instance
  const website = window.ilmWebsite;
  if (website && typeof website.setupImageLightbox === 'function') {
    website.setupImageLightbox();
    console.log('✅ Gallery lightbox reinitialized');
  }
  
  // Also setup gallery navigation
  if (website && typeof website.setupGalleryNavigation === 'function') {
    website.setupGalleryNavigation();
    console.log('✅ Gallery navigation reinitialized');
  }
}

// Initialize public gallery on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing iLm Website...');
  
  // Remove any existing floating privacy buttons from previous sessions
  document.querySelectorAll('.floating-privacy-btn').forEach(btn => btn.remove());
  
  const website = new ILMWebsite();
  window.ilmWebsite = website; // Make globally available for reinitializing interactions
  website.init();
  
  // Load gallery after a short delay to ensure Supabase is ready
  setTimeout(loadPublicGallery, 1000);
  
  console.log('✅ iLm Website initialized successfully');
}); 

// Also run if DOM is already loaded
if (document.readyState !== 'loading') {
  // DOM already loaded, run optimized initialization
  console.log('🚀 Starting optimized initialization (DOM already ready)...');
  
  // Initialize page transitions immediately
  initializePageTransitions();
  
  // Remove any existing floating privacy buttons
  document.querySelectorAll('.floating-privacy-btn').forEach(btn => btn.remove());
  
  // Create and initialize website
  const website = new ILMWebsite();
  window.ilmWebsite = website;
  website.init();
  
  console.log('✅ Optimized initialization complete');
} 