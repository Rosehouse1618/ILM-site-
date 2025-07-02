/* ===============================================
   ADMIN DASHBOARD JAVASCRIPT
   =============================================== */

// Global variables and configuration
const SUPABASE_URL = 'https://nrnbfevlbakvdeaswbbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybmJmZXZsYmFrdmRlYXN3YmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTIzODgsImV4cCI6MjA2NDM4ODM4OH0.3V7rTYNwxSsKA0etRgNgxvUgoULmqvppVtmSY9Hzr3M';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Analytics Configuration
window.ANALYTICS_CONFIG = {
  endpoint: 'https://nrnbfevlbakvdeaswbbd.supabase.co/functions/v1/analytics',
  token: 'ilm-analytics-secure-token-2024',
  siteId: 'ilm-student-halls',
  realTimeUpdates: false,
  retryInterval: 30000,
  batchSize: 10
};

window.APP_VERSION = '1.0.0';

// Application state
let applications = [];
let filteredApplications = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentApplicationId = null;
let realtimeSubscription = null;

// Gallery state
let galleryImages = [];
let filteredGalleryImages = [];
let galleryCategories = [];
let selectedGalleryImages = [];
let currentGalleryPage = 1;
let galleryItemsPerPage = 12;

// Document management state
let currentDocuments = [];
let selectedDocuments = new Set();
let currentDocumentView = 'table';
let availableRooms = [];

// Signature canvas state
let isDrawing = false;
let canvas, ctx;
let isReorderMode = false;
let draggedElement = null;

// ===============================================
// DYNAMIC SECTION LOADING
// ===============================================

