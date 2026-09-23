
// DOM Elements
const appContainer = document.getElementById('appContainer');
const content = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const modalBackdrop = document.getElementById('modalBackdrop');
const mobileHeader = document.getElementById('mobileHeader');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const navLinks = document.querySelectorAll('.nav-link');
const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
const desktopDarkModeBtn = document.getElementById('desktopDarkModeBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Add to your main.js - code that runs when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check for course join links in URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinToken = urlParams.get('join');

    if (joinToken) {
        // Clear the URL parameter to prevent repeated join attempts on refresh
        window.history.replaceState({}, document.title, window.location.pathname);

        // Process the join token after a slight delay to ensure auth is loaded
        setTimeout(() => {
            processCourseJoinLink(joinToken);
        }, 1000);
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage && errorMessage.textContent.includes("Session expired")) {
        // Redirect to login page
        window.location.href = '/login';
    }
});

// Remove the item from localStorage to prevent repeated messages
// Function to process a course join link
async function processCourseJoinLink(token) {
    try {
        // Show loading indicator
        showToast('Processing enrollment link...', 'info');

        // Call the API to join the course
        const response = await courseLinkService.joinViaLink(token);

        // Handle successful join
        showToast('Successfully enrolled in course!', 'success');

        // Redirect to the joined course
        if (response.data && response.data.course) {
            loadView('course-detail', { courseId: response.data.course._id });
        } else {
            loadView('courses');
        }
    } catch (error) {
        console.error('Error joining course via link:', error);
        showToast(error.message || 'Failed to join course. The link may be invalid or expired.', 'error');
        loadView('courses');
    }
}



// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();

    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
});

// Initialize app
async function initializeApp() {
    const joinToken = new URLSearchParams(window.location.search).get('token');


    if (!await checkAuth()) {
        // Save pending join token if not logged in
        if (joinToken) {
            localStorage.setItem('pendingJoinToken', joinToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        loadLoginPage();
        return;
    }
    setupEventListeners();

    // Initialize language support
    initializeLanguage();

    // Initialize accessibility settings
    initializeAccessibilitySettings();

    // Load appropriate view based on URL params or default to dashboard
    loadView('dashboard');


    // Initialize theme based on system preference or saved setting
    initializeTheme();

    // User is authenticated; update UI
    updateUserInfo();

    // If there's a pending join token (either from URL or local storage), process it
    const tokenToJoin = joinToken || localStorage.getItem('pendingJoinToken');
    if (tokenToJoin) {
        window.history.replaceState({}, document.title, window.location.pathname);
        await joinCourseViaLink(tokenToJoin);
        localStorage.removeItem('pendingJoinToken');
    } else {
        loadView('dashboard');
    }
}

function initializeTheme() {
    const followSystem = localStorage.getItem('followSystemTheme') !== 'false';
    const savedTheme = localStorage.getItem('theme');

    if (followSystem) {
        // Use system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Listen for changes in system preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    } else if (savedTheme) {
        // Use saved preference
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}

/**
 * Initialize accessibility settings
 */
function initializeAccessibilitySettings() {
    // Apply text size
    const textSize = localStorage.getItem('textSize') || '100';
    document.documentElement.style.fontSize = `${textSize}%`;

    // Apply reduce motion setting
    if (localStorage.getItem('reduceMotion') === 'true') {
        document.documentElement.classList.add('reduce-motion');
    }

    // Apply high contrast setting
    if (localStorage.getItem('highContrast') === 'true') {
        document.documentElement.classList.add('high-contrast');
    }

    // Apply dyslexic font setting
    if (localStorage.getItem('dyslexicFont') === 'true') {
        document.documentElement.classList.add('dyslexic-font');
        // Load dyslexic font
        if (!document.getElementById('dyslexicFontStylesheet')) {
            const link = document.createElement('link');
            link.id = 'dyslexicFontStylesheet';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/dist/opendyslexic/opendyslexic.css';
            document.head.appendChild(link);
        }
    }
}
// Check if user is authenticated
async function checkAuth() {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        // Verify token by getting user data
        await authService.getCurrentUser();
        showUIElements();
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        return false;
    }
}

// Show main UI elements
function showUIElements() {
    mobileHeader.classList.remove('hidden');
    sidebar.classList.remove('hidden');
}

// Hide main UI elements
function hideUIElements() {
    mobileHeader.classList.add('hidden');
    sidebar.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', async function () {
    const landing = document.getElementById('landingPage');
    const app = document.getElementById('appContainer');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const sidebar = document.getElementById('sidebar');

    // Helper: Show/hide elements
    function showLanding() {
        if (landing) landing.style.display = '';
        if (app) app.style.display = 'none';
    }
    function showApp() {
        if (landing) landing.style.display = 'none';
        if (app) app.style.display = '';
    }

    // Check authentication
    let isAuthenticated = false;
    try {
        isAuthenticated = await checkAuth();
    } catch (e) {
        isAuthenticated = false;
    }

    if (isAuthenticated) {
        showApp();
        loadView('dashboard');
    } else {
        showLanding();
        if (getStartedBtn) {
            getStartedBtn.onclick = function () {
                showApp();
                loadLoginPage();
            };
        }
        // Handle footer CTA button
        const getStartedBtnFooter = document.getElementById('getStartedBtnFooter');
        if (getStartedBtnFooter) {
            getStartedBtnFooter.onclick = function () {
                showApp();
                loadSignupPage();
            };
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainContent = document.querySelector('main.flex-1');

    // Show sidebar (when mobile menu button is clicked)
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            sidebar.classList.remove('hidden');
            if (modalBackdrop) modalBackdrop.classList.remove('hidden');
        });
    }

    // Hide sidebar (when close button or backdrop is clicked)
    function hideSidebar() {
        sidebar.classList.add('hidden');
        if (modalBackdrop) modalBackdrop.classList.add('hidden');
    }

    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', hideSidebar);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', hideSidebar);
    }

    // On desktop, always show sidebar and hide backdrop
    function handleResize() {
        if (window.innerWidth >= 768) { // md breakpoint
            sidebar.classList.remove('hidden');
            if (modalBackdrop) modalBackdrop.classList.add('hidden');
        } else {
            // On mobile, hide sidebar by default
            sidebar.classList.add('hidden');
            if (modalBackdrop) modalBackdrop.classList.add('hidden');
        }
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // Run on load
});
// Update user info in the UI
// Update user info in the UI
// ...existing code...

function updateUserInfo(userData = window.currentUser) {
    if (!userData) return;

    const newAvatarUrl = getProfileImageUrl(userData);

    // Update sidebar profile info
    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarRole = document.getElementById('sidebarUserRole');
    const sidebarImage = document.getElementById('sidebarProfileImage');

    if (sidebarName) sidebarName.textContent = `${userData.firstName} ${userData.lastName}`;
    if (sidebarRole) sidebarRole.textContent = capitalizeFirstLetter(userData.role);
    
    const defaultAvatar = window.DEFAULT_PROFILE_IMAGE || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';

    // Add error handler BEFORE setting src
    if (sidebarImage) {
        sidebarImage.onerror = function() {
            this.onerror = null;
            this.src = defaultAvatar;
        };
        sidebarImage.src = newAvatarUrl;
    }

    // Update mobile header image
    const mobileImage = document.getElementById('mobileProfileImage');
    if (mobileImage) {
        mobileImage.onerror = function() {
            this.onerror = null;
            this.src = defaultAvatar;
        };
        mobileImage.src = newAvatarUrl;
    }
}


// Setup event listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            loadView(view);

            // Update active state
            navLinks.forEach(l => l.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-primary', 'dark:text-primaryLight'));
            e.currentTarget.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-primary', 'dark:text-primaryLight');

            // Hide sidebar on mobile after navigation
            if (window.innerWidth < 768) {
                sidebar.classList.add('hidden');
                modalBackdrop.classList.add('hidden');
            }
        });
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleSidebar);
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    modalBackdrop.addEventListener('click', toggleSidebar);

    // Dark mode toggles
    toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
    desktopDarkModeBtn.addEventListener('click', toggleDarkMode);
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    modalBackdrop.classList.toggle('hidden');

    if (sidebar.classList.contains('hidden')) {
        modalBackdrop.classList.add('hidden');
    } else {
        modalBackdrop.classList.remove('hidden');
    }
}
// Toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}

// Show loading spinner
function showLoading() {
    content.innerHTML = `
        <div class="flex justify-center items-center h-64">
            <div class="spinner w-12 h-12 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
        </div>
    `;
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;

    // Set color based on type
    if (type === 'success') {
        toast.classList.remove('border-red-500', 'border-blue-500');
        toast.classList.add('border-green-500');
    } else if (type === 'error') {
        toast.classList.remove('border-green-500', 'border-blue-500');
        toast.classList.add('border-red-500');
    } else {
        toast.classList.remove('border-green-500', 'border-red-500');
        toast.classList.add('border-blue-500');
    }

    // Show toast
    toast.classList.remove('hidden');

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');

        // Remove from DOM after animation completes
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Load different views
function loadView(view, params = {}) {
    currentView = view;
    showLoading();

    // Create a promise for view loading
    const viewPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            content.classList.remove('fade-in');
            void content.offsetWidth; // Force reflow
            content.classList.add('fade-in');

            switch (view) {
                case 'dashboard':
                    loadDashboard().then(resolve).catch(reject);
                    break;
                case 'login':
                    loadLoginPage().then(resolve).catch(reject);
                    break;
                case 'courses':
                    loadCourses().then(resolve).catch(reject);
                    break;
                case 'course-detail':
                    loadCourseDetail(params.courseId).then(resolve).catch(reject);
                    break;
                case 'resources':
                    loadResources().then(resolve).catch(reject); // ✅ Load user-specific resources
                    break;
                case 'assignments':
                    loadAssignments().then(resolve).catch(reject); // ✅ Load user-specific assignments
                    break;
                case 'discussions':
                    loadDiscussions().then(resolve).catch(reject);
                    break;
                case 'discussion-detail':
                    if (!params.discussionId) {
                        showToast('Discussion ID is required', 'error');
                        loadDiscussions();
                        return;
                    }
                    loadDiscussionDetail(params.discussionId);
                    break;
                case 'resource-detail':
                    if (!params.resourceId) {
                        showToast('Resource ID is required', 'error');
                        loadResources();
                        return;
                    }
                    loadResourceDetail(params.resourceId).then(resolve).catch(reject);
                    break;
                case 'edit-resource':
                    showEditResourceModal(params.resourceId).then(resolve).catch(reject);
                    break;
                case 'profile':
                    loadProfile().then(resolve).catch(reject);
                    break;
                case 'settings':
                    loadSettings().then(resolve).catch(reject);
                    break;
                case 'join-course':
                    joinCourseViaLink(params.token).then(resolve).catch(reject);
                    break;

                default:
                    loadDashboard().then(resolve).catch(reject);
            }

            resolve();
        }, 300);
    });

    viewPromise
        .then(() => {
            console.log(`Successfully loaded ${view} view`);
        })
        .catch((error) => {
            console.error(`Error loading ${view} view:`, error);
            content.innerHTML = `
                <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                    <p class="font-medium">Error</p>
                    <p>${error.message || 'Something went wrong. Please try again.'}</p>
                </div>
                <button onclick="loadView('${currentView}')" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg">
                    Try Again
                </button>
            `;
        });

    return viewPromise;
}
// Modal functions

