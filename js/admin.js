// ===================================
// Admin Dashboard JavaScript
// ===================================

// Supabase configuration
const SUPABASE_URL = 'https://nrnbfevlbakvdeaswbbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybmJmZXZsYmFrdmRlYXN3YmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU3MTEsImV4cCI6MjA0OTQxMTcxMX0.iTnguqRP7VCx_H40n7qtzTRVCHT5Ny5NmM0PWNjq_OM';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentSection = 'overview';
let sidebarExpanded = true;

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

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Admin Dashboard - Starting initialization...');
  
  // Check authentication
  const session = await checkAuth();
  if (!session) {
    window.location.href = '/admin.html';
    return;
  }
  
  // Initialize dashboard
  initializeDashboard();
  initializeSidebar();
  
  // Load initial section
  const hash = window.location.hash.slice(1) || 'overview';
  await loadSection(hash);
  
  console.log('✅ Admin Dashboard - Initialization complete');
});

// ===================================
// AUTHENTICATION
// ===================================
async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!session) {
      console.log('❌ No session found, redirecting to login...');
      return null;
    }
    
    // Check if user has admin privileges
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || !profile || profile.role !== 'admin') {
      console.log('❌ User is not an admin, redirecting...');
      await supabase.auth.signOut();
      return null;
    }
    
    console.log('✅ Admin authenticated:', session.user.email);
    return session;
    
  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

// ===================================
// DASHBOARD INITIALIZATION
// ===================================
function initializeDashboard() {
  // Set up event listeners
  setupEventListeners();
  
  // Initialize components
  initializeNotifications();
  initializeSearch();
  
  // Start periodic data refresh
  setInterval(refreshData, 30000);
}

function setupEventListeners() {
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleSidebar);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Search functionality
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleGlobalSearch, 300));
  }
}

// ===================================
// SIDEBAR NAVIGATION
// ===================================
function initializeSidebar() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav button, .sidebar-nav a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) {
        loadSection(section);
      }
    });
  });
}

function toggleSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const main = document.querySelector('.admin-main');
  const toggle = document.getElementById('mobileToggle');
  
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('expanded');
  
  // Update toggle icon
  toggle.innerHTML = sidebar.classList.contains('collapsed') ? '☰' : '✕';
  
  sidebarExpanded = !sidebar.classList.contains('collapsed');
}

// ===================================
// DYNAMIC SECTION LOADING
// ===================================
async function loadSection(sectionName) {
  try {
    console.log(`📄 Loading section: ${sectionName}`);
    
    // Update URL
    window.history.pushState({}, '', `#${sectionName}`);
    
    // Update active state
    updateActiveNavItem(sectionName);
    
    // Show loading state
    const mainContent = document.getElementById('main');
    mainContent.innerHTML = '<div class="loading">Loading...</div>';
    
    // Load section content
    const response = await fetch(`/admin/pages/${sectionName}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load section: ${sectionName}`);
    }
    
    const content = await response.text();
    mainContent.innerHTML = content;
    
    // Initialize section-specific functionality
    initializeSection(sectionName);
    
    currentSection = sectionName;
    
  } catch (error) {
    console.error('❌ Error loading section:', error);
    showNotification(`Error loading section: ${error.message}`, 'error');
    
    // Fallback to overview
    if (sectionName !== 'overview') {
      loadSection('overview');
    }
  }
}