// Dynamic section loading function for sidebar navigation
async function loadSection(section) {
  console.log(`📄 Loading section: ${section}`);
  
  // Update sidebar active state
  document.querySelectorAll('.sidebar button').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Show loading state
  const main = document.getElementById('main');
  main.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading...</p></div>';
  
  try {
    // Load the corresponding page content
    const response = await fetch(`admin/pages/${section}.html`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${section} page: ${response.status}`);
    }
    
    const content = await response.text();
    main.innerHTML = content;
    
    // Initialize section-specific functionality
    await initializeSection(section);
    
    console.log(`✅ Section ${section} loaded successfully`);
    
  } catch (error) {
    console.error(`❌ Error loading section ${section}:`, error);
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Error Loading Section</h3>
        <p>Could not load the ${section} section. Please try again.</p>
        <button class="btn btn-primary" onclick="loadSection('${section}')">Retry</button>
      </div>
    `;
  }
}

// Initialize section-specific functionality after loading
async function initializeSection(section) {
  switch (section) {
    case 'overview':
      await loadApplications();
      updateStats();
      updateRecentActivity();
      break;
      
    case 'users':
      await loadStudents();
      break;
      
    case 'bookings':
      await loadApplications();
      renderApplicationsTable();
      renderPagination();
      break;
      
    case 'gallery':
      await initializeGallery();
      break;
      
    case 'analytics':
      await initializeAnalytics();
      break;
      
    default:
      console.log(`No specific initialization for section: ${section}`);
  }
}

// Error handling for missing pages
function handlePageError(section) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📄</div>
      <h3>Page Not Found</h3>
      <p>The ${section} page is not available yet.</p>
      <button class="btn btn-secondary" onclick="loadSection('overview')">Go to Overview</button>
    </div>
  `;
}

// ===============================================
// AUTHENTICATION
// ===============================================

async function checkAuthentication() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth check error:', error);
      redirectToLogin();
      return false;
    }
    
    if (!user) {
      console.log('No authenticated user found');
      redirectToLogin();
      return false;
    }
    
    const authorizedEmails = [
      'rosehouse.ilm@outlook.com',
      'ilmstudenthalls@gmail.com'
    ];
    
    if (!authorizedEmails.includes(user.email.toLowerCase())) {
      console.error('❌ Unauthorized email:', user.email);
      await supabase.auth.signOut();
      alert('Your email address is not authorized for admin access.');
      redirectToLogin();
      return false;
    }
    
    console.log('✅ Authenticated admin user:', user.email);
    updateUserInfo(user);
    setupAuthListener();
    
    return true;
    
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    redirectToLogin();
    return false;
  }
}

function redirectToLogin() {
  console.log('🔐 Redirecting to login...');
  localStorage.removeItem('admin_authenticated');
  localStorage.removeItem('admin_email');
  window.location.href = 'admin.html';
}

function updateUserInfo(user) {
  const userEmail = user.email;
  console.log('📧 Logged in as:', userEmail);
}

function setupAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state change:', event, session?.user?.email);
    
    if (event === 'SIGNED_OUT' || !session) {
      console.log('🚪 User signed out, redirecting...');
      redirectToLogin();
    } else if (event === 'SIGNED_IN') {
      console.log('🔑 User signed in:', session.user.email);
      updateUserInfo(session.user);
    }
  });
}

async function logout() {
  try {
    console.log('🚪 Signing out...');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout error:', error);
      showNotification('Error signing out', 'error');
    }
    
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_email');
    
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription);
    }
    
    window.location.href = 'admin.html';
    
  } catch (error) {
    console.error('❌ Logout failed:', error);
    window.location.href = 'admin.html';
  }
}

// ===============================================
// DASHBOARD INITIALIZATION
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Admin Dashboard Initializing...');
  
  // Clear any sample data from localStorage on startup
  const savedApps = localStorage.getItem('ilm_applications');
  if (savedApps) {
    try {
      const parsedApps = JSON.parse(savedApps);
      const isSampleData = parsedApps.some(app => 
        app.email && app.email.includes('example.com')
      );
      if (isSampleData) {
        console.log('🗑️ Clearing sample data on startup');
        localStorage.removeItem('ilm_applications');
      }
    } catch (e) {
      console.log('🗑️ Clearing invalid localStorage data');
      localStorage.removeItem('ilm_applications');
    }
  }
  
  initializeDashboard();
  initializeNotifications();
  
  // Load default section (overview)
  setTimeout(() => {
    loadSection('overview');
  }, 500);
});

async function initializeDashboard() {
  try {
    if (!await checkAuthentication()) {
      return;
    }
    
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('applications').select('count', { count: 'exact', head: true });
    if (error && error.code === '42P01') {
      await createApplicationsTable();
    } else if (error) {
      console.error('❌ Supabase connection error:', error);
      showNotification('Database connection failed. Trying to load applications anyway...', 'warning');
    }
    
    console.log('✅ Supabase connected successfully');
    
    await loadApplications();
    
    setTimeout(() => {
      try {
        setupRealTimeUpdates();
      } catch (error) {
        console.warn('⚠️ Real-time setup failed, continuing without it:', error);
      }
    }, 1000);
    
    console.log('✅ Admin dashboard initialized with Supabase');
    
  } catch (error) {
    console.error('❌ Dashboard initialization error:', error);
    showNotification('Failed to initialize dashboard. Trying alternative loading...', 'warning');
    
    try {
      await loadApplications();
    } catch (loadError) {
      console.error('❌ Failed to load applications, using fallback:', loadError);
      await loadApplicationsFromLocalStorage();
    }
  }
}

// ===============================================
// APPLICATIONS MANAGEMENT
// ===============================================

async function loadApplications() {
  try {
    showLoading();
    
    console.log('📊 Loading applications from Supabase...');
    
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('submission_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    applications = data.map(app => ({
      id: app.id,
      firstName: app.first_name || '',
      lastName: app.last_name || '',
      email: app.email || '',
      phone: app.phone || '',
      dateOfBirth: app.date_of_birth || '',
      gender: app.gender || '',
      nationality: app.nationality || '',
      university: app.university || '',
      courseOfStudy: app.course_of_study || '',
      yearOfStudy: app.year_of_study || '',
      roomType: app.room_type || '',
      checkInDate: app.check_in_date || '',
      contractLength: app.contract_length || '',
      status: app.status || 'new',
      submissionDate: app.submission_date || app.created_at,
      homeAddress: app.home_address || '',
      roomPreferences: app.room_preferences || '',
      dietaryRequirements: app.dietary_requirements || '',
      medicalConditions: app.medical_conditions || '',
      referenceName: app.reference_name || '',
      referenceEmail: app.reference_email || '',
      referenceTelephone: app.reference_telephone || '',
      guarantorName: app.guarantor_name || '',
      guarantorEmail: app.guarantor_email || '',
      guarantorTelephone: app.guarantor_telephone || '',
      emergencyName: app.emergency_name || '',
      emergencyPhone: app.emergency_phone || '',
      emergencyEmail: app.emergency_email || '',
      parkingRequired: app.parking_required || false,
      additionalInfo: app.additional_info || '',
      notes: app.notes || '',
      lastModified: app.last_modified || app.created_at,
      createdAt: app.created_at
    }));
    
    filteredApplications = [...applications];
    updateStats();
    renderApplicationsTable();
    renderPagination();
    updateRecentActivity();
    
    console.log(`📊 Loaded ${applications.length} applications from Supabase`);
    if (applications.length === 0) {
      showNotification('No applications found in database', 'info');
    } else {
      showNotification(`Loaded ${applications.length} applications`, 'success');
    }
    
  } catch (error) {
    console.error('❌ Error loading applications:', error);
    
    if (error.code === '42P01') {
      console.log('📋 Applications table not found, showing empty state');
      applications = [];
      filteredApplications = [];
      updateStats();
      renderApplicationsTable();
      renderPagination();
      updateRecentActivity();
      showNotification('Applications table not found. Please run the database setup.', 'warning');
    } else {
      console.log('📱 Loading from localStorage as fallback...');
      console.error('❌ Database error:', error);
      showNotification(`Database error: ${error.message}. Loading offline data.`, 'warning');
      await loadApplicationsFromLocalStorage();
    }
  }
}

async function loadApplicationsFromLocalStorage() {
  console.log('📱 Loading from localStorage as fallback...');
  const savedApplications = localStorage.getItem('ilm_applications');
  
  if (savedApplications) {
    const parsedApps = JSON.parse(savedApplications);
    
    const isSampleData = parsedApps.some(app => 
      app.email && app.email.includes('example.com')
    );
    
    if (isSampleData) {
      console.log('🗑️ Clearing sample data from localStorage');
      localStorage.removeItem('ilm_applications');
      
      applications = [];
      filteredApplications = [];
      updateStats();
      renderApplicationsTable();
      renderPagination();
      updateRecentActivity();
      showNotification('No applications found. Database connection required.', 'warning');
    } else {
      applications = parsedApps;
      filteredApplications = [...applications];
      updateStats();
      renderApplicationsTable();
      renderPagination();
      updateRecentActivity();
      showNotification('Loaded offline data', 'info');
    }
  } else {
    applications = [];
    filteredApplications = [];
    updateStats();
    renderApplicationsTable();
    renderPagination();
    updateRecentActivity();
    showNotification('No applications found. Please check database connection.', 'warning');
  }
}

function updateStats() {
  const total = applications.length;
  const newToday = applications.filter(app => {
    const today = new Date().toDateString();
    return new Date(app.submissionDate).toDateString() === today;
  }).length;
  const pending = applications.filter(app => app.status === 'new' || app.status === 'review').length;
  const approved = applications.filter(app => app.status === 'approved').length;

  const totalEl = document.getElementById('totalApplications');
  const newEl = document.getElementById('newApplications');
  const pendingEl = document.getElementById('pendingApplications');
  const approvedEl = document.getElementById('approvedApplications');

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newToday;
  if (pendingEl) pendingEl.textContent = pending;
  if (approvedEl) approvedEl.textContent = approved;
}

function renderApplicationsTable() {
  const tbody = document.getElementById('applicationsTableBody');
  if (!tbody) return;
  
  if (filteredApplications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div>No applications found</div>
        </td>
      </tr>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageApplications = filteredApplications.slice(startIndex, endIndex);

  tbody.innerHTML = pageApplications.map(app => `
    <tr>
      <td><input type="checkbox" class="select-checkbox" data-id="${app.id}" onchange="updateBulkActions()"></td>
      <td><strong>${app.id}</strong></td>
      <td>${app.firstName} ${app.lastName}</td>
      <td><a href="mailto:${app.email}">${app.email}</a></td>
      <td>${getUniversityName(app.university)}</td>
      <td>${getRoomTypeName(app.roomType)}</td>
      <td><span class="status-badge status-${app.status}">${getStatusName(app.status)}</span></td>
      <td>${formatDate(app.submissionDate)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-view" onclick="viewApplication('${app.id}')">👁️ View</button>
          <button class="btn-small btn-edit" onclick="editApplication('${app.id}')">✏️ Edit</button>
          <button class="btn-small btn-pdf" onclick="downloadApplicationPDF('${app.id}')">📄 PDF</button>
          <button class="btn-small btn-delete" onclick="deleteApplication('${app.id}')">🗑️ Delete</button>
          <button class="btn-small btn-archive" onclick="archiveApplication('${app.id}')">📦 Archive</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let paginationHTML = '';
  
  if (currentPage > 1) {
    paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
  }
  
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    paginationHTML += `<button class="${activeClass}" onclick="changePage(${i})">${i}</button>`;
  }
  
  if (currentPage < totalPages) {
    paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
  }
  
  pagination.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  renderApplicationsTable();
  renderPagination();
}