// Show enrollment key modal
function showEnrollmentModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Enroll in Course</h3>
                    <button id="closeEnrollModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <p class="font-medium" data-user-content="true">${course.name} (${course.code})</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Instructor: ${course.instructor.firstName} ${course.instructor.lastName}</p>
                </div>
                
                <form id="enrollForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Enrollment Code <span class="text-red-500">*</span></label>
                        <input type="text" id="enrollmentCode" required placeholder="Enter the course enrollment code" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div id="enrollError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelEnrollBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Enroll
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    // Set up event listeners
    document.getElementById('closeEnrollModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelEnrollBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Form submission
    document.getElementById('enrollForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const enrollmentCode = document.getElementById('enrollmentCode').value;
        const errorDiv = document.getElementById('enrollError');

        errorDiv.classList.add('hidden');

        if (!enrollmentCode) {
            errorDiv.textContent = 'Please enter the enrollment code.';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            // Enroll in course
            await courseService.enrollInCourse({
                courseId: course._id,
                enrollmentCode
            });

            // Close modal and refresh course
            document.body.removeChild(modalContainer);
            showToast('Successfully enrolled in course!');
            loadCourseDetail(course._id);
        } catch (error) {
            console.error('Error enrolling in course:', error);
            errorDiv.textContent = error.message || 'Invalid enrollment code. Please check and try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Show assignment modal - different views for students vs instructors
function showAssignmentModal(assignmentId) {
    // Fetch assignment details
    assignmentService.getAssignment(assignmentId)
        .then(async response => {
            const assignment = response.data.assignment;

            // Fetch submissions for this assignment
            let submissions = [];
            try {
                const submissionsResponse = await assignmentService.getSubmissions(assignmentId);
                submissions = submissionsResponse.data.submissions;
            } catch (error) {
                console.warn(`Could not fetch submissions for assignment ${assignmentId}:`, error);
            }

            // For students: find their own submission (if any)
            let mySubmission = null;
            if (currentUser.role === 'student') {
                mySubmission = submissions.find(s =>
                    (typeof s.student === 'object' && s.student._id === currentUser._id) ||
                    s.student === currentUser._id
                );
            }

            // Determine assignment state
            const now = new Date();
            const dueDate = new Date(assignment.dueDate);
            const isPastDue = dueDate < now;
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));

            // Calculate submission statistics (for instructors)
            const submissionStats = {
                total: submissions.length,
                graded: submissions.filter(s => s.status === 'graded' || s.grade).length,
                late: submissions.filter(s => new Date(s.submittedAt) > dueDate).length
            };

            // Course information
            const course = assignment.course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';

            // Format for displaying the assignment description with Markdown
            const formattedDescription = assignment.description ?
                marked.parse(assignment.description) :
                'No detailed instructions provided.';

            // Create different modal content based on user role
            const modalContent = currentUser.role === 'student' ?
                generateStudentModal(assignment, mySubmission, isPastDue, daysLeft, daysOverdue, courseCode, formattedDescription) :
                generateInstructorModal(assignment, submissions, submissionStats, isPastDue, daysLeft, courseCode, formattedDescription);

            // Create the modal container
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalContent;
            document.body.appendChild(modalContainer);
            if (localStorage.getItem('language') === 'ha') {
                applyHausaTranslations(modalContainer);
            }
            // Set up shared event listeners
            document.getElementById('closeAssignmentModal').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });

            // Set up role-specific event listeners
            if (currentUser.role === 'student') {
                setupStudentEventListeners(assignment, mySubmission, modalContainer);
            } else {
                setupInstructorEventListeners(assignment, submissions, modalContainer);
            }
        })
        .catch(error => {
            console.error('Error fetching assignment:', error);
            showToast('Failed to load assignment details', 'error');
        });
}

