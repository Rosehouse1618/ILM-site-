/* ===============================================
   MAIN SITE JAVASCRIPT
   =============================================== */

// Booking form functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Main site JavaScript initialized');
  
  // Initialize booking form if it exists
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    initializeBookingForm();
  }
  
  // Initialize animations
  initializeAnimations();
  
  // Initialize mobile menu
  initializeMobileMenu();
  
  // Initialize gallery if it exists
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    initializeGallery();
  }
});

// ===============================================
// BOOKING FORM FUNCTIONALITY
// ===============================================

function initializeBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  
  console.log('📝 Initializing booking form...');
  
  // Add form validation
  form.addEventListener('submit', handleBookingSubmission);
  
  // Add real-time validation
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });
  
  // Room type selection
  const roomTypeInputs = form.querySelectorAll('input[name="roomType"]');
  roomTypeInputs.forEach(input => {
    input.addEventListener('change', updateRoomTypeDisplay);
  });
  
  // University selection
  const universitySelect = form.querySelector('select[name="university"]');
  if (universitySelect) {
    universitySelect.addEventListener('change', handleUniversityChange);
  }
  
  console.log('✅ Booking form initialized');
}

async function handleBookingSubmission(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Show loading state
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;
  
  try {
    // Validate form
    if (!validateForm(form)) {
      throw new Error('Please fix the errors in the form');
    }
    
    // Collect form data
    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData.entries());
    
    // Add metadata
    bookingData.submissionDate = new Date().toISOString();
    bookingData.id = generateApplicationId();
    
    console.log('📝 Submitting booking:', bookingData);
    
    // Submit to Supabase (if available) or localStorage fallback
    await submitBooking(bookingData);
    
    // Redirect to success page
    window.location.href = 'booking-success.html';
    
  } catch (error) {
    console.error('❌ Booking submission error:', error);
    showNotification(error.message || 'Failed to submit booking. Please try again.', 'error');
    
    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

async function submitBooking(bookingData) {
  // Try Supabase first if available
  if (typeof supabase !== 'undefined') {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([convertToDBFormat(bookingData)]);
      
      if (error) throw error;
      
      console.log('✅ Booking submitted to Supabase');
      return;
    } catch (error) {
      console.warn('⚠️ Supabase submission failed, using localStorage fallback:', error);
    }
  }
  
  // Fallback to localStorage
  const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  existingBookings.push(bookingData);
  localStorage.setItem('bookings', JSON.stringify(existingBookings));
  
  console.log('📱 Booking saved to localStorage');
}

function convertToDBFormat(bookingData) {
  return {
    id: bookingData.id,
    first_name: bookingData.firstName,
    last_name: bookingData.lastName,
    email: bookingData.email,
    phone: bookingData.phone,
    date_of_birth: bookingData.dateOfBirth,
    gender: bookingData.gender,
    nationality: bookingData.nationality,
    university: bookingData.university,
    course_of_study: bookingData.courseOfStudy,
    year_of_study: bookingData.yearOfStudy,
    room_type: bookingData.roomType,
    check_in_date: bookingData.checkInDate,
    contract_length: bookingData.contractLength,
    status: 'new',
    submission_date: bookingData.submissionDate,
    home_address: bookingData.homeAddress,
    room_preferences: bookingData.roomPreferences,
    dietary_requirements: bookingData.dietaryRequirements,
    medical_conditions: bookingData.medicalConditions,
    reference_name: bookingData.referenceName,
    reference_email: bookingData.referenceEmail,
    reference_telephone: bookingData.referenceTelephone,
    guarantor_name: bookingData.guarantorName,
    guarantor_email: bookingData.guarantorEmail,
    guarantor_telephone: bookingData.guarantorTelephone,
    emergency_name: bookingData.emergencyName,
    emergency_phone: bookingData.emergencyPhone,
    emergency_email: bookingData.emergencyEmail,
    parking_required: bookingData.parkingRequired === 'on',
    additional_info: bookingData.additionalInfo
  };
}

function generateApplicationId() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `APP-${year}-${timestamp}`;
}

// ===============================================
// FORM VALIDATION
// ===============================================

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  inputs.forEach(input => {
    if (!validateField({ target: input })) {
      isValid = false;
    }
  });
  
  return isValid;
}