function filterApplications() {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const universityFilter = document.getElementById('universityFilter');

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const statusFilterValue = statusFilter ? statusFilter.value : '';
  const universityFilterValue = universityFilter ? universityFilter.value : '';

  filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.firstName.toLowerCase().includes(searchTerm) ||
      app.lastName.toLowerCase().includes(searchTerm) ||
      app.email.toLowerCase().includes(searchTerm) ||
      app.id.toLowerCase().includes(searchTerm);
    
    const matchesStatus = !statusFilterValue || app.status === statusFilterValue;
    const matchesUniversity = !universityFilterValue || app.university === universityFilterValue;

    return matchesSearch && matchesStatus && matchesUniversity;
  });

  currentPage = 1;
  renderApplicationsTable();
  renderPagination();
}

function refreshApplications() {
  showNotification('Refreshing applications...', 'info');
  loadApplications();
}

// ===============================================
// GALLERY MANAGEMENT
// ===============================================

async function initializeGallery() {
  try {
    console.log('🖼️ Initializing gallery management...');
    
    await loadGalleryCategories();
    await loadGalleryImages();
    
    console.log('✅ Gallery management initialized');
    
  } catch (error) {
    console.error('❌ Gallery initialization error:', error);
    showNotification('Failed to initialize gallery. Please refresh the page.', 'error');
  }
}