// Generate modal HTML for students
function generateStudentModal(assignment, mySubmission, isPastDue, daysLeft, daysOverdue, courseCode, formattedDescription) {
    const isSubmitted = !!mySubmission;
    const isGraded = isSubmitted && (mySubmission.status === 'graded' || mySubmission.grade);
    const isLateSubmission = isSubmitted && new Date(mySubmission.submittedAt) > new Date(assignment.dueDate);
    const canSubmitLate = isPastDue && assignment.allowLateSubmissions && !isSubmitted;

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold" data-user-content="true">${assignment.title}</h3>
                    <button id="closeAssignmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Assignment header -->
                <div class="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="mb-2 md:mb-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                ${courseCode}
                            </span>
                            <span class="px-2 py-1 text-xs rounded-full ${isPastDue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}">
                                ${isPastDue ? `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}` : `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                            </span>
                            ${isSubmitted ? `
                                <span class="px-2 py-1 text-xs rounded-full ${isGraded ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}">
                                    ${isGraded ? 'Graded' : 'Submitted'}
                                </span>
                                ${isLateSubmission ? `
                                    <span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                        Late Submission
                                    </span>
                                ` : ''}
                            ` : ''}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Due: ${formatDate(assignment.dueDate)} (${isPastDue ? 'Past due' : `${daysLeft} days left`})</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Worth: ${assignment.pointsPossible} points</p>
                    </div>
                    
                    <!-- Grade display - only shown if graded -->
                    ${isGraded && mySubmission.grade ? `
                        <div class="flex flex-col items-end">
                            <div class="text-2xl font-bold ${getGradeColorClass(mySubmission.grade.score, assignment.pointsPossible)}">
                                ${mySubmission.grade.score} / ${assignment.pointsPossible}
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                ${((mySubmission.grade.score / assignment.pointsPossible) * 100).toFixed(1)}%
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Assignment content section -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3">Instructions</h4>
                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-4 prose dark:prose-invert max-w-none">
                        ${formattedDescription}
                    </div>
                    
                    <!-- Display resources/attachments if any -->
                    ${assignment.resources && assignment.resources.length > 0 ? `
                        <div class="mt-4">
                            <h5 class="font-medium mb-2">Resources</h5>
                            <div class="space-y-2">
                                ${assignment.resources.map(resource => `
                                    <div class="flex items-center p-2 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                        <i class="fas fa-file mr-2 text-primary"></i>
                                        <span class="flex-1" data-user-content="true">${resource.title}</span>${!resource.title ? `<span class="flex-1>Resource</span>` : ''}
                                        <a href="#" class="text-primary hover:underline">View</a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Submission section -->
                ${isGraded ? `
                    <!-- Show graded submission -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <h4 class="font-semibold mb-3">Your Submission</h4>
                        <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                            ${mySubmission.textContent ? `
                                <div class="mb-4">
                                    <h5 class="text-sm font-medium mb-2">Your Response:</h5>
                                    <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <p data-user-content="true" class="whitespace-pre-line text-gray-800 dark:text-gray-200">${mySubmission.textContent}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${mySubmission.attachments && mySubmission.attachments.length > 0 ? `
                                <div class="mb-4">
                                    <h5 class="text-sm font-medium mb-2">Your Attachments:</h5>
                                    <div class="space-y-2">
                                        ${mySubmission.attachments.map(file => `
                                            <div class="flex items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                <i class="fas fa-file mr-2 text-gray-500"></i>
                                                <span class="flex-1">${file.fileName || 'File'}</span>
                                                <a href="${file.fileUrl || '#'}" target="_blank" class="text-primary dark:text-primaryLight hover:underline">View</a>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <h5 class="text-sm font-medium mb-2">Feedback:</h5>
                                ${mySubmission.grade && mySubmission.grade.feedback ? `
                                    <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <p class="whitespace-pre-line text-gray-800 dark:text-gray-200">${mySubmission.grade.feedback}</p>
                                    </div>
                                ` : `
                                    <p class="text-gray-500 dark:text-gray-400">No feedback provided.</p>
                                `}
                            </div>
                        </div>
                    </div>
                ` : isSubmitted ? `
                    <!-- Show ungraded submission -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <h4 class="font-semibold mb-3">Your Submission</h4>
                        <div data-user-content="true" class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                            ${mySubmission.textContent ? `
                                <div class="mb-4">
                                    <h5 class="text-sm font-medium mb-2">Your Response:</h5>
                                    <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <p data-user-content="true" class="whitespace-pre-line text-gray-800 dark:text-gray-200">${mySubmission.textContent}</p>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${mySubmission.attachments && mySubmission.attachments.length > 0 ? `
                                <div>
                                    <h5 class="text-sm font-medium mb-2">Your Attachments:</h5>
                                    <div class="space-y-2">
                                        ${mySubmission.attachments.map(file => `
                                            <div class="flex items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                <i class="fas fa-file mr-2 text-gray-500"></i>
                                                <span class="flex-1">${file.fileName || 'File'}</span>
                                                <a href="${file.fileUrl || '#'}" target="_blank" class="text-primary dark:text-primaryLight hover:underline">View</a>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                                <p><i class="fas fa-info-circle mr-2"></i> Your submission is awaiting grading.</p>
                                <p class="text-sm mt-1">Submitted on ${formatDate(mySubmission.submittedAt)}</p>
                            </div>
                        </div>
                    </div>
                ` : isPastDue && !assignment.allowLateSubmissions ? `
                    <!-- Past due without submission and late submissions not allowed -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <div class="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
                            <p class="font-medium"><i class="fas fa-exclamation-circle mr-2"></i> Assignment Past Due</p>
                            <p class="mt-1">This assignment was due on ${formatDate(assignment.dueDate)} and cannot be submitted late.</p>
                        </div>
                    </div>
                ` : `
                    <!-- Show submission form -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 class="font-semibold mb-3">
                            ${canSubmitLate ? 'Submit Late Assignment' : 'Your Submission'}
                            ${canSubmitLate ? `
                                <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                    Late
                                </span>
                            ` : ''}
                        </h4>
                        
                        ${canSubmitLate ? `
                            <div class="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                                <p><i class="fas fa-exclamation-triangle mr-2"></i> This assignment is past due, but late submissions are allowed.</p>
                                <p class="text-sm mt-1">Note: Late submissions may receive reduced points.</p>
                            </div>
                        ` : ''}
                        
                        <form id="assignmentSubmitForm" class="space-y-4">
                            ${assignment.submissionType !== 'file' ? `
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                                    <textarea id="submissionText" rows="5" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                                </div>
                            ` : ''}
                            
                            ${assignment.submissionType !== 'text' ? `
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Upload Files</label>
                                    <input type="file" id="submissionFile" multiple class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        You can upload multiple files. Maximum size: 10MB per file.
                                    </p>
                                </div>
                            ` : ''}
                            
                            <div id="submissionError" class="text-red-500 hidden"></div>
                            
                            <div class="flex justify-end">
                                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    ${canSubmitLate ? 'Submit Late Assignment' : 'Submit Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Generate modal HTML for instructors
function generateInstructorModal(assignment, submissions, submissionStats, isPastDue, daysLeft, courseCode, formattedDescription) {
    // Determine if instructor can edit the assignment (shouldn't edit after submissions)
    const canEdit = submissions.length === 0;

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold" data-user-content="true">${assignment.title}</h3>
                    <div class="flex items-center">
                        ${canEdit ? `
                            <button id="editAssignmentBtn" class="mr-2 text-primary dark:text-primaryLight hover:text-primaryDark dark:hover:text-primaryLight">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button id="closeAssignmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Assignment header -->
                <div class="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="mb-2 md:mb-0">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                ${courseCode}
                            </span>
                            <span class="px-2 py-1 text-xs rounded-full ${isPastDue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}">
                                ${isPastDue ? 'Past Due' : 'Active'}
                            </span>
                            ${assignment.allowLateSubmissions ? `
                                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Late Submissions Allowed
                                </span>
                            ` : ''}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Due: ${formatDate(assignment.dueDate)} (${isPastDue ? 'Past due' : `${daysLeft} days left`})</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Worth: ${assignment.pointsPossible} points</p>
                    </div>
                    
                    <!-- Submission stats card -->
                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-3">
                        <h4 class="text-sm font-medium mb-2">Submission Summary:</h4>
                        <div class="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div class="text-lg font-bold">${submissionStats.total}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Total</div>
                            </div>
                            <div>
                                <div class="text-lg font-bold">${submissionStats.graded}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Graded</div>
                            </div>
                            <div>
                                <div class="text-lg font-bold">${submissionStats.late}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Late</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Assignment content section -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3">Assignment Details</h4>
                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-4 prose dark:prose-invert max-w-none">
                        ${formattedDescription}
                    </div>
                    
                    <!-- Display resources/attachments if any -->
                    ${assignment.resources && assignment.resources.length > 0 ? `
                        <div class="mt-4">
                            <h5 class="font-medium mb-2">Resources</h5>
                            <div class="space-y-2">
                                ${assignment.resources.map(resource => `
                                    <div class="flex items-center p-2 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                        <i class="fas fa-file mr-2 text-primary"></i>
                                        <span class="flex-1" data-user-content="true">${resource.title}</span>${!resource.title ? `<span class="flex-1">Resource</span>` : ''}
                                        <a href="#" class="text-primary hover:underline">View</a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <p><span class="font-medium">Submission Type:</span> ${getSubmissionTypeLabel(assignment.submissionType)}</p>
                            <p><span class="font-medium">Allow Late Submissions:</span> ${assignment.allowLateSubmissions ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p><span class="font-medium">Created:</span> ${formatDate(assignment.createdAt)}</p>
                            <p><span class="font-medium">Last Updated:</span> ${formatDate(assignment.updatedAt || assignment.createdAt)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Submission section -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-semibold">Student Submissions</h4>
                        <button id="viewAllSubmissionsBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                            View All Submissions
                        </button>
                    </div>
                    
                    ${submissions.length === 0 ? `
                        <div class="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg text-gray-500 dark:text-gray-400 text-center">
                            <p><i class="far fa-clock mr-2"></i> No submissions yet.</p>
                        </div>
                    ` : `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-750">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    ${submissions.slice(0, 3).map(submission => {
        const student = submission.student;
        const studentName = typeof student === 'object' ?
            `${student.firstName} ${student.lastName}` : 'Student';

        const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
        const isGraded = submission.status === 'graded' || submission.grade;

        let statusBadge = '';
        if (isGraded) {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Graded</span>`;
        } else if (isLate) {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Late</span>`;
        } else {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Submitted</span>`;
        }

        return `
                                            <tr>
                                                <td class="px-4 py-2">
                                                    <div class="flex items-center">
                                                        <img src="${getProfileImageUrl(student)}" alt="${studentName}" class="w-7 h-7 rounded-full object-cover mr-2" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                                        <span>${studentName}</span>
                                                    </div>
                                                </td>
                                                <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                    ${formatDate(submission.submittedAt)}
                                                </td>
                                                <td class="px-4 py-2">
                                                    ${statusBadge}
                                                </td>
                                                <td class="px-4 py-2">
                                                    <button class="view-submission-btn px-3 py-1 text-sm ${isGraded ? 'text-primary dark:text-primaryLight hover:underline' : 'bg-primary hover:bg-primaryDark text-white rounded'}" data-submission-id="${submission._id}">
                                                        ${isGraded ? 'View' : 'Grade'}
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
    }).join('')}
                                </tbody>
                            </table>
                            ${submissions.length > 3 ? `
                                <div class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Showing 3 of ${submissions.length} submissions
                                </div>
                            ` : ''}
                        </div>
                    `}
                    
                    <div class="mt-4 flex justify-end">
                        <button id="downloadsBtn" class="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <i class="fas fa-download mr-1"></i> Export Grades
                        </button>
                        <button id="viewAllSubmissionsBtn2" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Manage Submissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Set up event listeners for student assignment modal
function setupStudentEventListeners(assignment, mySubmission, modalContainer) {
    // Handle assignment submission
    const submitForm = document.getElementById('assignmentSubmitForm');
    if (submitForm) {
        submitForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const textContent = document.getElementById('submissionText')?.value || '';
            const fileInput = document.getElementById('submissionFile');
            const errorDiv = document.getElementById('submissionError');

            // Validate submission based on assignment requirements
            if (assignment.submissionType === 'text' && !textContent.trim()) {
                errorDiv.textContent = 'Please enter your response before submitting.';
                errorDiv.classList.remove('hidden');
                return;
            }

            if (assignment.submissionType === 'file' &&
                (!fileInput || !fileInput.files || fileInput.files.length === 0)) {
                errorDiv.textContent = 'Please upload at least one file before submitting.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Create FormData object
            const formData = new FormData();
            formData.append('textContent', textContent);

            // Add files if any
            if (fileInput && fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('files', fileInput.files[i]);
                }
            }

            // Submit
            try {
                errorDiv.classList.add('hidden');

                // Show loading state
                const submitBtn = submitForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';

                await assignmentService.submitAssignment(assignment._id, formData);

                // Remove modal and show success message
                document.body.removeChild(modalContainer);
                showToast('Assignment submitted successfully!');

                // Reload the assignment view
                loadView('assignments');
            } catch (error) {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                // Show error
                errorDiv.textContent = error.message || 'Failed to submit assignment. Please try again.';
                errorDiv.classList.remove('hidden');
            }
        });
    }
}

// Set up event listeners for instructor assignment modal
function setupInstructorEventListeners(assignment, submissions, modalContainer) {
    // View all submissions button
    const viewAllSubmissionsBtn = document.getElementById('viewAllSubmissionsBtn');
    const viewAllSubmissionsBtn2 = document.getElementById('viewAllSubmissionsBtn2');

    if (viewAllSubmissionsBtn) {
        viewAllSubmissionsBtn.addEventListener('click', () => {
            // Close the current modal
            document.body.removeChild(modalContainer);
            // Show submissions view
            viewSubmissions(assignment._id);
        });
    }

    if (viewAllSubmissionsBtn2) {
        viewAllSubmissionsBtn2.addEventListener('click', () => {
            // Close the current modal
            document.body.removeChild(modalContainer);
            // Show submissions view
            viewSubmissions(assignment._id);
        });
    }

    // Edit assignment button
    const editAssignmentBtn = document.getElementById('editAssignmentBtn');
    if (editAssignmentBtn) {
        editAssignmentBtn.addEventListener('click', () => {
            // Close the current modal
            document.body.removeChild(modalContainer);
            // Show edit assignment modal
            showEditAssignmentModal(assignment);
        });
    }

    // Export grades button
    const downloadsBtn = document.getElementById('downloadsBtn');
    if (downloadsBtn) {
        downloadsBtn.addEventListener('click', () => {
            // This would normally trigger a download API call
            // For now, just show a toast since iframe doesn't allow downloads
            showToast('CSV export would be downloaded in a production environment. Downloads are not supported in this demo.', 'info');
        });
    }

    // Individual submission view/grade buttons
    document.querySelectorAll('.view-submission-btn').forEach(button => {
        button.addEventListener('click', () => {
            const submissionId = button.dataset.submissionId;
            const submission = submissions.find(s => s._id === submissionId);

            if (submission) {
                // Close the current modal
                document.body.removeChild(modalContainer);
                // Show submission detail modal
                showSubmissionDetailModal(submission, assignment);
            }
        });
    });
}

// Utility function to get grade color class based on score
function getGradeColorClass(score, total) {
    const percentage = (score / total) * 100;

    if (percentage >= 90) {
        return 'text-green-500';
    } else if (percentage >= 80) {
        return 'text-blue-500';
    } else if (percentage >= 70) {
        return 'text-yellow-500';
    } else if (percentage >= 60) {
        return 'text-orange-500';
    } else {
        return 'text-red-500';
    }
}

// Utility function to get submission type label
function getSubmissionTypeLabel(type) {
    switch (type) {
        case 'text':
            return 'Text Only';
        case 'file':
            return 'File Upload Only';
        case 'both':
        default:
            return 'Text and File Upload';
    }
}

// Edit assignment modal - for instructors only
function showEditAssignmentModal(assignment) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Edit Assignment</h3>
                    <button id="closeEditModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="editAssignmentForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Assignment Title</label>
                        <input type="text" data-user-content="true" id="assignmentTitle" value="${assignment.title}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
                        <textarea id="assignmentDescription" rows="6" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200" data-user-content="true">${assignment.description || ''}</textarea>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You can use Markdown formatting</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                            <input type="datetime-local" id="assignmentDueDate" value="${new Date(assignment.dueDate).toISOString().slice(0, 16)}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Points Possible</label>
                            <input type="number" id="assignmentPoints" value="${assignment.pointsPossible}" min="0" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Submission Type</label>
                            <select id="assignmentSubmissionType" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                <option value="both" ${assignment.submissionType === 'both' ? 'selected' : ''}>Text and File Upload</option>
                                <option value="text" ${assignment.submissionType === 'text' ? 'selected' : ''}>Text Only</option>
                                <option value="file" ${assignment.submissionType === 'file' ? 'selected' : ''}>File Upload Only</option>
                            </select>
                        </div>
                        <div class="flex items-center h-full pt-8">
                            <input type="checkbox" id="assignmentAllowLate" class="mr-2" ${assignment.allowLateSubmissions ? 'checked' : ''}>
                            <label for="assignmentAllowLate" class="text-gray-700 dark:text-gray-300">Allow late submissions</label>
                        </div>
                    </div>
                    
                    <div id="assignmentError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-between pt-2">
                        <button type="button" id="deleteAssignmentBtn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                            Delete Assignment
                        </button>
                        <div>
                            <button type="button" id="cancelEditBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    // Set up event listeners
    document.getElementById('closeEditModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        // Show the assignment modal again
        showAssignmentModal(assignment._id);
    });

    document.getElementById('deleteAssignmentBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            try {
                // Call the API to delete the assignment
                await assignmentService.deleteAssignment(assignment._id);
                showToast('Assignment deleted successfully!');
                // Remove the modal from the DOM
                document.body.removeChild(modalContainer);
                // Optionally, refresh the assignments view
                loadView('assignments');
            } catch (error) {
                console.error('Error deleting assignment:', error);
                showToast(`Failed to delete assignment: ${error.message}`, 'error');
            }
        }
    });


    // Form submission
    document.getElementById('editAssignmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        // Get form values
        const title = document.getElementById('assignmentTitle').value;
        const description = document.getElementById('assignmentDescription').value;
        const dueDate = document.getElementById('assignmentDueDate').value;
        const pointsPossible = parseInt(document.getElementById('assignmentPoints').value);
        const submissionType = document.getElementById('assignmentSubmissionType').value;
        const allowLateSubmissions = document.getElementById('assignmentAllowLate').checked;

        // Create the data object to update
        const assignmentData = {
            title,
            description,
            dueDate,
            pointsPossible,
            submissionType,
            allowLateSubmissions
        };

        try {
            // Call  API to update the assignment.
            // Make sure assignmentId is defined in the current scope (passed in from the modal, for example)
            await assignmentService.updateAssignment(assignment._id, assignmentData);

            showToast('Assignment updated successfully!');
            document.body.removeChild(modalContainer);

            // Reload the assignments view to reflect the changes.
            loadView('assignments');
        } catch (error) {
            console.error('Error updating assignment:', error);
            showToast(`Failed to update assignment: ${error.message}`, 'error');
        }
    });

}
// Get submission form HTML
function getSubmissionForm(assignment) {
    return `
        <form id="assignmentSubmitForm" class="space-y-4">
            ${assignment.submissionType !== 'file' ? `
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                    <textarea id="submissionText" rows="5" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                </div>
            ` : ''}
            
            ${assignment.submissionType !== 'text' ? `
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Upload Files</label>
                    <input type="file" id="submissionFile" multiple class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You can upload multiple files. Maximum size: 10MB per file.
                    </p>
                </div>
            ` : ''}
            
            <div id="submissionError" class="text-red-500 hidden"></div>
            
            <div>
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    Submit Assignment
                </button>
            </div>
        </form>
    `;
}

// Show upload resource modal
async function showUploadResourceModal(courseId) {
    try {
        // Use provided courseId or fall back to the current course if available
        courseId = courseId || (currentCourse ? currentCourse._id : null);

        // If no course ID is available, we need to let the user select a course
        let userCourses = [];
        let selectedCourseId = courseId;

        if (!courseId) {
            try {
                // Get courses where user is instructor
                const coursesResponse = await courseService.getMyCourses();
                userCourses = coursesResponse.data.courses.filter(course =>
                    (currentUser.role === 'admin') ||
                    (course.instructor === currentUser._id) ||
                    (typeof course.instructor === 'object' && course.instructor._id === currentUser._id)
                );

                if (userCourses.length === 0) {
                    showToast('You do not have any courses where you can upload resources.', 'error');
                    return;
                }

                // Default to the first course
                selectedCourseId = userCourses[0]._id;
            } catch (error) {
                console.error('Error fetching courses:', error);
                showToast('Failed to load your courses. Please try again.', 'error');
                return;
            }
        }

        // Create and show modal
        const modalHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Upload Resource</h3>
                        <button id="closeResourceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="resourceUploadForm" class="space-y-4">
                        ${!courseId ? `
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
                                <select id="resourceCourse" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    ${userCourses.map(course => `
                                        <option data-user-content="true" value="${course._id}">${course.name} (${course.code})</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                        
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Title <span class="text-red-500">*</span></label>
                            <input type="text" id="resourceTitle" required placeholder="Enter a title for this resource" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea id="resourceDescription" rows="3" placeholder="Describe what this resource contains or how students should use it" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Type <span class="text-red-500">*</span></label>
                                <select id="resourceType" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <option value="">-- Select Resource Type --</option>
                                    <option value="file">File Upload</option>
                                    <option value="link">External Link</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select id="resourceCategory" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <option value="lecture">Lecture Materials</option>
                                    <option value="reading">Reading Materials</option>
                                    <option value="exercise">Practice Exercises</option>
                                    <option value="assignment">Assignment Materials</option>
                                    <option value="tutorial">Tutorial Videos</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- File upload section (initially hidden) -->
                        <div id="fileUploadSection" class="hidden">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Upload File <span class="text-red-500">*</span></label>
                            <input type="file" id="resourceFile" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Maximum file size: 10MB. Supported formats: PDF, DOCX, PPTX, XLSX, ZIP, MP4, JPG, PNG
                            </p>
                        </div>
                        
                        <!-- Link section (initially hidden) -->
                        <div id="linkSection" class="hidden">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">External URL <span class="text-red-500">*</span></label>
                            <input type="url" id="resourceLink" placeholder="https://example.com/resource" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        ${currentUser.role === 'instructor' ? `
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
                            <select id="resourceVisibility" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                <option value="true">Visible to Students</option>
                                <option value="false">Hidden from Students</option>
                            </select>
                        </div>
                        ` : ''}
                        <div id="resourceError" class="text-red-500 hidden"></div>
                        
                        <div class="flex justify-end pt-2">
                            <button type="button" id="cancelResourceBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Cancel
                            </button>
                            <button type="submit" id="uploadResourceBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Upload Resource
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        if (localStorage.getItem('language') === 'ha') {
            applyHausaTranslations(modalContainer);
        }
        // Set up event listeners

        // Close modal
        document.getElementById('closeResourceModal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });

        document.getElementById('cancelResourceBtn').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });

        // Handle resource type selection
        const resourceType = document.getElementById('resourceType');
        resourceType.addEventListener('change', (e) => {
            // Hide all resource sections
            document.getElementById('fileUploadSection').classList.add('hidden');
            document.getElementById('linkSection').classList.add('hidden');

            // Show the selected section
            const selectedType = e.target.value;
            if (selectedType === 'file') {
                document.getElementById('fileUploadSection').classList.remove('hidden');
            } else if (selectedType === 'link') {
                document.getElementById('linkSection').classList.remove('hidden');
            }
        });

        // Handle form submission
        document.getElementById('resourceUploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const errorDiv = document.getElementById('resourceError');
            errorDiv.classList.add('hidden');

            // Get the selected course ID
            const targetCourseId = courseId || document.getElementById('resourceCourse')?.value;
            if (!targetCourseId) {
                errorDiv.textContent = 'Please select a course.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Get common resource data
            const title = document.getElementById('resourceTitle').value;
            const description = document.getElementById('resourceDescription').value;
            const category = document.getElementById('resourceCategory').value;
            const isVisible = document.getElementById('resourceVisibility').value === 'true';

            // Validate required fields
            const selectedType = resourceType.value;
            if (!selectedType) {
                errorDiv.textContent = 'Please select a resource type.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Prepare form data (for both file and link resources)
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('isVisible', isVisible);

            // Handle resource type-specific data and validation
            if (selectedType === 'file') {
                const fileInput = document.getElementById('resourceFile');
                if (!fileInput.files || fileInput.files.length === 0) {
                    errorDiv.textContent = 'Please select a file to upload.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                // Check file size (10MB max)
                const file = fileInput.files[0];
                if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
                    errorDiv.textContent = 'File size exceeds the 10MB limit.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                // Add file to formData
                formData.append('file', file);

            } else if (selectedType === 'link') {
                const link = document.getElementById('resourceLink').value;
                if (!link) {
                    errorDiv.textContent = 'Please enter a valid URL.';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                // Validate URL format
                try {
                    new URL(link); // Will throw if invalid
                    formData.append('link', link);
                } catch (error) {
                    errorDiv.textContent = 'Please enter a valid URL (include http:// or https://).';
                    errorDiv.classList.remove('hidden');
                    return;
                }
            }

            // Update button state
            const uploadBtn = document.getElementById('uploadResourceBtn');
            const originalBtnText = uploadBtn.innerHTML;
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Uploading...';

            try {
                // Call the API to create the resource - pass the courseId in the URL parameter
                await resourceService.createResource(targetCourseId, formData);

                // Close modal
                document.body.removeChild(modalContainer);

                // Show success message
                showToast('Resource uploaded successfully!');

                // Refresh the course resources if we're in a course detail view
                if (currentView === 'course-detail' && currentCourse) {
                    loadCourseDetail(currentCourse._id);
                }
                else {
                    loadResources();
                }

            } catch (error) {
                console.error('Error uploading resource:', error);
                errorDiv.textContent = error.message || 'Failed to upload resource. Please try again.';
                errorDiv.classList.remove('hidden');

                // Reset button state
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = originalBtnText;
            }

        });

    } catch (error) {
        console.error('Error showing upload resource modal:', error);
        showToast('An error occurred. Please try again.', 'error');
    }

}

/**
* Show modal to edit a resource
* @param {string} resourceId - ID of the resource to edit
* @returns {Promise<void>}
*/
async function showEditResourceModal(resourceId) {
    try {
        // Show loading modal
        const loadingModalHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center">
                    <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
                    <p class="text-gray-700 dark:text-gray-300">Loading resource data...</p>
                </div>
            </div>
        `;

        const loadingContainer = document.createElement('div');
        loadingContainer.innerHTML = loadingModalHtml;
        document.body.appendChild(loadingContainer);
        if (localStorage.getItem('language') === 'ha') {
            applyHausaTranslations(modalContainer);
        }
        // Fetch resource data
        const response = await resourceService.getResource(resourceId);
        const resource = response.data.resource;

        // Remove loading modal
        document.body.removeChild(loadingContainer);

        // Prepare data for the form
        const courseId = typeof resource.course === 'object' ? resource.course._id : resource.course;

        // Create edit modal
        const modalHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Edit Resource</h3>
                        <button id="closeEditResourceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="editResourceForm" class="space-y-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Title <span class="text-red-500">*</span></label>
                            <input type="text" id="resourceTitle" value="${resource.title}" required placeholder="Enter a title for this resource" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea id="resourceDescription" rows="3" placeholder="Describe what this resource contains or how students should use it" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${resource.description || ''}</textarea>
                            ${resource.type === 'text' ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You can use Markdown formatting in the description.</p>` : ''}
                        </div>
                        
                        <!-- Display resource type (cannot be changed) -->
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Resource Type</label>
                            <div class="px-4 py-2 bg-gray-100 dark:bg-gray-750 rounded-lg text-gray-700 dark:text-gray-300">
                                ${resource.type === 'file' ? 'File Upload' : resource.type === 'link' ? 'External Link' : 'Text Content'}
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Resource type cannot be changed after creation.</p>
                        </div>
                        
                        ${resource.type === 'link' ? `
                            <!-- Link URL for link resources -->
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">External URL <span class="text-red-500">*</span></label>
                                <input type="url" id="resourceLink" value="${resource.link || ''}" required placeholder="https://example.com/resource" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            </div>
                        ` : resource.type === 'text' ? `
                            <!-- Content for text resources -->
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Content <span class="text-red-500">*</span></label>
                                <textarea id="resourceContent" rows="6" required placeholder="Enter the content or paste from another source. Markdown formatting is supported." class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${resource.content || ''}</textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You can use Markdown for formatting.</p>
                            </div>
                        ` : `
                            <!-- File info for file resources -->
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Current File</label>
                                <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                                    ${getResourceTypeIcon(resource)}
                                    <div class="ml-3 flex-1">
                                        <p class="font-medium">${resource.file?.fileName || 'File'}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            ${formatFileSize(resource.file?.fileSize)} • ${resource.file?.fileType || 'Unknown type'}
                                        </p>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    To replace this file, please create a new resource.
                                </p>
                            </div>
                        `}
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select id="resourceCategory" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <option value="lecture" ${resource.category === 'lecture' ? 'selected' : ''}>Lecture Materials</option>
                                    <option value="reading" ${resource.category === 'reading' ? 'selected' : ''}>Reading Materials</option>
                                    <option value="exercise" ${resource.category === 'exercise' ? 'selected' : ''}>Practice Exercises</option>
                                    <option value="assignment" ${resource.category === 'assignment' ? 'selected' : ''}>Assignment Materials</option>
                                    <option value="tutorial" ${resource.category === 'tutorial' ? 'selected' : ''}>Tutorial Videos</option>
                                    <option value="other" ${resource.category === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
                                <select id="resourceVisibility" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <option value="true" ${resource.isVisible !== false ? 'selected' : ''}>Visible to Students</option>
                                    <option value="false" ${resource.isVisible === false ? 'selected' : ''}>Hidden from Students</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="editResourceError" class="text-red-500 hidden"></div>
                        
                        <div class="flex justify-end pt-2">
                            <button type="button" id="cancelEditResourceBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        if (localStorage.getItem('language') === 'ha') {
            applyHausaTranslations(modalContainer);
        }
        // Set up event listeners
        document.getElementById('closeEditResourceModal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });

        document.getElementById('cancelEditResourceBtn').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });

        // Form submission
        document.getElementById('editResourceForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('resourceTitle').value;
            const description = document.getElementById('resourceDescription').value;
            const category = document.getElementById('resourceCategory').value;
            const isVisible = document.getElementById('resourceVisibility').value === 'true';
            const errorDiv = document.getElementById('editResourceError');

            // Resource-type specific fields
            let updateData = {
                title,
                description,
                category,
                isVisible
            };

            if (resource.type === 'link') {
                updateData.link = document.getElementById('resourceLink').value;
            } else if (resource.type === 'text') {
                updateData.content = document.getElementById('resourceContent').value;
            }

            errorDiv.classList.add('hidden');

            try {
                // Update the resource
                await resourceService.updateResource(resourceId, updateData);

                // Close modal and show success message
                document.body.removeChild(modalContainer);
                showToast('Resource updated successfully!');

                // Reload the resource detail view
                loadResourceDetail(resourceId);
            } catch (error) {
                console.error('Error updating resource:', error);
                errorDiv.textContent = error.message || 'Failed to update resource. Please try again.';
                errorDiv.classList.remove('hidden');
            }
        });

    } catch (error) {
        console.error('Error showing edit resource modal:', error);
        showToast('Failed to load resource data for editing', 'error');
    }
}
/**
 * Delete a resource
 * @param {string} resourceId - ID of the resource to delete
 * @returns {Promise<void>}
 */
async function deleteResource(id) {
    try {
        await resourceService.deleteResource(id);
        showToast('Resource deleted successfully!');

        // Redirect to resources list
        loadResources();
    } catch (error) {
        console.error('Error deleting resource:', error);
        showToast('Failed to delete resource', 'error');
    }
}

// Show new discussion modal
function showNewAnnouncementModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Create Announcement</h3>
                    <button id="closeAnnouncementModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createAnnouncementForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input type="text" id="announcementTitle" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Content</label>
                        <textarea id="announcementContent" rows="6" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                    </div>

                    <div id="announcementError" class="text-red-500 hidden"></div>

                    <div>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    // Setup event listeners
    document.getElementById('closeAnnouncementModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('createAnnouncementForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const announcementData = {
                title: document.getElementById('announcementTitle').value,
                content: document.getElementById('announcementContent').value,
                course: currentCourse._id,
            };

            await announcementService.createAnnouncement(announcementData);
            document.body.removeChild(modalContainer);
            showToast('Announcement created successfully!');
            loadCourseDetail(currentCourse._id);
        } catch (error) {
            const errorDiv = document.getElementById('announcementError');
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}


// Show create assignment modal
async function showCreateAssignmentModal() {
    let courses = [];
    if (currentUser.role === 'instructor') {
        try {
            const response = await courseService.getMyCourses();
            courses = response.data.courses;
        } catch (error) {
            console.error("Error fetching courses for assignment modal:", error);
        }
    }

    const modalHtml = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Create New Assignment</h3>
            <button id="closeAssignmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <form id="createAssignmentForm" class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Assignment Title</label>
              <input type="text" id="assignmentTitle" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
            
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Instructions</label>
              <textarea id="assignmentDescription" rows="5" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
            </div>

            <!-- Course selection for instructors -->
            ${currentUser.role === 'instructor' ? `
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                <select id="assignmentCourse" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                  <option value="">Select a course</option>
                  ${courses.map(course => `<option data-user-content="true" value="${course._id}">${course.name} (${course.code})</option>`).join('')}
                </select>
              </div>
            ` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input type="datetime-local" id="assignmentDueDate" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Points Possible</label>
                <input type="number" id="assignmentPoints" value="100" min="0" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Submission Type</label>
                <select id="assignmentSubmissionType" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                  <option value="both">Text and File Upload</option>
                  <option value="text">Text Only</option>
                  <option value="file">File Upload Only</option>
                </select>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="assignmentAllowLate" class="mr-2">
                <label for="assignmentAllowLate" class="text-gray-700 dark:text-gray-300">Allow late submissions</label>
              </div>
            </div>
            
            <div id="assignmentError" class="text-red-500 hidden"></div>
            
            <div>
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                Create Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    // Close modal
    document.getElementById('closeAssignmentModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Set default due date to 1 week from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    document.getElementById('assignmentDueDate').value = defaultDueDate.toISOString().slice(0, 16);

    // Pre-select course if currentCourse is defined (for instructors)
    if (currentUser.role === 'instructor' && currentCourse) {
        const courseSelect = document.getElementById('assignmentCourse');
        if (courseSelect) {
            const optionToSelect = Array.from(courseSelect.options).find(opt => opt.value === currentCourse._id);
            if (optionToSelect) {
                optionToSelect.selected = true;
            }
        }
    }

    // Setup form submission
    document.getElementById('createAssignmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Determine the course ID to use
        let courseId;
        if (currentUser.role === 'instructor') {
            const courseSelect = document.getElementById('assignmentCourse');
            if (courseSelect && courseSelect.value) {
                courseId = courseSelect.value;
            } else if (currentCourse && currentCourse._id) {
                courseId = currentCourse._id;
            } else {
                const errorDiv = document.getElementById('assignmentError');
                errorDiv.textContent = "No course selected for assignment creation.";
                errorDiv.classList.remove('hidden');
                return;
            }
        } else {
            // For students, currentCourse should exist
            if (currentCourse && currentCourse._id) {
                courseId = currentCourse._id;
            } else {
                const errorDiv = document.getElementById('assignmentError');
                errorDiv.textContent = "No course context available.";
                errorDiv.classList.remove('hidden');
                return;
            }
        }

        try {
            const assignmentData = {
                title: document.getElementById('assignmentTitle').value,
                description: document.getElementById('assignmentDescription').value,
                dueDate: document.getElementById('assignmentDueDate').value,
                pointsPossible: parseInt(document.getElementById('assignmentPoints').value),
                submissionType: document.getElementById('assignmentSubmissionType').value,
                allowLateSubmissions: document.getElementById('assignmentAllowLate').checked,
                course: courseId
            };

            await assignmentService.createAssignment(assignmentData);
            document.body.removeChild(modalContainer);
            showToast('Assignment created successfully!');
            loadView('course-detail', { courseId: assignmentData.course });
        } catch (error) {
            const errorDiv = document.getElementById('assignmentError');
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                authService.logout();
                window.location.href = "index.html"; // Redirect to login page
            }
        });
    }

    // Apply translations whenever a new view is loaded
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ha') {
        // Initial translation on page load
        applyHausaTranslations();

        // Add translation call after loading any view
        const originalLoadView = window.loadView;
        window.loadView = function (view, params = {}) {
            const result = originalLoadView(view, params);
            // Check if loadView returns a promise
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    // Apply translations after view content is loaded
                    setTimeout(applyHausaTranslations, 100);
                });
            } else {
                // If not a promise, apply translations after a short delay
                setTimeout(applyHausaTranslations, 100);
            }
            return result;
        };
    }
});