function updateActiveNavItem(sectionName) {
  // Remove active class from all nav items
  document.querySelectorAll('.sidebar-nav button, .sidebar-nav a').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to current item
  const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

function initializeSection(sectionName) {
  switch (sectionName) {
    case 'overview':
      loadDashboardStats();
      break;
    case 'bookings':
      loadApplications();
      break;
    case 'gallery':
      initializeGalleryManagement();
      break;
    case 'users':
      loadStudents();
      initializeStudentManagement();
      break;
    case 'analytics':
      loadAnalyticsData();
      break;
  }
}

// ===================================
// DASHBOARD STATISTICS
// ===================================
async function loadDashboardStats() {
  try {
    // Load application statistics
    const { data: applications, error: appError } = await supabase
      .from('student_applications')
      .select('status');
      
    if (appError) throw appError;
    
    // Update stat cards
    updateStatCard('totalApplications', applications.length);
    updateStatCard('newApplications', applications.filter(a => a.status === 'new').length);
    updateStatCard('pendingReview', applications.filter(a => a.status === 'review').length);
    updateStatCard('approved', applications.filter(a => a.status === 'approved').length);
    
    // Load recent activity
    await loadRecentActivity();
    
  } catch (error) {
    console.error('❌ Error loading dashboard stats:', error);
    showNotification('Error loading dashboard statistics', 'error');
  }
}

function updateStatCard(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value.toString();
  }
}

