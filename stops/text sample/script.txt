const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

toggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Optional: Close sidebar when clicking outside of it on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Dropdown Menu Logic
const notificationIcon = document.getElementById('notification-icon-container');
const userIcon = document.getElementById('user-icon-container');
const notificationDropdown = document.getElementById('notification-dropdown');
const userDropdown = document.getElementById('user-dropdown');

// Function to update notification badge
const updateNotificationBadge = () => {
    const badge = notificationIcon.querySelector('.notification-badge');
    const notificationItems = notificationDropdown.querySelectorAll('.dropdown-item');
    const count = notificationItems.length;

    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex'; // Use flex to center number
        } else {
            badge.style.display = 'none';
        }
    }
};

const setupDropdown = (icon, dropdown) => {
    if (icon && dropdown) {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            // Close other dropdowns
            if (dropdown === notificationDropdown) {
                userDropdown.classList.remove('show');
            } else {
                notificationDropdown.classList.remove('show');
            }
            dropdown.classList.toggle('show');
        });
    }
};

setupDropdown(notificationIcon, notificationDropdown);
setupDropdown(userIcon, userDropdown);

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    if (notificationDropdown && !notificationDropdown.contains(event.target)) {
        notificationDropdown.classList.remove('show');
    }
    if (userDropdown && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
});

// Initial call to set the badge count on page load
document.addEventListener('DOMContentLoaded', updateNotificationBadge);

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Function to apply theme
const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    } else {
        body.classList.remove('dark-mode');
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
    }
};

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.contains('dark-mode');
    if (isDarkMode) {
        localStorage.setItem('theme', 'light');
        applyTheme('light');
    } else {
        localStorage.setItem('theme', 'dark');
        applyTheme('dark');
    }
});

const createRouteContainer = document.getElementById('create-route-container');
const createRouteDropdown = document.getElementById('create-route-dropdown');

setupDropdown(createRouteContainer, createRouteDropdown);

// Buses page specific logic
const createBusBtn = document.getElementById('create-bus-btn');
const createBusForm = document.getElementById('create-bus-form');
const cancelCreateBtn = document.getElementById('cancel-create-btn');

if (createBusBtn && createBusForm && cancelCreateBtn) {
    createBusBtn.addEventListener('click', () => {
        createBusForm.style.display = 'block';
    });

    cancelCreateBtn.addEventListener('click', () => {
        createBusForm.style.display = 'none';
    });
}