async function togglePinResource(id) {
    try {
        const response = await resourceService.togglePin(id);
        showToast(response.data.message);
        loadView('resources'); // Refresh resource list
    } catch (error) {
        showToast('Error pinning resource', 'error');
    }
}

/**
 * Hausa language translation module
 * Contains translations for common UI elements
 */
const hausaTranslations = {
    // Navigation
    'Dashboard': 'Dashbod',
    'Courses': 'Darussa',
    'Assignments': 'Ayyuka Na',
    'Discussions': 'Tattaunawa',
    'Resources': 'Kayyayakin Aiki',
    'Announcements': 'Sanarwa',
    'Profile': 'Frofayil',
    'Settings': 'Saiti',
    'All':' Duka',
    'Logout': 'Fita',
    //Calendar
    'Today': 'Yau',
    'Tomorrow': 'Gobe',
    'This Week': 'Wannan Mako',
    'Next Week': 'Mako Mai Zuwa',
    'This Month': 'Wannan Watan',
    'Next Month': 'Watan Mai Zuwa',
    'April 2025': 'Afrilu 2025',

    // General UI
    'Main': 'Mafi Amfani:',
    'Home': 'Gida',
    'Save': 'Ajiye',
    'Update': 'Sabunta',
    'Create': 'Kirkiri',
    'Information': 'Bayani Mai Mahimmanci',
    'Comments ': 'Ra\'ayi',
    'Comment': 'Ra\'ayi',
    'Details': 'Cikakkun Bayanan',
    'Description': 'Bayani',
    'Title': 'Suna',
    'Date': 'Rana',
    'File': 'Fayil',
    'Welcome back,': 'Barka da dawowa,',
    'Cancel': 'Soke',
    'Delete': 'Share Kayan Aiki',
    'Edit': 'Gyara Kayan Aiki',
    'View': 'Bude',
    'Search': 'Bincika',
    'Loading': 'lodi...',
    'Submit': 'Tura',
    'Back': 'Koma',
    'Next': 'Na gaba',
    'Previous': 'Na baya',
    'Close': 'Rufe',

    //Dashboard elements
    'Upcoming Assignments': 'Ayyukan da ke tafe',
    'Explore more courses': 'Duba Duka darussa',
    'View All': 'Duba Duka',
    'Welcome back': 'Barka da dawowa',
    'You\'re all caught up!': 'Ka kammala dukkan ayyuka!',
    'No upcoming discussions': 'Babu tattaunawa',
    'No upcoming assignments due.': 'Babu ayyuka masu zuwa.',
    'No upcoming announcements': 'Babu sanarwa masu zuwa.',
    'Calendar': 'Kalanda',
    'View Calendar': 'Duba Kalanda',
    'No courses available': 'Babu darussa da ake da su',
    'No discussions available': 'Babu tattaunawa da ake da su',
    'No resources available': 'Babu kayan aiki',
    'No announcements available': 'Babu sanarwa ',
    'No assignments available': 'Babu ayyuka',
    'Recent Discussions': 'Tattaunawa na Kwanan nan',
    'Recent Announcements': 'Sanarwa na Kwanan nan',
    'No Available Courses': 'Babu Sabbin Darussa',
    'There are no new courses available for enrollment at this time.': 'A halin yanzu babu sabbin darussa da za a iya rajista.',

    // Course related
    'Course': 'Darasi',
    'My Courses': 'Darussa Na ',
    'All Courses': 'Duka Darussa',
    'Course Name': 'Sunan Darasi',
    'Course Description': 'Bayanin Darasi',
    'Course Duration': 'Tsawon Darasi',
    'students': 'dalibai',
    'Course Start Date': 'Ranar Fara Darasi',
    'Search courses...': 'Bincika Darussa...',
    'Available Courses': 'Darussa da Ba\'yi Rajista ba ',
    'Enroll': 'Yi Rajista',
    'Course Code': 'Lambar Darasi',
    'Instructor': 'Malami',
    'Students': 'Dalibai',
    'Create Course': 'Kirkiri Darasin',
    'Join Course': 'Shiga Darasin',
    'Course Details': 'Bayanin Darasin',
    'Course Information': 'Bayanin Darasi',
    'View Course Details': 'Duba Cikakken Bayanan Darasi',
    'Course Settings': 'Saitin Darasi',
    'Manage Students': 'Yi Manajin Dalibai',
    'New Announcement': 'Sabon Sanarwa',
    'New Assignment': 'Loda Sabon Aiki',
    'New Discussion': 'Sabon Tattaunawa',
    'Enrollment Code': 'Lambar Rajista',
    'Course Link': 'Linki na Darasi',
    'Generate Course Link': 'Kirkiri Linkin Darasi',
    'Students Enrolled': 'Dalibai da suka yi rajista',
    'Past Due': 'Lokaci ya wuce',
    'About this Course': 'Bayani akan Darasin Nan',
    'Enroll in Course': 'Yi Rajistan Darasin Nan',
    'Enter the course Enrollment Code': 'Shigar da Lambar Rajista',

    //Resource related
    'Upload Resource': 'Loda Kayan Aiki',
    'Resource Title': 'Sunan Kayan Aiki',
    'Resource Description': 'Bayanin Kayan Aiki',
    'Resource Type': 'Nau\'in Kayan Aiki',
    'File Upload': 'Loda Fayil',
    'Filter Resources': 'Tace Kayyayakin Aiki',
    'Search resources...': 'Bincika Kayyayakin Aiki...',
    'All Resources': 'Duka Kayan Aiki',
    'Lecture Materials': 'Kayan Koyarwa',
    'Reading Materials': 'Kayan Karatu',
    'Practice Exercises': 'kayan Aikin Fractice',
    'Text Content': 'Abun ciki na rubutu',
    'Assignment Materials': 'Kayan Aikin Aikin Gida',
    'Tutorial Videos': 'Bidio na koyarwa',
    'Other': 'Sauransu',
    'Resource Category': 'Rukuni na Kayan Aiki',
    'Resource Visibility': 'Bayyanar Kayan Aiki',
    'Visible to Students': 'Bayyana ga Dalibai',
    'Hidden from Students': 'Boye daga Dalibai',
    'Resource Link': 'Hanyar Kayan Aiki',
    'External URL': 'Hanyar Waje',
    'Resource Content': 'Abun ciki na Kayan Aiki',
    'All Types': 'Duka Nau\'in Kayan Aiki',
    'Files': 'Fayiloli',
    'Links': 'addreshi',
    'Text': 'Rubutu',
    'Back to Resources': 'Koma zuwa Kayyayakin Aiki Na',
    'Recently Added': 'Sabbin shigowa',
    'Added by': 'Daga',
    'Most Popular': 'Wanda Aka fi kalla',
    'Pinned': 'An Manna',
    'Most Liked': ' Wanda Aka fi So',
    'Most Downloaded': 'Wanda Aka fi Downloadi',
    'Most Viewed': 'Wanda Aka fi Dubawa',
    'Title (A-Z)': 'Suna (A-Z)',
    'Related Resources': 'Kayan Aiki Masu Alaka',
    'Related resources will appear here automatically.': 'Kayan aiki masu alaka zasu bayyana anan kai tsaye.',
    'Download': 'Yi Downloadi',
    'No comments yet. Be the first to comment!': 'Babu ra\'ayi tukuna. Kasance na farko da ya yi bada ra\'ayi!',
    'File Size': 'Girman Fayil',
    'File Type': 'Nau\'in Fayil',
    'View Details': 'Duba Cikakken Bayani',
    'Resource Actions': 'Abbubuwan Yi Da Kayan Aiki',
    'Share Resource': 'Tura Kayan Aiki',
    'Pin Resource': 'Manna Kayan Aiki',
    'View Course': 'Duba Darasi',
    'Resource Details': 'Bayanin Kayan Aiki',
    'Download File': 'Yi Downlodin Fayil',
    'Add your comment...': 'Saka ra\'ayi anan...',
    'Post Comment': 'Tura Ra\'ayi',
    'Sort by': 'Tace ta',
    'SORT BY': 'TACE TA',
    'Updated': 'An Gyara',

    //Date and time related
    "second": "sacon",
    "seconds": "sacon",
    "minute": "minti",
    "minutes": "mintuna",
    "hour": "awa",
    "hours": "awanni",
    "day": "rana",
    "days": "ranaku",
    "week": "mako",
    "weeks": "makonni",
    "month": "wata",
    "months": "watanni",
    "year": "shekara",
    "years": "shekaru",
    "ago": "da suka wuce",
    'AM': 'Na Safe',
    'PM': 'Na Yamma',
    // Months (full names)
    "January": "Janairu",
    "February": "Faburairu",
    "March": "Maris",
    "April": "Afrilu",
    "May": "Mayu",
    "June": "Yuni",
    "July": "Yuli",
    "August": "Agusta",
    "September": "Satumba",
    "October": "Oktoba",
    "November": "Nuwamba",
    "December": "Disamba",

    //Abrreviated days
    "Su": "Lah",
    "Mo": "Lit",
    "Tu": "Tal",
    "We": "Lar",
    "Th": "Alh",
    "Fr": "Jum",
    "Sa": "Asa",

    // Abbreviated months
    "Jan": "Janairu",
    "Feb": "Fabarairu",
    "Mar": "Maris",
    "Apr": "Afrilu",
    "May": "Mayu",
    "Jun": "Yuni",
    "Jul": "Yuli",
    "Aug": "Agusta",
    "Sep": "Satumba",
    "Oct": "Oktoba",
    "Nov": "Nuwamba",
    "Dec": "Disamba",

    // Special time words
    "today": "yau",
    "yesterday": "jiya",
    "tomorrow": "gobe",
    "now": "yanzu",
    "soon": "nan gaba",
    'Date Created': 'Ranar Kafa',
    'Last Updated': 'An Sabunta Karshe',
    'months ago': 'watanni dasuka wuce',

    // Assignment related
    'Due':'Lokacin Tura Wa',
    'Worth': 'Daraja',
    'Due Date': 'Kwanan Lokaci',
    'Submission': 'An Tura',
    'Allow Late Submissions': 'Ana Iya Tura Wa Latti',
    'Grade': 'Maki',
    'Active':'Sabbi',
    'Points': 'Maki Ake Iya Ci',
    'Submission Type': 'Nau\'in Tura Wa',
    'late submissions Allowed': 'Ana Iya Tura Wa Latti',
    'Manage Submissions': 'Duba da Ayyukan Da Aka Tura',
    'Export Grades': 'Fitar da Makin Dalibai',
    'Created': 'An Kafa',
    'Submission Summary': 'Takaitaccen Bayanin Tura Aiki',
    'Text and File Upload': 'Rubutu da Loda Fayil',
    'Text Only': 'Rubutu Kawai',
    'File Upload Only': 'Loda Fayil Kawai',
    'Late Submission': 'An Tura Latti',
    'Grading': 'Maki',
    'Score (out of 100)': 'Maki (bisa 100)',
    'Feedback': 'Ra\'ayyoyi',
    'Edit Grade': 'Gyara Maki',
    'All submissions': 'Duk Ayyukan Da Aka Tura',
    'On Time': 'Akan Lokaci',
    'Graded': 'Anyi Maki',
    'Ungraded': 'Ba Ayi Maki ba',
    'Active Assignments': 'Sabbin Ayyuka',
    'No upcoming assignments. Enjoy your free time!': 'Babu Ayyuka A Yanzu. A Huta Lafiya!',
    'Past Due Assignments': 'Ayyuka Dasuka Wuce',
    'Assignment': 'Aiki',

    'Submissions': 'Ayyukan Da Aka Tura',
    'Actions': 'Abun Yi',
    'Upcoming': 'Sabbin Ayyuka',
    'Submitted': 'An Tura',
    'Not Submitted': 'Ba a Tura ba',
    'Missed': 'Lokaci Ya Wuce',
    'Graded': 'Anyi Maki',
    'days overdue': 'ranaku dasuka wuce',
    'No submitted assignments awaiting grades': 'Babu Ayyuka da aka tura a yanzu',
    'Missed Assignments': 'Ayyuka Na Da Lokaci Ya Wuce',
    'Submitted Assignments': 'Ayyuka Da Aka Tura',
    'Assignment Details': 'Cikakken Bayanin Aiki',

    // Discussion related
    'Post': 'Rubutu',
    'Reply': 'Amsa',
    'Comments': 'Ra\'ayoyi',
    'Announcements': 'Sanarwa',
    'Popular Discussions': ' Sannanun Tattaunawa',
    'No popular discussions yet.': 'Babu Sannanun Tattaunawa a yanzu.',
    'Unread': 'Wainda Ba\'a Karanta ba',
    'My Posts': 'Tattaunawa Na',
    'Total Replies': 'Duka Amsoshi',

    // Profile and Settings
    'Account': 'Asusu',
    'Password': 'Kalmar Sirri',
    'Email': 'Imel',
    'E-Mail': 'Imel',
    'Name': 'Suna',
    'First Name': 'Sunan Farko',
    'Last Name': 'Sunan Karshe',
    'Profile Picture': 'Hoton Bayani',
    'Change Password': 'Canza Kalmar Sirri',
    'Language': 'Yare',
    'Theme': 'Jigo',
    'Light Mode': 'Farin Yanayi',
    'Dark Mode': 'Bakin Yanayi',
    'Notifications': 'Sanarwa',
    'Email Notifications': 'Sanarwar Imel',
    'Push Notifications': 'Sanarwar Tura',
    'Privacy': 'Sirri',
    'Select your preferred language for the interface.': 'Zaɓi yaren da kake so a wannan shafin.',
    'Select your preferred theme': 'Zaɓi jigon da kake so',
    'Customize your experience': 'Gyara saituttukan Ka',
    'Manage your account settings': 'Gudanar da saitunan asusunka',
    'Manage your privacy settings': 'Gudanar da saitunan sirrinka',
    'General': 'Komai da Komai',
    'Appearance': 'Kama',
    'Security': 'Tsaro',
    'Accessibility': 'Kananan Gyara-Gyare',

    // Messages
    'Successfully saved': 'An yi nasarar ajiye',
    'Changes applied': 'An yi canji',
    'An error occurred': 'An Samu Kuskure',
    'Resource not found': 'Ba a sami kaya ba',
    'Please try again': 'Da fatan a sake gwadawa',
    'Are you sure?': 'Kana tabbata?',
    'This action cannot be undone': 'Ba za\'a iya janye wannan aiki ba',

    // Settings sections
    'General Settings': 'Saitunan Gaba Ɗaya',
    'Account Settings': 'Saitunan Acount',
    'Account Information': 'Bayanin Acount',
    'Basic information about your account.': 'Bayanai akan acount',
    'Email Address': 'Adireshin Imel',
    'Change Email': 'Canza Imel',
    'Bio': 'Takaittacen Bayani',
    'Choose how dates and times are displayed.': 'Nuna Yanda Lokuta da Kwanan Wata Zasu bayyana.',
    'Brief description about yourself that will be visible on your profile.': 'Takaitaccen bayani akan mutum wanda zai bayyana profile.',
    'Profile Visibility': 'Bayyanar Profile',
    'Who can see your profile?': 'Wa zai iya ganin profile din mutum?',
    'Upload a profile picture to personalize your account.': 'Loda hoto don bambanta acount.',
    'Change Picture': 'Chanza Hoto',
    'Save Changes': 'Ajiye Canje-canje',
    'Appearance Settings': 'Saitunan Kama',
    'Language Settings': 'Saitin Yare',
    'Notification Settings': 'Saitunan Sanerwa',
    'Security Settings': 'Saitunan Tsaro',
    'Accessibility Settings': 'Saitunan Samuwa',

    // Specific to language settings
    'Display Language': 'Nuna Yare',
    'Log In': 'Shiga',
    'Sign Up': 'Yi Rajista',
    'Log In to Virtual Campus': 'Shiga Virtual Campus',
    'Don\'t have an Account?': 'Ba A Da accoun?',
    'Date & Time Format': 'Tsarin Kwanan Wata & Lokaci',
    'Date Format': 'Tsarin Kwanan Wata',
    'Time Format': 'Tsarin Lokaci',
    'Hausa Language Support': 'Yaren Hausa',
    'Hausa language is currently in beta': 'Yaren Hausa yana kan gwaji a halin yanzu',
    'Some parts of the interface may still appear in English': 'Wasu sassan na iya bayyana a turanci'
};

