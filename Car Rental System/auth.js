// CHRISMARI Car Rental - Authentication JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  checkAuthStatus();

  // Tab switching
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show/hide forms
      if (targetTab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
      } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
      }
    });
  });

  // Password toggle functionality
  setupPasswordToggles();

  // Login form submission
  const loginFormElement = document.getElementById('loginForm');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', handleLogin);
  }

  // Signup form submission
  const signupFormElement = document.getElementById('signupForm');
  if (signupFormElement) {
    signupFormElement.addEventListener('submit', handleSignup);
  }
});

function setupPasswordToggles() {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const icon = toggle.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember');

  const messageEl = document.getElementById('loginMessage');
  
  // Validate inputs
  if (!email || !password) {
    showMessage(messageEl, 'Please fill in all fields', 'error');
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('chrismari_users') || '[]');
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Create session
    const sessionData = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      loginTime: new Date().toISOString()
    };
    
    if (remember) {
      localStorage.setItem('chrismari_session', JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem('chrismari_session', JSON.stringify(sessionData));
    }
    
    showMessage(messageEl, 'Login successful! Redirecting...', 'success');
    
    // Redirect after short delay
    setTimeout(() => {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectUrl;
    }, 1500);
  } else {
    showMessage(messageEl, 'Invalid email or password. Please try again.', 'error');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const terms = formData.get('terms');

  const messageEl = document.getElementById('signupMessage');
  
  // Validate inputs
  if (!name || !email || !phone || !password || !confirmPassword) {
    showMessage(messageEl, 'Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage(messageEl, 'Password must be at least 6 characters long', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage(messageEl, 'Passwords do not match', 'error');
    return;
  }

  if (!terms) {
    showMessage(messageEl, 'Please agree to the Terms & Conditions', 'error');
    return;
  }

  // Check if email already exists
  const users = JSON.parse(localStorage.getItem('chrismari_users') || '[]');
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    showMessage(messageEl, 'This email is already registered. Please sign in instead.', 'error');
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    phone: phone,
    password: password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('chrismari_users', JSON.stringify(users));

  showMessage(messageEl, 'Account created successfully! Redirecting to login...', 'success');

  // Switch to login tab after delay
  setTimeout(() => {
    document.querySelector('.auth-tab[data-tab="login"]').click();
    document.getElementById('loginEmail').value = email;
    showMessage(document.getElementById('loginMessage'), 'Please sign in with your new account', 'success');
  }, 2000);
}

function showMessage(element, message, type) {
  if (!element) return;
  
  element.textContent = message;
  element.className = `form-message ${type}`;
  element.style.display = 'block';

  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

function checkAuthStatus() {
  const session = localStorage.getItem('chrismari_session') || sessionStorage.getItem('chrismari_session');
  
  if (session) {
    // User is already logged in, redirect to home
    const user = JSON.parse(session);
    console.log('User already logged in:', user.name);
    // Optionally redirect to home page
    // window.location.href = 'index.html';
  }
}

// Export function to check if user is logged in (for other pages)
function isLoggedIn() {
  return !!(localStorage.getItem('chrismari_session') || sessionStorage.getItem('chrismari_session'));
}

function getCurrentUser() {
  const session = localStorage.getItem('chrismari_session') || sessionStorage.getItem('chrismari_session');
  return session ? JSON.parse(session) : null;
}

function logout() {
  localStorage.removeItem('chrismari_session');
  sessionStorage.removeItem('chrismari_session');
  window.location.href = 'index.html';
}

// Make functions available globally
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.logout = logout;