async function loadRecentActivity() {
  try {
    const { data: activities, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;
    
    activityContainer.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${getActivityIconClass(activity.type)}">
          ${getActivityIcon(activity.type)}
        </div>
        <div class="activity-text">${activity.description}</div>
        <div class="activity-time">${formatTimeAgo(activity.created_at)}</div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('❌ Error loading recent activity:', error);
  }
}

// ===================================
// APPLICATIONS MANAGEMENT
// ===================================
async function loadApplications() {
  try {
    const { data: applications, error } = await supabase
      .from('student_applications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    renderApplicationsTable(applications);
    
  } catch (error) {
    console.error('❌ Error loading applications:', error);
    showNotification('Error loading applications', 'error');
  }
}

function renderApplicationsTable(applications) {
  const container = document.getElementById('applicationsTableContainer');
  if (!container) return;
  
  if (applications.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No applications found.</p></div>';
    return;
  }
  
  const tableHTML = `
    <table class="applications-table">
      <thead>
        <tr>
          <th><input type="checkbox" id="selectAll" onchange="toggleSelectAll()"></th>
          <th>Application ID</th>
          <th>Student Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${applications.map(app => renderApplicationRow(app)).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

function renderApplicationRow(app) {
  return `
    <tr>
      <td><input type="checkbox" class="app-checkbox" value="${app.id}"></td>
      <td>${app.id.slice(0, 8)}...</td>
      <td>${escapeHtml(app.name)}</td>
      <td>${escapeHtml(app.email)}</td>
      <td><span class="status-badge status-${app.status}">${app.status}</span></td>
      <td>${formatDate(app.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-view" onclick="viewApplication('${app.id}')">👁️</button>
          <button class="btn-small btn-edit" onclick="editApplication('${app.id}')">✏️</button>
          <button class="btn-small btn-pdf" onclick="exportApplicationPDF('${app.id}')">📄</button>
          <button class="btn-small btn-delete" onclick="deleteApplication('${app.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `;
}

// ===================================
// GALLERY MANAGEMENT
// ===================================
async function initializeGalleryManagement() {
  await loadGalleryImages();
  await loadGalleryCategories();
  
  // Set up event listeners
  const uploadForm = document.getElementById('imageForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', saveGalleryImage);
  }
}

async function loadGalleryImages() {
  try {
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error) throw error;
    
    renderGalleryGrid(images);
    updateGalleryStats(images);
    
  } catch (error) {
    console.error('❌ Error loading gallery images:', error);
    showNotification('Error loading gallery images', 'error');
  }
}

function renderGalleryGrid(images) {
  const container = document.getElementById('galleryManagementGrid');
  if (!container) return;
  
  if (images.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🖼️</div><p>No images in gallery.</p></div>';
    return;
  }
  
  container.innerHTML = images.map(image => `
    <div class="gallery-item" data-image-id="${image.id}">
      <div class="gallery-image" style="background-image: url('${image.url}')"></div>
      <div class="gallery-info">
        <h4>${escapeHtml(image.title || 'Untitled')}</h4>
        <p>Order: ${image.display_order || 'N/A'}</p>
        <div class="gallery-actions">
          <button class="btn-small btn-edit" onclick="editGalleryImage('${image.id}')">✏️</button>
          <button class="btn-small ${image.is_visible ? 'btn-view' : 'btn-archive'}" 
                  onclick="toggleImageVisibility('${image.id}')">
            ${image.is_visible ? '👁️' : '👁️‍🗨️'}
          </button>
          <button class="btn-small btn-delete" onclick="deleteGalleryImage('${image.id}')">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===================================
// STUDENT MANAGEMENT
// ===================================
async function loadStudents() {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    renderStudentsTable(students);
    
  } catch (error) {
    console.error('❌ Error loading students:', error);
    showStudentsError();
  }
}

function renderStudentsTable(students) {
  const container = document.getElementById('studentsTableContainer');
  if (!container) return;
  
  if (students.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>No students registered yet.</p></div>';
    return;
  }
  
  const tableHTML = `
    <table class="applications-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Room Number</th>
          <th>Registered</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(student => renderStudentRow(student)).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

function renderStudentRow(student) {
  return `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="student-avatar">
            ${student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <span>${escapeHtml(student.name)}</span>
        </div>
      </td>
      <td>${escapeHtml(student.email)}</td>
      <td><span class="status-badge status-approved">${escapeHtml(student.room_number)}</span></td>
      <td>${formatDate(student.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-edit" onclick="editStudent('${student.id}')">✏️</button>
          <button class="btn-small btn-warning" onclick="resetStudentPassword('${student.id}')">🔑</button>
          <button class="btn-small btn-delete" onclick="deleteStudent('${student.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `;
}

// ===================================
// ANALYTICS
// ===================================
async function loadAnalyticsData() {
  try {
    // Load analytics from localStorage
    const analyticsData = JSON.parse(localStorage.getItem('ilm_analytics') || '{}');
    const consentStats = JSON.parse(localStorage.getItem('ilm_consent_stats') || '{}');
    
    // Update overview metrics
    updateOverviewMetrics(analyticsData);
    
    // Update performance data
    updatePerformanceData(analyticsData);
    
    // Update user behavior
    updateUserBehaviorData(analyticsData);
    
    // Update consent statistics
    updateConsentStatistics(consentStats);
    
  } catch (error) {
    console.error('❌ Error loading analytics:', error);
    showNotification('Error loading analytics data', 'error');
  }
}

// ===================================
// UTILITIES
// ===================================
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification') || createNotificationElement();
  
  notification.className = `notification ${type} show`;
  notification.textContent = message;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function createNotificationElement() {
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.className = 'notification';
  document.body.appendChild(notification);
  return notification;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

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

async function handleLogout() {
  try {
    await supabase.auth.signOut();
    window.location.href = '/admin.html';
  } catch (error) {
    console.error('❌ Error logging out:', error);
    showNotification('Error logging out', 'error');
  }
}

// ===================================
// SEARCH
// ===================================
function initializeSearch() {
  // Global search functionality
}

async function handleGlobalSearch(e) {
  const query = e.target.value.trim();
  if (!query) return;
  
  // Search across different entities
  // Implementation depends on requirements
}

// ===================================
// DATA REFRESH
// ===================================
async function refreshData() {
  if (currentSection === 'overview') {
    await loadDashboardStats();
  }
}

// ===================================
// EXPORT FUNCTIONS
// ===================================
window.loadSection = loadSection;
window.showNotification = showNotification;
window.viewApplication = viewApplication;
window.editApplication = editApplication;
window.deleteApplication = deleteApplication;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.resetStudentPassword = resetStudentPassword;
window.editGalleryImage = editGalleryImage;
window.deleteGalleryImage = deleteGalleryImage;
window.toggleImageVisibility = toggleImageVisibility;