/**
 * Apply Hausa translations to the interface
 * This function finds text nodes in the DOM and replaces them with Hausa equivalents
 */
function applyEnglishTranslations() {
    // Store the fact that English is the active language
    localStorage.setItem('language', 'en');

    // Reload the page to reset all translations
    window.location.reload();
}

function applyHausaTranslations(targetElement = null, visitedElements = new Set()) {
    // Store the fact that Hausa is the active language
    localStorage.setItem('language', 'ha');
    localStorage.setItem('languageChange', 'true');

    // If no target specified, translate the whole document including modals
    const rootElement = targetElement || document.documentElement;

    // Prevent infinite recursion
    if (visitedElements.has(rootElement)) return;
    visitedElements.add(rootElement);

    // Enhanced translation function that handles patterns and placeholders
    function translateText(text, isAttribute = false) {
        if (!text || typeof text !== 'string') return text;

        const trimmedText = text.trim();
        if (!trimmedText) return text;

        // Normalize the text for lookup (handle case and extra whitespace)
        const normalizedText = trimmedText.replace(/\s+/g, ' '); // Replace multiple spaces with single space
        const lowerText = normalizedText.toLowerCase();

        // Direct translation lookup (try original, normalized, and lowercase versions)
        const directLookups = [trimmedText, normalizedText, lowerText];
        for (let lookup of directLookups) {
            if (hausaTranslations[lookup]) {
                return hausaTranslations[lookup];
            }
        }

        // Also try case-insensitive lookup by checking all translation keys
        for (let key in hausaTranslations) {
            if (key.toLowerCase() === lowerText) {
                return hausaTranslations[key];
            }
        }

        // Handle dynamic patterns with numbers in parentheses like "My Courses(4)"
        const numberPattern = /^(.+?)\s*\((\d+)\)$/;
        const numberMatch = trimmedText.match(numberPattern);
        if (numberMatch) {
            const baseText = numberMatch[1].trim();
            const number = numberMatch[2];
            if (hausaTranslations[baseText]) {
                return `${hausaTranslations[baseText]}(${number})`;
            }
        }

        // Handle patterns with variables like "Welcome, {username}!"
        const variablePattern = /\{[^}]+\}/g;
        if (variablePattern.test(trimmedText)) {
            let translatedText = trimmedText;
            // Extract the base text without variables
            const baseText = trimmedText.replace(variablePattern, '').trim();
            // Remove extra spaces and punctuation for lookup
            const cleanBaseText = baseText.replace(/[,!.?]+\s*$/, '').trim();

            if (hausaTranslations[cleanBaseText]) {
                // Replace the base text while preserving variables
                translatedText = trimmedText.replace(cleanBaseText, hausaTranslations[cleanBaseText]);
            }
            return translatedText;
        }

        // Handle greeting patterns like "Welcome back, Aliyu!" or "Hello, John!"
        const greetingPatterns = [
            /^(Welcome back),\s*([^,!.?]+)([!.?]*)$/i,
            /^(Welcome),\s*([^,!.?]+)([!.?]*)$/i,
            /^(Hello),\s*([^,!.?]+)([!.?]*)$/i,
            /^(Hi),\s*([^,!.?]+)([!.?]*)$/i,
            /^(Good morning),\s*([^,!.?]+)([!.?]*)$/i,
            /^(Good afternoon),\s*([^,!.?]+)([!.?]*)$/i,
            /^(Good evening),\s*([^,!.?]+)([!.?]*)$/i
        ];

        for (let pattern of greetingPatterns) {
            const greetingMatch = trimmedText.match(pattern);
            if (greetingMatch) {
                const greeting = greetingMatch[1];
                const name = greetingMatch[2];
                const punctuation = greetingMatch[3] || '';

                if (hausaTranslations[greeting]) {
                    return `${hausaTranslations[greeting]}, ${name}${punctuation}`;
                }
            }
        }

        // Handle patterns with names and punctuation like "Welcome back, Name!" without exact match
        const namePattern = /^(.+?),\s*([A-Z][a-zA-Z\s]*?)([!.?]*)$/;
        const nameMatch = trimmedText.match(namePattern);
        if (nameMatch) {
            const basePhrase = nameMatch[1].trim();
            const name = nameMatch[2].trim();
            const punctuation = nameMatch[3] || '';

            if (hausaTranslations[basePhrase]) {
                return `${hausaTranslations[basePhrase]}, ${name}${punctuation}`;
            }
        }

        // Handle patterns with percentage or other dynamic values like "Progress: 75%"
        const percentPattern = /^(.+?):\s*(\d+%?)$/;
        const percentMatch = trimmedText.match(percentPattern);
        if (percentMatch) {
            const baseText = percentMatch[1].trim();
            const value = percentMatch[2];
            if (hausaTranslations[baseText]) {
                return `${hausaTranslations[baseText]}: ${value}`;
            }
        }

        // Handle relative time patterns like "2 months ago", "26 days ago", "1 year ago"
        const relativeTimePatterns = [
            /^(\d+)\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+(ago)$/i,
            /^(\d+)\s+(sec|min|hr|hrs|wk|wks|mo|mos|yr|yrs)\s+(ago)$/i,
            /^(a|an)\s+(second|minute|hour|day|week|month|year)\s+(ago)$/i
        ];

        for (let pattern of relativeTimePatterns) {
            const timeMatch = trimmedText.match(pattern);
            if (timeMatch) {
                const number = timeMatch[1];
                const timeUnit = timeMatch[2].toLowerCase();
                const agoWord = timeMatch[3];

                // Handle "a" or "an" cases
                if (number === 'a' || number === 'an') {
                    const translatedUnit = hausaTranslations[timeUnit] || hausaTranslations[timeUnit + 's'];
                    const translatedAgo = hausaTranslations[agoWord];
                    if (translatedUnit && translatedAgo) {
                        return `${translatedUnit} 1 ${translatedAgo}`;
                    }
                } else {
                    // Handle plural/singular forms
                    let unitKey = timeUnit;
                    const num = parseInt(number);

                    // Map common abbreviations
                    const unitMap = {
                        'sec': 'second', 'min': 'minute', 'hr': 'hour', 'hrs': 'hours',
                        'wk': 'week', 'wks': 'weeks', 'mo': 'month', 'mos': 'months',
                        'yr': 'year', 'yrs': 'years'
                    };

                    if (unitMap[unitKey]) {
                        unitKey = unitMap[unitKey];
                    }

                    // Try both singular and plural forms
                    const translatedUnit = hausaTranslations[unitKey] ||
                        hausaTranslations[unitKey + 's'] ||
                        hausaTranslations[unitKey.replace(/s$/, '')];
                    const translatedAgo = hausaTranslations[agoWord];

                    if (translatedUnit && translatedAgo) {
                        return `${translatedUnit} ${number} ${translatedAgo}`;
                    }
                }
            }
        }

        // Handle month-year patterns like "June 2025", "December 2024"
        const monthYearPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
        const monthYearMatch = trimmedText.match(monthYearPattern);
        if (monthYearMatch) {
            const month = monthYearMatch[1];
            const year = monthYearMatch[2];

            if (hausaTranslations[month]) {
                return `${hausaTranslations[month]} ${year}`;
            }
        }

        // Handle abbreviated month patterns like "Jan 2025", "Feb 2024"
        const shortMonthYearPattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i;
        const shortMonthYearMatch = trimmedText.match(shortMonthYearPattern);
        if (shortMonthYearMatch) {
            const shortMonth = shortMonthYearMatch[1];
            const year = shortMonthYearMatch[2];

            if (hausaTranslations[shortMonth]) {
                return `${hausaTranslations[shortMonth]} ${year}`;
            }
        }

        // Handle date patterns like "June 15, 2025" or "15 June 2025"
        const fullDatePatterns = [
            /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i,
            /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i
        ];

        for (let pattern of fullDatePatterns) {
            const dateMatch = trimmedText.match(pattern);
            if (dateMatch) {
                if (pattern.source.startsWith('^(January')) {
                    // Month Day, Year format
                    const month = dateMatch[1];
                    const day = dateMatch[2];
                    const year = dateMatch[3];

                    if (hausaTranslations[month]) {
                        return `${day} ${hausaTranslations[month]} ${year}`;
                    }
                } else {
                    // Day Month Year format
                    const day = dateMatch[1];
                    const month = dateMatch[2];
                    const year = dateMatch[3];

                    if (hausaTranslations[month]) {
                        return `${day} ${hausaTranslations[month]} ${year}`;
                    }
                }
            }
        }

        // Handle "today", "yesterday", "tomorrow" patterns
        const specialTimeWords = ['today', 'yesterday', 'tomorrow', 'now', 'recently', 'soon'];
        if (specialTimeWords.includes(trimmedText.toLowerCase())) {
            const translation = hausaTranslations[trimmedText.toLowerCase()];
            if (translation) {
                return translation;
            }
        }

        // Handle patterns like "Page 1 of 5"
        const pagePattern = /^(.+?)\s+(\d+)\s+(.+?)\s+(\d+)$/;
        const pageMatch = trimmedText.match(pagePattern);
        if (pageMatch) {
            const part1 = pageMatch[1];
            const num1 = pageMatch[2];
            const part2 = pageMatch[3];
            const num2 = pageMatch[4];

            if (hausaTranslations[part1] && hausaTranslations[part2]) {
                return `${hausaTranslations[part1]} ${num1} ${hausaTranslations[part2]} ${num2}`;
            }
        }

        // Handle compound phrases - check for complete phrases first, then fall back to individual words
        const words = normalizedText.split(/\s+/);
        if (words.length > 1) {
            // First, try to find longer phrase combinations (case-insensitive)
            for (let length = words.length; length >= 2; length--) {
                for (let start = 0; start <= words.length - length; start++) {
                    const phrase = words.slice(start, start + length).join(' ');
                    const cleanPhrase = phrase.replace(/[^\w\s]/g, '').trim();

                    // Try exact match, clean match, and case-insensitive matches
                    const phraseLookups = [phrase, cleanPhrase, phrase.toLowerCase(), cleanPhrase.toLowerCase()];
                    let translation = null;

                    for (let lookup of phraseLookups) {
                        if (hausaTranslations[lookup]) {
                            translation = hausaTranslations[lookup];
                            break;
                        }
                    }

                    // Also try case-insensitive key matching
                    if (!translation) {
                        for (let key in hausaTranslations) {
                            if (key.toLowerCase() === phrase.toLowerCase() || key.toLowerCase() === cleanPhrase.toLowerCase()) {
                                translation = hausaTranslations[key];
                                break;
                            }
                        }
                    }

                    if (translation) {
                        const before = words.slice(0, start);
                        const after = words.slice(start + length);

                        // Preserve punctuation from original phrase
                        const punctuation = phrase.match(/[^\w\s]+$/);
                        const translatedPhrase = punctuation ? translation + punctuation[0] : translation;

                        return [...before, translatedPhrase, ...after].join(' ');
                    }
                }
            }

            // Fall back to individual word translation only if no phrase matches found
            let hasTranslation = false;
            let translatedWords = words.map(word => {
                const cleanWord = word.replace(/[^\w\s]/g, ''); // Remove punctuation

                // Try multiple lookup variations for each word
                const wordLookups = [word, cleanWord, word.toLowerCase(), cleanWord.toLowerCase()];
                let wordTranslation = null;

                for (let lookup of wordLookups) {
                    if (hausaTranslations[lookup]) {
                        wordTranslation = hausaTranslations[lookup];
                        break;
                    }
                }

                // Also try case-insensitive key matching for individual words
                if (!wordTranslation) {
                    for (let key in hausaTranslations) {
                        if (key.toLowerCase() === cleanWord.toLowerCase()) {
                            wordTranslation = hausaTranslations[key];
                            break;
                        }
                    }
                }

                if (wordTranslation) {
                    hasTranslation = true;
                    return word.replace(cleanWord, wordTranslation);
                }
                return word;
            });

            if (hasTranslation) {
                return translatedWords.join(' ');
            }
        }

        return text; // Return original if no translation found
    }

    // Walk through text nodes and translate them - use rootElement instead of document.body
    const textNodes = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                // Skip script and style elements
                const parent = node.parentElement;
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' ||
                    parent.closest('[data-user-content="true"], .user-content')
                )) {
                    return NodeFilter.FILTER_REJECT;
                }
                // Only process nodes with meaningful text
                return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        },
        false
    );

    let node;
    const processedNodes = new Set();

    while (node = textNodes.nextNode()) {
        // Avoid processing the same node multiple times
        if (processedNodes.has(node)) continue;
        processedNodes.add(node);

        const originalText = node.nodeValue;
        const translatedText = translateText(originalText);

        if (translatedText !== originalText) {
            node.nodeValue = translatedText;
        }
    }

    // Translate attributes like placeholders, titles, and aria-labels - use rootElement
    const attributesToTranslate = ['placeholder', 'title', 'aria-label', 'alt', 'data-tooltip'];
    const elements = rootElement.querySelectorAll(
        attributesToTranslate.map(attr => `[${attr}]`).join(', ')
    );

    elements.forEach(el => {
        attributesToTranslate.forEach(attr => {
            if (el.hasAttribute(attr)) {
                const originalText = el.getAttribute(attr);
                const translatedText = translateText(originalText, true);

                if (translatedText !== originalText) {
                    el.setAttribute(attr, translatedText);
                }
            }
        });
    });

    // Handle select dropdowns and their options - use rootElement
    const selectElements = rootElement.querySelectorAll('select');
    selectElements.forEach(selectEl => {
        selectEl.querySelectorAll('option').forEach(optionEl => {
            const originalText = optionEl.textContent;
            const translatedText = translateText(originalText);

            if (translatedText !== originalText) {
                optionEl.textContent = translatedText;
            }

            // Also translate the value attribute if it contains text
            const value = optionEl.getAttribute('value');
            if (value && isNaN(value) && value !== originalText.trim()) {
                const translatedValue = translateText(value, true);
                if (translatedValue !== value) {
                    optionEl.setAttribute('value', translatedValue);
                }
            }
        });
    });

    // Handle buttons and interactive elements - use rootElement
    const interactiveElements = rootElement.querySelectorAll('button, input[type="submit"], input[type="button"], a');
    interactiveElements.forEach(el => {
        // Translate button text content
        if (el.textContent && el.textContent.trim()) {
            const originalText = el.textContent;
            const translatedText = translateText(originalText);

            if (translatedText !== originalText) {
                el.textContent = translatedText;
            }
        }

        // Translate input values for buttons
        if (el.tagName === 'INPUT' && el.hasAttribute('value')) {
            const originalValue = el.getAttribute('value');
            const translatedValue = translateText(originalValue, true);

            if (translatedValue !== originalValue) {
                el.setAttribute('value', translatedValue);
            }
        }
    });

    // Handle data attributes that might contain user-facing text - use rootElement
    const elementsWithDataText = rootElement.querySelectorAll('[data-text], [data-label], [data-message]');
    elementsWithDataText.forEach(el => {
        ['data-text', 'data-label', 'data-message'].forEach(attr => {
            if (el.hasAttribute(attr)) {
                const originalText = el.getAttribute(attr);
                const translatedText = translateText(originalText, true);

                if (translatedText !== originalText) {
                    el.setAttribute(attr, translatedText);
                }
            }
        });
    });

    // Set document language
    document.documentElement.setAttribute('lang', 'ha');

    // Translate any existing modals and portals
    translateModalsAndPortals(visitedElements);

    // Optional: Dispatch custom event to notify other parts of the application
    const translationEvent = new CustomEvent('translationApplied', {
        detail: { language: 'ha', timestamp: Date.now(), target: targetElement || 'document' }
    });
    document.dispatchEvent(translationEvent);
}

