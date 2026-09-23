// Format date to readable format
function formatDate(dateString, short = false) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    if (short) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}
// Format time ago (e.g. "2 hours ago")
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return 'Just now';
}

// Format file size to readable format
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get current month name and year
function getCurrentMonth() {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
}

// Generate calendar days HTML
function generateCalendarDays(events = []) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startGap = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const totalDays = lastDay.getDate();
    
    let calendarHTML = '';
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startGap; i++) {
        calendarHTML += `<div></div>`;
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(today.getFullYear(), today.getMonth(), day);
        const isToday = day === today.getDate();
        
        // Check if there are events on this day
        const hasEvent = events.some(event => {
            const eventDate = new Date(event.dueDate);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
        });
        
        if (isToday) {
            calendarHTML += `<div class="h-8 flex items-center justify-center rounded-full bg-primary text-white">${day}</div>`;
        } else if (hasEvent) {
            calendarHTML += `<div class="h-8 flex items-center justify-center relative">
                ${day}
                <span class="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></span>
            </div>`;
        } else {
            calendarHTML += `<div class="h-8 flex items-center justify-center">${day}</div>`;
        }
    }
    
    return calendarHTML;
}

// Default profile picture URL (clean, high-resolution, universal avatar)
const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';
window.DEFAULT_PROFILE_IMAGE = DEFAULT_PROFILE_IMAGE;

// Get profile image URL
function getProfileImageUrl(user) {
    const API_BASE_URL = window.API_BASE_URL || 'https://project1-1bz0.onrender.com';
    
    // Return default if no user
    if (!user) return DEFAULT_PROFILE_IMAGE;

    // If string passed directly (e.g. image path or ID)
    if (typeof user === 'string') {
        if (user.startsWith('http://') || user.startsWith('https://')) return user;
        if (user.startsWith('/uploads/')) return `${API_BASE_URL}${user}`;
        if (user.includes('.') && user !== 'default.jpg' && user !== 'default.png') {
            return `${API_BASE_URL}/uploads/profile/${user}`;
        }
        return DEFAULT_PROFILE_IMAGE;
    }
    
    // Check if user has a custom profile picture
    if (user.profilePicture && user.profilePicture !== 'default.jpg' && user.profilePicture !== 'default.png') {
        // If it's a full URL (external image), use it directly
        if (user.profilePicture.startsWith('http://') || user.profilePicture.startsWith('https://')) {
            return user.profilePicture;
        }
        
        if (user.profilePicture.startsWith('/uploads/')) {
            return `${API_BASE_URL}${user.profilePicture}`;
        }
        
        // For uploaded files, use the backend server URL
        return `${API_BASE_URL}/uploads/profile/${user.profilePicture}`;
    }
    
    // Return default profile image
    return DEFAULT_PROFILE_IMAGE;
}

// Global fallback handler for avatar/profile images that fail to load
window.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'IMG') {
        const img = e.target;
        if (img.dataset.fallbackApplied) return;
        
        const isProfileImg = img.classList.contains('rounded-full') ||
            (img.id && (img.id.toLowerCase().includes('profile') || img.id.toLowerCase().includes('avatar'))) ||
            (img.alt && (img.alt.toLowerCase().includes('profile') || img.alt.toLowerCase().includes('instructor') || img.alt.toLowerCase().includes('student') || img.alt.toLowerCase().includes('user'))) ||
            img.src.includes('uploads/profile') ||
            img.src.includes('default.jpg') ||
            img.src.includes('picsum.photos');

        if (isProfileImg && img.src !== DEFAULT_PROFILE_IMAGE) {
            img.dataset.fallbackApplied = 'true';
            img.src = DEFAULT_PROFILE_IMAGE;
        }
    }
}, true);

// Capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