async function loadGalleryCategories() {
  try {
    console.log('📁 Loading gallery categories from Supabase...');
    
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;

    galleryCategories = data || [];
    updateCategoryDropdowns();
    updateCategoryStats();
    
    console.log(`📁 Loaded ${galleryCategories.length} categories`);
    
  } catch (error) {
    console.error('❌ Error loading categories:', error);
    showNotification(`Error loading categories: ${error.message}`, 'error');
  }
}

// ===============================================
// DOCUMENT MANAGEMENT
// ===============================================

async function initializeDocumentManagement() {
  try {
    const documentUploadForm = document.getElementById('documentUploadForm');
    if (documentUploadForm) {
      documentUploadForm.addEventListener('submit', handleDocumentUpload);
    }
    
    const isSharedDocumentEl = document.getElementById('isSharedDocument');
    if (isSharedDocumentEl) {
      isSharedDocumentEl.addEventListener('change', function() {
        const roomNumberGroup = document.getElementById('roomNumberGroup');
        const roomNumberInput = document.getElementById('roomNumber');
        
        if (this.checked) {
          roomNumberGroup.style.display = 'none';
          roomNumberInput.required = false;
          roomNumberInput.value = '';
        } else {
          roomNumberGroup.style.display = 'block';
          roomNumberInput.required = true;
        }
      });
    }
    
    await loadDocuments();
    
  } catch (error) {
    console.error('❌ Document management initialization error:', error);
  }
}

// ===============================================
// STUDENTS MANAGEMENT
// ===============================================