// Function to specifically target modals and portal elements
function translateModalsAndPortals(visitedElements = new Set()) {
    if (localStorage.getItem('language') !== 'ha') return;

    // Common modal selectors
    const modalSelectors = [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '.modal',
        '.dialog',
        '.popup',
        '.overlay',
        '.modal-content',
        '.modal-body',
        '.modal-header',
        '.modal-footer',
        '[data-modal]',
        '[data-dialog]',
        '.fixed.inset-0', // Common Tailwind modal pattern
        '.z-50', // High z-index elements (often modals)
        '#modal',
        '#dialog',
        '.ReactModal__Content', // React Modal
        '.MuiDialog-root', // Material-UI
        '.ant-modal', // Ant Design
        '.el-dialog', // Element UI
        '.v-dialog' // Vuetify
    ];

    const foundModals = document.querySelectorAll(modalSelectors.join(', '));

    foundModals.forEach(modal => {
        // Prevent infinite recursion: if we've already processed this element, skip
        if (visitedElements.has(modal)) return;
        visitedElements.add(modal);

        // Check if modal is visible or has content
        const isVisible = modal.oiffsetParent !== null ||
            getComputedStyle(modal).display !== 'none' ||
            modal.getAttribute('aria-hidden') !== 'true';

        // Translate both visible and hidden modals (they might become visible later)
        applyHausaTranslations(modal, visitedElements);
    });

    // Also check for elements appended to body that might be portals
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
        // Prevent infinite recursion: if we've already processed this element, skip
        if (visitedElements.has(child)) return;
        // Look for elements with high z-index or common portal characteristics
        const style = getComputedStyle(child);
        const zIndex = parseInt(style.zIndex);

        if (zIndex > 1000 ||
            style.position === 'fixed' ||
            child.classList.contains('portal') ||
            child.id.includes('portal') ||
            child.id.includes('modal') ||
            child.id.includes('dialog')) {
            applyHausaTranslations(child, visitedElements);
        }
    });

    // Check React portals and other common portal containers
    const portalContainers = document.querySelectorAll(
        '#root-portal, #modal-root, #dialog-root, #portal-root, .portal-container'
    );

    portalContainers.forEach(container => {
        if (visitedElements.has(container)) return;
        applyHausaTranslations(container, visitedElements);
    });
}