function validateField(event) {
  const field = event.target;
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Clear previous errors
  clearFieldError(event);
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    errorMessage = 'This field is required';
    isValid = false;
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errorMessage = 'Please enter a valid email address';
      isValid = false;
    }
  }
  
  // Phone validation
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value) || value.length < 10) {
      errorMessage = 'Please enter a valid phone number';
      isValid = false;
    }
  }
  
  // Date validation
  if (field.type === 'date' && value) {
    const selectedDate = new Date(value);
    const today = new Date();
    
    if (field.name === 'dateOfBirth') {
      const minAge = 16;
      const maxAge = 100;
      const age = (today - selectedDate) / (365.25 * 24 * 60 * 60 * 1000);
      
      if (age < minAge || age > maxAge) {
        errorMessage = 'Please enter a valid date of birth';
        isValid = false;
      }
    }
    
    if (field.name === 'checkInDate') {
      if (selectedDate < today) {
        errorMessage = 'Check-in date cannot be in the past';
        isValid = false;
      }
    }
  }
  
  // Show error if validation failed
  if (!isValid) {
    showFieldError(field, errorMessage);
  }
  
  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(event) {
  const field = event.target;
  field.classList.remove('error');
  
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// ===============================================
// ROOM TYPE FUNCTIONALITY
// ===============================================

function updateRoomTypeDisplay() {
  const selectedRoomType = document.querySelector('input[name="roomType"]:checked');
  if (!selectedRoomType) return;
  
  const roomTypeCards = document.querySelectorAll('.room-type-card');
  roomTypeCards.forEach(card => {
    card.classList.remove('selected');
  });
  
  const selectedCard = selectedRoomType.closest('.room-type-card');
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
  
  // Update pricing display if exists
  updatePricingDisplay(selectedRoomType.value);
}

function updatePricingDisplay(roomType) {
  const pricingElement = document.getElementById('selectedRoomPrice');
  if (!pricingElement) return;
  
  const prices = {
    'single-no-wc': '£160/week',
    'single-with-wc': '£165/week',
    'single-en-suite': '£190/week',
    'double-with-wc': '£190/week'
  };
  
  pricingElement.textContent = prices[roomType] || '';
}

function handleUniversityChange(event) {
  const universitySelect = event.target;
  const otherUniversityField = document.getElementById('otherUniversity');
  
  if (universitySelect.value === 'other') {
    if (otherUniversityField) {
      otherUniversityField.style.display = 'block';
      otherUniversityField.querySelector('input').required = true;
    }
  } else {
    if (otherUniversityField) {
      otherUniversityField.style.display = 'none';
      otherUniversityField.querySelector('input').required = false;
      otherUniversityField.querySelector('input').value = '';
    }
  }
}

// ===============================================
// ANIMATIONS
// ===============================================

function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe elements with animation classes
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right');
  animatedElements.forEach(el => observer.observe(el));
  
  // Smooth scrolling for anchor links
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', handleSmoothScroll);
  });
}

function handleSmoothScroll(event) {
  event.preventDefault();
  
  const targetId = event.target.getAttribute('href');
  const targetElement = document.querySelector(targetId);
  
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// ===============================================
// MOBILE MENU
// ===============================================

function initializeMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.classList.add('menu-open');
    });
  }
  
  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  }
  
  // Close menu when clicking on a link
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    }
  });
}

// ===============================================
// GALLERY FUNCTIONALITY
// ===============================================

function initializeGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  
  let currentImageIndex = 0;
  const images = Array.from(galleryItems).map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt || '',
    title: item.dataset.title || ''
  }));
  
  // Open lightbox when clicking on gallery items
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentImageIndex = index;
      openLightbox();
    });
  });
  
  // Close lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }
  
  // Navigation
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      updateLightboxImage();
    });
  }
  
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      updateLightboxImage();
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (event) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
        break;
      case 'ArrowRight':
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
        break;
    }
  });
  
  function openLightbox() {
    if (lightbox) {
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateLightboxImage();
    }
  }
  
  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  function updateLightboxImage() {
    if (lightboxImg && images[currentImageIndex]) {
      const image = images[currentImageIndex];
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
      
      // Update counter if exists
      const counter = lightbox.querySelector('.lightbox-counter');
      if (counter) {
        counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
      }
      
      // Update title if exists
      const title = lightbox.querySelector('.lightbox-title');
      if (title) {
        title.textContent = image.title;
      }
    }
  }
}

// ===============================================
// NOTIFICATIONS
// ===============================================

function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

// ===============================================
// UTILITIES
// ===============================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ===============================================
// CONTACT FORM (if exists)
// ===============================================

function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = Object.fromEntries(formData.entries());
    
    try {
      // Here you would normally send to a backend service
      console.log('Contact form submitted:', contactData);
      showNotification('Thank you for your message! We will get back to you soon.', 'success');
      contactForm.reset();
    } catch (error) {
      console.error('Contact form error:', error);
      showNotification('Failed to send message. Please try again.', 'error');
    }
  });
}

// ===============================================
// PERFORMANCE OPTIMIZATIONS
// ===============================================

// Lazy loading for images
function initializeLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy');
          imageObserver.unobserve(image);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
}

// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLazyLoading);
} else {
  initializeLazyLoading();
}

// Initialize contact form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
  initializeContactForm();
}

// Export functions for global access
window.showNotification = showNotification;
window.updateRoomTypeDisplay = updateRoomTypeDisplay;
window.handleUniversityChange = handleUniversityChange;