async function loadStudents() {
  try {
    console.log('👥 Loading students...');
    
    const { data, error } = await supabase
      .from('student_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`👥 Loaded ${data?.length || 0} students`);
    renderStudentsTable(data || []);
    
  } catch (error) {
    console.error('❌ Error loading students:', error);
    showNotification(`Error loading students: ${error.message}`, 'error');
  }
}

function renderStudentsTable(students) {
  const container = document.getElementById('studentsTableContainer');
  if (!container) return;

  if (students.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>No students registered yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="applications-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Room Number</th>
          <th>Registration Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(student => `
          <tr>
            <td>${student.full_name || 'N/A'}</td>
            <td>${student.email}</td>
            <td>${student.room_number || 'N/A'}</td>
            <td>${formatDate(student.created_at)}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-small btn-view" onclick="viewStudent('${student.id}')">👁️ View</button>
                <button class="btn-small btn-edit" onclick="editStudent('${student.id}')">✏️ Edit</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ===============================================
// ANALYTICS
// ===============================================

async function initializeAnalytics() {
  try {
    console.log('📊 Initializing analytics...');
    
    // Load analytics data
    await loadAnalyticsData();
    
    console.log('✅ Analytics initialized');
    
  } catch (error) {
    console.error('❌ Analytics initialization error:', error);
    showNotification('Failed to initialize analytics', 'error');
  }
}

async function loadAnalyticsData() {
  // This would load actual analytics data in production
  console.log('📊 Loading analytics data...');
  
  // Update analytics cards with dummy data for now
  updateAnalyticsCards();
}

function updateAnalyticsCards() {
  const activeVisitors = document.getElementById('activeVisitors');
  const avgPageTime = document.getElementById('avgPageTime');
  const conversionRate = document.getElementById('conversionRate');
  const privacyConsent = document.getElementById('privacyConsent');

  if (activeVisitors) activeVisitors.textContent = '42';
  if (avgPageTime) avgPageTime.textContent = '2m 34s';
  if (conversionRate) conversionRate.textContent = '12.5%';
  if (privacyConsent) privacyConsent.textContent = '94%';
}

// ===============================================
// REAL-TIME UPDATES
// ===============================================

function setupRealTimeUpdates() {
  console.log('📡 Setting up real-time updates...');
  
  realtimeSubscription = supabase
    .channel('applications_channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'applications' 
      }, 
      async (payload) => {
        console.log('🔄 Real-time update received:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            await handleNewApplication(payload.new);
            break;
          case 'UPDATE':
            await handleApplicationUpdate(payload.new);
            break;
          case 'DELETE':
            await handleApplicationDelete(payload.old);
            break;
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscription active');
        showNotification('Real-time updates enabled', 'success');
      } else if (status === 'CHANNEL_ERROR') {
        console.warn('⚠️ Real-time subscription error, continuing without real-time updates');
      }
    });
}

async function handleNewApplication(newApp) {
  console.log('📝 New application received:', newApp.id);
  
  const formattedApp = formatApplicationFromDB(newApp);
  applications.unshift(formattedApp);
  
  filteredApplications = [...applications];
  updateStats();
  renderApplicationsTable();
  renderPagination();
  updateRecentActivity();
  
  const message = `New application from ${formattedApp.firstName} ${formattedApp.lastName}`;
  showNotification(message, 'success');
  
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('New Student Application', {
      body: `${formattedApp.firstName} ${formattedApp.lastName} has submitted an application`,
      icon: 'https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748189942/web-app-manifest-192x192_wr5wdr.png',
      badge: 'https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748189942/web-app-manifest-192x192_wr5wdr.png',
      tag: `application-${formattedApp.id}`,
      requireInteraction: isMobileDevice()
    });
    
    notification.onclick = function() {
      window.focus();
      viewApplication(formattedApp.id);
      notification.close();
    };
    
    if (!isMobileDevice()) {
      setTimeout(() => notification.close(), 10000);
    }
  }
}

async function handleApplicationUpdate(updatedApp) {
  console.log('✏️ Application updated:', updatedApp.id);
  
  const index = applications.findIndex(app => app.id === updatedApp.id);
  if (index !== -1) {
    applications[index] = formatApplicationFromDB(updatedApp);
    
    filteredApplications = [...applications];
    updateStats();
    renderApplicationsTable();
    updateRecentActivity();
  }
}

async function handleApplicationDelete(deletedApp) {
  console.log('🗑️ Application deleted:', deletedApp.id);
  
  applications = applications.filter(app => app.id !== deletedApp.id);
  
  filteredApplications = [...applications];
  updateStats();
  renderApplicationsTable();
  renderPagination();
  updateRecentActivity();
}

function formatApplicationFromDB(dbApp) {
  return {
    id: dbApp.id,
    firstName: dbApp.first_name || '',
    lastName: dbApp.last_name || '',
    email: dbApp.email || '',
    phone: dbApp.phone || '',
    dateOfBirth: dbApp.date_of_birth || '',
    gender: dbApp.gender || '',
    nationality: dbApp.nationality || '',
    university: dbApp.university || '',
    courseOfStudy: dbApp.course_of_study || '',
    yearOfStudy: dbApp.year_of_study || '',
    roomType: dbApp.room_type || '',
    checkInDate: dbApp.check_in_date || '',
    contractLength: dbApp.contract_length || '',
    status: dbApp.status || 'new',
    submissionDate: dbApp.submission_date || dbApp.created_at,
    homeAddress: dbApp.home_address || '',
    roomPreferences: dbApp.room_preferences || '',
    dietaryRequirements: dbApp.dietary_requirements || '',
    medicalConditions: dbApp.medical_conditions || '',
    referenceName: dbApp.reference_name || '',
    referenceEmail: dbApp.reference_email || '',
    referenceTelephone: dbApp.reference_telephone || '',
    guarantorName: dbApp.guarantor_name || '',
    guarantorEmail: dbApp.guarantor_email || '',
    guarantorTelephone: dbApp.guarantor_telephone || '',
    emergencyName: dbApp.emergency_name || '',
    emergencyPhone: dbApp.emergency_phone || '',
    emergencyEmail: dbApp.emergency_email || '',
    parkingRequired: dbApp.parking_required || false,
    additionalInfo: dbApp.additional_info || '',
    notes: dbApp.notes || '',
    lastModified: dbApp.last_modified || dbApp.created_at,
    createdAt: dbApp.created_at
  };
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
  }, 3000);
}

function showLoading() {
  const tbody = document.getElementById('applicationsTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="loading">
          Loading applications...
        </td>
      </tr>
    `;
  }
}

async function initializeNotifications() {
  try {
    if ('Notification' in window) {
      console.log('🔔 Browser notifications supported');
      
      if (Notification.permission === 'default') {
        if (isMobileDevice()) {
          const permission = await Notification.requestPermission();
          console.log('📱 Mobile notification permission:', permission);
          
          if (permission === 'granted') {
            showNotification('Mobile notifications enabled!', 'success');
            
            setTimeout(() => {
              if (Notification.permission === 'granted') {
                new Notification('iLm Admin Dashboard', {
                  body: 'Mobile notifications are now active',
                  icon: 'https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748189942/web-app-manifest-192x192_wr5wdr.png',
                  badge: 'https://res.cloudinary.com/dq8l3fhb2/image/upload/v1748189942/web-app-manifest-192x192_wr5wdr.png',
                  tag: 'admin-test',
                  requireInteraction: false
                });
              }
            }, 2000);
          }
        }
      } else if (Notification.permission === 'granted') {
        console.log('✅ Notification permission already granted');
      }
    }
    
  } catch (error) {
    console.error('❌ Notification initialization error:', error);
  }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
         window.innerWidth <= 768;
}

// ===============================================
// RECENT ACTIVITY
// ===============================================

function updateRecentActivity() {
  const activityList = document.getElementById('recentActivityList');
  if (!activityList) return;
  
  const recentApps = applications
    .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
    .slice(0, 5);

  activityList.innerHTML = recentApps.map(app => `
    <div class="activity-item">
      <div class="activity-icon activity-new">📝</div>
      <div class="activity-text">New application from ${app.firstName} ${app.lastName}</div>
      <div class="activity-time">${getTimeAgo(app.submissionDate)}</div>
    </div>
  `).join('');
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB');
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getUniversityName(code) {
  const universities = {
    'abertay': 'Abertay University',
    'dundee': 'University of Dundee',
    'al-makhtoum': 'Al Makhtoum Institute',
    'st-andrews': 'St Andrews University',
    'dundee-angus-college': 'Dundee & Angus College',
    'other': 'Other'
  };
  return universities[code] || code;
}

function getRoomTypeName(code) {
  const roomTypes = {
    'single-no-wc': 'Single – no WC (£160/week)',
    'single-with-wc': 'Single – with WC (£165/week)',
    'single-en-suite': 'Single – en-suite (£190/week)',
    'double-with-wc': 'Double – with WC (£190/week)'
  };
  return roomTypes[code] || code;
}

function getStatusName(code) {
  const statuses = {
    'new': 'New',
    'review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'archived': 'Archived'
  };
  return statuses[code] || code;
}

// ===============================================
// GLOBAL ERROR HANDLING
// ===============================================

window.addEventListener('beforeunload', () => {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription);
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
  showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Export functions for global access
window.loadSection = loadSection;
window.logout = logout;
window.showNotification = showNotification;
window.filterApplications = filterApplications;
window.refreshApplications = refreshApplications;
window.updateBulkActions = updateBulkActions;
window.changePage = changePage;