// Helper function to observe and translate dynamically added content
function observeDynamicContent() {
    const observer = new MutationObserver(function (mutations) {
        // Check if Hausa is still the active language
        if (localStorage.getItem('language') !== 'ha') return;

        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is a modal or portal element
                        const isModal = node.matches && (
                            node.matches('[role="dialog"]') ||
                            node.matches('[aria-modal="true"]') ||
                            node.matches('.modal, .dialog, .popup, .overlay') ||
                            node.classList.contains('modal') ||
                            node.id.includes('modal') ||
                            node.id.includes('dialog')
                        );

                        // Translate the new element and its children
                        translateElement(node);

                        // If it's a modal, also run the comprehensive translation
                        if (isModal) {
                            // Wait a bit for the modal to fully render
                            setTimeout(() => {
                                applyHausaTranslations(node);
                            }, 100);
                        }
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        // Translate the text node
                        const originalText = node.nodeValue;
                        const translatedText = translateText(originalText);
                        if (translatedText !== originalText) {
                            node.nodeValue = translatedText;
                        }
                    }
                });
            } else if (mutation.type === 'attributes') {
                // Handle attribute changes
                const target = mutation.target;
                const attributeName = mutation.attributeName;

                if (['placeholder', 'title', 'aria-label', 'alt'].includes(attributeName)) {
                    const originalText = target.getAttribute(attributeName);
                    const translatedText = translateText(originalText, true);

                    if (translatedText !== originalText) {
                        target.setAttribute(attributeName, translatedText);
                    }
                }

                // Check for visibility changes that might indicate a modal appearing
                if (attributeName === 'style' || attributeName === 'class' || attributeName === 'aria-hidden') {
                    const isModalElement = target.matches && (
                        target.matches('[role="dialog"]') ||
                        target.matches('.modal, .dialog, .popup')
                    );

                    if (isModalElement) {
                        setTimeout(() => {
                            applyHausaTranslations(target);
                        }, 50);
                    }
                }
            }
        });
    });

    // Observe the entire document, including head for dynamically added content
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['placeholder', 'title', 'aria-label', 'alt', 'data-text', 'data-label', 'style', 'class', 'aria-hidden']
    });

    return observer;
}

// Helper function to translate a specific element and its children
function translateElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    // Skip script and style elements
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;

    // Translate text content
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                const parent = node.parentElement;
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        },
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const originalText = node.nodeValue;
        const translatedText = translateText(originalText);

        if (translatedText !== originalText) {
            node.nodeValue = translatedText;
        }
    }

    // Translate attributes
    const attributesToTranslate = ['placeholder', 'title', 'aria-label', 'alt', 'data-tooltip'];
    if (element.hasAttributes()) {
        attributesToTranslate.forEach(attr => {
            if (element.hasAttribute(attr)) {
                const originalText = element.getAttribute(attr);
                const translatedText = translateText(originalText, true);

                if (translatedText !== originalText) {
                    element.setAttribute(attr, translatedText);
                }
            }
        });
    }

    // Handle select options
    if (element.tagName === 'SELECT') {
        element.querySelectorAll('option').forEach(optionEl => {
            const originalText = optionEl.textContent;
            const translatedText = translateText(originalText);

            if (translatedText !== originalText) {
                optionEl.textContent = translatedText;
            }
        });
    }
}

// Additional helper functions for modal-specific scenarios

// Function to translate modals when they become visible
function translateOnModalOpen() {
    // Listen for common modal events
    document.addEventListener('click', function (e) {
        if (localStorage.getItem('language') !== 'ha') return;

        // Check if clicked element might open a modal
        const modalTriggers = e.target.closest('[data-modal], [data-toggle="modal"], .modal-trigger, [aria-haspopup="dialog"]');

        if (modalTriggers) {
            setTimeout(() => {
                translateModalsAndPortals();
            }, 200); // Wait for modal to appear
        }
    });

    // Listen for focus events (modals often focus on first element)
    document.addEventListener('focusin', function (e) {
        if (localStorage.getItem('language') !== 'ha') return;

        const modalElement = e.target.closest('[role="dialog"], .modal, [aria-modal="true"]');
        if (modalElement) {
            applyHausaTranslations(modalElement);
        }
    });
}

// Function to manually trigger translation of all visible modals
function translateVisibleModals() {
    if (localStorage.getItem('language') !== 'ha') return;

    const modalSelectors = [
        '[role="dialog"]:not([aria-hidden="true"])',
        '[aria-modal="true"]',
        '.modal:not(.hidden)',
        '.dialog:not(.hidden)',
        '.popup:not(.hidden)'
    ];

    const visibleModals = document.querySelectorAll(modalSelectors.join(', '));
    visibleModals.forEach(modal => {
        applyHausaTranslations(modal, visitedElements);
    });
}

// Function to force translation of specific modal by ID or selector
function translateModal(selector) {
    if (localStorage.getItem('language') !== 'ha') return;
   
    

    const modal = document.querySelector(selector);
    if (modal) {
        applyHausaTranslations(modal, new Set());
        return true;
    }
    return false;
}

// Comprehensive initialization function
function initHausaTranslation() {
    // Apply initial translations
    applyHausaTranslations(undefined, new Set());
;

    // Set up dynamic content observer
    const observer = observeDynamicContent();

    // Set up modal-specific listeners
    translateOnModalOpen();

    // Periodic check for missed modals (fallback)
    const modalCheckInterval = setInterval(() => {
        if (localStorage.getItem('language') !== 'ha') {
            clearInterval(modalCheckInterval);
            return;
        }
        translateModalsAndPortals(new Set());
    }, 2000);

    // Return cleanup function
    return function cleanup() {
        observer.disconnect();
        clearInterval(modalCheckInterval);
    };
}

/**
  Reset interface language to default (English)
 **/
function resetToDefaultLanguage() {
    localStorage.removeItem('language');
    //location.reload(); // Reload the page to reset translations
}

/**
 * Initialize language based on user preference
 * Call this during application startup
 */
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ha') {
        // Apply translations immediately
        applyHausaTranslations(undefined, new Set());
        // Add mutation observer to handle dynamically added content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    applyHausaTranslations(undefined, new Set());
                }
            });
        });

        // Start observing the content div for changes
        observer.observe(document.getElementById('content'), {
            childList: true,
            subtree: true
        });
    }
    else {
        // Default to English if no preference is set
        resetToDefaultLanguage();
        localStorage.setItem('languageChange', 'true');
    }
    // Reload the page to apply translations
}
function reloadPage() {
    location.reload(); // Reload the page to apply translations
}

/**
 * Show modal with active user sessions
 */
function showSessionsModal() {
    // In a real app, you would fetch active sessions from the server
    // For demonstration, we'll use mock data
    const mockSessions = [
        {
            id: '1',
            device: 'Chrome on Windows',
            location: 'Lagos, Nigeria',
            lastActive: new Date(Date.now() - 1000 * 60), // 1 minute ago
            isCurrent: true
        },
        {
            id: '2',
            device: 'Safari on iPhone',
            location: 'Abuja, Nigeria',
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            isCurrent: false
        },
        {
            id: '3',
            device: 'Firefox on Mac',
            location: 'Kano, Nigeria',
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            isCurrent: false
        }
    ];

    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Active Sessions</h3>
                    <button id="closeSessionsModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    These are the devices currently logged into your account. If you don't recognize a session, you should revoke it and change your password.
                </p>
                
                <div class="space-y-3 mb-6">
                    ${mockSessions.map(session => `
                        <div class="p-4 border ${session.isCurrent ? 'border-primary dark:border-primaryLight' : 'border-gray-200 dark:border-gray-700'} rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="flex items-center">
                                        <i class="fas ${session.device.includes('Chrome') ? 'fa-chrome' :
            session.device.includes('Safari') ? 'fa-safari' :
                session.device.includes('Firefox') ? 'fa-firefox' :
                    'fa-globe'} mr-2 text-gray-500"></i>
                                        <span class="font-medium">${session.device}</span>
                                        ${session.isCurrent ? '<span class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">Current</span>' : ''}
                                    </div>
                                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span><i class="fas fa-map-marker-alt mr-1"></i> ${session.location}</span>
                                        <span class="ml-3"><i class="fas fa-clock mr-1"></i> Last active ${formatTimeAgo(session.lastActive)}</span>
                                    </div>
                                </div>
                                
                                ${!session.isCurrent ? `
                                    <button class="revoke-session-btn px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-500/30 transition" data-id="${session.id}">
                                        Revoke
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="flex justify-between">
                    <button id="revokeAllBtn" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-500/30 transition">
                        Revoke All Other Sessions
                    </button>
                    
                    <button id="closeSessionsBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    // Set up event listeners
    document.getElementById('closeSessionsModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('closeSessionsBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Individual session revocation
    const revokeButtons = document.querySelectorAll('.revoke-session-btn');
    revokeButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const sessionId = btn.dataset.id;

            // In a real app, this would call an API endpoint
            try {
                // Mock API call
                // await userService.revokeSession(sessionId);

                // Show success toast
                showToast('Session revoked successfully');

                // Remove the session from the DOM
                btn.closest('.p-4').remove();
            } catch (error) {
                console.error('Error revoking session:', error);
                showToast('Failed to revoke session', 'error');
            }
        });
    });

    // Revoke all other sessions
    document.getElementById('revokeAllBtn').addEventListener('click', async () => {
        // In a real app, this would call an API endpoint
        try {
            // Mock API call
            // await userService.revokeAllOtherSessions();

            // Show success toast
            showToast('All other sessions revoked successfully');

            // Remove all non-current sessions from the DOM
            document.querySelectorAll('.revoke-session-btn').forEach(btn => {
                btn.closest('.p-4').remove();
            });
        } catch (error) {
            console.error('Error revoking sessions:', error);
            showToast('Failed to revoke sessions', 'error');
        }
    });
}

/**
 * Show delete account confirmation modal
 */
function showDeleteAccountModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-red-600 dark:text-red-400">Delete Account</h3>
                    <button id="closeDeleteAccountModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Warning: This action cannot be undone</h3>
                            <div class="mt-2 text-sm text-red-700 dark:text-red-200">
                                <p>
                                    Deleting your account will permanently remove all of your data, including:
                                </p>
                                <ul class="list-disc list-inside mt-2">
                                    <li>Course enrollments and progress</li>
                                    <li>Assignment submissions</li>
                                    <li>Discussion posts and comments</li>
                                    <li>Personal information and settings</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form id="deleteAccountForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                        <input type="password" id="confirmDeletePassword" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200" required>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="confirmDeleteCheckbox" class="form-checkbox rounded text-red-500 focus:ring-red-500 h-4 w-4" required>
                        <label for="confirmDeleteCheckbox" class="ml-2 text-gray-700 dark:text-gray-300">I understand that this action cannot be undone</label>
                    </div>
                    
                    <div id="deleteAccountError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelDeleteBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                            Delete Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    // Set up event listeners
    document.getElementById('closeDeleteAccountModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Form submission
    document.getElementById('deleteAccountForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('confirmDeletePassword').value;
        const confirmed = document.getElementById('confirmDeleteCheckbox').checked;
        const errorDiv = document.getElementById('deleteAccountError');

        errorDiv.classList.add('hidden');

        if (!password) {
            errorDiv.textContent = 'Please enter your password';
            errorDiv.classList.remove('hidden');
            return;
        }

        if (!confirmed) {
            errorDiv.textContent = 'Please confirm that you understand this action cannot be undone';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            // In a real app, this would call the API to delete the account
            await userService.deleteAccount({ password });

            // Show success message
            showToast('Your account has been deleted');

            // Redirect to logout
            setTimeout(() => {
                window.location.href = '/logout';
            }, 2000);
        } catch (error) {
            console.error('Error deleting account:', error);
            errorDiv.textContent = error.message || 'Failed to delete account. Please check your password and try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

/**
 * Toggle language between Hausa and English
 * @param {string} language - The language to switch to ('ha' for Hausa, 'en' for English)
 */
function toggleLanguage(language) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;

    // Set the language preference
    localStorage.setItem('language', language);
    // Set a flag to indicate we're changing languages
    localStorage.setItem('languageChange', 'true');

    // Force reload the page
    window.location.reload();
}

// Add to views.js
function showReportModal(contentType, contentId, contentPreview) {
    const modalHtml = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Report Content</h3>
          <button id="closeReportModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <p class="text-sm text-gray-600 dark:text-gray-400">Content Preview:</p>
          <p class="mt-1" data-user-content="true">${contentPreview}</p>
        </div>

        <form id="reportForm" class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2">Reason for Report</label>
            <select id="reportReason" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800">
              <option value="">Select a reason...</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="misinformation">Misinformation</option>
              <option value="copyright">Copyright Violation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2">Additional Details</label>
            <textarea id="reportDetails" rows="3" maxlength="500" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"></textarea>
          </div>

          <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(modalContainer);
    }
    document.getElementById('closeReportModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('reportForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const reason = document.getElementById('reportReason').value;
        const details = document.getElementById('reportDetails').value;

        try {
            await reportService.createReport({
                contentType,
                contentId,
                reason,
                details
            });

            showToast('Report submitted successfully', 'success');
            document.body.removeChild(modalContainer);
        } catch (error) {
            showToast(error.message || 'Failed to submit report', 'error');
        }
    });
}