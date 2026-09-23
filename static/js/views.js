// Current state
let currentView = 'dashboard';
let currentCourse = null;

// Login page
function loadLoginPage() {
    hideUIElements();

    content.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-6 text-center">Log In to Virtual Campus</h2>
          
          <form id="loginForm" class="space-y-6">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" id="email" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
            
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" id="password" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 dark:text-gray-200">
            </div>
            
            <div id="loginError" class="text-red-500 hidden"></div>
            
            <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
              Log In
            </button>
          </form>
          
          <div class="mt-4 text-center">
            <p class="text-gray-600 dark:text-gray-400">
              Don't have an account? 
              <a href="#" onclick="loadSignupPage(); return false;" class="text-primary dark:text-primaryLight hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Add event listener for form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = "";

            // Log in once and get the user data
            const result = await authService.login(email, password);

            if (!result) {
                loadLoginPage();

            }

            // Update UI with user info
            showUIElements();
            updateUserInfo();

            // Check for a pending secure join token stored in localStorage
            const pendingToken = localStorage.getItem('pendingJoinToken');
            if (pendingToken) {
                localStorage.removeItem('pendingJoinToken');
                // joinCourseViaLink should be defined in your secure link service logic
                await joinCourseViaLink(pendingToken);
            } else {
                showToast("Logged in Successfully")
                loadView('dashboard');
            }
        } catch (error) {
            console.error("Login error:", error);

            // User-friendly error messages
            let errorMessage = 'An error occurred while logging in.';

            if (error.status === 401) {
                errorMessage = 'Invalid email or password.';
            } else if (error.status === 400) {
                errorMessage = 'Please enter both email and password.';
            } else if (error.message.includes('NetworkError')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            }

            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove('hidden');

        }
    });
}


// Signup page
function loadSignupPage() {
    hideUIElements();

    content.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
                <h2 class="text-2xl font-bold mb-6 text-center">Create an Account</h2>
                
                <form id="signupForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                            <input type="text" id="firstName" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                            <input type="text" id="lastName" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Role</label>
                        <select id="role" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="password" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                        <input type="password" id="passwordConfirm" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div id="signupError" class="text-red-500 hidden"></div>
                    
                    <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                        Sign Up
                    </button>
                </form>
                
                <div class="mt-4 text-center">
                    <p class="text-gray-600 dark:text-gray-400">
                        Already have an account? 
                        <a href="#" onclick="loadLoginPage(); return false;" class="text-primary dark:text-primaryLight hover:underline">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add event listener for form submission
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const errorDiv = document.getElementById('signupError');

        // Validate passwords match
        if (password !== passwordConfirm) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            errorDiv.classList.add('hidden');
            const result = await authService.signup({
                firstName,
                lastName,
                email,
                role,
                password,
                passwordConfirm
            });

            // Update UI with user info
            showUIElements();
            updateUserInfo();
            showToast("Account Created Successfully");
            loadView('dashboard');

        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}

// Dashboard view
/**
 * Load dashboard view with courses, upcoming assignments and recent discussions
 * @returns {Promise<void>}
 */
async function loadDashboard() {
    try {
        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;

        // Fetch user's courses
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.data.courses;

        // Initialize arrays for assignments and discussions
        let upcomingAssignments = [];
        let recentDiscussions = [];

        // Only proceed if user has courses
        if (courses.length > 0) {
            // Fetch upcoming assignments
            try {
                const assignmentsResponse = await assignmentService.getAllAssignments();
                const allAssignments = assignmentsResponse.data.assignments;


                upcomingAssignments = allAssignments.filter(assignment => {
                    // Check if assignment belongs to one of user's courses
                    const courseMatch = courses.some(course =>
                        (typeof assignment.course === 'object' && assignment.course._id === course._id) ||
                        assignment.course === course._id
                    );

                    // For due date, compare with current date
                    const dueDate = new Date(assignment.dueDate);
                    const now = new Date();
                    const isUpcoming = dueDate > now;

                    // If student, check if already submitted
                    let notSubmitted = true;
                    if (currentUser.role === 'student' && assignment.submissions) {
                        // Check if this student has already submitted
                        notSubmitted = !assignment.submissions.some(submission =>
                            (typeof submission.student === 'object' && submission.student._id === currentUser._id) ||
                            submission.student === currentUser._id
                        );
                    }

                    return courseMatch && isUpcoming && (currentUser.role !== 'student' || notSubmitted);
                });

                // Sort by due date (closest first)
                upcomingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

                // Limit to 5 items
                upcomingAssignments = upcomingAssignments.slice(0, 5);
            } catch (error) {
                console.warn('Could not fetch assignments:', error);
            }

            // Fetch recent discussions
            try {
                const discussionsResponse = await discussionService.getAllDiscussions();
                const allDiscussions = discussionsResponse.data.discussions;

                // Filter discussions that are from user's courses
                recentDiscussions = allDiscussions.filter(discussion => {
                    return courses.some(course =>
                        (typeof discussion.course === 'object' && discussion.course._id === course._id) ||
                        discussion.course === course._id
                    );
                });

                // Sort by most recent activity
                recentDiscussions.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

                // Limit to 5 items
                recentDiscussions = recentDiscussions.slice(0, 5);
            } catch (error) {
                console.warn('Could not fetch discussions:', error);
            }
        }
        let recentAnnouncements = [];

        try {
            // You may need to implement this in your announcementService
            const announcementsResponse = await announcementService.getAllAnnouncements();
            const allAnnouncements = announcementsResponse.data.announcements;

            // Filter announcements for user's courses
            recentAnnouncements = allAnnouncements.filter(announcement =>
    announcement.course && courses.some(course =>
        (typeof announcement.course === 'object' && announcement.course._id === course._id) ||
        announcement.course === course._id
    )
);

            // Sort by most recent
            recentAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            recentAnnouncements = recentAnnouncements.slice(0, 5);
        } catch (error) {
            console.warn('Could not fetch announcements:', error);
        }


        // Build dashboard HTML
        content.innerHTML = `
            <div class="mb-6">
            <h1 class="text-2xl font-bold">Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400">Welcome back, ${currentUser.firstName}!</p>
            <hr class="my-4 border-black-200 dark:border-black-700">
            </div>
            
            <!-- My Courses Section -->
            <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">My Courses</h2>
                <a href="#" onclick="event.preventDefault(); loadView('courses');" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                View All
                </a>
            </div>
            
            ${courses.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${courses.slice(0, 6).map(course => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer" onclick="loadView('course-detail', {courseId: '${course._id}'})">
                    <div class="h-20 bg-gradient-to-r" style="background-color: ${course.color || '#5D5CDE'}"></div>
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-1" data-user-content="true">${course.name}</h3>
                        <div class="flex items-center justify-between">
                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${course.color || '#5D5CDE'}25; color: ${course.color || '#5D5CDE'}">
                            ${course.code}
                        </span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            ${course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Instructor'}
                        </span>
                        </div>
                    </div>
                    </div>
                `).join('')}
                
                ${courses.length > 6 ? `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex items-center justify-center h-40" onclick="loadView('courses')">
                    <div class="text-center">
                        <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-ellipsis-h text-gray-500 dark:text-gray-400"></i>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400">View all ${courses.length} courses</p>
                    </div>
                    </div>
                ` : ''}
                
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-gray-700" onclick="loadView('courses')">
                    <div class="text-center">
                    <div class="w-12 h-12 bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-plus text-primary dark:text-primaryLight"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400">Explore more courses</p>
                    </div>
                </div>
                </div>
            ` : `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <div class="w-16 h-16 bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-book text-primary dark:text-primaryLight text-2xl"></i>
                </div>
                <h3 class="font-semibold text-lg mb-2">No Courses Yet</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">You are not enrolled in any courses yet.</p>
                <button onclick="loadView('courses')" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    Browse Courses
                </button>
                </div>
            `}
            </div>
            
            <hr class="my-4 border-black-200 dark:border-black-700">
            <!-- Two Column Layout for Assignments and Discussions -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Upcoming Assignments -->
            <div>
                <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Upcoming Assignments</h2>
                <a href="#" onclick="event.preventDefault(); loadView('assignments');" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                    View All
                </a>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                ${upcomingAssignments.length > 0 ? `
                    <div class="space-y-4">
                    ${upcomingAssignments.map(assignment => {
            const course = assignment.course;
            const courseName = typeof course === 'object' ? course.name : 'Course';
            const courseCode = typeof course === 'object' ? course.code : '';
            const courseColor = typeof course === 'object' ? (course.color || '#5D5CDE') : '#5D5CDE';
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            return `
                        <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer" onclick="showAssignmentModal('${assignment._id}')">
                            <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-medium" data-user-content="true">${assignment.title}</h3>
                                <div class="flex items-center mt-1">
                                <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor}">
                                    ${courseCode}
                                </span>
                                <span class="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">${courseName}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-medium text-sm ${daysLeft <= 1 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}">
                                ${formatDate(assignment.dueDate, true)}
                                </div>
                                <div class="text-xs ${daysLeft <= 1 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}">
                                ${daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                                </div>
                            </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                    </div>
                ` : `
                    <div class="text-center py-6">
                    <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-check text-green-500 text-xl"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400">You're all caught up!</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No upcoming assignments due.</p>
                    </div>
                `}
                </div>
            </div>
            
            <!-- Recent Discussions -->
            <div>
                <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Recent Discussions</h2>
                <a href="#" onclick="event.preventDefault(); loadView('discussions');" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                    View All
                </a>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                ${recentDiscussions.length > 0 ? `
                    <div class="space-y-4">
                    ${recentDiscussions.map(discussion => {
            const course = discussion.course;
            const courseName = typeof course === 'object' ? course.name : 'Course';
            const courseCode = typeof course === 'object' ? course.code : '';
            const courseColor = typeof course === 'object' ? (course.color || '#5D5CDE') : '#5D5CDE';

            return `
                        <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer ${discussion.isAnnouncement ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30' : ''}" onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                            <div class="flex justify-between items-start">
                            <h3 class="font-medium" data-user-content="true">
                                ${discussion.isAnnouncement ? '<i class="fas fa-bullhorn text-blue-500 mr-1"></i> ' : ''}
                                ${discussion.title}
                            </h3>
                            <span class="text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(discussion.createdAt)}</span>
                            </div>
                            <div class="flex items-center mt-1">
                            <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor}">
                                ${courseCode}
                            </span>
                            <span class="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">by ${discussion.author.firstName} ${discussion.author.lastName}</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">${discussion.content}</p>
                        </div>
                        `;
        }).join('')}
                    </div>
                ` : `
                    <div class="text-center py-6">
                    <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-comments text-gray-500 text-xl"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400">No recent discussions</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Join a discussion or start a new one!</p>
                    <button onclick="loadView('discussions')" class="mt-3 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                        Browse Discussions
                    </button>
                    </div>
                `}
                </div>
            </div>
            </div>

            <!-- Calendar and Announcements Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <!-- Calendar Card -->
            <div class="flex flex-col h-full">
                <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Calendar</h2>
                </div>
                <div class="flex-1 flex flex-col">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 flex-1 flex flex-col">
                    <div class="font-medium font-semibold text-lg mb-2">${getCurrentMonth()}</div>
                    <div class="grid grid-cols-7 gap-1 text-xs mb-2">
                        <div class="text-center font-semibold">Sun</div>
                        <div class="text-center font-semibold">Mon</div>
                        <div class="text-center font-semibold">Tue</div>
                        <div class="text-center font-semibold">Wed</div>
                        <div class="text-center font-semibold">Thu</div>
                        <div class="text-center font-semibold">Fri</div>
                        <div class="text-center font-semibold">Sat</div>
                    </div>
                    <div class="grid grid-cols-7 gap-1 flex-1">
                        ${generateCalendarDays(upcomingAssignments)}
                    </div>
                </div>
                </div>
            </div>
            <!-- Recent Announcements Card -->
            <div class="flex flex-col h-full">
                <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Recent Announcements</h2>
                </div>
                <div class="flex-1 flex flex-col">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 flex-1 flex flex-col">
                    ${recentAnnouncements.length > 0 ? `
                    <div class="space-y-4">
                    ${recentAnnouncements.map(announcement => {
            // Properly handle course data
            const course = typeof announcement.course === 'object' ?
                announcement.course :
                { _id: announcement.course, code: '', color: '#5D5CDE' };

            return `
        <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30"
            onclick="loadView('course-detail', {courseId: '${course._id}'})">
            <div class="flex items-center mb-1">
                <img src="${getProfileImageUrl(announcement.author)}" alt="Instructor" class="w-10 h-10 rounded-full object-cover mr-3"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                <div>
                    <p class="text-gray-500 dark:text-gray-400 font-normal text-sm">
                        ${announcement.author.firstName} ${announcement.author.lastName} • ${formatTimeAgo(announcement.createdAt)}
                    </p>
                    <div class="font-medium">
                        <i class="fas fa-bullhorn text-blue-500 mr-2"></i>${announcement.title}
                    </div>
                    <div class="flex items-center mt-1">
                        ${course.code ? `
                            <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${course.color}25; color: ${course.color}">
                                ${course.code}
                            </span>
                        ` : ''}
                    </div>
                    <div class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2" data-user-content="true">${announcement.content}</div>
                </div>
            </div>
        </div>
    `;
        }).join('')}
                    </div>
                    ` : `
                    <div class="text-center py-6">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-bullhorn text-blue-500 text-xl"></i>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400">No recent announcements</p>
                    </div>
                    `}
                </div>
                </div>
            </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading dashboard</p>
                <p>${error.message || 'Failed to load dashboard data'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadLoginPage()">Retry</button>
            </div>
        `;
    }
}
/**
 * Load courses view with enrolled and available courses
 * @returns {Promise<void>}
 */
async function loadCourses() {
    try {
        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;

        // Fetch user's enrolled courses
        const myCoursesResponse = await courseService.getMyCourses();
        const myCourses = myCoursesResponse.data.courses;

        // Fetch all available courses
        const allCoursesResponse = await courseService.getAllCourses();
        const allCourses = allCoursesResponse.data.courses;

        // Filter out courses the user is already enrolled in
        const availableCourses = allCourses.filter(course => {
            // Skip courses where user is instructor
            if (course.instructor._id === currentUser._id) return false;

            // Skip courses user is already enrolled in
            return !myCourses.some(myCourse => myCourse._id === course._id);
        });

        // Build the view
        content.innerHTML = `
            <div class="mb-6 flex flex-wrap justify-between items-center">
                <h1 class="text-2xl font-bold">Courses</h1>
                ${currentUser.role === 'instructor' || currentUser.role === 'admin' ? `
                    <button id="createCourseBtn" class="mt-2 sm:mt-0 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                        <i class="fas fa-plus mr-1"></i> Create Course
                    </button>
                ` : ''}
            </div>
            
            <!-- Tabs for My Courses and Available Courses -->
            <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex overflow-x-auto">
                    <button id="myCoursesTab" class="course-tab px-4 py-2 border-b-2 border-primary text-primary dark:text-primaryLight whitespace-nowrap">
                        My Courses (${myCourses.length})
                    </button>
                    <button id="availableCoursesTab" class="course-tab px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 whitespace-nowrap">
                        Available Courses (${availableCourses.length})
                    </button>
                </div>
            </div>
            
            <!-- Search and Filter -->
            <div class="mb-6 flex flex-wrap gap-3 items-center">
                <div class="relative flex-1 min-w-[200px]">
                    <input type="text" id="searchCourses" placeholder="Search courses..." class="pl-10 pr-4 py-2 w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                </div>
                
                <select id="courseSort" class="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    <option value="name">Sort by: Name</option>
                    <option value="recent">Sort by: Recently Added</option>
                    <option value="code">Sort by: Course Code</option>
                </select>
            </div>
            
            <!-- My Courses Tab Content -->
            <div id="myCoursesContent" class="course-tab-content">
                ${myCourses.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${myCourses.map(course => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer course-card" 
                                data-id="${course._id}" 
                                data-name="${course.name}"
                                data-code="${course.code}"
                                data-created-at="${course.createdAt}"
                                data-user-content="true"
                                onclick="loadView('course-detail', {courseId: '${course._id}'})">
                                <div class="h-32 bg-gradient-to-r relative" style="background-color: ${course.color || '#5D5CDE'}">
                                    ${course.instructor._id === currentUser._id ? `
                                        <div class="absolute top-3 right-3 px-2 py-1 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 text-xs font-medium rounded">
                                            Instructor
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="p-5">
                                    <h3 class="text-lg font-semibold mb-1" data-user-content="true">${course.name}</h3>
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${course.color || '#5D5CDE'}25; color: ${course.color || '#5D5CDE'}">
                                            ${course.code}
                                        </span>
                                        <span class="text-sm text-gray-500 dark:text-gray-400">
                                            ${course.students?.length || 0} students
                                        </span>
                                    </div>
                                    <div class="flex items-center">
                                        <img src="${getProfileImageUrl(course.instructor)}" alt="${course.instructor.firstName}" class="w-6 h-6 rounded-full object-cover mr-2" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                        <span class="text-sm text-gray-600 dark:text-gray-300">
                                            ${course.instructor.firstName} ${course.instructor.lastName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                        <div class="w-16 h-16 bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-book text-primary dark:text-primaryLight text-2xl"></i>
                        </div>
                        <h3 class="font-semibold text-lg mb-2">No Courses Yet</h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">You are not enrolled in any courses yet.</p>
                        <button id="browseCourseBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Browse Available Courses
                        </button>
                    </div>
                `}
            </div>
            
            <!-- Available Courses Tab Content -->
            <div id="availableCoursesContent" class="course-tab-content hidden">
                ${availableCourses.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${availableCourses.map(course => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer course-card" 
                                data-id="${course._id}" 
                                data-name="${course.name}"
                                data-user-content="true"
                                data-code="${course.code}">
                                <div class="h-32 bg-gradient-to-r" style="background-color: ${course.color || '#5D5CDE'}"></div>
                                <div class="p-5">
                                    <h3 class="text-lg font-semibold mb-1" data-user-content="true">${course.name}</h3>
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${course.color || '#5D5CDE'}25; color: ${course.color || '#5D5CDE'}">
                                            ${course.code}
                                        </span>
                                        <span class="text-sm text-gray-500 dark:text-gray-400">
                                            ${course.students?.length || 0} students
                                        </span>
                                    </div>
                                    <div class="flex items-center mb-4">
                                        <img src="${getProfileImageUrl(course.instructor)}" alt="${course.instructor.firstName}" class="w-6 h-6 rounded-full object-cover mr-2" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                        <span class="text-sm text-gray-600 dark:text-gray-300">
                                            ${course.instructor.firstName} ${course.instructor.lastName}
                                        </span>
                                    </div>
                                    <button class="enroll-btn w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition" data-id="${course._id}">
                                        Enroll in Course
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-search text-gray-500 text-2xl"></i>
                        </div>
                        <h3 class="font-semibold text-lg mb-2">No Available Courses</h3>
                        <p class="text-gray-600 dark:text-gray-400">There are no new courses available for enrollment at this time.</p>
                    </div>
                `}
            </div>
        `;

        // Set up event listeners

        // Tab switching
        document.getElementById('myCoursesTab').addEventListener('click', () => {
            // Update active tab
            document.getElementById('myCoursesTab').classList.add('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('myCoursesTab').classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            document.getElementById('availableCoursesTab').classList.remove('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('availableCoursesTab').classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');

            // Show/hide content
            document.getElementById('myCoursesContent').classList.remove('hidden');
            document.getElementById('availableCoursesContent').classList.add('hidden');
        });

        document.getElementById('availableCoursesTab').addEventListener('click', () => {
            // Update active tab
            document.getElementById('availableCoursesTab').classList.add('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('availableCoursesTab').classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            document.getElementById('myCoursesTab').classList.remove('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('myCoursesTab').classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');

            // Show/hide content
            document.getElementById('availableCoursesContent').classList.remove('hidden');
            document.getElementById('myCoursesContent').classList.add('hidden');
        });

        // Create course button
        const createCourseBtn = document.getElementById('createCourseBtn');
        if (createCourseBtn) {
            createCourseBtn.addEventListener('click', () => {
                showCreateCourseModal();
            });
        }

        // Browse courses button
        const browseCourseBtn = document.getElementById('browseCourseBtn');
        if (browseCourseBtn) {
            browseCourseBtn.addEventListener('click', () => {
                document.getElementById('availableCoursesTab').click();
            });
        }

        // Course enrollment buttons
        const enrollBtns = document.querySelectorAll('.enroll-btn');
        enrollBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent navigating to course detail
                const courseId = btn.dataset.id;
                const course = availableCourses.find(c => c._id === courseId);
                showEnrollmentModal(course);
            });
        });

        // Available course card click handler
        const availableCourseCards = document.querySelectorAll('#availableCoursesContent .course-card');
        availableCourseCards.forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.id;
                const course = availableCourses.find(c => c._id === courseId);
                showCoursePreviewModal(course);
            });
        });

        // Course search
        const searchInput = document.getElementById('searchCourses');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            filterCourses(searchTerm);
        });

        // Course sorting
        const sortSelect = document.getElementById('courseSort');
        sortSelect.addEventListener('change', () => {
            sortCourses(sortSelect.value);
        });

    } catch (error) {
        console.error('Error loading courses:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading courses</p>
                <p>${error.message || 'Failed to load courses data'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadLoginPage()">Retry</button>
            </div>
        `;
    }
}

// Helper functions for courses view
function filterCourses(searchTerm) {
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const code = card.dataset.code.toLowerCase();

        if (name.includes(searchTerm) || code.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function sortCourses(sortBy) {
    const myCoursesContent = document.getElementById('myCoursesContent');
    const availableCoursesContent = document.getElementById('availableCoursesContent');

    [myCoursesContent, availableCoursesContent].forEach(container => {
        if (!container) return;

        const courseCards = Array.from(container.querySelectorAll('.course-card'));

        courseCards.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.dataset.name.localeCompare(b.dataset.name);
                case 'recent':
                    // Sort by createdAt timestamp
                    const dateA = new Date(a.dataset.createdAt || 0);
                    const dateB = new Date(b.dataset.createdAt || 0);
                    return dateB - dateA; // Most recent first
                case 'code':
                    return a.dataset.code.localeCompare(b.dataset.code);
                default:
                    return 0;
            }
        });

        // Get the grid container
        const grid = container.querySelector('.grid');
        if (grid) {
            // Reattach sorted cards
            courseCards.forEach(card => grid.appendChild(card));
        }
    });
}
/**
 * Show modal for creating a new course
 */
function showCreateCourseModal() {
    const availableColors = [
        '#5D5CDE', // Default blue-purple
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#14B8A6', // Teal
        '#F97316', // Orange
    ];

    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Create New Course</h3>
                    <button id="closeCreateCourseModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createCourseForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Name <span class="text-red-500">*</span></label>
                        <input type="text" id="courseName" required placeholder="Enter course name" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Code <span class="text-red-500">*</span></label>
                        <input type="text" id="courseCode" required placeholder="e.g. CS101" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Description</label>
                        <textarea id="courseDescription" rows="3" placeholder="Describe your course" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Color</label>
                        <div class="grid grid-cols-5 gap-3 mb-2">
                            ${availableColors.map((color, index) => `
                                <button type="button" data-color="${color}" class="color-option w-full h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500" style="background-color: ${color}; ${index === 0 ? 'box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);' : ''}"></button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div id="createCourseError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelCreateCourseBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Create Course
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
    // Track selected color
    let selectedColor = availableColors[0];

    // Set up event listeners
    document.getElementById('closeCreateCourseModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelCreateCourseBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove highlight from all options
            colorOptions.forEach(opt => {
                opt.style.boxShadow = '';
            });

            // Highlight selected option
            option.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
            selectedColor = option.dataset.color;
        });
    });

    // Form submission
    document.getElementById('createCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('courseName').value;
        const code = document.getElementById('courseCode').value;
        const description = document.getElementById('courseDescription').value;
        const errorDiv = document.getElementById('createCourseError');

        errorDiv.classList.add('hidden');

        if (!name || !code) {
            errorDiv.textContent = 'Course name and code are required.';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            // Submit course data
            await courseService.createCourse({
                name,
                code,
                description,
                color: selectedColor
            });

            // Close modal and refresh courses
            document.body.removeChild(modalContainer);
            showToast('Course created successfully!');
            loadCourses();
        } catch (error) {
            console.error('Error creating course:', error);
            errorDiv.textContent = error.message || 'Failed to create course. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}
/**
 * Show modal with course preview for unenrolled users
 * @param {Object} course - The course to preview
 */
function showCoursePreviewModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-0 max-h-[90vh] overflow-y-auto">
                <div class="h-48 w-full" style="background-color: ${course.color || '#5D5CDE'}"></div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-2xl data-user-content="true" font-semibold">${course.name}</h3>
                            <div class="flex items-center mt-1">
                                <span class="px-2 py-1 text-xs rounded-full mr-2" style="background-color: ${course.color || '#5D5CDE'}25; color: ${course.color || '#5D5CDE'}">
                                    ${course.code}
                                </span>
                                <span class="text-sm text-gray-500 dark:text-gray-400">
                                    ${course.students?.length || 0} students enrolled
                                </span>
                            </div>
                        </div>
                        <button id="closePreviewModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <img src="${getProfileImageUrl(course.instructor)}" alt="${course.instructor.firstName}" class="w-10 h-10 rounded-full object-cover mr-3" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                        <div>
                            <p class="font-medium">${course.instructor.firstName} ${course.instructor.lastName}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="font-semibold mb-2">About This Course</h4>
                        <p class="text-gray-600 dark:text-gray-300">
                            ${course.description || 'No description provided for this course.'}
                        </p>
                    </div>
                    
                    <div class="flex justify-end">
                        <button id="cancelPreviewBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button id="enrollFromPreviewBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Enroll in Course
                        </button>
                    </div>
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
    document.getElementById('closePreviewModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelPreviewBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('enrollFromPreviewBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showEnrollmentModal(course);
    });
}
// Course detail view
/**
 * Load course detail view with separate assignment displays for students and instructors
 * @param {string} courseId - The ID of the course to display
 * @returns {Promise<void>}
 */
async function loadCourseDetail(courseId) {
    try {
        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;

        // Fetch course data
        const courseResponse = await courseService.getCourse(courseId);
        const course = courseResponse.data.course;
        currentCourse = course;

        // Determine user role in the course
        const isInstructor = (course.instructor._id === currentUser._id) || currentUser.role === 'admin';
        const isEnrolled = course.students.some(student =>
            (typeof student === 'object' && student._id === currentUser._id) ||
            student === currentUser._id
        );

        // Fetch course resources, assignments, discussions and announcements
        let courseResources = [];
        let courseAssignments = [];
        let courseDiscussions = [];
        let courseAnnouncements = [];

        try {
            // Fetch resources
            const resourcesResponse = await resourceService.getCourseResources(courseId);
            courseResources = resourcesResponse.data.resources;
        } catch (error) {
            console.warn('Could not load resources:', error);
        }

        try {
            // Fetch assignments
            const assignmentsResponse = await assignmentService.getCourseAssignments(courseId);
            courseAssignments = assignmentsResponse.data.assignments;

            // If user is a student, get submissions for status display
            if (!isInstructor && isEnrolled) {
                // For each assignment, fetch submission if exists
                for (let i = 0; i < courseAssignments.length; i++) {
                    try {
                        const submissionsResponse = await assignmentService.getSubmissions(courseAssignments[i]._id);
                        const submissions = submissionsResponse.data.submissions;

                        // Find the student's submission for this assignment
                        const mySubmission = submissions.find(s =>
                            (typeof s.student === 'object' && s.student._id === currentUser._id) ||
                            s.student === currentUser._id
                        );

                        // Attach submission to assignment object for easier access
                        if (mySubmission) {
                            courseAssignments[i].mySubmission = mySubmission;
                        }
                    } catch (err) {
                        console.warn(`Could not fetch submissions for assignment ${courseAssignments[i]._id}:`, err);
                    }
                }
            }

            // Sort assignments by due date (upcoming first)
            courseAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        } catch (error) {
            console.warn('Could not load assignments:', error);
        }

        try {
            // Fetch discussions
            const discussionsResponse = await discussionService.getCourseDiscussions(courseId);
            const announcementsResponse = await announcementService.getCourseAnnouncements(courseId);
            // Separate announcements from regular discussions
            courseDiscussions = discussionsResponse.data.discussions.filter(d => !d.isAnnouncement);
            courseAnnouncements = announcementsResponse.data.announcements;

            // Sort announcements by date (newest first)
            courseAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Sort discussions by activity (newest/most active first)
            courseDiscussions.sort((a, b) => {
                // First check if pinned
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;

                // Then by last activity
                const aLastActivity = a.updatedAt || a.createdAt;
                const bLastActivity = b.updatedAt || b.createdAt;
                return new Date(bLastActivity) - new Date(aLastActivity);
            });

        } catch (error) {
            console.warn('Could not load discussions:', error);
        }

        // Generate HTML
        content.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <!-- Course header with banner and info -->
                <div class="h-40 bg-gradient-to-r" style="background-color: ${course.color || '#5D5CDE'}">
                    ${isInstructor ? `
                        <div class="h-full flex justify-end">
                            <button id="courseSettingsBtn" class="m-3 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded transition">
                                <i class="fas fa-cog mr-1"></i> Course Settings
                            </button>
                        </div>
                    ` : ''}
                    
                </div>
                
                <div class="p-6 relative">
                    <h1 class="text-2xl font-bold" data-user-content="true">${course.name}</h1>
                    <div class="flex flex-wrap items-center gap-2 mt-1 mb-4">
                        <span class="px-2 py-1 text-sm rounded font-medium" style="background-color: ${course.color || '#5D5CDE'}25; color: ${course.color || '#5D5CDE'}">
                            ${course.code}
                        </span>
                        <span class="text-gray-500 dark:text-gray-400">•</span>
                        <span class="text-gray-600 dark:text-gray-300">
                            <i class="fas fa-user-tie mr-1"></i> ${course.instructor.firstName} ${course.instructor.lastName}
                        </span>
                        <span class="text-gray-500 dark:text-gray-400">•</span>
                        <span class="text-gray-600 dark:text-gray-300">
                            <i class="fas fa-users mr-1"></i> ${course.students ? course.students.length : 0} students
                        </span>
                         ${isInstructor && course.students && course.students.length > 0 ? `
                        <span class="text-gray-500 dark:text-gray-400">•</span>
                        <span class="text-gray-600 dark:text-gray-300">
                            <button id="viewStudentsBtn" class="text-primary dark:text-primaryLight text-sm font-medium mt-1">
                                <i class="fas fa-users mr-1"></i> Manage Students
                            </button>
                        ` : ''}
                    </div>
                    
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${course.description || 'No course description provided.'}</p>
                    <div>
                ${currentUser.role === 'student' ? `
                    <button class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    <i class="fas fa-envelope mr-2"></i>Contact Instructor
                  </button>
                    <button id="unenrollBtn" class="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition">
                      <i class="fas fa-sign-out-alt mr-2"></i>Unenroll
                    </button>
                  ` : ''}
                </div>
                    ${!isEnrolled && !isInstructor ? `
                        <div class="mt-4">
                            <p class="mb-3">You are not enrolled in this course.</p>
                            <button id="enrollBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Enroll in Course
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Announcements Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Announcements</h3>
              ${currentUser.role === 'instructor' ? `
                <button id="createAnnouncementBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                  <i class="fas fa-plus mr-1"></i> New Announcement
                </button>
              ` : ''}
            </div>
            ${courseAnnouncements.length > 0 ? `
              <div class="space-y-4">
                ${courseAnnouncements.map(announcement => `
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div class="flex">
                      <img src="${getProfileImageUrl(announcement.author)}" alt="Instructor" class="w-10 h-10 rounded-full object-cover mr-3"
                      onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                      <div>
                        <p class="font-medium">${announcement.author.firstName} ${announcement.author.lastName} <span class="text-gray-500 dark:text-gray-400 font-normal text-sm">• ${formatTimeAgo(announcement.createdAt)}</span></p>
                        <p class="text-sm font-semibold text-black-500 dark:text-black-400">${announcement.title}</p>
                        <p class="mt-1" data-user-content="true">${announcement.content}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="text-gray-500 dark:text-gray-400">No announcements yet.</p>
            `}
          </div>
            
            <!-- Main course content sections -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left column - Assignments and Discussions -->
                <div class="lg:col-span-2">
                    <!-- Assignments section -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold">Assignments</h2>
                            ${isInstructor ? `
                                <button id="newAssignmentBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                                    <i class="fas fa-plus mr-1"></i> New Assignment
                                </button>
                            ` : ''}
                        </div>
                        
                        ${courseAssignments.length > 0 ? `
                            <div class="space-y-3">
                                ${courseAssignments.slice(0, 5).map(assignment => {
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const isPastDue = dueDate < now;
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            // Determine status for students
            let status = 'Upcoming';
            let statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';

            if (!isInstructor && assignment.mySubmission) {
                if (assignment.mySubmission.status === 'graded' || assignment.mySubmission.grade) {
                    status = 'Graded';
                    statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                } else {
                    status = 'Submitted';
                    statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                }
            } else if (isPastDue) {
                status = 'Past Due';
                statusClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            } else if (daysLeft <= 1) {
                status = 'Due Soon';
                statusClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            }

            return `
                                        <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                                            <div class="flex justify-between items-start">
                                                <div>
                                                    <h3 class="font-medium">${assignment.title}</h3>
                                                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Due: ${formatDate(assignment.dueDate)} ${!isPastDue ? `(${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)` : ''}
                                                    </p>
                                                </div>
                                                <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
                                                    ${status}
                                                </span>
                                            </div>
                                            <div class="mt-2 text-sm">
                                                <span class="text-gray-600 dark:text-gray-300">${assignment.pointsPossible} points</span>
                                                ${!isInstructor && assignment.mySubmission && assignment.mySubmission.grade ? `
                                                    <span class="mx-2">•</span>
                                                    <span class="font-medium ${getGradeColorClass(assignment.mySubmission.grade.score, assignment.pointsPossible)}">
                                                        ${assignment.mySubmission.grade.score}/${assignment.pointsPossible} (${((assignment.mySubmission.grade.score / assignment.pointsPossible) * 100).toFixed(1)}%)
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <div class="mt-2">
                                                ${isInstructor ? `
                                                    <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                        View Details
                                                    </button>
                                                    ${assignment.submissions?.length > 0 ? `
                                                        <button class="ml-2 px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                            Submissions (${assignment.submissions.length})
                                                        </button>
                                                    ` : ''}
                                                ` : `
                                                    <button class="px-3 py-1.5 ${assignment.mySubmission ? 'border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark' : 'bg-primary hover:bg-primaryDark text-white'} text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                        ${assignment.mySubmission ? 'View Submission' : isPastDue && !assignment.allowLateSubmissions ? 'View (Past Due)' : 'Submit'}
                                                    </button>
                                                `}
                                            </div>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                            
                            ${courseAssignments.length > 5 ? `
                                <div class="text-center mt-4">
                                    <button id="viewAllAssignmentsBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                                        View All Assignments (${courseAssignments.length})
                                    </button>
                                </div>
                            ` : ''}
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No assignments have been created for this course yet.</p>
                            ${isInstructor ? `
                                <button id="createFirstAssignmentBtn" class="mt-3 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Create First Assignment
                                </button>
                            ` : ''}
                        `}
                    </div>
                    
                    <!-- Discussions section -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold">Discussions</h2>
                            <button id="newDiscussionBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                                <i class="fas fa-plus mr-1"></i> New Discussion
                            </button>
                        </div>
                        
                        ${courseDiscussions.length > 0 ? `
                            <div class="space-y-3">
                                ${courseDiscussions.slice(0, 5).map(discussion => `
                                    <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer" onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                                        <div class="flex items-center justify-between">
                                            <h3 class="font-medium flex items-center" data-user-content="true">
                                                ${discussion.title}
                                                ${discussion.isPinned ? `
                                                    <span class="ml-2 text-yellow-500 dark:text-yellow-400" title="Pinned">
                                                        <i class="fas fa-thumbtack"></i>
                                                    </span>
                                                ` : ''}
                                            </h3>
                                            <span class="text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(discussion.createdAt)}</span>
                                        </div>
                                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1" data-user-content="true">${discussion.content}</p>
                                        <div class="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <img src="${getProfileImageUrl(discussion.author)}" alt="${discussion.author.firstName}" class="w-5 h-5 rounded-full object-cover mr-2" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                            ${discussion.author.firstName} ${discussion.author.lastName}
                                            <span class="mx-2">•</span>
                                            <i class="far fa-comment-alt mr-1"></i> ${discussion.replyCount || discussion.replies?.length || 0} replies
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            ${courseDiscussions.length > 5 ? `
                                <div class="text-center mt-4">
                                    <button id="viewAllDiscussionsBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                                        View All Discussions (${courseDiscussions.length})
                                    </button>
                                </div>
                            ` : ''}
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No discussions have been started in this course yet.</p>
                            <button id="startFirstDiscussionBtn" class="mt-3 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Start First Discussion
                            </button>
                        `}
                    </div>
                </div>
                
                <!-- Right column - Resources and Course Info -->
                <div>
                    <!-- Resources section -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold">Resources</h2>
                            ${isInstructor ? `
                                <button id="uploadResourceBtn" class="text-primary dark:text-primaryLight hover:underline text-sm font-medium">
                                    <i class="fas fa-plus mr-1"></i> Upload Resource
                                </button>
                            ` : ''}
                        </div>
                        
                        ${courseResources.length > 0 ? `
                            <div class="space-y-2">
                                ${courseResources.filter(r => r.isVisible || isInstructor).map(resource => `
                                    <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg ${!resource.isVisible ? 'opacity-70' : ''}">
                                        ${getResourceIcon(resource)}
                                        <div class="ml-3 flex-1 min-w-0">
                                            <p class="font-medium truncate" data-user-content="true">${resource.title}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                ${getResourceTypeLabel(resource)}
                                                ${!resource.isVisible ? ' • Hidden from students' : ''}
                                            </p>
                                        </div>
                                        ${resource.type === 'link' ? `
                                            <a href="${resource.link}" target="_blank" class="text-primary dark:text-primaryLight hover:underline ml-2">
                                                <i class="fas fa-external-link-alt"></i>
                                            </a>
                                        ` : `
                                            <a href="#" class="text-primary dark:text-primaryLight hover:underline ml-2" onclick="event.stopPropagation(); viewResource('${resource._id}')">
                                                <i class="fas fa-download"></i>
                                            </a>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No resources have been added to this course yet.</p>
                            ${isInstructor ? `
                                <button id="addFirstResourceBtn" class="mt-3 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Add First Resource
                                </button>
                            ` : ''}
                        `}
                    </div>
                    
                    <!-- Course info section -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-semibold mb-4">Course Information</h2>
                        
                        <div class="space-y-3">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor</h3>
                                <div class="flex items-center mt-1">
                                    <img src="${getProfileImageUrl(course.instructor)}" alt="${course.instructor.firstName}" class="w-8 h-8 rounded-full object-cover mr-3"
                                    onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                    <div>
                                        <p class="font-medium">${course.instructor.firstName} ${course.instructor.lastName}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">${course.instructor.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Course Code</h3>
                                <p>${course.code}</p>
                            </div>
                            
                            ${isInstructor ? `
                                <div>
                                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Enrollment Code</h3>
                                    <div class="flex items-center">
                                        <input type="text" value="${course.enrollmentCode}" readonly class="bg-gray-50 dark:bg-gray-700 text-sm p-1 rounded border border-gray-300 dark:border-gray-600 mr-2">
                                        <button id="copyEnrollmentCodeBtn" class="text-primary dark:text-primaryLight" onclick="copyToClipboard('${course.enrollmentCode}')">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Course Link</h3>
                                    <button id="generateCourseLinkBtn" class="text-primary dark:text-primaryLight text-sm font-medium mt-1">
                                        <i class="fas fa-link mr-1"></i> Generate Enrollment Link
                                    </button>
                                </div>
                            ` : ''}
                            
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Students Enrolled</h3>
                                <p>${course.students ? course.students.length : 0} students</p>
                                ${isInstructor && course.students && course.students.length > 0 ? `
                                    <button id="viewStudentsBtn" class="text-primary dark:text-primaryLight text-sm font-medium mt-1">
                                        <i class="fas fa-users mr-1"></i> Manage Students
                                    </button>
                                ` : ''}
                            </div>
                            
                            ${isInstructor ? `
                                <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <button id="courseSettingsBtn2" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        <i class="fas fa-cog mr-1"></i> Course Settings
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners

        // Enrollment button
        const enrollBtn = document.getElementById('enrollBtn');
        if (enrollBtn) {
            enrollBtn.addEventListener('click', () => {
                showEnrollmentModal(course);
            });
        }
        const unenrollBtn = document.getElementById('unenrollBtn');
        if (unenrollBtn) {
            unenrollBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to unenroll from this course?')) {
                    try {
                        await courseService.unenrollFromCourse(courseId);
                        showToast('Successfully unenrolled from course');
                        loadView('courses');
                    } catch (error) {
                        showToast(`Failed to unenroll: ${error.message}`, 'error');
                    }
                }
            });
        }

        // Announcements
        const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
        if (createAnnouncementBtn) {
            createAnnouncementBtn.addEventListener('click', () => showNewAnnouncementModal());
        }

        // Assignments
        const newAssignmentBtn = document.getElementById('newAssignmentBtn');
        if (newAssignmentBtn) {
            newAssignmentBtn.addEventListener('click', () => {
                showCreateAssignmentModal();
            });
        }

        const createFirstAssignmentBtn = document.getElementById('createFirstAssignmentBtn');
        if (createFirstAssignmentBtn) {
            createFirstAssignmentBtn.addEventListener('click', () => {
                showCreateAssignmentModal();
            });
        }

        const viewAllAssignmentsBtn = document.getElementById('viewAllAssignmentsBtn');
        if (viewAllAssignmentsBtn) {
            viewAllAssignmentsBtn.addEventListener('click', () => {
                loadView('assignments', { courseId: course._id });
            });
        }

        // Discussions
        const newDiscussionBtn = document.getElementById('newDiscussionBtn');
        if (newDiscussionBtn) {
            newDiscussionBtn.addEventListener('click', () => {
                showNewDiscussionModal(course);
            });
        }

        const startFirstDiscussionBtn = document.getElementById('startFirstDiscussionBtn');
        if (startFirstDiscussionBtn) {
            startFirstDiscussionBtn.addEventListener('click', () => {
                showNewDiscussionModal(course);
            });
        }

        const viewAllDiscussionsBtn = document.getElementById('viewAllDiscussionsBtn');
        if (viewAllDiscussionsBtn) {
            viewAllDiscussionsBtn.addEventListener('click', () => {
                loadView('discussions', { courseId: course._id });
            });
        }

        // Resources
        const uploadResourceBtn = document.getElementById('uploadResourceBtn');
        if (uploadResourceBtn) {
            uploadResourceBtn.addEventListener('click', () => {
                showUploadResourceModal(course._id);
            });
        }

        const addFirstResourceBtn = document.getElementById('addFirstResourceBtn');
        if (addFirstResourceBtn) {
            addFirstResourceBtn.addEventListener('click', () => {
                showUploadResourceModal(course._id);
            });
        }

        // Course settings
        const courseSettingsBtns = [
            document.getElementById('courseSettingsBtn'),
            document.getElementById('courseSettingsBtn2')
        ];

        courseSettingsBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    showCourseSettingsModal(course);
                });
            }
        });

        // View students
        const viewStudentsBtn = document.getElementById('viewStudentsBtn');
        if (viewStudentsBtn) {
            viewStudentsBtn.addEventListener('click', () => {
                showManageStudentsModal(course);
            });
        }

        // Generate course link
        const generateCourseLinkBtn = document.getElementById('generateCourseLinkBtn');
        if (generateCourseLinkBtn) {
            generateCourseLinkBtn.addEventListener('click', () => {
                showGenerateCourseLinkModal(course._id);
            });
        }

    } catch (error) {
        console.error('Error loading course:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading course</p>
                <p>${error.message || 'Failed to load course details'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadView('courses')">
                    Back to Courses
                </button>
            </div>
        `;
    }

}

// Utility function to copy text to clipboard
function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    showToast('Copied to clipboard!');
}

// Get appropriate icon for resource type
function getResourceIcon(resource) {
    if (resource.type === 'file') {
        const fileType = resource.file?.fileType || '';
        if (fileType.includes('pdf')) {
            return '<i class="far fa-file-pdf text-red-500 text-xl"></i>';
        } else if (fileType.includes('word') || fileType.includes('document')) {
            return '<i class="far fa-file-word text-blue-500 text-xl"></i>';
        } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            return '<i class="far fa-file-excel text-green-500 text-xl"></i>';
        } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
            return '<i class="far fa-file-powerpoint text-orange-500 text-xl"></i>';
        } else if (fileType.includes('image')) {
            return '<i class="far fa-file-image text-purple-500 text-xl"></i>';
        } else if (fileType.includes('video')) {
            return '<i class="far fa-file-video text-pink-500 text-xl"></i>';
        } else if (fileType.includes('audio')) {
            return '<i class="far fa-file-audio text-yellow-500 text-xl"></i>';
        } else if (fileType.includes('zip') || fileType.includes('archive')) {
            return '<i class="far fa-file-archive text-gray-500 text-xl"></i>';
        } else {
            return '<i class="far fa-file text-gray-500 text-xl"></i>';
        }
    } else if (resource.type === 'link') {
        return '<i class="fas fa-link text-blue-500 text-xl"></i>';
    } else if (resource.type === 'text') {
        return '<i class="far fa-file-alt text-gray-500 text-xl"></i>';
    } else {
        return '<i class="far fa-file text-gray-500 text-xl"></i>';
    }
}

// Get descriptive label for resource type
function getResourceTypeLabel(resource) {
    if (resource.type === 'file') {
        return resource.file?.fileName || 'File';
    } else if (resource.type === 'link') {
        return 'External Link';
    } else if (resource.type === 'text') {
        return 'Text Content';
    } else {
        return 'Resource';
    }
}

// Get color class for grade display
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

// Course Settings Modal
// Update the showCourseSettingsModal function to include a "Course Links" option
function showCourseSettingsModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Course Settings</h3>
                    <button id="closeSettingsModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Course Appearance</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Customize how your course looks</p>
                        </div>
                        <button id="editAppearanceBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Edit
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Course Information</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Update course name, code and description</p>
                        </div>
                        <button id="editInfoBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Edit
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Enrollment Options</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Manage enrollment code and course access</p>
                        </div>
                        <button id="editEnrollmentBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Edit
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Course Links</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">View and manage all generated enrollment links</p>
                        </div>
                        <button id="viewLinksBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            View Links
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Manage Students</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">View, add or remove students</p>
                        </div>
                        <button id="manageStudentsBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Manage
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="font-medium text-red-600 dark:text-red-400">Danger Zone</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Archive or delete this course</p>
                        </div>
                        <button id="dangerZoneBtn" class="px-3 py-1.5 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-700 transition">
                            Options
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <button id="closeModalBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
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
    document.getElementById('closeSettingsModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Edit Course Appearance
    document.getElementById('editAppearanceBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseAppearanceModal(course);
    });

    // Edit Course Information
    document.getElementById('editInfoBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseInfoModal(course);
    });

    // Edit Enrollment Options
    document.getElementById('editEnrollmentBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showEnrollmentOptionsModal(course);
    });

    // View Course Links (new)
    document.getElementById('viewLinksBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseLinksModal(course);
    });

    // Manage Students
    document.getElementById('manageStudentsBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showManageStudentsModal(course);
    });

    // Danger Zone
    document.getElementById('dangerZoneBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showDangerZoneModal(course);
    });
}
// Course Appearance Modal
function showCourseAppearanceModal(course) {
    const availableColors = [
        '#5D5CDE', // Default blue-purple
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#14B8A6', // Teal
        '#F97316', // Orange
    ];

    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Course Appearance</h3>
                    <button id="closeAppearanceModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="appearanceForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Color</label>
                        <div class="grid grid-cols-5 gap-3 mb-2">
                            ${availableColors.map(color => `
                                <button type="button" data-color="${color}" class="color-option w-full h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500" style="background-color: ${color}; ${course.color === color ? 'box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);' : ''}"></button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div id="appearanceError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelAppearanceBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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
    // Track selected color
    let selectedColor = course.color || '#5D5CDE';

    // Set up event listeners
    document.getElementById('closeAppearanceModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    document.getElementById('cancelAppearanceBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove highlight from all options
            colorOptions.forEach(opt => {
                opt.style.boxShadow = '';
            });

            // Highlight selected option
            option.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
            selectedColor = option.dataset.color;
        });
    });

    // Form submission
    document.getElementById('appearanceForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const errorDiv = document.getElementById('appearanceError');
        errorDiv.classList.add('hidden');

        try {
            // Update course appearance
            await courseService.updateCourse(course._id, {
                color: selectedColor
            });

            // Close modal and refresh course
            document.body.removeChild(modalContainer);
            showToast('Course appearance updated successfully!');
            loadCourseDetail(course._id);
        } catch (error) {
            console.error('Error updating course appearance:', error);
            errorDiv.textContent = error.message || 'Failed to update course appearance. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Course Information Modal
function showCourseInfoModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Course Information</h3>
                    <button id="closeInfoModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="infoForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Name <span class="text-red-500">*</span></label>
                        <input type="text" data-user-content="true" id="courseName" value="${course.name}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Code <span class="text-red-500">*</span></label>
                        <input type="text" id="courseCode" value="${course.code}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Course Description</label>
                        <textarea id="courseDescription" rows="4" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${course.description || ''}</textarea>
                    </div>
                    
                    <div id="infoError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelInfoBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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
    document.getElementById('closeInfoModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    document.getElementById('cancelInfoBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    // Form submission
    document.getElementById('infoForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('courseName').value;
        const code = document.getElementById('courseCode').value;
        const description = document.getElementById('courseDescription').value;
        const errorDiv = document.getElementById('infoError');

        errorDiv.classList.add('hidden');

        // Validate inputs
        if (!name || !code) {
            errorDiv.textContent = 'Course name and code are required.';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            // Update course information
            await courseService.updateCourse(course._id, {
                name,
                code,
                description
            });

            // Close modal and refresh course
            document.body.removeChild(modalContainer);
            showToast('Course information updated successfully!');
            loadCourseDetail(course._id);
        } catch (error) {
            console.error('Error updating course information:', error);
            errorDiv.textContent = error.message || 'Failed to update course information. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Enrollment Options Modal
function showEnrollmentOptionsModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Enrollment Options</h3>
                    <button id="closeEnrollmentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="enrollmentForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Current Enrollment Code</label>
                        <div class="flex items-center">
                            <input type="text" value="${course.enrollmentCode}" readonly class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <button type="button" class="ml-2 text-primary dark:text-primaryLight" onclick="copyToClipboard('${course.enrollmentCode}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <button type="button" id="generateNewCodeBtn" class="px-4 py-2 border border-primary text-primary dark:border-primaryLight dark:text-primaryLight hover:bg-primary hover:text-white dark:hover:bg-primaryDark rounded-lg transition">
                            Generate New Enrollment Code
                        </button>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Note: This will invalidate the current enrollment code. Students will need the new code to enroll.
                        </p>
                    </div>
                    
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div class="flex items-center mb-3">
                            <input type="checkbox" id="allowEnrollment" ${course.allowEnrollment !== false ? 'checked' : ''} class="mr-2">
                            <label for="allowEnrollment" class="text-gray-700 dark:text-gray-300">Allow new student enrollments</label>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 ml-6">
                            If disabled, new students won't be able to enroll in this course, even with the enrollment code.
                        </p>
                    </div>
                    
                    <div id="enrollmentError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelEnrollmentBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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
    // Track enrollment code
    let enrollmentCode = course.enrollmentKey;
    let codeChanged = false;

    // Set up event listeners
    document.getElementById('closeEnrollmentModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    document.getElementById('cancelEnrollmentBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    // Generate new enrollment code
    document.getElementById('generateNewCodeBtn').addEventListener('click', () => {
        // Generate a random 6-character alphanumeric code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let newCode = '';
        for (let i = 0; i < 6; i++) {
            newCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Update the input field
        const codeInput = modalContainer.querySelector('input[readonly]');
        codeInput.value = newCode;
        enrollmentCode = newCode;
        codeChanged = true;
    });

    // Form submission
    document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const allowEnrollment = document.getElementById('allowEnrollment').checked;
        const errorDiv = document.getElementById('enrollmentError');

        errorDiv.classList.add('hidden');

        try {
            // Update course enrollment options
            const updateData = {
                allowEnrollment
            };

            // Only include enrollmentCode if it was changed
            if (codeChanged) {
                updateData.enrollmentCode = enrollmentCode;
            }

            await courseService.updateCourse(course._id, updateData);

            // Close modal and refresh course
            document.body.removeChild(modalContainer);
            showToast('Enrollment options updated successfully!');
            loadCourseDetail(course._id);
        } catch (error) {
            console.error('Error updating enrollment options:', error);
            errorDiv.textContent = error.message || 'Failed to update enrollment options. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Manage Students Modal
function showManageStudentsModal(course) {
    // Create loading modal first
    const loadingModalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
                <p class="text-gray-700 dark:text-gray-300">Loading student data...</p>
            </div>
        </div>
    `;

    // Add loading modal to DOM
    const loadingContainer = document.createElement('div');
    loadingContainer.innerHTML = loadingModalHtml;
    document.body.appendChild(loadingContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(loadingContainer);
    }
    // Fetch detailed student data
    fetchStudentData(course)
        .then(students => {
            // Remove loading modal
            document.body.removeChild(loadingContainer);

            // Create and show the student management modal
            displayStudentManagementModal(course, students);
        })
        .catch(error => {
            console.error('Error fetching student data:', error);

            // Remove loading modal and show error
            document.body.removeChild(loadingContainer);
            showToast('Failed to load student data. Please try again.', 'error');

            // Go back to course settings
            showCourseSettingsModal(course);
        });
}

// Helper to fetch detailed student data
async function fetchStudentData(course) {
    // If students are already objects with complete data, use them
    if (course.students && course.students.length > 0 &&
        typeof course.students[0] === 'object' && course.students[0].firstName) {
        return course.students;
    }

    // Otherwise, fetch detailed data for each student
    const studentIds = course.students || [];
    const students = [];

    for (const id of studentIds) {
        try {
            const studentId = typeof id === 'object' ? id._id : id;
            const response = await userService.getUserById(studentId);
            students.push(response.data.user);
        } catch (error) {
            console.warn(`Could not fetch data for student ${id}:`, error);
            // Add placeholder for missing student
            students.push({
                _id: typeof id === 'object' ? id._id : id,
                firstName: 'Unknown',
                lastName: 'Student',
                email: 'N/A'
            });
        }
    }

    return students;
}

// Display student management modal with fetched data
function displayStudentManagementModal(course, students) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Manage Students</h3>
                    <button id="closeStudentsModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-gray-700 dark:text-gray-300">
                            <span class="font-medium">${students.length}</span> students enrolled
                        </div>
                        <div class="flex space-x-2">
                            <button id="addStudentBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                                <i class="fas fa-user-plus mr-1"></i> Add Student
                            </button>
                            <div class="relative">
                                <input type="text" id="searchStudents" placeholder="Search students..." class="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-750">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" id="studentsTableBody">
                                ${students.map(student => `
                                    <tr class="student-row" data-id="${student._id}">
                                        <td class="px-4 py-3">
                                            <div class="flex items-center">
                                                <img src="${getProfileImageUrl(student)}" alt="${student.firstName}" class="w-8 h-8 rounded-full object-cover mr-3" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                                <div>
                                                    <p class="font-medium">${student.firstName} ${student.lastName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            ${student.email}
                                        </td>
                                        <td class="px-4 py-3">
                                            <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                Enrolled
                                            </span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <button class="remove-student-btn px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                <i class="fas fa-user-minus mr-1"></i> Remove
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="flex justify-end pt-2">
                    <button id="closeStudentsModalBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
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
    document.getElementById('closeStudentsModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    document.getElementById('closeStudentsModalBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    // Add student button
    document.getElementById('addStudentBtn').addEventListener('click', () => {
        // Hide this modal temporarily (don't remove)
        modalContainer.style.display = 'none';

        // Show add student modal
        showAddStudentModal(course, modalContainer);
    });

    // Search functionality
    document.getElementById('searchStudents').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.student-row');

        rows.forEach(row => {
            const studentName = row.querySelector('.font-medium').textContent.toLowerCase();
            const studentEmail = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

            if (studentName.includes(searchTerm) || studentEmail.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Remove student buttons
    document.querySelectorAll('.remove-student-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const row = btn.closest('.student-row');
            const studentId = row.dataset.id;
            const studentName = row.querySelector('.font-medium').textContent;

            if (confirm(`Are you sure you want to remove ${studentName} from this course?`)) {
                try {
                    // Call API to remove student
                    await courseService.removeStudentFromCourse(course._id, studentId);

                    // Remove row from table
                    row.remove();

                    // Update count
                    const countEl = modalContainer.querySelector('.text-gray-700 .font-medium') ||
                        modalContainer.querySelector('.dark\\:text-gray-300 .font-medium');
                    countEl.textContent = parseInt(countEl.textContent) - 1;

                    showToast(`${studentName} has been removed from the course.`);
                } catch (error) {
                    console.error('Error removing student:', error);
                    showToast('Failed to remove student. Please try again.', 'error');
                }
            }
        });
    });
}

// Add Student Modal
function showAddStudentModal(course, parentModal) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Add Student to Course</h3>
                    <button id="closeAddStudentModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="addStudentForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Student Email <span class="text-red-500">*</span></label>
                        <input type="email" id="studentEmail" required placeholder="Enter student's email address" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    
                    <div id="addStudentError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelAddStudentBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Add Student
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
    const closeAddStudentModal = () => {
        document.body.removeChild(modalContainer);
        parentModal.style.display = '';
    };

    document.getElementById('closeAddStudentModal').addEventListener('click', closeAddStudentModal);
    document.getElementById('cancelAddStudentBtn').addEventListener('click', closeAddStudentModal);

    // Form submission
    document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('studentEmail').value;
        const errorDiv = document.getElementById('addStudentError');

        errorDiv.classList.add('hidden');

        if (!email) {
            errorDiv.textContent = 'Student email is required.';
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            // Call API to add student by email
            const response = await courseService.addStudentToCourse(course._id, { email });

            // Close modals and refresh course view
            document.body.removeChild(modalContainer);
            document.body.removeChild(parentModal);

            showToast('Student added to the course successfully!');
            loadCourseDetail(course._id);
        } catch (error) {
            console.error('Error adding student:', error);
            errorDiv.textContent = error.message || 'Failed to add student. Please check the email and try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Danger Zone Modal
function showDangerZoneModal(course) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                    <button id="closeDangerModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="p-4 border border-red-300 dark:border-red-700 rounded-lg">
                        <h4 class="font-medium text-red-600 dark:text-red-400">Archive Course</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Archiving a course will make it read-only for all students. No new submissions or discussions will be allowed.
                        </p>
                        <button id="archiveCourseBtn" data-user-content="true" class="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition">
                            Archive Course
                        </button>
                    </div>
                    
                    <div class="p-4 border border-red-300 dark:border-red-700 rounded-lg">
                        <h4 class="font-medium text-red-600 dark:text-red-400">Delete Course</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            This action is irreversible. All course data, assignments, resources, and discussions will be permanently deleted.
                        </p>
                        <button id="deleteCourseBtn" class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                            Delete Course
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-end mt-4">
                    <button id="cancelDangerBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Cancel
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
    const closeDangerModal = () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    };

    document.getElementById('closeDangerModal').addEventListener('click', closeDangerModal);
    document.getElementById('cancelDangerBtn').addEventListener('click', closeDangerModal);

    // Archive course
    document.getElementById('archiveCourseBtn').addEventListener('click', async () => {
        if (confirm(`Are you sure you want to archive ${course.name}? This will make the course read-only.`)) {
            try {
                // Call API to archive course
                await courseService.updateCourse(course._id, { isArchived: true });

                // Close modal and refresh course
                document.body.removeChild(modalContainer);
                showToast('Course archived successfully!');
                loadCourseDetail(course._id);
            } catch (error) {
                console.error('Error archiving course:', error);
                showToast('Failed to archive course. Please try again.', 'error');
            }
        }
    });

    // Delete course
    document.getElementById('deleteCourseBtn').addEventListener('click', async () => {
        const confirmText = `DELETE ${course.code}`;
        const userInput = prompt(`This action is IRREVERSIBLE. All course data, assignments, discussions, and resources will be permanently deleted.\n\nTo confirm, type "${confirmText}" below:`);

        if (userInput === confirmText) {
            try {
                // Call API to delete course
                await courseService.deleteCourse(course._id);

                // Close modal and go back to courses view
                document.body.removeChild(modalContainer);
                showToast('Course deleted successfully!');
                loadView('courses');
            } catch (error) {
                console.error('Error deleting course:', error);
                showToast('Failed to delete course. Please try again.', 'error');
            }
        } else if (userInput !== null) {
            // User entered incorrect text
            showToast('Deletion cancelled: Confirmation text did not match.', 'error');
        }
    });
}

// Generate Course Link Modal
function showGenerateCourseLinkModal(courseId) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Generate Enrollment Link</h3>
                    <button id="closeGenerateLinkModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="generateLinkForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Expires in (hours)</label>
                        <div class="flex items-center">
                            <input type="number" id="expiresIn" min="1" value="168" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <span class="ml-2 text-gray-600 dark:text-gray-400">hours</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Default is 168 hours (7 days). Enter 0 for no expiration.
                        </p>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Maximum uses (optional)</label>
                        <input type="number" id="maxUses" min="0" placeholder="Unlimited" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave blank for unlimited uses.
                        </p>
                    </div>
                    
                    <div id="generateLinkError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelGenerateLinkBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Generate Link
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
    document.getElementById('closeGenerateLinkModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelGenerateLinkBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Form submission
    document.getElementById('generateLinkForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const expiresIn = parseInt(document.getElementById('expiresIn').value) || 0;
        const maxUses = parseInt(document.getElementById('maxUses').value) || null;
        const errorDiv = document.getElementById('generateLinkError');

        try {
            errorDiv.classList.add('hidden');

            const options = {};
            if (expiresIn > 0) options.expiresIn = expiresIn;
            if (maxUses > 0) options.maxUses = maxUses;

            // Generate course link
            const response = await courseLinkService.generateCourseLink(courseId, options);
            const link = response.data.courseLink;

            // Show success with the generated link
            document.body.removeChild(modalContainer);
            showCourseLinkModal(link);
        } catch (error) {
            console.error('Error generating course link:', error);
            errorDiv.textContent = error.message || 'Failed to generate link. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Show the generated course link
function showCourseLinkModal(link) {
    const baseUrl = window.location.origin + window.location.pathname;
    const linkUrl = `${baseUrl}?join=${link.token}`;

    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Course Link Generated</h3>
                    <button id="closeLinkSuccessModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="p-4 bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300">
                        <p><i class="fas fa-check-circle mr-2"></i> Link generated successfully!</p>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Share this link with students:</label>
                        <div class="flex items-center">
                            <input type="text" value="${linkUrl}" readonly class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            <button type="button" class="ml-2 text-primary dark:text-primaryLight" onclick="copyToClipboard('${linkUrl}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        <p><span class="font-medium">Expires:</span> ${link.expiresAt ? formatDate(link.expiresAt) : 'Never'}</p>
                        <p><span class="font-medium">Max uses:</span> ${link.maxUses || 'Unlimited'}</p>
                    </div>
                </div>
                
                <div class="flex justify-end mt-4">
                    <button id="closeLinkModalBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                        Done
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
    const closeLinkModal = () => {
        document.body.removeChild(modalContainer);
    };

    document.getElementById('closeLinkSuccessModal').addEventListener('click', closeLinkModal);
    document.getElementById('closeLinkModalBtn').addEventListener('click', closeLinkModal);
}
// Add this new function to view and manage course links
function showCourseLinksModal(course) {
    // Create loading state first
    const loadingModalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
                <p class="text-gray-700 dark:text-gray-300">Loading course links...</p>
            </div>
        </div>
    `;

    // Add loading modal to DOM
    const loadingContainer = document.createElement('div');
    loadingContainer.innerHTML = loadingModalHtml;
    document.body.appendChild(loadingContainer);
    if (localStorage.getItem('language') === 'ha') {
        applyHausaTranslations(loadingContainer);
    }
    // Fetch course links
    courseLinkService.getCourseLinks(course._id)
        .then(response => {
            const links = response.data.courseLinks || [];

            // Remove loading modal
            document.body.removeChild(loadingContainer);

            // Create and show the course links modal
            displayCourseLinksModal(course, links);
        })
        .catch(error => {
            console.error('Error fetching course links:', error);

            // Remove loading modal and show error
            document.body.removeChild(loadingContainer);
            showToast('Failed to load course links. Please try again.', 'error');

            // Go back to course settings
            showCourseSettingsModal(course);
        });
}

// Display course links modal with fetched data
function displayCourseLinksModal(course, links) {
    // Format the base URL for sharing
    const baseUrl = window.location.origin + window.location.pathname;

    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Course Enrollment Links</h3>
                    <button id="closeLinksModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <p class="text-gray-600 dark:text-gray-300" data-user-content="true">Manage enrollment links for ${course.name}</p>
                        <button id="generateNewLinkBtn" class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            <i class="fas fa-plus mr-1"></i> Generate New Link
                        </button>
                    </div>
                    
                    ${links.length === 0 ? `
                        <div class="bg-gray-50 dark:bg-gray-750 p-8 rounded-lg text-center">
                            <i class="fas fa-link text-gray-400 text-4xl mb-3"></i>
                            <p class="text-gray-500 dark:text-gray-400">No enrollment links have been generated yet.</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Generate a link to allow easy enrollment without the enrollment code.
                            </p>
                        </div>
                    ` : `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-750">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uses</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    ${links.map(link => {
        const isExpired = new Date(link.expiresAt) < new Date();
        const isMaxedOut = link.maxUses && link.usedCount >= link.maxUses;
        const isRevoked = !link.isActive;

        let statusBadge = '';
        if (isRevoked) {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Revoked</span>`;
        } else if (isExpired) {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Expired</span>`;
        } else if (isMaxedOut) {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Max Uses Reached</span>`;
        } else {
            statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</span>`;
        }

        const linkUrl = `${baseUrl}?join=${link.token}`;

        return `
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 link-row ${isRevoked || isExpired || isMaxedOut ? 'opacity-60' : ''}" data-id="${link._id}">
                                                <td class="px-4 py-4 whitespace-nowrap text-sm">
                                                    ${formatDate(link.createdAt)}
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap text-sm">
                                                    ${link.expiresAt ? formatDate(link.expiresAt) : 'Never'}
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap text-sm">
                                                    ${link.usedCount || 0} ${link.maxUses ? `/ ${link.maxUses}` : ''}
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    ${statusBadge}
                                                </td>
                                                <td class="px-4 py-4 text-sm">
                                                    <div class="flex items-center">
                                                        <span class="truncate max-w-[150px] mr-2">${linkUrl}</span>
                                                        <button class="copy-link-btn text-primary dark:text-primaryLight" data-link="${linkUrl}">
                                                            <i class="fas fa-copy"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    ${!isRevoked ? `
                                                        <button class="revoke-link-btn px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-id="${link._id}">
                                                            <i class="fas fa-ban mr-1"></i> Revoke
                                                        </button>
                                                    ` : ''}
                                                </td>
                                            </tr>
                                        `;
    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
                
                <div class="flex justify-end mt-4">
                    <button id="backToSettingsBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Back to Settings
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
    document.getElementById('closeLinksModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    document.getElementById('backToSettingsBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showCourseSettingsModal(course);
    });

    // Generate new link button
    document.getElementById('generateNewLinkBtn')?.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showGenerateCourseLinkModal(course._id);
    });

    // Copy link buttons
    document.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const link = btn.dataset.link;
            copyToClipboard(link);
        });
    });

    // Revoke link buttons
    document.querySelectorAll('.revoke-link-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const linkId = btn.dataset.id;

            if (confirm('Are you sure you want to revoke this link? Students will no longer be able to use it to join the course.')) {
                try {
                    await courseLinkService.revokeCourseLink(linkId);
                    showToast('Link revoked successfully!');

                    // Refresh the modal with updated data
                    document.body.removeChild(modalContainer);
                    showCourseLinksModal(course);
                } catch (error) {
                    console.error('Error revoking link:', error);
                    showToast('Failed to revoke link. Please try again.', 'error');
                }
            }
        });
    });
}
// Discussion detail view
async function loadDiscussionDetail(discussionId) {
    // Fetch discussion data
    const response = await discussionService.getDiscussion(discussionId);
    const discussion = response.data.discussion;

    content.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div class="mb-4">
                <div class="flex items-center justify-between">
                    <a href="#" class="text-primary dark:text-primaryLight hover:underline flex items-center mb-2" onclick="loadView('course-detail', {courseId: '${discussion.course._id}'}); return false;">
                        <i class="fas fa-arrow-left mr-2" data-user-content="true"></i>
                        Back to ${discussion.course.name}
                    </a>
                    <div class="flex items-center gap-2">
                        ${discussion.isPinned ? `
                            <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <i class="fas fa-thumbtack mr-1"></i> Pinned
                            </span>
                        ` : ''}
                        ${(discussion.author._id !== currentUser._id) ? `
                            <button data-user-content="true" onclick="showReportModal('discussion', '${discussion._id}', '${discussion.title}')" 
                            class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                            <i class="fas fa-flag"></i>
                            </button>
` : ''}
                        <!-- 🗑 Delete Button (Only for author, instructor, or admin) -->
                        ${(discussion.author._id === currentUser._id || currentUser.role === 'instructor' || currentUser.role === 'admin') ? `
                            <button class="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                                    onclick="deleteDiscussion('${discussionId}')">
                                <i class="fas fa-trash-alt mr-1"></i> Delete
                            </button>
                            
                
                        ` : ''}
                    </div>
                </div>
                <h1 class="text-2xl font-bold" data-user-content="true">${discussion.title}</h1>
                <div class="flex items-center mt-2 mb-4">
                    <img src="${getProfileImageUrl(discussion.author)}" alt="${discussion.author.firstName}" class="w-8 h-8 rounded-full object-cover mr-2" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                    <div>
                        <p class="text-sm font-medium">${discussion.author.firstName} ${discussion.author.lastName}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(discussion.createdAt)}</p>
                    </div>
                </div>
                <div class="prose dark:prose-invert max-w-none" data-user-content="true">
                    ${discussion.content}
                </div>
                
                ${discussion.tags && discussion.tags.length > 0 ? `
                    <div class="mt-4 flex flex-wrap gap-1">
                        ${discussion.tags.map(tag => `
                            <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="mr-4">
                    <i class="far fa-eye mr-1"></i> ${discussion.views || 0} views
                </div>
                <div>
                    <i class="far fa-comment mr-1"></i> ${discussion.replies?.length || 0} replies
                </div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">${discussion.replies?.length || 0} Replies</h2>
            
            ${!discussion.isLocked ? `
                <div class="mb-6">
                    <form id="replyForm" class="space-y-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Your Reply</label>
                            <textarea id="replyContent" rows="4" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                        </div>
                        <div id="replyError" class="text-red-500 hidden"></div>
                        <div>
                            <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            ` : `
                <div class="bg-gray-100 dark:bg-gray-750 border-l-4 border-gray-400 p-4 mb-6">
                    <p class="text-gray-700 dark:text-gray-300">
                        <i class="fas fa-lock mr-2"></i>
                        This discussion is locked. No new replies can be added.
                    </p>
                </div>
            `}
            
            <div class="space-y-6">
                ${discussion.replies && discussion.replies.length > 0 ? discussion.replies.map(reply => `
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div class="flex">
                            <img src="${getProfileImageUrl(reply.author)}" alt="${reply.author.firstName}" class="w-10 h-10 rounded-full object-cover mr-3" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                            <div class="flex-1">
                                <div class="flex items-center">
                                    <p class="font-medium" data-user-content="true">${reply.author.firstName} ${reply.author.lastName}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 ml-2">${formatTimeAgo(reply.createdAt)}</p>
                                    ${reply.isEdited ? `
                                        <p class="text-xs text-gray-500 dark:text-gray-400 ml-2">(edited)</p>
                                    ` : ''}
                                </div>
                                <div class="mt-1 text-gray-700 dark:text-gray-300" data-user-content="true">
                                    ${reply.content}
                                </div>
                                <div class="mt-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                    <button class="hover:text-gray-700 dark:hover:text-gray-200">
                                        <i class="far fa-thumbs-up mr-1"></i> ${reply.likes?.length || 0}
                                    </button>
                                    ${reply.author._id === currentUser._id || currentUser.role === 'instructor' || currentUser.role === 'admin' ? `
                                        <button class="ml-4 hover:text-red-500" delete-reply="${reply._id}" onclick="deleteReply('${discussionId}', '${reply._id}')">
                                            <i class="far fa-trash-alt mr-1"></i> Delete
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                        No replies yet. Be the first to reply!
                    </div>
                `}
            </div>
        </div>
    `;

    // Set up reply form submission
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const content = document.getElementById('replyContent').value;
            const errorDiv = document.getElementById('replyError');

            try {
                errorDiv.classList.add('hidden');

                // Add reply
                await discussionService.addReply(discussionId, { content });

                // Reload discussion
                loadView('discussion-detail', { discussionId });
                showToast('Reply added successfully!');
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
}
async function deleteDiscussion(discussionId) {
    if (!confirm("Are you sure you want to delete this discussion? This action cannot be undone.")) {
        return;
    }

    try {
        await discussionService.deleteDiscussion(discussionId);
        showToast("Discussion deleted successfully.");
        loadView("discussions"); // Redirect back to discussions list
    } catch (error) {
        showToast(`Failed to delete discussion: ${error.message}`, "error");
    }

}
async function deleteReply(discussionId, replyId) {
    if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
        return;
    }

    try {
        await discussionService.deleteReply(discussionId, replyId);
        showToast("Reply deleted successfully.");
        loadView("discussion-detail", { discussionId });
    } catch (error) {
        showToast(`Failed to delete reply: ${error.message}`, "error");
    }
}

/**
 * Load resources view with filtering, sorting and categorization
 * @param {string} courseId - Optional course ID to filter resources
 * @returns {Promise<void>}
 */
async function loadResources(courseId = null) {
    try {
        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;

        // Fetch course data if courseId is provided
        if (courseId) {
            const courseResponse = await courseService.getCourse(courseId);
            currentCourseData = courseResponse.data.course;
        } else {
            currentCourseData = null;
        }

        // Fetch resources based on parameters
        let resources = [];
        try {
            if (courseId) {
                const response = await resourceService.getCourseResources(courseId);
                resources = response.data.resources;
            } else {
                const response = await resourceService.getAllResources();
                resources = response.data.resources;
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            throw new Error('Failed to fetch resources. Please try again.');
        }


        // Get all user's courses for filter
        let userCourses = [];
        try {
            const coursesResponse = await courseService.getMyCourses();
            userCourses = coursesResponse.data.courses;
        } catch (error) {
            console.warn('Could not fetch courses for filter:', error);
        }

        // Prepare data for rendering
        const resourceCategories = [
            { id: 'all', name: 'All Resources' },
            { id: 'lecture', name: 'Lecture Materials' },
            { id: 'reading', name: 'Reading Materials' },
            { id: 'exercise', name: 'Practice Exercises' },
            { id: 'assignment', name: 'Assignment Materials' },
            { id: 'tutorial', name: 'Tutorial Videos' },
            { id: 'other', name: 'Other Resources' }
        ];

        // Determine if user can upload resources
        const canUpload = currentUser.role === 'instructor' || currentUser.role === 'admin';

        // Group resources by category
        const resourcesByCategory = {};
        resourceCategories.forEach(category => {
            if (category.id === 'all') {
                resourcesByCategory[category.id] = [...resources];
            } else {
                resourcesByCategory[category.id] = resources.filter(
                    resource => resource.category === category.id
                );
            }
        });

        // Build the view
        content.innerHTML = `
            <div class="mb-6 flex flex-wrap justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold">
                        ${currentCourseData ? `Resources: ${currentCourseData.name}` : 'Resources'}
                    </h1>
                    ${currentCourseData ? `
                        <p class="text-gray-600 dark:text-gray-400 mt-1">
                            ${currentCourseData.code} • ${currentCourseData.instructor.firstName} ${currentCourseData.instructor.lastName}
                        </p>
                    ` : ''}
                </div>
                
                ${canUpload ? `
                    <button id="uploadResourceBtn" class="mt-2 sm:mt-0 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                        <i class="fas fa-upload mr-1"></i> Upload Resource
                    </button>
                ` : ''}
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <!-- Left sidebar: Filters and controls -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 sticky top-4">
                        <h2 class="font-semibold text-lg mb-4">Filter Resources</h2>
                        
                        <!-- Search -->
                        <div class="mb-4">
                            <div class="relative">
                                <input type="text" id="searchResources" placeholder="Search resources..." class="pl-10 pr-4 py-2 w-full text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Categories -->
                        <div class="mb-4">
                            <h3 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Categories</h3>
                            <div class="space-y-2">
                                ${resourceCategories.map(category => `
                                    <button class="resource-category-btn w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition ${category.id === 'all' ? 'bg-primary bg-opacity-10 text-primary dark:bg-opacity-20 dark:text-primaryLight' : ''}" data-category="${category.id}">
                                        ${category.name}
                                        <span class="float-right">${resourcesByCategory[category.id].length}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${!courseId && userCourses.length > 0 ? `
                            <!-- Course filter (only show when viewing all resources) -->
                            <div class="mb-4">
                                <h3 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Courses</h3>
                                <select id="courseFilter" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    <option value="all">All Courses</option>
                                    ${userCourses.map(course => `
                                        <option value="${course._id}" data-user-content="true">${course.code} - ${course.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                        
                        <!-- Type filter -->
                        <div class="mb-4">
                            <h3 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Resource Type</h3>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" class="resource-type-filter" value="all" checked>
                                    <span class="ml-2">All Types</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="resource-type-filter" value="file">
                                    <span class="ml-2">Files</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="resource-type-filter" value="link">
                                    <span class="ml-2">Links</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="resource-type-filter" value="text">
                                    <span class="ml-2">Text</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Sort options -->
                        <div>
                            <h3 class="font-medium text-sm tracking-wider text-gray-500 dark:text-gray-400 mb-2">SORT BY</h3>
                            <select id="resourceSort" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                <option value="recent">Recently Added</option>
                                <option value="title">Title (A-Z)</option>
                                <option value="likes">Most Liked</option>
                                <option value="views">Most Viewed</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Right content: Resource listing -->
                <div class="lg:col-span-3">
                    <!-- Resources grid -->
                    <div id="resourcesContainer">
                        ${resources.length > 0 ? `
                            <div class="space-y-4" id="resourcesList">
                                ${resources.map(resource => generateResourceCard(resource)).join('')}
                            </div>
                        ` : `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-file-alt text-gray-500 text-2xl"></i>
                                </div>
                                <h3 class="font-semibold text-lg mb-2">No Resources Found</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-4">
                                    ${currentCourseData ?
                'No resources have been added to this course yet.' :
                'No resources match your current filters.'}
                                </p>
                                ${canUpload ? `
                                    <button id="addFirstResourceBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        Upload First Resource
                                    </button>
                                ` : ''}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners

        // Upload resource button
        const uploadBtn = document.getElementById('uploadResourceBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                showUploadResourceModal(courseId);
            });
        }

        const viewDetailBtn = document.querySelectorAll('.resource-card');
        viewDetailBtn.forEach(card => {
            card.addEventListener('click', () => {
                const resourceId = card.dataset.id;
                loadView('resource-detail', { resourceId });
            });
        });

        const resourcesList = document.getElementById('resourcesList');
        if (resourcesList) {
            resourcesList.addEventListener('click', (e) => {
                if (e.target.closest('.resource-card')) {
                    const resourceId = e.target.closest('.resource-card').dataset.id;
                    loadView('resource-detail', { resourceId });
                }
            });
        }

        // First resource button
        const firstResourceBtn = document.getElementById('addFirstResourceBtn');
        if (firstResourceBtn) {
            firstResourceBtn.addEventListener('click', () => {
                showUploadResourceModal(courseId);
            });
        }

        // Category filter buttons
        const categoryBtns = document.querySelectorAll('.resource-category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                categoryBtns.forEach(b => {
                    b.classList.remove('bg-primary', 'bg-opacity-10', 'text-primary', 'dark:bg-opacity-20', 'dark:text-primaryLight');
                });
                btn.classList.add('bg-primary', 'bg-opacity-10', 'text-primary', 'dark:bg-opacity-20', 'dark:text-primaryLight');

                // Apply filter
                filterResources();
            });
        });

        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', () => {
                if (courseFilter.value !== 'all') {
                    // Redirect to the course resources page
                    loadResources(courseFilter.value);
                } else {
                    // Just apply filters
                    filterResources();
                }
            });
        }

        // Resource type filter
        const typeFilters = document.querySelectorAll('.resource-type-filter');
        typeFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                // Handle "All Types" checkbox
                if (e.target.value === 'all') {
                    typeFilters.forEach(f => {
                        if (f !== e.target) {
                            f.checked = false;
                        }
                    });
                } else {
                    // If a specific type is checked, uncheck "All Types"
                    document.querySelector('.resource-type-filter[value="all"]').checked = false;

                    // If no specific types are checked, check "All Types"
                    const anyChecked = Array.from(typeFilters).some(f => f.value !== 'all' && f.checked);
                    if (!anyChecked) {
                        document.querySelector('.resource-type-filter[value="all"]').checked = true;
                    }
                }

                // Apply filters
                filterResources();
            });
        });

        // Search input
        const searchInput = document.getElementById('searchResources');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                filterResources();
            });
        }

        // Sort selection
        const sortSelect = document.getElementById('resourceSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                filterResources();
            });
        }

    } catch (error) {
        console.error('Error loading resources:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading resources</p>
                <p>${error.message || 'Failed to load resources'}</p>
                <div class="mt-4 flex space-x-2">
                    <button class="px-4 py-2 bg-primary text-white rounded-lg" onclick="loadResources(${courseId ? `'${courseId}'` : ''})">
                        Retry
                    </button>
                    <button class="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg" onclick="loadLoginPage()">
                        Back to login Page
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Generate HTML for a resource card
 * @param {Object} resource - The resource data
 * @returns {string} HTML string for the resource card
 */
function generateResourceCard(resource) {
    // Get course details
    const course = resource.course || {};
    const courseName = typeof course === 'object' ? (course.name || 'Unknown Course') : 'Unknown Course';
    const courseCode = typeof course === 'object' ? (course.code || '') : '';
    const courseColor = typeof course === 'object' ? (course.color || '#5D5CDE') : '#5D5CDE';

    // Get user details
    const addedBy = resource.addedBy || {};
    const userName = typeof addedBy === 'object' ?
        `${addedBy.firstName || ''} ${addedBy.lastName || ''}`.trim() : 'Unknown User';

    // Format dates
    const addedDate = formatDate(resource.createdAt);
    const updatedDate = resource.updatedAt ? formatDate(resource.updatedAt) : '';

    // Get resource statistics
    const viewCount = resource.viewCount || 0;
    const likeCount = resource.likes?.length || 0;
    const commentCount = resource.comments?.length || 0;

    // Determine if resource is pinned
    const isPinned = resource.isPinned || false;

    // Determine if current user has liked the resource
    const isLiked = resource.likes?.includes(currentUser._id) || false;

    // Determine if user can edit/delete
    const canModify =
        currentUser._id === (typeof resource.addedBy === 'object' ? resource.addedBy._id : resource.addedBy) ||
        currentUser.role === 'admin';

    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition resource-card"
            data-id="${resource._id}"
            data-title="${resource.title}"
            data-type="${resource.type}"
            data-category="${resource.category || 'other'}"
            data-course="${typeof resource.course === 'object' ? resource.course._id : resource.course}"
            data-views="${viewCount}"
            data-likes="${likeCount}">
            
            <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-start">
                        ${getResourceTypeIcon(resource)}
                        <div class="ml-3">
                            <h3 class="font-semibold text-lg">
                                <a href="#" data-user-content="true" class="hover:text-primary dark:hover:text-primaryLight resource-title-link" data-id="${resource._id}">
                                    ${resource.title}
                                </a>
                                ${isPinned ? '<i class="fas fa-thumbtack ml-2 text-yellow-500 dark:text-yellow-400" title="Pinned"></i>' : ''}
                            </h3>
                            <div class="flex items-center mt-1">
                                <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor}">
                                    ${courseCode}
                                </span>
                                <span class="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                    ${getCategoryLabel(resource.category)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="resource-actions relative">
                        <button class="resource-menu-btn p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="resource-menu absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-40 z-10 hidden">
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750 resource-view-btn" data-id="${resource._id}">
                                <i class="fas fa-eye mr-2"></i> View Details
                            </a>
                            ${resource.type === 'file' ? `
                                <a href="${resource.file?.filePath || '#'}" target="_blank" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750">
                                    <i class="fas fa-eye mr-2"></i> View
                                </a>
                            ` : resource.type === 'link' ? `
                                <a href="${resource.link}" target="_blank" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750">
                                    <i class="fas fa-external-link-alt mr-2"></i> Open Link
                                </a>
                            ` : ''}
                            ${canModify ? `
                                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750 resource-edit-btn" data-id="${resource._id}">
                                    <i class="fas fa-edit mr-2"></i> Edit
                                </a>
                                <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750 text-red-600 dark:text-red-400 resource-delete-btn" data-id="${resource._id}">
                                    <i class="fas fa-trash mr-2"></i> Delete
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    <span data-user-content="true">${resource.description || ''}</span>${!resource.description ? 'No Description Provided' : ''}
                </p>
                
                <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>Added by ${userName}</span>
                    <span class="mx-2">•</span>
                    <span>${addedDate}</span>
                    ${updatedDate && updatedDate !== addedDate ? `
                        <span class="mx-2">•</span>
                        <span>Updated ${formatTimeAgo(resource.updatedAt)}</span>
                    ` : ''}
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex space-x-4">
                        <button class="resource-like-btn flex items-center text-sm ${isLiked ? 'text-primary dark:text-primaryLight' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primaryLight'}" data-id="${resource._id}" data-liked="${isLiked}">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart mr-1"></i>
                            <span class="resource-like-count">${likeCount}</span>
                        </button>
                        <button class="resource-comment-btn flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primaryLight" data-id="${resource._id}">
                            <i class="far fa-comment mr-1"></i>
                            <span>${commentCount}</span>
                        </button>
                        <span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <i class="far fa-eye mr-1"></i>
                            <span>${viewCount}</span>
                        </span>
                    </div>
                    <a href="#" class="text-primary dark:text-primaryLight hover:underline text-sm resource-view-btn" data-id="${resource._id}">View Details</a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get category label for display
 * @param {string} category - Category identifier
 * @returns {string} Display label for the category
 */
function getCategoryLabel(category) {
    const categories = {
        'lecture': 'Lecture Materials',
        'reading': 'Reading Materials',
        'exercise': 'Practice Exercises',
        'assignment': 'Assignment Materials',
        'tutorial': 'Tutorial Videos',
        'other': 'Other Resources'
    };

    return categories[category] || 'Other Resources';
}

/**
 * Get appropriate icon for resource type
 * @param {Object} resource - The resource object
 * @returns {string} HTML for the resource icon
 */
function getResourceTypeIcon(resource) {
    let iconHtml = '';
    const size = 'text-2xl';

    if (resource.type === 'file') {
        const fileType = resource.file?.fileType || '';
        if (fileType.includes('pdf')) {
            iconHtml = `<i class="far fa-file-pdf text-red-500 ${size}"></i>`;
        } else if (fileType.includes('word') || fileType.includes('document')) {
            iconHtml = `<i class="far fa-file-word text-blue-500 ${size}"></i>`;
        } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            iconHtml = `<i class="far fa-file-excel text-green-500 ${size}"></i>`;
        } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
            iconHtml = `<i class="far fa-file-powerpoint text-orange-500 ${size}"></i>`;
        } else if (fileType.includes('image')) {
            iconHtml = `<i class="far fa-file-image text-purple-500 ${size}"></i>`;
        } else if (fileType.includes('video')) {
            iconHtml = `<i class="far fa-file-video text-pink-500 ${size}"></i>`;
        } else if (fileType.includes('audio')) {
            iconHtml = `<i class="far fa-file-audio text-yellow-500 ${size}"></i>`;
        } else if (fileType.includes('zip') || fileType.includes('archive')) {
            iconHtml = `<i class="far fa-file-archive text-gray-500 ${size}"></i>`;
        } else if (fileType.includes('code') || fileType.includes('text/')) {
            iconHtml = `<i class="far fa-file-code text-gray-500 ${size}"></i>`;
        } else {
            iconHtml = `<i class="far fa-file text-gray-500 ${size}"></i>`;
        }
    } else if (resource.type === 'link') {
        iconHtml = `<i class="fas fa-link text-blue-500 ${size}"></i>`;
    } else if (resource.type === 'text') {
        iconHtml = `<i class="far fa-file-alt text-gray-500 ${size}"></i>`;
    } else {
        iconHtml = `<i class="far fa-file text-gray-500 ${size}"></i>`;
    }

    return iconHtml;
}

/**
 * Filter resources based on current filter settings
 */
function filterResources() {
    // Get filter values
    const searchTerm = document.getElementById('searchResources').value.toLowerCase();
    const selectedCategory = document.querySelector('.resource-category-btn.bg-primary')?.dataset.category || 'all';
    const sortBy = document.getElementById('resourceSort').value;

    // Get selected types
    const allTypesSelected = document.querySelector('.resource-type-filter[value="all"]').checked;
    const selectedTypes = allTypesSelected ? ['file', 'link', 'text'] :
        Array.from(document.querySelectorAll('.resource-type-filter:checked'))
            .map(checkbox => checkbox.value)
            .filter(value => value !== 'all');

    // Get all resource cards
    const resourceCards = document.querySelectorAll('.resource-card');

    // Filter resources
    resourceCards.forEach(card => {
        const title = card.dataset.title.toLowerCase();
        const category = card.dataset.category;
        const type = card.dataset.type;

        const matchesSearch = title.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        const matchesType = selectedTypes.includes(type);

        if (matchesSearch && matchesCategory && matchesType) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    // Sort visible resources
    const resourcesList = document.getElementById('resourcesList');

    if (resourcesList) {
        const visibleCards = Array.from(resourceCards).filter(card => !card.classList.contains('hidden'));

        visibleCards.sort((a, b) => {
            if (sortBy === 'title') {
                return a.dataset.title.localeCompare(b.dataset.title);
            } else if (sortBy === 'likes') {
                return parseInt(b.dataset.likes) - parseInt(a.dataset.likes);
            } else if (sortBy === 'views') {
                return parseInt(b.dataset.views) - parseInt(a.dataset.views);
            } else {
                // Default: sort by recent (based on DOM order as we initially sorted by createdAt)
                return 0;
            }
        });

        // Re-append sorted cards
        visibleCards.forEach(card => resourcesList.appendChild(card));
    }
    // Show/hide empty state

    else if (visibleCount === 0) {
        // Show empty state if no resources match filters
        const courseId = document.getElementById('courseFilter')?.value;
        const resourcesContainer = document.getElementById('resourcesContainer');
        resourcesContainer.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-filter text-gray-500 text-2xl"></i>
                </div>
                <h3 class="font-semibold text-lg mb-2">No Resources Found</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    No resources match your current filters.
                </p>
                <button id="clearFiltersBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    Clear Filters
                </button>
            </div>
        `;

        // Set up clear filters button
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            // Reset search
            document.getElementById('searchResources').value = '';

            // Reset category
            document.querySelector('.resource-category-btn[data-category="all"]').click();

            // Reset type filters
            document.querySelector('.resource-type-filter[value="all"]').checked = true;
            document.querySelectorAll('.resource-type-filter:not([value="all"])').forEach(checkbox => {
                checkbox.checked = false;
            });

            // Reset sort
            document.getElementById('resourceSort').value = 'recent';

            // Reload resources
            loadResources(courseId === 'all' ? null : courseId);
        });
    }
}

/**
 * Add event listeners for resource cards after they're loaded
 */
function setupResourceCardListeners() {
    // Resource menu toggles
    document.querySelectorAll('.resource-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = btn.nextElementSibling;
            menu.classList.toggle('hidden');

            // Close all other open menus
            document.querySelectorAll('.resource-menu:not(.hidden)').forEach(openMenu => {
                if (openMenu !== menu) {
                    openMenu.classList.add('hidden');
                }
            });
        });
    });

    // Close menus when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.resource-menu:not(.hidden)').forEach(menu => {
            menu.classList.add('hidden');
        });
    });

    // Like buttons
    document.querySelectorAll('.resource-like-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const resourceId = btn.dataset.id;
            const isLiked = btn.dataset.liked === 'true';

            try {
                if (isLiked) {
                    await resourceService.unlikeResource(resourceId);
                    btn.dataset.liked = 'false';
                    btn.querySelector('i').classList.remove('fas');
                    btn.querySelector('i').classList.add('far');
                } else {
                    await resourceService.likeResource(resourceId);
                    btn.dataset.liked = 'true';
                    btn.querySelector('i').classList.remove('far');
                    btn.querySelector('i').classList.add('fas');
                }

                // Update like count
                const response = await resourceService.getResource(resourceId);
                const likeCount = response.data.resource.likes?.length || 0;
                btn.querySelector('.resource-like-count').textContent = likeCount;

                // Update the card's dataset for sorting
                const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
                if (card) {
                    card.dataset.likes = likeCount;
                }

            } catch (error) {
                console.error('Error toggling resource like:', error);
                showToast('Failed to update like status', 'error');
            }
        });
    });

    // View buttons
    document.querySelectorAll('.resource-view-btn, .resource-title-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const resourceId = btn.dataset.id;
            loadResourceDetail(resourceId);
        });
    });

    // Comment buttons
    document.querySelectorAll('.resource-comment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const resourceId = btn.dataset.id;
            loadResourceDetail(resourceId, 'comments');
        });
    });

    // Edit buttons
    document.querySelectorAll('.resource-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const resourceId = btn.dataset.id;
            showEditResourceModal(resourceId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.resource-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const resourceId = btn.dataset.id;

            if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
                deleteResource(resourceId);
            }
        });
    });
}

/**
 * Load detailed view of a resource
 * @param {string} resourceId - ID of the resource to view
 * @param {string} activeTab - Optional tab to activate (info, comments)
 * @returns {Promise<void>}
 */
async function loadResourceDetail(resourceId, activeTab = 'info') {
    try {
        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;

        // Fetch resource details
        const response = await resourceService.getResource(resourceId);
        const resource = response.data.resource;

        // Increase view count if not already viewed in this session
        const viewedResources = JSON.parse(sessionStorage.getItem('viewedResources') || '[]');
        if (!viewedResources.includes(resourceId)) {
            try {
                await resourceService.recordResourceView(resourceId);
                viewedResources.push(resourceId);
                sessionStorage.setItem('viewedResources', JSON.stringify(viewedResources));
            } catch (error) {
                console.warn('Could not record resource view:', error);
            }
        }

        // Get course details
        const course = resource.course || {};
        const courseName = typeof course === 'object' ? (course.name || 'Unknown Course') : 'Unknown Course';
        const courseCode = typeof course === 'object' ? (course.code || '') : '';
        const courseColor = typeof course === 'object' ? (course.color || '#5D5CDE') : '#5D5CDE';
        const courseId = typeof course === 'object' ? course._id : course;

        // Get user details
        const addedBy = resource.addedBy || {};
        const userName = typeof addedBy === 'object' ?
            `${addedBy.firstName || ''} ${addedBy.lastName || ''}`.trim() : 'Unknown User';

        // Determine if user can edit/delete/pin
        const canModify =
            currentUser._id === (typeof resource.addedBy === 'object' ? resource.addedBy._id : resource.addedBy) ||
            currentUser.role === 'admin';

        const canPin = currentUser.role === 'instructor' || currentUser.role === 'admin';

        // Get resource statistics
        const viewCount = resource.viewCount || 0;
        const likeCount = resource.likes?.length || 0;
        const commentCount = resource.comments?.length || 0;

        // Check if user has liked this resource
        const isLiked = resource.likes?.includes(currentUser._id) || false;

        // Determine if resource is pinned
        const isPinned = resource.isPinned || false;

        // Prepare comments
        const comments = resource.comments || [];

        // Sort comments newest first
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Build the view
        content.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-wrap items-center gap-2">
                    <button id="backToResourcesBtn" class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primaryLight">
                        <i class="fas fa-arrow-left mr-1"></i> Back to Resources
                    </button>
                    ${courseCode ? `
                        <span class="text-gray-500 dark:text-gray-400">•</span>
                        <a href="#" onclick="event.preventDefault(); loadView('course-detail', {courseId: '${courseId}'});" class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primaryLight">
                            ${courseCode}
                        </a>
                    ` : ''}
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left content: Resource details -->
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-start">
                                ${getResourceTypeIcon(resource)}
                                <div class="ml-3">
                                    <h1 class="text-2xl font-bold" data-user-content="true">${resource.title}</h1>
                                    <div class="flex items-center mt-1">
                                        <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor}">
                                            ${courseCode}
                                        </span>
                                        <span class="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">
                                            ${getCategoryLabel(resource.category)}
                                        </span>
                                        ${isPinned ? `
                                            <span class="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                                            <span class="text-xs font-medium text-yellow-500 dark:text-yellow-400">
                                                <i class="fas fa-thumbtack mr-1"></i> Pinned
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            ${canModify || canPin ? `
                                <div class="relative">
                                    <button id="resourceActionsBtn" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <div id="resourceActionsMenu" class="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-40 z-10 hidden">
                                        ${canModify ? `
                                            <a href="#" id="editResourceBtn" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750">
                                                <i class="fas fa-edit mr-2"></i> Edit
                                            </a>
                                            <a href="#" id="deleteResourceBtn" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750 text-red-600 dark:text-red-400">
                                                <i class="fas fa-trash mr-2"></i> Delete
                                            </a>
                                        ` : ''}
                                        ${canPin ? `
                                            <a href="#" id="togglePinBtn" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750">
                                                <i class="fas ${isPinned ? 'fa-thumbtack' : 'fa-thumbtack'} mr-2"></i> ${isPinned ? 'Unpin' : 'Pin'} Resource
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span>Added by ${userName}</span>
                            <span class="mx-2">•</span>
                            <span>${formatDate(resource.createdAt)}</span>
                            ${resource.updatedAt && resource.updatedAt !== resource.createdAt ? `
                                <span class="mx-2">•</span>
                                <span>Updated ${formatTimeAgo(resource.updatedAt)}</span>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center space-x-6 text-sm mb-6">
                            <button id="likeResourceBtn" class="flex items-center ${isLiked ? 'text-primary dark:text-primaryLight' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primaryLight'}">
                                <i class="${isLiked ? 'fas' : 'far'} fa-heart mr-1"></i>
                                <span id="likeCount">${likeCount}</span>
                            </button>
                            <span class="flex items-center text-gray-500 dark:text-gray-400">
                                <i class="far fa-comment mr-1"></i>
                                <span id="commentCount">${commentCount}</span>
                            </span>
                            <span class="flex items-center text-gray-500 dark:text-gray-400">
                                <i class="far fa-eye mr-1"></i>
                                <span>${viewCount}</span>
                            </span>
                        </div>
                        
                        <!-- Tabs for resource content -->
                        <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
                            <div class="flex">
                                <button id="infoTab" class="resource-tab px-4 py-2 border-b-2 ${activeTab === 'info' ? 'border-primary text-primary dark:text-primaryLight' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}">
                                    Information
                                </button>
                                <button id="commentsTab" class="resource-tab px-4 py-2 border-b-2 ${activeTab === 'comments' ? 'border-primary text-primary dark:text-primaryLight' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}">
                                    Comments (${commentCount})
                                </button>
                            </div>
                        </div>
                        
                        <!-- Info tab content -->
                        <div id="infoTabContent" class="resource-tab-content ${activeTab !== 'info' ? 'hidden' : ''}">
                            <div class="mb-6">
                                <h2 class="font-semibold text-lg mb-3">Description</h2>
                                <div class="prose dark:prose-invert max-w-none" data-user-content="true">
                                    ${resource.description ? marked.parse(resource.description) : '<p class="text-gray-500 dark:text-gray-400">No description provided.</p>'}
                                </div>
                            </div>
                            
                            ${resource.type === 'file' ? `
                                <div class="mb-6">
                                    <h2 class="font-semibold text-lg mb-3">File</h2>
                                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 flex items-center justify-between">
                                        <div class="flex items-center">
                                            ${getResourceTypeIcon(resource)}
                                            <div class="ml-3">
                                                <p class="font-medium">${resource.file?.fileName || 'File'}</p>
                                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                                    ${formatFileSize(resource.file?.fileSize)} • ${resource.file?.fileType || 'Unknown type'}
                                                </p>
                                            </div>
                                        </div>
                                        <a href="${resource.file?.filePath || '#'}" target="_blank" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                            <i class="fas fa-eye mr-1"></i> View 
                                        </a>
                                    </div>
                                </div>
                            ` : resource.type === 'link' ? `
                                <div class="mb-6">
                                    <h2 class="font-semibold text-lg mb-3">External Link</h2>
                                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-link text-blue-500 text-2xl"></i>
                                            <div class="ml-3">
                                                <p class="font-medium" data-user-content="true">${resource.title}</p>
                                                <p class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    ${resource.link || 'Link'}
                                                </p>
                                            </div>
                                        </div>
                                        <a href="${resource.link || '#'}" target="_blank" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                            <i class="fas fa-external-link-alt mr-1"></i> Open Link
                                        </a>
                                    </div>
                                </div>
                            ` : resource.type === 'text' ? `
                                <div class="mb-6">
                                    <h2 class="font-semibold text-lg mb-3">Content</h2>
                                    <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                                        <div class="prose dark:prose-invert max-w-none">
                                            ${resource.content ? marked.parse(resource.content) : '<p class="text-gray-500 dark:text-gray-400">No content provided.</p>'}
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Comments tab content -->
                        <div id="commentsTabContent" class="resource-tab-content ${activeTab !== 'comments' ? 'hidden' : ''}">
                            <div class="mb-6">
                                <h2 class="font-semibold text-lg mb-3">Comments</h2>
                                
                                <!-- Comment form -->
                                <form id="commentForm" class="mb-6">
                                    <textarea id="commentContent" rows="3" placeholder="Add your comment..." class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                                    <div class="flex justify-end mt-2">
                                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                            Post Comment
                                        </button>
                                    </div>
                                </form>
                                
                                <!-- Comments list -->
                                <div id="commentsList">
                                    ${comments.length > 0 ? comments.map(comment => `
                                        <div class="comment-item p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4" data-id="${comment._id}">
                                            <div class="flex justify-between items-start mb-2">
                                                <div class="flex items-center">
                                                    <img src="${getProfileImageUrl(comment.user)}" alt="${comment.user?.firstName || 'User'}" class="w-8 h-8 rounded-full object-cover mr-3" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                                    <div>
                                                        <p class="font-medium">${comment.user?.firstName || ''} ${comment.user?.lastName || ''}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(comment.createdAt)}</p>
                                                    </div>
                                                </div>
                                                    <div class="relative">
                                                        ${(currentUser._id !== (comment.user?._id || comment.user)) || currentUser.role === 'admin' ? `
                                                        <button onclick="showReportModal('comment', '${comment._id}', '${comment.content}')" 
                                                         class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                                                        <i class="fas fa-flag"></i>
                                                        </button>
                                                        ` : ''}
                                                        <button class="comment-menu-btn p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                                            <i class="fas fa-ellipsis-v"></i>
                                                        </button>
                                                        <div class="comment-menu absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-32 z-10 hidden">
                                                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750 comment-edit-btn" data-id="${comment._id}">
                                                                <i class="fas fa-edit mr-2"></i> Edit
                                                            </a>
                                                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-750 text-red-600 dark:text-red-400 comment-delete-btn" data-id="${comment._id}">
                                                                <i class="fas fa-trash mr-2"></i> Delete
                                                            </a>
                                                        </div>
                                                    </div>
                                            </div>
                                            <div class="comment-content ml-11">
                                                <p data-user-content="true" class="text-gray-700 dark:text-gray-300 whitespace-pre-line">${comment.content}</p>
                                            </div>
                                            <!-- Edit form (hidden by default) -->
                                            <div class="comment-edit-form ml-11 mt-2 hidden">
                                                <textarea data-user-content="true" class="edit-comment-content w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200" rows="3">${comment.content}</textarea>
                                                <div class="flex justify-end mt-2 space-x-2">
                                                    <button type="button" class="cancel-edit-btn px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition">
                                                        Cancel
                                                    </button>
                                                    <button type="button" class="save-comment-btn px-3 py-1 bg-primary hover:bg-primaryDark text-white text-sm rounded-lg transition" data-id="${comment._id}">
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('') : `
                                        <div class="text-center py-6">
                                            <p class="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right sidebar: Related resources and info -->
                <div class="lg:col-span-1">
                    <!-- Resource actions card -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h2 class="font-semibold text-lg mb-4">Resource Actions</h2>
                        
                        <div class="space-y-3">
                            ${resource.type === 'file' ? `
                                <a href="${resource.file?.filePath || '#'}" target="_blank" class="flex items-center justify-center w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    <i class="fas fa-eye mr-2"></i> View File
                                </a>
                            ` : resource.type === 'link' ? `
                                <a href="${resource.link || '#'}" target="_blank" class="flex items-center justify-center w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    <i class="fas fa-external-link-alt mr-2"></i> Visit Link
                                </a>
                            ` : ''}
                            
                            <button id="shareResourceBtn" class="flex items-center justify-center w-full px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark rounded-lg transition">
                                <i class="fas fa-share-alt mr-2"></i> Share Resource
                            </button>
                            
                            ${resource.course ? `
                                <a href="#" onclick="event.preventDefault(); loadView('course-detail', {courseId: '${courseId}'});" class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition">
                                    <i class="fas fa-book mr-2"></i> View Course
                                </a>
                            ` : ''}
                            
                            <a href="#" onclick="event.preventDefault(); loadResources('${courseId}');" class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition">
                                <i class="fas fa-list mr-2"></i> All Resources
                            </a>
                        </div>
                    </div>
                    
                    <!-- Course information card -->
                    ${resource.course ? `
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                            <h2 class="font-semibold text-lg mb-4">Course Information</h2>
                            
                            <div>
                                <p class="font-medium">${courseName}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${courseCode}</p>
                                
                                <div class="flex items-center mb-4">
                                    <img src="${getProfileImageUrl(course.instructor)}" alt="${course.instructor?.firstName || 'Instructor'}" class="w-6 h-6 rounded-full object-cover mr-2"
                                    onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                    <span class="text-sm">${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}</span>
                                </div>
                                
                                <a href="#" onclick="event.preventDefault(); loadView('course-detail', {courseId: '${courseId}'});" class="text-primary dark:text-primaryLight hover:underline text-sm">
                                    View Course Details
                                </a>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Related resources card (placeholder) -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h2 class="font-semibold text-lg mb-4">Related Resources</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Related resources will appear here automatically.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners

        // Back button
        document.getElementById('backToResourcesBtn').addEventListener('click', () => {
            // Go back to course resources if this was from a course
            if (courseId) {
                loadResources(courseId);
            } else {
                loadResources();
            }
        });

        // Tabs
        document.getElementById('infoTab').addEventListener('click', () => {
            document.getElementById('infoTab').classList.add('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('infoTab').classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            document.getElementById('commentsTab').classList.remove('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('commentsTab').classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');

            document.getElementById('infoTabContent').classList.remove('hidden');
            document.getElementById('commentsTabContent').classList.add('hidden');
        });

        document.getElementById('commentsTab').addEventListener('click', () => {
            document.getElementById('commentsTab').classList.add('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('commentsTab').classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            document.getElementById('infoTab').classList.remove('border-primary', 'text-primary', 'dark:text-primaryLight');
            document.getElementById('infoTab').classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');

            document.getElementById('commentsTabContent').classList.remove('hidden');
            document.getElementById('infoTabContent').classList.add('hidden');
        });

        // Like button
        const likeBtn = document.getElementById('likeResourceBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                try {
                    if (isLiked) {
                        await resourceService.unlikeResource(resourceId);
                        likeBtn.classList.remove('text-primary', 'dark:text-primaryLight');
                        likeBtn.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-primary', 'dark:hover:text-primaryLight');
                        likeBtn.querySelector('i').classList.remove('fas');
                        likeBtn.querySelector('i').classList.add('far');
                    } else {
                        await resourceService.likeResource(resourceId);
                        likeBtn.classList.add('text-primary', 'dark:text-primaryLight');
                        likeBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-primary', 'dark:hover:text-primaryLight');
                        likeBtn.querySelector('i').classList.remove('far');
                        likeBtn.querySelector('i').classList.add('fas');
                    }

                    // Update like count
                    const updatedResponse = await resourceService.getResource(resourceId);
                    const updatedResource = updatedResponse.data.resource;
                    document.getElementById('likeCount').textContent = updatedResource.likes?.length || 0;

                } catch (error) {
                    console.error('Error toggling resource like:', error);
                    showToast('Failed to update like status', 'error');
                }
            });
        }

        // Resource actions menu toggle
        const actionsBtn = document.getElementById('resourceActionsBtn');
        const actionsMenu = document.getElementById('resourceActionsMenu');
        if (actionsBtn && actionsMenu) {
            actionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                actionsMenu.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                actionsMenu.classList.add('hidden');
            });
        }

        // Edit resource button
        const editBtn = document.getElementById('editResourceBtn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showEditResourceModal(resourceId);
            });
        }

        // Delete resource button
        const deleteBtn = document.getElementById('deleteResourceBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();

                if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
                    deleteResource(resourceId);
                }
            });
        }

        // Toggle pin button
        const togglePinBtn = document.getElementById('togglePinBtn');
        if (togglePinBtn) {
            togglePinBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                try {
                    if (isPinned) {
                        await resourceService.unpinResource(resourceId);
                        showToast('Resource unpinned successfully');
                    } else {
                        await resourceService.pinResource(resourceId);
                        showToast('Resource pinned successfully');
                    }

                    // Reload the resource detail view
                    loadResourceDetail(resourceId, activeTab);
                } catch (error) {
                    console.error('Error toggling pin status:', error);
                    showToast('Failed to update pin status', 'error');
                }
            });
        }

        // Share resource button
        const shareBtn = document.getElementById('shareResourceBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                // Create a temporary input to copy the URL
                const tempInput = document.createElement('input');
                tempInput.value = window.location.origin + window.location.pathname + '?view=resource-detail&resourceId=' + resourceId;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);

                showToast('Resource link copied to clipboard!');
            });
        }

        // Comment form
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const content = document.getElementById('commentContent').value.trim();
                if (!content) {
                    showToast('Please enter a comment', 'error');
                    return;
                }

                try {
                    // Submit the comment
                    await resourceService.addComment(resourceId, { content });

                    // Clear the form
                    document.getElementById('commentContent').value = '';

                    // Reload the resource detail view with comments tab active
                    loadResourceDetail(resourceId, 'comments');
                } catch (error) {
                    console.error('Error adding comment:', error);
                    showToast('Failed to add comment', 'error');
                }
            });
        }

        // Comment menu toggles
        document.querySelectorAll('.comment-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const menu = btn.nextElementSibling;
                menu.classList.toggle('hidden');

                // Close all other menus
                document.querySelectorAll('.comment-menu:not(.hidden)').forEach(openMenu => {
                    if (openMenu !== menu) {
                        openMenu.classList.add('hidden');
                    }
                });
            });
        });

        // Close comment menus when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.comment-menu:not(.hidden)').forEach(menu => {
                menu.classList.add('hidden');
            });
        });

        // Edit comment buttons
        document.querySelectorAll('.comment-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const commentId = btn.dataset.id;
                const commentItem = document.querySelector(`.comment-item[data-id="${commentId}"]`);

                // Hide comment content and show edit form
                commentItem.querySelector('.comment-content').classList.add('hidden');
                commentItem.querySelector('.comment-edit-form').classList.remove('hidden');

                // Close the menu
                commentItem.querySelector('.comment-menu').classList.add('hidden');
            });
        });

        // Cancel edit buttons
        document.querySelectorAll('.cancel-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const commentItem = btn.closest('.comment-item');

                // Show comment content and hide edit form
                commentItem.querySelector('.comment-content').classList.remove('hidden');
                commentItem.querySelector('.comment-edit-form').classList.add('hidden');
            });
        });

        // Save comment buttons
        document.querySelectorAll('.save-comment-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const commentId = btn.dataset.id;
                const commentItem = document.querySelector(`.comment-item[data-id="${commentId}"]`);
                const content = commentItem.querySelector('.edit-comment-content').value.trim();

                if (!content) {
                    showToast('Comment cannot be empty', 'error');
                    return;
                }

                try {
                    // Update the comment
                    await resourceService.updateComment(resourceId, commentId, { content });

                    // Reload the resource detail view with comments tab active
                    loadResourceDetail(resourceId, 'comments');
                } catch (error) {
                    console.error('Error updating comment:', error);
                    showToast('Failed to update comment', 'error');
                }
            });
        });

        // Delete comment buttons
        document.querySelectorAll('.comment-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();

                const commentId = btn.dataset.id;

                if (confirm('Are you sure you want to delete this comment?')) {
                    try {
                        // Delete the comment
                        await resourceService.deleteComment(resourceId, commentId);

                        // Reload the resource detail view with comments tab active
                        loadResourceDetail(resourceId, 'comments');
                    } catch (error) {
                        console.error('Error deleting comment:', error);
                        showToast('Failed to delete comment', 'error');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error loading resource detail:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading resource</p>
                <p>${error.message || 'Failed to load resource details'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadResources()">
                    Back to Resources
                </button>
            </div>
        `;
    }
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}



// Discussions view
async function loadDiscussions() {
    try {
        // Fetch discussions
        const discussionsResponse = await discussionService.getAllDiscussions();
        const discussions = discussionsResponse.data.discussions;

        // Fetch popular discussions
        let popularDiscussions = [];
        try {
            const popularResponse = await discussionService.getPopularDiscussions();
            popularDiscussions = popularResponse.data.discussions;
        } catch (error) {
            console.warn('Could not fetch popular discussions:', error);
            // If popular discussions endpoint fails, create a fallback
            popularDiscussions = discussions
                .slice() // Create a copy to avoid modifying the original
                .sort((a, b) => (b.replyCount || b.replies?.length || 0) - (a.replyCount || a.replies?.length || 0))
                .slice(0, 5);
        }

        // Fetch user's courses for filtering
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.data.courses;

        // Sort discussions by date (newest first)
        discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        content.innerHTML = `
            <div class="flex flex-wrap justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Discussions</h2>
                <div class="mt-2 sm:mt-0 flex flex-wrap gap-2">
                    <div class="relative">
                        <input type="text" id="searchDiscussions" placeholder="Search discussions..." class="pl-10 pr-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                    </div>
                    <button id="newDscussionBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            <i class="fas fa-plus mr-1"></i>  Start New Discussion
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <div class="flex flex-wrap justify-between items-center mb-4">
                            <div class="flex flex-wrap gap-2 mb-2 sm:mb-0">
                                <button class="discussion-filter-btn px-3 py-1.5 bg-primary text-white rounded-lg text-sm" data-filter="all">All</button>
                                <button class="discussion-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="unread">Unread</button>
                                <button class="discussion-filter-btn px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm" data-filter="my">My Posts</button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <select id="courseFilter" class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800">
                                    <option value="all">All Courses</option>
                                    ${courses.map(course => `<option value="${course._id}">${course.code}</option>`).join('')}
                                </select>
                                <select id="discussionSort" class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800">
                                    <option value="latest">Sort: Latest</option>
                                    <option value="active">Sort: Most Active</option>
                                    <option value="oldest">Sort: Oldest</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="discussionsList" class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${discussions.length === 0 ? `
                                <div class="py-6 text-center text-gray-500 dark:text-gray-400">
                                    <p>No discussions found.</p>
                                    <p class="mt-1 text-sm">Be the first to start a discussion!</p>
                                    <button id="emptyStateDiscussionBtn" class="mt-3 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        <i class="fas fa-plus mr-1"></i> New Discussion
                                    </button>
                                </div>
                            ` : discussions.map(discussion => {
            const course = discussion.course;
            const isMyPost = discussion.author._id === currentUser._id;

            return `
                                    <div class="py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 -mx-5 px-5 transition discussion-item ${isMyPost ? 'my-discussion' : ''}" 
                                        data-course="${course._id}"
                                        data-mypost="${isMyPost}"
                                        onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <div class="flex items-center gap-2">
                                                    <h4 class="font-medium" data-user-content="true">${discussion.title}</h4>
                                        
                                                    ${discussion.isPinned ? `
                                                        <span class="text-yellow-500 dark:text-yellow-400" title="Pinned">
                                                            <i class="fas fa-thumbtack"></i>
                                                        </span>
                                                    ` : ''}
                                                </div>
                                                <div class="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <span class="px-2 py-0.5 text-xs rounded-full" style="background-color: ${course.color || 'var(--tw-colors-blue-500)'}25; color: ${course.color || 'var(--tw-colors-blue-500)'};">
                                                        ${course.code}
                                                    </span>
                                                    <span class="mx-2">•</span>
                                                    <span>Started by ${discussion.author.firstName} ${discussion.author.lastName}</span>
                                                    <span class="mx-2">•</span>
                                                    <span>${formatTimeAgo(discussion.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                <i class="far fa-comment-alt mr-1"></i> ${discussion.replyCount || discussion.replies?.length || 0} replies
                                            </div>
                                        </div>
                                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2" data-user-content="true">
                                            ${discussion.content}
                                        </p>
                                        ${discussion.tags && discussion.tags.length > 0 ? `
                                            <div class="mt-2 flex flex-wrap gap-1">
                                                ${discussion.tags.map(tag => `
                                                    <span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                                        ${tag}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
        }).join('')}
                        </div>
                        
                        ${discussions.length > 10 ? `
                            <div class="mt-4 text-center">
                                <button id="loadMoreBtn" class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-650 transition">
                                    Load More
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Popular Discussions</h3>
                        <div class="space-y-3">
                            ${popularDiscussions.length > 0 ? popularDiscussions.slice(0, 5).map(discussion => `
                                <div class="flex items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 -mx-5 px-5 py-2 transition" onclick="loadView('discussion-detail', {discussionId: '${discussion._id}'})">
                                    <div class="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3">
                                        <span class="text-xs font-semibold">${discussion.replyCount || discussion.replies?.length || 0}</span>
                                    </div>
                                    <div>
                                        <p class="font-medium line-clamp-1" data-user-content="true">${discussion.title}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            ${discussion.course.code} • ${formatTimeAgo(discussion.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            `).join('') : `
                                <p class="text-gray-500 dark:text-gray-400">No popular discussions yet.</p>
                            `}
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">My Activity</h3>
                        <div>
                            ${discussions.filter(d => d.author._id === currentUser._id).length > 0 ? `
                                <div class="space-y-2">
                                    <p class="mb-2 text-gray-700 dark:text-gray-300">
                                        <span class="font-semibold">My Discussions:</span> ${discussions.filter(d => d.author._id === currentUser._id).length}
                                    </p>
                                    <p class="mb-2 text-gray-700 dark:text-gray-300">
                                        <span class="font-semibold">Total Replies:</span> <span data-user-content="true">${discussions.reduce((total, discussion) => {
            const myReplies = (discussion.replies || []).filter(reply => reply.author._id === currentUser._id).length;
            return total + myReplies;
        }, 0)}</span>
                                    </p>
                                    <button id="viewMyDiscussionsBtn" class="mt-2 w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        View My Discussions
                                    </button>
                                </div>
                            ` : `
                                <p class="text-gray-500 dark:text-gray-400 mb-3">You haven't started any discussions yet.</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners

        const emptyStateDiscussionBtn = document.getElementById('emptyStateDiscussionBtn');
        if (emptyStateDiscussionBtn) {
            emptyStateDiscussionBtn.addEventListener('click', () => showNewDiscussionModal());
        }
        const newDiscussionBtn = document.getElementById('newDscussionBtn');
        if (newDiscussionBtn) {
            newDiscussionBtn.addEventListener('click', () => showNewDiscussionModal());

            const startFirstDiscussionBtn = document.getElementById('startFirstDiscussionBtn');
            if (startFirstDiscussionBtn) {
                startFirstDiscussionBtn.addEventListener('click', () => showNewDiscussionModal());
            }

            const viewMyDiscussionsBtn = document.getElementById('viewMyDiscussionsBtn');
            if (viewMyDiscussionsBtn) {
                viewMyDiscussionsBtn.addEventListener('click', () => {
                    // Select the "My Posts" filter button and trigger a click
                    const myPostsBtn = document.querySelector('.discussion-filter-btn[data-filter="my"]');
                    if (myPostsBtn) myPostsBtn.click();
                });
            }

            // Filter buttons
            const filterButtons = document.querySelectorAll('.discussion-filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Update active state
                    filterButtons.forEach(btn => {
                        btn.classList.remove('bg-primary', 'text-white');
                        btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
                    });
                    button.classList.remove('bg-gray-200', 'dark:bg-gray-700');
                    button.classList.add('bg-primary', 'text-white');

                    const filter = button.dataset.filter;
                    const items = document.querySelectorAll('.discussion-item');

                    items.forEach(item => {
                        if (filter === 'all') {
                            item.classList.remove('hidden');
                        } else if (filter === 'unread') {
                            // In a real app, you would check if the discussion is read
                            // For now, we'll just show all
                            item.classList.remove('hidden');
                        } else if (filter === 'my') {
                            const isMyPost = item.dataset.mypost === 'true';
                            item.classList.toggle('hidden', !isMyPost);
                        }
                    });

                    // Apply course filter if selected
                    applyCourseFilter();
                });
            });
        }
        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', applyCourseFilter);
        }

        function applyCourseFilter() {
            const courseId = courseFilter.value;
            const items = document.querySelectorAll('.discussion-item:not(.hidden)');

            items.forEach(item => {
                if (courseId === 'all') {
                    item.classList.remove('hidden-by-course');
                } else {
                    const itemCourseId = item.dataset.course;
                    item.classList.toggle('hidden-by-course', itemCourseId !== courseId);
                }

                // Finally check both filters
                item.style.display = (item.classList.contains('hidden') || item.classList.contains('hidden-by-course')) ? 'none' : '';
            });
        }

        // Sort dropdown
        const discussionSort = document.getElementById('discussionSort');
        if (discussionSort) {
            discussionSort.addEventListener('change', () => {
                const sortValue = discussionSort.value;
                const discussionsList = document.getElementById('discussionsList');
                const items = Array.from(discussionsList.querySelectorAll('.discussion-item'));

                // Sort the items
                items.sort((a, b) => {
                    const aData = discussions.find(d => d._id === a.getAttribute('onclick').match(/discussionId: '([^']+)'/)[1]);
                    const bData = discussions.find(d => d._id === b.getAttribute('onclick').match(/discussionId: '([^']+)'/)[1]);

                    if (sortValue === 'latest') {
                        return new Date(bData.createdAt) - new Date(aData.createdAt);
                    } else if (sortValue === 'oldest') {
                        return new Date(aData.createdAt) - new Date(bData.createdAt);
                    } else if (sortValue === 'active') {
                        const aReplies = aData.replyCount || aData.replies?.length || 0;
                        const bReplies = bData.replyCount || bData.replies?.length || 0;
                        return bReplies - aReplies;
                    }
                    return 0;
                });

                // Re-append the items in the new order
                items.forEach(item => discussionsList.appendChild(item));
            });
        }

        // Search input
        const searchInput = document.getElementById('searchDiscussions');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const items = document.querySelectorAll('.discussion-item');

                items.forEach(item => {
                    const title = item.querySelector('h4').textContent.toLowerCase();
                    const content = item.querySelector('p.line-clamp-2').textContent.toLowerCase();
                    const hasMatch = title.includes(searchTerm) || content.includes(searchTerm);

                    item.classList.toggle('hidden-by-search', !hasMatch);

                    // Check all filter states
                    item.style.display = (
                        item.classList.contains('hidden') ||
                        item.classList.contains('hidden-by-course') ||
                        item.classList.contains('hidden-by-search')
                    ) ? 'none' : '';
                });
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            // In a real app, this would load the next page of discussions
            // For now, we'll just hide the button after clicking
            loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.textContent = 'No more discussions to load';
                loadMoreBtn.disabled = true;
                loadMoreBtn.classList.add('opacity-50', 'cursor-not-allowed');
            });
        }

    } catch (error) {
        console.error('Error loading discussions:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading discussions</p>
                <p>${error.message || 'Failed to load discussions'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadLoginPage()">
                    Retry
                </button>
            </div>
        `;
    }
}

// Show new discussion modal
function showNewDiscussionModal(courseContext = null) {
    // First get user's courses for course selection
    courseService.getMyCourses()
        .then(response => {
            const courses = response.data.courses;
            const selectedCourseId = courseContext && courseContext._id ? courseContext._id : null;
            const selectedCourse = selectedCourseId
                ? courses.find(course => course._id === selectedCourseId)
                : null;

            // Show modal for creating a new discussion
            const modalHtml = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold">Start New Discussion</h3>
                            <button id="closeDiscussionModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="createDiscussionForm" class="space-y-4">
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                <input type="text" id="discussionTitle" required placeholder="Enter a descriptive title" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
                                ${selectedCourseId ? `
                                    <input type="hidden" id="discussionCourse" value="${selectedCourseId}">
                                    <div class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-200">
                                        <p class="font-medium">${selectedCourse ? selectedCourse.name : 'Selected course'}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">${selectedCourse ? selectedCourse.code : ''}</p>
                                    </div>
                                ` : `
                                    <select id="discussionCourse" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                        <option value="">Select a course</option>
                                        ${courses.map(course => `<option data-user-content="true" value="${course._id}">${course.name} (${course.code})</option>`).join('')}
                                    </select>
                                `}
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Content</label>
                                <textarea id="discussionContent" rows="6" required placeholder="Share your thoughts or questions here..." class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200"></textarea>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    You can use Markdown for formatting
                                </p>
                            </div>
                            
                            <div id="discussionError" class="text-red-500 hidden"></div>
                            
                            <div class="flex justify-end">
                                <button type="button" id="cancelDiscussionBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                    Cancel
                                </button>
                                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Create Discussion
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
            document.getElementById('closeDiscussionModal').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });

            document.getElementById('cancelDiscussionBtn').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });

            // Lock the course to the current course only when launched from a course page
            if (selectedCourseId) {
                const courseSelect = document.getElementById('discussionCourse');
                if (courseSelect && courseSelect.tagName === 'SELECT') {
                    const option = Array.from(courseSelect.options).find(opt => opt.value === selectedCourseId);
                    if (option) {
                        option.selected = true;
                    }
                }
            }

            // Setup form submission
            document.getElementById('createDiscussionForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                try {
                    const discussionData = {
                        title: document.getElementById('discussionTitle').value,
                        content: document.getElementById('discussionContent').value,
                        course: document.getElementById('discussionCourse').value
                    };

                    await discussionService.createDiscussion(discussionData);
                    document.body.removeChild(modalContainer);
                    showToast(`Discussion created successfully!`);

                    // Reload discussions view
                    loadView('discussions');
                } catch (error) {
                    const errorDiv = document.getElementById('discussionError');
                    errorDiv.textContent = error.message;
                    errorDiv.classList.remove('hidden');
                }
            });
        })
        .catch(error => {
            console.error('Error fetching courses for discussion:', error);
            showToast('Failed to load courses. Please try again.', 'error');
        });
}


// Assignments view
async function loadAssignments() {
    try {
        // Fetch all assignments
        const assignmentsResponse = await assignmentService.getAllAssignments();
        const assignments = assignmentsResponse.data.assignments;

        // Get all courses for filter
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.data.courses;

        // Group assignments by status
        const upcomingAssignments = []; // Not due yet
        const missedAssignments = [];   // Past due without submission
        const submittedAssignments = []; // Submitted but not graded
        const gradedAssignments = [];   // Submitted and graded

        // For instructors, track assignments needing grading
        const assignmentsToGrade = [];
        const pastDueAssignments = [];  // Past due assignments (instructor view)

        // Process each assignment
        for (const assignment of assignments) {
            // Get the current date for comparison
            const currentDate = new Date();
            const dueDate = new Date(assignment.dueDate);
            const isPastDue = dueDate < currentDate;

            // Check if the assignment has submissions
            let submissions = [];
            try {
                const submissionsResponse = await assignmentService.getSubmissions(assignment._id);
                submissions = submissionsResponse.data.submissions;
            } catch (error) {
                console.warn(`Could not fetch submissions for assignment ${assignment._id}:`, error);
            }

            // Store all submissions with the assignment for reference
            assignment.submissions = submissions;

            // Different processing based on user role
            if (currentUser.role === 'student') {
                // Find the student's own submission
                const mySubmission = submissions.find(s =>
                    (typeof s.student === 'object' && s.student._id === currentUser._id) ||
                    s.student === currentUser._id
                );

                if (mySubmission) {
                    // Store submission with assignment for reference
                    assignment.mySubmission = mySubmission;

                    if (mySubmission.status === 'graded' || mySubmission.grade) {
                        // Assignment is graded
                        assignment.myGrade = mySubmission.grade;
                        gradedAssignments.push(assignment);
                    } else {
                        // Assignment is submitted but not graded
                        submittedAssignments.push(assignment);
                    }
                } else {
                    // No submission found
                    if (isPastDue) {
                        // Assignment is past due without submission
                        assignment.isPastDue = true;
                        missedAssignments.push(assignment);
                    } else {
                        // Assignment is still pending/upcoming
                        upcomingAssignments.push(assignment);
                    }
                }
            } else if (currentUser.role === 'instructor') {
                // For instructors, check if this is their course
                const isInstructorCourse = assignment.course.instructor === currentUser._id ||
                    (typeof assignment.course.instructor === 'object' &&
                        assignment.course.instructor._id === currentUser._id);

                if (!isInstructorCourse) {
                    // Skip assignments for courses where user is not the instructor
                    continue;
                }

                // Check for ungraded submissions
                const ungradedSubmissions = submissions.filter(s =>
                    !s.status || s.status !== 'graded' || !s.grade
                );

                if (ungradedSubmissions.length > 0) {
                    assignment.ungradedCount = ungradedSubmissions.length;
                    assignmentsToGrade.push(assignment);
                }

                // Categorize by due date for instructors
                if (isPastDue) {
                    pastDueAssignments.push(assignment);
                } else {
                    upcomingAssignments.push(assignment);
                }
            }
        }

        // Sort assignments by due date
        upcomingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        missedAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        submittedAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        gradedAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        assignmentsToGrade.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        pastDueAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

        content.innerHTML = `
            <div class="flex flex-wrap justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Assignments</h2>
                <div class="mt-2 sm:mt-0 flex space-x-2">
                    <select id="courseFilter" class="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        <option value="all">All Courses</option>
                        ${courses.map(course => `<option data-user-content="true" value="${course._id}">${course.code} - ${course.name}</option>`).join('')}
                    </select>
                    
                    ${currentUser.role === 'instructor' ? `
                        <button id="createAssignmentBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            <i class="fas fa-plus mr-1"></i> New Assignment
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="flex mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <button id="upcomingTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-primary text-primary dark:text-primaryLight">
                    ${currentUser.role === 'student' ? 'Upcoming' : 'Active'} (${upcomingAssignments.length})
                </button>
                
                ${currentUser.role === 'student' ? `
                    <button id="missedTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Missed (${missedAssignments.length})
                    </button>
                    <button id="submittedTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Submitted (${submittedAssignments.length})
                    </button>
                    <button id="gradedTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Graded (${gradedAssignments.length})
                    </button>
                ` : `
                    <button id="pastDueTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Past Due (${pastDueAssignments.length})
                    </button>
                    ${assignmentsToGrade.length > 0 ? `
                        <button id="gradeTab" class="assignment-tab whitespace-nowrap px-4 py-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            To Grade (${assignmentsToGrade.length})
                        </button>
                    ` : ''}
                `}
            </div>
            
            <!-- Upcoming/Active Assignments Tab -->
            <div id="upcomingTab-content" class="assignment-tab-content">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                    <h3 class="text-lg font-semibold mb-4">
                        ${currentUser.role === 'student' ? 'Upcoming Assignments' : 'Active Assignments'}
                    </h3>
                    ${upcomingAssignments.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                    ${upcomingAssignments.map(assignment => {
            const course = assignment.course;
            const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            let statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            let statusText = 'Upcoming';

            if (daysLeft <= 1) {
                statusClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
                statusText = 'Due Soon';
            }

            const courseId = typeof course === 'object' ? course._id : course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';

            return `
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                <td class="px-4 py-4">
                                                    <p class="font-medium">${assignment.title}</p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                </td>
                                                <td class="px-4 py-4">
                                                    <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                        ${courseCode}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    <p class="${daysLeft <= 1 ? 'text-red-500' : ''}">${formatDate(assignment.dueDate)}</p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                                        ${daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                                                    </p>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
                                                        ${statusText}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    ${currentUser.role === 'student' ? `
                                                        <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                            Start
                                                        </button>
                                                    ` : `
                                                        <div class="flex space-x-2">
                                                            <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                                View
                                                            </button>
                                                            ${assignment.submissions?.length > 0 ? `
                                                                <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                                    Submissions (${assignment.submissions.length})
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    `}
                                                </td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p class="text-gray-500 dark:text-gray-400">No upcoming assignments. Enjoy your free time!</p>
                    `}
                </div>
            </div>
            
            ${currentUser.role === 'student' ? `
                <!-- Missed Assignments Tab -->
                <div id="missedTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Missed Assignments</h3>
                        ${missedAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${missedAssignments.map(assignment => {
            const course = assignment.course;
            const courseId = typeof course === 'object' ? course._id : course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';
            const daysPast = Math.ceil((new Date() - new Date(assignment.dueDate)) / (1000 * 60 * 60 * 24));

            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <p class="text-red-500">${formatDate(assignment.dueDate)}</p>
                                                        <p class="text-xs text-red-500">
                                                            ${daysPast} days overdue
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            Missed
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 ${assignment.allowLateSubmissions ? 'bg-primary hover:bg-primaryDark text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'} text-sm rounded transition" 
                                                                onclick="showAssignmentModal('${assignment._id}')"
                                                                ${!assignment.allowLateSubmissions ? 'disabled' : ''}>
                                                            ${assignment.allowLateSubmissions ? 'Submit Late' : 'View'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No missed assignments. Keep up the good work!</p>
                        `}
                    </div>
                </div>
                
                <!-- Submitted Assignments Tab -->
                <div id="submittedTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Submitted Assignments</h3>
                        ${submittedAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${submittedAssignments.map(assignment => {
            const course = assignment.course;
            const courseId = typeof course === 'object' ? course._id : course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';

            const submission = assignment.mySubmission;
            const submittedDate = formatDate(submission.submittedAt);
            const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);

            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap text-sm">
                                                        <p>${submittedDate}</p>
                                                        <p class="text-xs ${isLate ? 'text-orange-500' : 'text-green-500'}">
                                                            ${isLate ? 'Late submission' : 'On time'}
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            Awaiting Grade
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No submitted assignments awaiting grades.</p>
                        `}
                    </div>
                </div>
                
                <!-- Graded Assignments Tab -->
                <div id="gradedTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">Graded Assignments</h3>
                        ${gradedAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${gradedAssignments.map(assignment => {
            const course = assignment.course;
            const courseId = typeof course === 'object' ? course._id : course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';

            const grade = assignment.myGrade;
            const scorePercentage = (grade.score / assignment.pointsPossible) * 100;

            let gradeClass = 'text-green-500';
            if (scorePercentage < 60) {
                gradeClass = 'text-red-500';
            } else if (scorePercentage < 80) {
                gradeClass = 'text-yellow-500';
            }

            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        ${formatDate(assignment.dueDate)}
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="font-bold ${gradeClass}">
                                                            ${grade.score}/${assignment.pointsPossible}
                                                        </span>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                                            ${scorePercentage.toFixed(1)}%
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No graded assignments yet.</p>
                        `}
                    </div>
                </div>
            ` : `
                <!-- Past Due Assignments Tab (Instructor) -->
                <div id="pastDueTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Past Due Assignments</h3>
                        ${pastDueAssignments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submissions</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${pastDueAssignments.map(assignment => {
            const course = assignment.course;
            const courseId = typeof course === 'object' ? course._id : course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';

            const daysPast = Math.ceil((new Date() - new Date(assignment.dueDate)) / (1000 * 60 * 60 * 24));
            const totalSubmissions = assignment.submissions?.length || 0;
            const totalStudents = typeof course === 'object' && course.students ? course.students.length : 0;

            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <p class="text-gray-700 dark:text-gray-300">${formatDate(assignment.dueDate)}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                                            ${daysPast} days ago
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <p class="text-sm">${totalSubmissions} / ${totalStudents}</p>
                                                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                                            <div class="bg-primary h-2.5 rounded-full" style="width: ${totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0}%"></div>
                                                        </div>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <div class="flex space-x-2">
                                                            <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="showAssignmentModal('${assignment._id}')">
                                                                View
                                                            </button>
                                                            ${totalSubmissions > 0 ? `
                                                                <button class="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                                    Submissions (${totalSubmissions})
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No past due assignments.</p>
                        `}
                    </div>
                </div>
                
                <!-- Assignments To Grade Tab (Instructor) -->
                <div id="gradeTab-content" class="assignment-tab-content hidden">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                        <h3 class="text-lg font-semibold mb-4">Assignments Waiting for Grading</h3>
                        ${assignmentsToGrade.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ungraded</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${assignmentsToGrade.map(assignment => {
            const course = assignment.course;
            const courseId = typeof course === 'object' ? course._id : course;
            const courseCode = typeof course === 'object' ? course.code : 'Course';
            const courseColor = typeof course === 'object' ? (course.color || 'var(--tw-colors-blue-500)') : 'var(--tw-colors-blue-500)';

            const ungradedCount = assignment.ungradedCount;
            const totalSubmissions = assignment.submissions?.length || 0;
            const isPastDue = new Date(assignment.dueDate) < new Date();

            return `
                                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 assignment-row" data-course="${courseId}">
                                                    <td class="px-4 py-4">
                                                        <p class="font-medium">${assignment.title}</p>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">${assignment.pointsPossible} points</p>
                                                    </td>
                                                    <td class="px-4 py-4">
                                                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${courseColor}25; color: ${courseColor};">
                                                            ${courseCode}
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        ${formatDate(assignment.dueDate)}
                                                        <p class="text-xs">
                                                            ${isPastDue ? 'Past due' : 'Active'}
                                                        </p>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            ${ungradedCount} of ${totalSubmissions} ungraded
                                                        </span>
                                                    </td>
                                                    <td class="px-4 py-4 whitespace-nowrap">
                                                        <button class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white text-sm rounded transition" onclick="viewSubmissions('${assignment._id}')">
                                                            Grade Submissions
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No submissions waiting to be graded.</p>
                        `}
                    </div>
                </div>
            `}
        `;

        // Setup event listeners

        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                const courseId = e.target.value;
                const rows = document.querySelectorAll('.assignment-row');

                rows.forEach(row => {
                    if (courseId === 'all' || row.dataset.course === courseId) {
                        row.classList.remove('hidden');
                    } else {
                        row.classList.add('hidden');
                    }
                });
            });
        }

        // Tab navigation
        const tabs = document.querySelectorAll('.assignment-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => {
                    t.classList.remove('border-primary', 'text-primary', 'dark:text-primaryLight');
                    t.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                });
                tab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                tab.classList.add('border-primary', 'text-primary', 'dark:text-primaryLight');

                // Show corresponding content
                const tabId = tab.id;
                const contentElements = document.querySelectorAll('.assignment-tab-content');
                contentElements.forEach(element => {
                    if (element.id === `${tabId}-content`) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });
            });
        });

        // Create assignment button (for instructors)
        const createAssignmentBtn = document.getElementById('createAssignmentBtn');
        if (createAssignmentBtn) {
            createAssignmentBtn.addEventListener('click', showCreateAssignmentModal);
        }

    } catch (error) {
        console.error('Error loading assignments:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading assignments</p>
                <p>${error.message || 'Failed to load assignments'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadLoginPage()">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Function for instructors to view and grade submissions
function viewSubmissions(assignmentId) {
    // Get the assignment and all submissions
    assignmentService.getAssignment(assignmentId)
        .then(async response => {
            const assignment = response.data.assignment;

            try {
                // Fetch submissions
                const submissionsResponse = await assignmentService.getSubmissions(assignmentId);
                const submissions = submissionsResponse.data.submissions;

                // Fetch course students
                const courseResponse = await courseService.getCourse(assignment.course._id);
                const course = courseResponse.data.course;

                // Create modal for viewing submissions
                const modalHtml = `
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-semibold">Submissions: <span data-user-content="true">${assignment.title}</span</h3>
                                <button id="closeSubmissionsModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div class="mb-4">
                                <p data-user-content="true"><span class="font-medium">Course:</span> <span data-user-content="true">${course.name} (${course.code})</span> </p>
                                <p><span class="font-medium">Due Date:</span> ${formatDate(assignment.dueDate)}</p>
                                <p><span class="font-medium">Total Students:</span> ${course.students.length}</p>
                                <p><span class="font-medium">Submissions:</span> ${submissions.length} / ${course.students.length}</p>
                            </div>
                            
                            <div class="mb-4">
                                <div class="flex mb-2">
                                    <button id="allSubmissionsTab" class="submissions-tab px-4 py-2 bg-primary text-white rounded-tl-lg rounded-tr-lg">
                                        All Submissions (${submissions.length})
                                    </button>
                                    <button id="ungradedSubmissionsTab" class="submissions-tab px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-tl-lg rounded-tr-lg ml-2">
                                        Ungraded (${submissions.filter(s => !s.grade && s.status !== 'graded').length})
                                    </button>
                                    <button id="gradedSubmissionsTab" class="submissions-tab px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-tl-lg rounded-tr-lg ml-2">
                                        Graded (${submissions.filter(s => s.grade || s.status === 'graded').length})
                                    </button>
                                </div>
                                
                                <div id="submissionsList" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    ${submissions.length === 0 ? `
                                        <p class="text-center text-gray-500 dark:text-gray-400 py-6">
                                            No submissions for this assignment yet.
                                        </p>
                                    ` : `
                                        <div class="overflow-x-auto">
                                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead>
                                                    <tr>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="submissionsTableBody" class="divide-y divide-gray-200 dark:divide-gray-700">
                                                    ${submissions.map(submission => {
                    const student = submission.student;
                    const studentName = typeof student === 'object' ?
                        `${student.firstName} ${student.lastName}` : 'Student';
                    const studentEmail = typeof student === 'object' ?
                        student.email : '';

                    const submittedDate = formatDate(submission.submittedAt);
                    const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
                    const isGraded = submission.status === 'graded' || submission.grade;

                    let statusBadge = '';
                    if (isGraded) {
                        statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Graded</span>`;
                    } else if (isLate) {
                        statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Late</span>`;
                    } else {
                        statusBadge = `<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Submitted</span>`;
                    }

                    const grade = submission.grade || {};

                    return `
                                                            <tr class="submission-row ${isGraded ? 'graded' : 'ungraded'}" data-submission-id="${submission._id}">
                                                                <td class="px-4 py-4">
                                                                    <div class="flex items-center">
                                                                        <img src="${getProfileImageUrl(student)}" alt="${studentName}" class="w-8 h-8 rounded-full object-cover mr-3" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                                                        <div>
                                                                            <p class="font-medium">${studentName}</p>
                                                                            <p class="text-xs text-gray-500 dark:text-gray-400">${studentEmail}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    <p>${submittedDate}</p>
                                                                    <p class="text-xs ${isLate ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}">
                                                                        ${isLate ? 'Late' : 'On time'}
                                                                    </p>
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    ${statusBadge}
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    ${isGraded ? `
                                                                        <p class="font-medium">${grade.score}/${assignment.pointsPossible}</p>
                                                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                                                            ${((grade.score / assignment.pointsPossible) * 100).toFixed(1)}%
                                                                        </p>
                                                                    ` : `
                                                                        <p class="text-gray-500 dark:text-gray-400">Not graded</p>
                                                                    `}
                                                                </td>
                                                                <td class="px-4 py-4 whitespace-nowrap">
                                                                    <button class="view-submission-btn px-3 py-1.5 ${isGraded ? 'border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark' : 'bg-primary hover:bg-primaryDark text-white'} text-sm rounded transition" data-submission-id="${submission._id}">
                                                                        ${isGraded ? 'View' : 'Grade'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        `;
                }).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    `}
                                </div>
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
                // Setup event listeners
                document.getElementById('closeSubmissionsModal').addEventListener('click', () => {
                    document.body.removeChild(modalContainer);
                });

                // Tab switching
                const submissionsTabs = document.querySelectorAll('.submissions-tab');
                submissionsTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Update active tab
                        submissionsTabs.forEach(t => {
                            t.classList.remove('bg-primary', 'text-white');
                            t.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                        });
                        tab.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                        tab.classList.add('bg-primary', 'text-white');

                        // Filter submissions
                        const rows = document.querySelectorAll('.submission-row');
                        if (tab.id === 'allSubmissionsTab') {
                            rows.forEach(row => row.classList.remove('hidden'));
                        } else if (tab.id === 'ungradedSubmissionsTab') {
                            rows.forEach(row => {
                                row.classList.toggle('hidden', row.classList.contains('graded'));
                            });
                        } else if (tab.id === 'gradedSubmissionsTab') {
                            rows.forEach(row => {
                                row.classList.toggle('hidden', !row.classList.contains('graded'));
                            });
                        }
                    });
                });

                // View/Grade submission buttons
                document.querySelectorAll('.view-submission-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const submissionId = button.dataset.submissionId;
                        const submission = submissions.find(s => s._id === submissionId);

                        // Create submission detail modal
                        showSubmissionDetailModal(submission, assignment);
                    });
                });

            } catch (error) {
                console.error('Error loading submissions:', error);
                showToast('Failed to load submissions', 'error');
            }
        })
        .catch(error => {
            console.error('Error fetching assignment:', error);
            showToast('Failed to load assignment details', 'error');
        });
}

// Show submission detail modal with grading interface
function showSubmissionDetailModal(submission, assignment) {
    const student = submission.student;
    const studentName = typeof student === 'object' ?
        `${student.firstName} ${student.lastName}` : 'Student';

    const isGraded = submission.status === 'graded' || submission.grade;
    const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
    const grade = submission.grade || {};

    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Submission Review</h3>
                    <button id="closeSubmissionDetailModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <div class="flex flex-wrap items-start justify-between mb-4">
                        <div>
                            <p class="font-bold text-lg" data-user-content="true">${assignment.title}</p>
                            <p class="text-gray-600 dark:text-gray-400">${assignment.pointsPossible} points possible</p>
                        </div>
                        <div class="text-right">
                            <p class="flex items-center">
                                <span class="font-medium mr-2">Student:</span>
                                <img src="${getProfileImageUrl(student)}" alt="${studentName}" class="w-6 h-6 rounded-full object-cover mr-2" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                ${studentName}
                            </p>
                            <p><span class="font-medium">Submitted:</span> ${formatDate(submission.submittedAt)} ${isLate ? '<span class="text-red-500">(Late)</span>' : ''}</p>
                        </div>
                    </div>
                    
                    <div class="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
                        <h4 class="font-medium mb-3">Submission</h4>
                        
                        ${submission.textContent ? `
                            <div class="mb-4">
                                <h5 class="text-sm font-medium mb-2">Text Response:</h5>
                                <div class="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                                    <p data-user-content="true" class="whitespace-pre-line">${submission.textContent}</p>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${submission.attachments && submission.attachments.length > 0 ? `
                            <div>
                                <h5 class="text-sm font-medium mb-2">Attachments:</h5>
                                <div class="space-y-2">
                                    ${submission.attachments.map(file => `
                                        <div class="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg flex items-center">
                                            <i class="fas fa-file mr-2 text-gray-500"></i>
                                            <span class="flex-1">${file.fileName}</span>
                                            <a href="${file.fileUrl}" target="_blank" class="text-primary dark:text-primaryLight hover:underline">View</a>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No file attachments</p>
                        `}
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-medium mb-3">Grading</h4>
                        
                        <form id="gradingForm" class="space-y-4">
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Score (out of ${assignment.pointsPossible})</label>
                                <input type="number" id="gradeScore" min="0" max="${assignment.pointsPossible}" value="${isGraded ? grade.score : ''}" ${isGraded ? 'disabled' : 'required'} class="w-full md:w-1/3 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 dark:text-gray-300 mb-2">Feedback</label>
                                <textarea id="gradeFeedback" rows="4" ${isGraded ? 'disabled' : ''} class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${isGraded ? grade.feedback || '' : ''}</textarea>
                            </div>
                            
                            <div id="gradingError" class="text-red-500 hidden"></div>
                            
                            <div class="flex justify-end space-x-2">
                                ${!isGraded ? `
                                    <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        Submit Grade
                                    </button>
                                ` : `
                                    <button id="editGradeBtn" type="button" class="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark rounded-lg transition">
                                        Edit Grade
                                    </button>
                                `}
                            </div>
                        </form>
                    </div>
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
    // Setup event listeners
    document.getElementById('closeSubmissionDetailModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Edit grade button (for already graded submissions)
    const editGradeBtn = document.getElementById('editGradeBtn');
    if (editGradeBtn) {
        editGradeBtn.addEventListener('click', () => {
            // Enable the form fields
            document.getElementById('gradeScore').disabled = false;
            document.getElementById('gradeFeedback').disabled = false;

            // Replace the edit button with submit button
            const buttonContainer = editGradeBtn.parentElement;
            buttonContainer.innerHTML = `
                <button type="submit" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    Update Grade
                </button>
            `;
        });
    }

    // Handle form submission
    const gradingForm = document.getElementById('gradingForm');
    if (gradingForm) {
        gradingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const score = parseInt(document.getElementById('gradeScore').value);
            const feedback = document.getElementById('gradeFeedback').value;
            const errorDiv = document.getElementById('gradingError');

            // Validate score
            if (isNaN(score) || score < 0 || score > assignment.pointsPossible) {
                errorDiv.textContent = `Score must be between 0 and ${assignment.pointsPossible}`;
                errorDiv.classList.remove('hidden');
                return;
            }

            try {
                errorDiv.classList.add('hidden');

                // Submit grade
                await assignmentService.gradeSubmission(submission._id, {
                    score,
                    feedback
                });

                document.body.removeChild(modalContainer);
                showToast('Assignment graded successfully!');

                // Reload the assignments view to show updated grades
                loadView('assignments');
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
}
// Profile view
/**
 * Load user profile with activity data and performance analytics
 * @returns {Promise<void>}
 */
async function loadProfile(isRefresh = false) {
    try {

        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;
        let userData;
        if (!isRefresh) {
            const response = await userService.getCurrentUser();
            userData = response.data.user;
            // Update window.currentUser
            window.currentUser = userData;
        } else {
            // Use existing currentUser data on refresh
            userData = window.currentUser;
        }

        if (!userData) {
            throw new Error('Could not load user data');
        }

        // Fetch additional user activity data
        const activityResponse = await userService.getUserActivity();
        const activityData = activityResponse.data;

        // Fetch user's courses
        const coursesResponse = await courseService.getMyCourses();
        const userCourses = coursesResponse.data.courses;

        // Prepare data for different user roles
        let roleSpecificData = {};

        // For students: fetch grades and assignment stats
        if (userData.role === 'student') {
            try {
                // Get student performance data
                const performanceResponse = await userService.getStudentPerformance();
                roleSpecificData = performanceResponse.data;
            } catch (error) {
                console.warn('Could not fetch student performance data:', error);
                roleSpecificData = {
                    averageGrade: null,
                    completedAssignments: 0,
                    totalAssignments: 0,
                    onTimeSubmissions: 0,
                    lateSubmissions: 0,
                    missedAssignments: 0,
                    courseProgress: []
                };
            }
        }
        // For instructors: fetch teaching stats
        else if (userData.role === 'instructor') {
            try {
                // Get instructor teaching data
                const teachingResponse = await userService.getInstructorStats();
                roleSpecificData = teachingResponse.data;
            } catch (error) {
                console.warn('Could not fetch instructor stats:', error);
                roleSpecificData = {
                    totalStudents: 0,
                    totalCourses: userCourses.length,
                    totalResources: 0,
                    totalAssignments: 0,
                    averageGrade: null,
                    studentEngagement: [],
                    recentActivity: []
                };
            }
        }

        // Format account creation date
        const accountCreated = new Date(userData.createdAt);
        const accountAge = Math.floor((new Date() - accountCreated) / (1000 * 60 * 60 * 24)); // days

        // Calculate basic stats
        const enrolledCourses = userData.role === 'student' ? userCourses.length : 0;
        const teachingCourses = userData.role === 'instructor' ? userCourses.length : 0;

        // Format activity data
        const lastLogin = activityData.lastLogin ? formatDate(activityData.lastLogin) : 'Never';
        const totalLogins = activityData.loginCount || 0;

        // Recent activity list
        const recentActivity = activityData.recentActivity || [];

        // Build the profile view
        content.innerHTML = `
            <div class="mb-6 flex flex-wrap justify-between items-center">
                <h1 class="text-2xl font-bold">My Profile</h1>
                <button id="editProfileBtn" class="mt-2 sm:mt-0 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                    <i class="fas fa-edit mr-1"></i> Edit Profile
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left column: User info and quick stats -->
                <div>
                    <!-- User info card -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div class="flex flex-col items-center text-center mb-4">
                            <div class="relative">
                                <img id="profilePageImage" src="${getProfileImageUrl(userData)}" alt="${userData.firstName}" class="w-24 h-24 rounded-full object-cover mb-3 shadow" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                <button id="changeAvatarBtn" class="absolute bottom-0 right-0 bg-primary hover:bg-primaryDark text-white rounded-full w-8 h-8 flex items-center justify-center">
                                    <i class="fas fa-camera"></i>
                                </button>
                            </div>
                            <h2 class="text-xl font-bold">${userData.firstName} ${userData.lastName}</h2>
                            <p class="mt-1 text-gray-600 dark:text-gray-400">E-mail: </bold>${userData.email}</p>
    
                            <p class="mt-2 mb-2 text-gray-600 dark:text-gray-400">Bio: ${userData.bio || "No Bio entered yet."}</p>
                            <div class="mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                ${formatRoleLabel(userData.role)}
                            </div>
                        </div>
                        
                        <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Member Since</span>
                                    <span>${formatDate(userData.createdAt)} (${accountAge} days)</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Last Login</span>
                                    <span>${lastLogin}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Total Logins</span>
                                    <span>${totalLogins}</span>
                                </div>
                                ${userData.role === 'student' ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Enrolled Courses</span>
                                        <span>${enrolledCourses}</span>
                                    </div>
                                ` : userData.role === 'instructor' ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Teaching Courses</span>
                                        <span>${teachingCourses}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick links card -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h3 class="font-semibold text-lg mb-4">Quick Links</h3>
                        <div class="space-y-2">
                            <a href="#" onclick="event.preventDefault(); loadView('courses');" class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                <i class="fas fa-book mr-3 text-primary dark:text-primaryLight"></i>
                                <span>My Courses</span>
                            </a>
                            <a href="#" onclick="event.preventDefault(); loadView('assignments');" class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                <i class="fas fa-tasks mr-3 text-primary dark:text-primaryLight"></i>
                                <span>Assignments</span>
                            </a>
                            <a href="#" onclick="event.preventDefault(); loadView('discussions');" class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                <i class="fas fa-comments mr-3 text-primary dark:text-primaryLight"></i>
                                <span>Discussions</span>
                            </a>
                            <a href="#" onclick="event.preventDefault(); loadView('resources');" class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                <i class="fas fa-file-alt mr-3 text-primary dark:text-primaryLight"></i>
                                <span>Resources</span>
                            </a>
                            <a href="#" onclick="event.preventDefault(); showAccountSettingsModal();" class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                                <i class="fas fa-cog mr-3 text-primary dark:text-primaryLight"></i>
                                <span>Account Settings</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Skill badges (students only) -->
                    ${userData.role === 'student' ? `
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 class="font-semibold text-lg mb-4">Skill Badges</h3>
                            <div class="flex flex-wrap gap-2">
                                ${getStudentBadges(roleSpecificData).map(badge => `
                                    <div class="flex flex-col items-center bg-gray-50 dark:bg-gray-750 rounded-lg p-3" title="${badge.description}">
                                        <div class="w-12 h-12 flex items-center justify-center mb-2 ${badge.colorClass} rounded-full">
                                            <i class="${badge.icon} text-xl"></i>
                                        </div>
                                        <span class="text-xs font-medium">${badge.name}</span>
                                    </div>
                                `).join('')}
                                ${getStudentBadges(roleSpecificData).length === 0 ? `
                                    <p class="text-gray-500 dark:text-gray-400 text-sm">Complete assignments and courses to earn skill badges!</p>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Center column: Analytics and performance -->
                <div class="lg:col-span-2">
                    <!-- Analytics summary card -->
                    ${userData.role === 'student' ? `
                        <!-- Student analytics -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                            <h3 class="font-semibold text-lg mb-4">Performance Overview</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <!-- Average Grade -->
                                <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Average Grade</p>
                                    <p class="text-2xl font-bold ${getGradeColorClass(roleSpecificData.averageGrade || 0, 100)}">
                                        ${roleSpecificData.averageGrade !== null ? roleSpecificData.averageGrade.toFixed(1) + '%' : 'N/A'}
                                    </p>
                                </div>
                                
                                <!-- Assignment Completion -->
                                <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Assignments Completed</p>
                                    <p class="text-2xl font-bold">
                                        ${roleSpecificData.completedAssignments || 0}/${roleSpecificData.totalAssignments || 0}
                                    </p>
                                </div>
                                
                                <!-- On-time Submission Rate -->
                                <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">On-time Submission</p>
                                    <p class="text-2xl font-bold ${getOnTimeRateColor(roleSpecificData)}">
                                        ${calculateOnTimeRate(roleSpecificData)}%
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Submission breakdown -->
                            <div class="mb-6">
                                <h4 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Submission Stats</h4>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    ${generateSubmissionStatsBar(roleSpecificData)}
                                </div>
                                <div class="flex justify-between text-xs mt-1">
                                    <span class="flex items-center"><span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span> On-time (${roleSpecificData.onTimeSubmissions || 0})</span>
                                    <span class="flex items-center"><span class="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span> Late (${roleSpecificData.lateSubmissions || 0})</span>
                                    <span class="flex items-center"><span class="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Missed (${roleSpecificData.missedAssignments || 0})</span>
                                </div>
                            </div>
                            
                            <!-- Course progress -->
                            <div>
                                <h4 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Course Progress</h4>
                                ${roleSpecificData.courseProgress && roleSpecificData.courseProgress.length > 0 ? `
                                    <div class="space-y-3">
                                        ${roleSpecificData.courseProgress.map(course => `
                                            <div>
                                                <div class="flex justify-between mb-1">
                                                    <span class="text-sm">${course.name}</span>
                                                    <span class="text-sm font-medium">${course.progress}%</span>
                                                </div>
                                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                    <div class="bg-primary dark:bg-primaryLight h-2.5 rounded-full" style="width: ${course.progress}%"></div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="text-gray-500 dark:text-gray-400 text-sm">No course progress data available.</p>
                                `}
                            </div>
                        </div>
                    ` : userData.role === 'instructor' ? `
                        <!-- Instructor analytics -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                            <h3 class="font-semibold text-lg mb-4">Teaching Overview</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <!-- Total Students -->
                                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Students</p>
                                    <p class="text-2xl font-bold">${roleSpecificData.totalStudents || 0}</p>
                                </div>
                                
                                <!-- Total Courses -->
                                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Courses</p>
                                    <p class="text-2xl font-bold">${roleSpecificData.totalCourses || 0}</p>
                                </div>
                                
                                <!-- Total Resources -->
                                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Resources</p>
                                    <p class="text-2xl font-bold">${roleSpecificData.totalResources || 0}</p>
                                </div>
                                
                                <!-- Total Assignments -->
                                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Assignments</p>
                                    <p class="text-2xl font-bold">${roleSpecificData.totalAssignments || 0}</p>
                                </div>
                            </div>
                            
                            <!-- Student performance -->
                            <div class="mb-6">
                                <h4 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Average Student Performance</h4>
                                <div class="flex items-center">
                                    <div class="flex-1">
                                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div class="bg-primary dark:bg-primaryLight h-2.5 rounded-full" style="width: ${roleSpecificData.averageGrade || 0}%"></div>
                                        </div>
                                    </div>
                                    <span class="ml-3 font-medium">${roleSpecificData.averageGrade ? roleSpecificData.averageGrade.toFixed(1) + '%' : 'N/A'}</span>
                                </div>
                            </div>
                            
                            <!-- Student engagement -->
                            <div>
                                <h4 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Student Engagement by Course</h4>
                                ${roleSpecificData.studentEngagement && roleSpecificData.studentEngagement.length > 0 ? `
                                    <div class="space-y-3">
                                        ${roleSpecificData.studentEngagement.map(course => `
                                            <div>
                                                <div class="flex justify-between mb-1">
                                                    <span class="text-sm" data-user-content="true" >${course.name}</span>
                                                    <span class="text-sm font-medium">${course.engagement}%</span>
                                                </div>
                                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                    <div class="bg-primary dark:bg-primaryLight h-2.5 rounded-full" style="width: ${course.engagement}%"></div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="text-gray-500 dark:text-gray-400 text-sm">No engagement data available.</p>
                                `}
                            </div>
                        </div>
                    ` : `
                        <!-- Admin statistics -->
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                            <h3 class="font-semibold text-lg mb-4">Platform Overview</h3>
                            <p class="text-gray-500 dark:text-gray-400">Admin analytics will be displayed here.</p>
                        </div>
                    `}
                    
                    <!-- Recent activity card -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold text-lg">Recent Activity</h3>
                            <a href="#" id="viewAllActivityBtn" class="text-primary dark:text-primaryLight hover:underline text-sm">View All</a>
                        </div>
                        
                        ${recentActivity.length > 0 ? `
                            <div class="space-y-4">
                                ${recentActivity.map(activity => {
            const icon = getActivityIcon(activity.type);
            return `
                                        <div class="flex">
                                            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mr-3">
                                                <i class="${icon} text-primary dark:text-primaryLight"></i>
                                            </div>
                                            <div>
                                                <p class="text-gray-700 dark:text-gray-300">${activity.description}</p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        ` : `
                            <p class="text-gray-500 dark:text-gray-400">No recent activity to display.</p>
                        `}
                    </div>
                    
                    <!-- Courses card -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold text-lg">${userData.role === 'student' ? 'My Courses' : userData.role === 'instructor' ? 'Courses I Teach' : 'All Courses'}</h3>
                            <a href="#" onclick="event.preventDefault(); loadView('courses');" class="text-primary dark:text-primaryLight hover:underline text-sm">View All</a>
                        </div>
                        
                        ${userCourses.length > 0 ? `
                            <div class="space-y-3">
                                ${userCourses.slice(0, 5).map(course => `
                                    <div class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer" onclick="loadView('course-detail', {courseId: '${course._id}'})">
                                        <div class="w-12 h-12 rounded flex-shrink-0" style="background-color: ${course.color || '#5D5CDE'}"></div>
                                        <div class="ml-3 flex-1 min-w-0">
                                            <p class="font-medium truncate" data-user-content="true">${course.name}</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${course.code}</p>
                                        </div>
                                        <i class="fas fa-chevron-right text-gray-800"></i>
                                    </div>
                                `).join('')}
                                
                                ${userCourses.length > 5 ? `
                                    <div class="text-center mt-2">
                                        <span class="text-gray-500 dark:text-gray-400 text-sm">Showing 5 of ${userCourses.length} courses</span>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="text-center py-6">
                                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-graduation-cap text-gray-500 text-2xl"></i>
                                </div>
                                <p class="text-gray-700 dark:text-gray-300 mb-2">No courses yet</p>
                                <p class="text-gray-500 dark:text-gray-400 mb-4">
                                    ${userData.role === 'student' ? 'Enroll in courses to get started with your learning journey.' :
                userData.role === 'instructor' ? 'Create your first course to begin teaching.' :
                    'No courses have been created yet.'}
                                </p>
                                <button class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition" onclick="loadView('courses')">
                                    ${userData.role === 'student' ? 'Browse Courses' :
                userData.role === 'instructor' ? 'Create Course' :
                    'Manage Courses'}
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners
        const profileImage = document.getElementById('profilePageImage');
        if (profileImage) {
            profileImage.src = getProfileImageUrl(userData) + '?t=' + Date.now();
        }
        // Edit profile button
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            showEditProfileModal(userData);
        });

        // Change avatar button
        document.getElementById('changeAvatarBtn').addEventListener('click', () => {
            showChangeAvatarModal();
        });

        // View all activity button
        const viewAllActivityBtn = document.getElementById('viewAllActivityBtn');
        if (viewAllActivityBtn) {
            viewAllActivityBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showActivityHistoryModal();
            });
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading profile</p>
                <p>${error.message || 'Failed to load profile data'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadLoginPage()">Retry</button>
            </div>
        `;
    }
}

/**
 * Format user role for display
 * @param {string} role - User role
 * @returns {string} Formatted role label
 */
function formatRoleLabel(role) {
    switch (role) {
        case 'admin':
            return 'Administrator';
        case 'instructor':
            return 'Instructor';
        case 'student':
            return 'Student';
        default:
            return role.charAt(0).toUpperCase() + role.slice(1);
    }
}

/**
 * Get appropriate icon for activity type
 * @param {string} activityType - Type of activity
 * @returns {string} FontAwesome icon class
 */
function getActivityIcon(activityType) {
    switch (activityType) {
        case 'login':
            return 'fas fa-sign-in-alt';
        case 'enrollment':
            return 'fas fa-user-plus';
        case 'submission':
            return 'fas fa-paper-plane';
        case 'comment':
            return 'fas fa-comment';
        case 'resource':
            return 'fas fa-file-alt';
        case 'grade':
            return 'fas fa-check-circle';
        case 'discussion':
            return 'fas fa-comments';
        case 'course_creation':
            return 'fas fa-plus-circle';
        default:
            return 'fas fa-clock';
    }
}

/**
 * Calculate on-time submission rate
 * @param {Object} data - Performance data
 * @returns {number} On-time submission rate percentage
 */
function calculateOnTimeRate(data) {
    const onTime = data.onTimeSubmissions || 0;
    const total = (data.onTimeSubmissions || 0) + (data.lateSubmissions || 0) + (data.missedAssignments || 0);

    if (total === 0) return 0;

    return Math.round((onTime / total) * 100);
}

/**
 * Get color class for on-time submission rate
 * @param {Object} data - Performance data
 * @returns {string} CSS color class
 */
function getOnTimeRateColor(data) {
    const rate = calculateOnTimeRate(data);

    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-blue-500';
    if (rate >= 60) return 'text-yellow-500';
    if (rate >= 40) return 'text-orange-500';
    return 'text-red-500';
}

/**
 * Generate HTML for submission stats progress bar
 * @param {Object} data - Performance data
 * @returns {string} HTML for progress bar
 */
function generateSubmissionStatsBar(data) {
    const onTime = data.onTimeSubmissions || 0;
    const late = data.lateSubmissions || 0;
    const missed = data.missedAssignments || 0;
    const total = onTime + late + missed;

    if (total === 0) {
        return '<div class="bg-gray-400 dark:bg-gray-600 h-4 rounded-full w-full"></div>';
    }

    const onTimePercent = (onTime / total) * 100;
    const latePercent = (late / total) * 100;
    const missedPercent = (missed / total) * 100;

    return `
        <div class="flex h-4 rounded-full overflow-hidden">
            <div class="bg-green-500 h-4" style="width: ${onTimePercent}%"></div>
            <div class="bg-yellow-500 h-4" style="width: ${latePercent}%"></div>
            <div class="bg-red-500 h-4" style="width: ${missedPercent}%"></div>
        </div>
    `;
}

/**
 * Get badges earned by the student
 * @param {Object} data - Student performance data
 * @returns {Array} Array of badge objects
 */
function getStudentBadges(data) {
    const badges = [];

    // Total assignments completed badge
    if ((data.completedAssignments || 0) >= 10) {
        badges.push({
            name: 'Assignment Master',
            description: 'Completed 10+ assignments',
            icon: 'fas fa-tasks',
            colorClass: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
        });
    } else if ((data.completedAssignments || 0) >= 5) {
        badges.push({
            name: 'Assignment Pro',
            description: 'Completed 5+ assignments',
            icon: 'fas fa-tasks',
            colorClass: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
        });
    }

    // On-time submissions badge
    const onTimeRate = calculateOnTimeRate(data);
    if (onTimeRate >= 90) {
        badges.push({
            name: 'Punctual Scholar',
            description: '90%+ on-time submission rate',
            icon: 'fas fa-clock',
            colorClass: 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-300'
        });
    }

    // High grades badge
    if ((data.averageGrade || 0) >= 90) {
        badges.push({
            name: 'Academic Excellence',
            description: '90%+ average grade',
            icon: 'fas fa-award',
            colorClass: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300'
        });
    } else if ((data.averageGrade || 0) >= 80) {
        badges.push({
            name: 'Honor Roll',
            description: '80%+ average grade',
            icon: 'fas fa-award',
            colorClass: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300'
        });
    }

    // Course completion badge
    const completedCourses = (data.courseProgress || []).filter(course => course.progress === 100).length;
    if (completedCourses >= 3) {
        badges.push({
            name: 'Course Champion',
            description: 'Completed 3+ courses',
            icon: 'fas fa-graduation-cap',
            colorClass: 'bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-300'
        });
    } else if (completedCourses >= 1) {
        badges.push({
            name: 'Course Graduate',
            description: 'Completed a course',
            icon: 'fas fa-graduation-cap',
            colorClass: 'bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-300'
        });
    }

    return badges;
}

/**
 * Show modal with user activity history
 */
function showActivityHistoryModal() {
    // Fetch activity history
    userService.getActivityHistory()
        .then(response => {
            const activityHistory = response.data.activities || [];

            // Create modal HTML
            const modalHtml = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold">Activity History</h3>
                            <button id="closeActivityModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        ${activityHistory.length > 0 ? `
                            <div class="space-y-4">
                                ${activityHistory.map(activity => {
                const icon = getActivityIcon(activity.type);
                const date = new Date(activity.timestamp);
                const dateString = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const timeString = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return `
                                        <div class="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                                            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mr-3">
                                                <i class="${icon} text-primary dark:text-primaryLight"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-gray-700 dark:text-gray-300">${activity.description}</p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400">${dateString} at ${timeString}</p>
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8">
                                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-history text-gray-500 text-2xl"></i>
                                </div>
                                <p class="text-gray-500 dark:text-gray-400">No activity history to display.</p>
                            </div>
                        `}
                        
                        <div class="flex justify-end mt-4">
                            <button id="closeActivityBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
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
            document.getElementById('closeActivityModal').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });

            document.getElementById('closeActivityBtn').addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
        })
        .catch(error => {
            console.error('Error fetching activity history:', error);
            showToast('Failed to load activity history', 'error');
        });
}

/**
 * Show modal for editing user profile
 * @param {Object} userData - Current user data
 */
function showEditProfileModal(userData) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Edit Profile</h3>
                    <button id="closeEditProfileModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="editProfileForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                            <input type="text" id="firstName" value="${userData.firstName}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                            <input type="text" id="lastName" value="${userData.lastName}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input type="email" id="email" value="${userData.email}" required class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
            
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea id="bio" rows="3" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${userData.bio || ''}</textarea>
                    </div>
                    
                    <div id="editProfileError" class="text-red-500 hidden"></div>
                    
                    <div class="flex justify-end pt-2">
                        <button type="button" id="cancelEditProfileBtn" class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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
    document.getElementById('closeEditProfileModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('cancelEditProfileBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Form submission
    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;
        const errorDiv = document.getElementById('editProfileError');

        errorDiv.classList.add('hidden');

        try {
            // Update user profile
            await userService.updateProfile({
                firstName,
                lastName,
                email,
                bio
            });

            // Close modal and show success message
            document.body.removeChild(modalContainer);
            showToast('Profile updated successfully!');

            // Reload profile view to show updated information
            loadProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            errorDiv.textContent = error.message || 'Failed to update profile. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

/**
 * Show modal for changing user avatar
 */
function showChangeAvatarModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Change Profile Picture</h3>
                    <button id="closeAvatarModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="avatarForm" class="space-y-4">
                    <div class="text-center">
                        <div class="mx-auto w-32 h-32 mb-3 relative">
                            <img id="avatarPreview" src="${getProfileImageUrl(window.currentUser)}" alt="Profile" 
                                class="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition cursor-pointer">
                                <span class="text-white text-sm">Change Picture</span>
                            </div>
                        </div>
                        <input type="file" id="avatarFile" accept="image/*" class="hidden">
                        <button type="button" id="selectAvatarBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Choose File
                        </button>
                    </div>
                    
                    <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Select a square image (JPG, PNG) for best results.<br>
                        Maximum file size: 5MB
                    </p>
                    
                    <div id="avatarError" class="text-red-500 text-sm text-center hidden"></div>
                    
                    <div class="flex justify-end space-x-2">
                        <button type="button" id="cancelAvatarBtn" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" id="saveAvatarBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition" disabled>
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
    // Get elements
    const avatarFile = document.getElementById('avatarFile');
    const preview = document.getElementById('avatarPreview');
    const selectBtn = document.getElementById('selectAvatarBtn');
    const saveBtn = document.getElementById('saveAvatarBtn');
    const errorDiv = document.getElementById('avatarError');
    const previewContainer = preview.parentElement;

    // Close modal handlers
    const closeModal = () => document.body.removeChild(modalContainer);
    document.getElementById('closeAvatarModal').onclick = closeModal;
    document.getElementById('cancelAvatarBtn').onclick = closeModal;

    // Trigger file input when clicking preview or select button
    previewContainer.onclick = () => avatarFile.click();
    selectBtn.onclick = () => avatarFile.click();

    // Handle file selection
    avatarFile.onchange = () => {
        const file = avatarFile.files[0];
        errorDiv.classList.add('hidden');
        saveBtn.disabled = true;

        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            errorDiv.textContent = 'File size must be less than 5MB';
            errorDiv.classList.remove('hidden');
            avatarFile.value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            errorDiv.textContent = 'Please select an image file';
            errorDiv.classList.remove('hidden');
            avatarFile.value = '';
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            saveBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    };

    // Handle form submission
    document.getElementById('avatarForm').onsubmit = async (e) => {
        e.preventDefault();

        const file = avatarFile.files[0];
        if (!file) {
            errorDiv.textContent = 'Please select an image file';
            errorDiv.classList.remove('hidden');
            return;
        }

        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Uploading...';
        errorDiv.classList.add('hidden');

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            // Upload avatar
            const response = await userService.updateAvatar(formData);

            // Update current user data
            if (response.data && response.data.user) {
                window.currentUser = response.data.user;

                // Update all profile images immediately
                const newAvatarUrl = getProfileImageUrl(window.currentUser);
                document.querySelectorAll('[data-user-avatar]').forEach(img => {
                    img.src = newAvatarUrl + '?t=' + Date.now();
                });
            }

            // Close modal
            closeModal();
            showToast('Profile picture updated successfully!');

            // Wait a brief moment before reloading profile
            await new Promise(resolve => setTimeout(resolve, 100));

            // Reload profile if we're on the profile page
            if (currentView === 'profile') {
                await loadProfile(true); // Pass true to indicate this is a refresh
            }

        } catch (error) {
            console.error('Error updating avatar:', error);
            errorDiv.textContent = error.message || 'Failed to update profile picture';
            errorDiv.classList.remove('hidden');
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    };
}
/**
 * Show account settings modal
 */
function showAccountSettingsModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Account Settings</h3>
                    <button id="closeSettingsModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Change Password</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                        </div>
                        <button id="changePasswordBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Change
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Email Notifications</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Manage your email preferences</p>
                        </div>
                        <button id="emailSettingsBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Settings
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h4 class="font-medium">Language & Region</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Change your display language</p>
                        </div>
                        <button id="languageSettingsBtn" class="px-3 py-1.5 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white dark:border-primaryLight dark:text-primaryLight dark:hover:bg-primaryDark transition">
                            Settings
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="font-medium text-red-600 dark:text-red-400">Delete Account</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account</p>
                        </div>
                        <button id="deleteAccountBtn" class="px-3 py-1.5 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-700 transition">
                            Delete
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <button id="closeSettingsBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
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
    // Set up close button event listeners
    document.getElementById('closeSettingsModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Change password button
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showChangePasswordModal();
    });

    // Email settings button
    document.getElementById('emailSettingsBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showEmailSettingsModal();
    });

    // Language settings button
    document.getElementById('languageSettingsBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showLanguageSettingsModal();
    });

    // Delete account button
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        showDeleteAccountModal();
    });
}

/**
 * Load user settings page with theme, language, and notification preferences
 * @returns {Promise<void>}
 */
async function loadSettings() {
    try {
        // Show loading state
        content.innerHTML = `
            <div class="flex justify-center items-center min-h-[300px]">
                <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        `;

        // Fetch user data and settings
        const userResponse = await userService.getCurrentUser();
        const userData = userResponse.data.user;

        // Get current theme preference
        const isDarkMode = document.documentElement.classList.contains('dark');

        // Get current language preference
        const currentLanguage = userData.language || 'en';
        const currentRegion = userData.region || 'US';

        // Get notification settings
        const notificationSettings = userData.notificationSettings || {
            emailNotifications: true,
            emailAssignmentReminders: true,
            emailCourseAnnouncements: true,
            emailDiscussionReplies: true
        };

        // Define available languages
        const languages = [
            { code: 'en', region: 'US', name: 'English (United States)' },
            { code: 'en', region: 'GB', name: 'English (United Kingdom)' },
            { code: 'ha', region: 'NG', name: 'Hausa (Nigeria)' }
        ];

        // Build the settings page
        content.innerHTML = `
            <div class="mb-6">
                <h1 class="text-2xl font-bold">Settings</h1>
                <p class="text-gray-600 dark:text-gray-400">Customize your experience</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left sidebar: Settings categories -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
                        <h2 class="font-semibold text-lg mb-4">Settings</h2>
                        
                        <div class="space-y-1">
                            <button id="generalSettingsBtn" class="settings-category-btn w-full text-left py-2 px-3 rounded-lg transition bg-primary bg-opacity-10 text-primary dark:hover:bg-gray-700 dark:bg-opacity-20 dark:text-primaryLight">
                                <i class="fas fa-cog mr-2"></i> General
                            </button>
                            <button id="appearanceSettingsBtn" class="settings-category-btn w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <i class="fas fa-palette mr-2"></i> Appearance
                            </button>
                            <button id="languageSettingsBtn" class="settings-category-btn w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <i class="fas fa-globe mr-2"></i> Language
                            </button>
                            <button id="notificationSettingsBtn" class="settings-category-btn w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <i class="fas fa-bell mr-2"></i> Notifications
                            </button>
                            <button id="securitySettingsBtn" class="settings-category-btn w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <i class="fas fa-shield-alt mr-2"></i> Security
                            </button>
                            <button id="accessibilitySettingsBtn" class="settings-category-btn w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <i class="fas fa-universal-access mr-2"></i> Accessibility
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Right content: Settings panels -->
                <div class="lg:col-span-2">
                    <!-- General Settings Panel -->
                    <div id="generalSettingsPanel" class="settings-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 class="text-xl font-semibold mb-4">General Settings</h2>
                        
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-medium text-lg mb-2">Account Information</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Basic information about your account.</p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                        <input type="text" id="firstName" value="${userData.firstName}" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                        <input type="text" id="lastName" value="${userData.lastName}" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                    <input type="email" id="email" value="${userData.email}" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                    <textarea id="bio" rows="3" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">${userData.bio || ''}</textarea>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Brief description about yourself that will be visible on your profile.</p>
                                </div>
                                
                                <div class="flex justify-end">
                                    <button id="saveGeneralBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Profile Picture</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Upload a profile picture to personalize your account.</p>
                                
                                <div class="flex items-center mb-4">
                                    <img src="${getProfileImageUrl(userData)}" alt="${userData.firstName}" class="w-20 h-20 rounded-full object-cover mr-4" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80';">
                                    <div>
                                        <button id="changeAvatarBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition mb-2">
                                            Change Picture
                                        </button>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">JPG, PNG or GIF. Max size 5MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Appearance Settings Panel -->
                    <div id="appearanceSettingsPanel" class="settings-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 hidden">
                        <h2 class="text-xl font-semibold mb-4">Appearance Settings</h2>
                        
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-medium text-lg mb-2">Theme</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Choose between light and dark mode.</p>
                                
                                <div class="flex space-x-4 mb-4">
                                    <div class="flex-1">
                                        <label class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer ${!isDarkMode ? 'ring-2 ring-primary' : ''}">
                                            <input type="radio" name="theme" value="light" class="sr-only" ${!isDarkMode ? 'checked' : ''}>
                                            <div class="mr-3 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center">
                                                <div class="bg-primary rounded-full w-3 h-3 ${!isDarkMode ? 'block' : 'hidden'}"></div>
                                            </div>
                                            <div>
                                                <span class="block font-medium">Light Mode</span>
                                                <span class="block text-sm text-gray-500 dark:text-gray-400">Light background with dark text</span>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div class="flex-1">
                                        <label class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer ${isDarkMode ? 'ring-2 ring-primary' : ''}">
                                            <input type="radio" name="theme" value="dark" class="sr-only" ${isDarkMode ? 'checked' : ''}>
                                            <div class="mr-3 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center">
                                                <div class="bg-primary rounded-full w-3 h-3 ${isDarkMode ? 'block' : 'hidden'}"></div>
                                            </div>
                                            <div>
                                                <span class="block font-medium">Dark Mode</span>
                                                <span class="block text-sm text-gray-500 dark:text-gray-400">Dark background with light text</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="flex items-center mb-4">
                                    <input type="checkbox" id="followSystemTheme" class="form-checkbox rounded text-primary focus:ring-primary h-4 w-4" checked>
                                    <label for="followSystemTheme" class="ml-2 text-gray-700 dark:text-gray-300">Use system theme preference when available</label>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Layout Density</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Adjust the amount of content shown on screen.</p>
                                
                                <div class="flex flex-col space-y-3 mb-4">
                                    <label class="flex items-center">
                                        <input type="radio" name="density" value="comfortable" class="text-primary focus:ring-primary h-4 w-4" checked>
                                        <span class="ml-2 text-gray-700 dark:text-gray-300">Comfortable (Default)</span>
                                    </label>
                                    
                                    <label class="flex items-center">
                                        <input type="radio" name="density" value="compact" class="text-primary focus:ring-primary h-4 w-4">
                                        <span class="ml-2 text-gray-700 dark:text-gray-300">Compact</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button id="saveAppearanceBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Language Settings Panel -->
                    <div id="languageSettingsPanel" class="settings-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 hidden">
                        <h2 class="text-xl font-semibold mb-4">Language Settings</h2>
                        
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-medium text-lg mb-2">Display Language</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Select your preferred language for the interface.</p>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Language</label>
                                    <select id="languageSelect" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                        ${languages.map(lang => `
                                            <option value="${lang.code}|${lang.region}" ${currentLanguage === lang.code && currentRegion === lang.region ? 'selected' : ''}>
                                                ${lang.name}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <div class="mt-6 ${currentLanguage === 'ha' ? '' : 'hidden'}" id="hausaInfoBox">
                                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
                                        <div class="flex">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                            </div>
                                            <div class="ml-3">
                                                <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-300">Hausa Language Support</h3>
                                                <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                                                    <p>
                                                        Hausa language is currently in beta. Some parts of the interface may still appear in English.
                                                        <br><br
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Date & Time Format</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Choose how dates and times are displayed.</p>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                                    <select id="dateFormatSelect" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                        <option value="MM/DD/YYYY" ${currentRegion === 'US' ? 'selected' : ''}>MM/DD/YYYY (e.g., 12/31/2023)</option>
                                        <option value="DD/MM/YYYY" ${currentRegion !== 'US' ? 'selected' : ''}>DD/MM/YYYY (e.g., 31/12/2023)</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2023-12-31)</option>
                                    </select>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Time Format</label>
                                    <select id="timeFormatSelect" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                        <option value="12h" ${currentRegion === 'US' ? 'selected' : ''}>12-hour (e.g., 3:30 PM)</option>
                                        <option value="24h" ${currentRegion !== 'US' ? 'selected' : ''}>24-hour (e.g., 15:30)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button id="saveLanguageBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Notification Settings Panel -->
                    <div id="notificationSettingsPanel" class="settings-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 hidden">
                        <h2 class="text-xl font-semibold mb-4">Notification Settings</h2>
                        
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-medium text-lg mb-2">Email Notifications</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Control which emails you receive.</p>
                                
                                <div class="space-y-3 mb-4">
                                    <label class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <span class="block font-medium text-gray-700 dark:text-gray-300">All Email Notifications</span>
                                            <span class="block text-sm text-gray-500 dark:text-gray-400">Main toggle for all email notifications</span>
                                        </div>
                                        <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                            <input type="checkbox" id="emailNotifications" class="notification-toggle sr-only" ${notificationSettings.emailNotifications ? 'checked' : ''}>
                                            <span class="toggle-bg block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></span>
                                        </div>
                                    </label>
                                    
                                    <label class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <span class="block font-medium text-gray-700 dark:text-gray-300">Assignment Reminders</span>
                                            <span class="block text-sm text-gray-500 dark:text-gray-400">Notifications about upcoming assignments</span>
                                        </div>
                                        <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                            <input type="checkbox" id="emailAssignmentReminders" class="notification-toggle sr-only" ${notificationSettings.emailAssignmentReminders ? 'checked' : ''}>
                                            <span class="toggle-bg block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></span>
                                        </div>
                                    </label>
                                    
                                    <label class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <span class="block font-medium text-gray-700 dark:text-gray-300">Course Announcements</span>
                                            <span class="block text-sm text-gray-500 dark:text-gray-400">Updates and announcements from your courses</span>
                                        </div>
                                        <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                            <input type="checkbox" id="emailCourseAnnouncements" class="notification-toggle sr-only" ${notificationSettings.emailCourseAnnouncements ? 'checked' : ''}>
                                            <span class="toggle-bg block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></span>
                                        </div>
                                    </label>
                                    
                                    <label class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <span class="block font-medium text-gray-700 dark:text-gray-300">Discussion Replies</span>
                                            <span class="block text-sm text-gray-500 dark:text-gray-400">Responses to your discussion posts</span>
                                        </div>
                                        <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                            <input type="checkbox" id="emailDiscussionReplies" class="notification-toggle sr-only" ${notificationSettings.emailDiscussionReplies ? 'checked' : ''}>
                                            <span class="toggle-bg block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Browser Notifications</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Allow browser notifications for important updates.</p>
                                
                                <div class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                                    <div>
                                        <span class="block font-medium text-gray-700 dark:text-gray-300">Browser Notifications</span>
                                        <span class="block text-sm text-gray-500 dark:text-gray-400">Allow notifications on this device</span>
                                    </div>
                                    <button id="browserNotificationsBtn" class="px-3 py-1.5 bg-primary hover:bg-primaryDark text-white rounded-lg transition text-sm">
                                        Enable
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button id="saveNotificationsBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Security Settings Panel -->
                    <div id="securitySettingsPanel" class="settings-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 hidden">
                        <h2 class="text-xl font-semibold mb-4">Security Settings</h2>
                        
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-medium text-lg mb-2">Password</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Change your account password.</p>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                    <input type="password" id="currentPassword" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <input type="password" id="newPassword" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                    <input type="password" id="confirmPassword" class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                                </div>
                                
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    Password should be at least 8 characters and include a mix of uppercase, lowercase, numbers, and special characters.
                                </p>
                                
                                <div class="flex justify-end">
                                    <button id="changePasswordBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Account Security</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Manage your account security settings.</p>
                                
                                <div class="space-y-3 mb-4">
                                    <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="font-medium text-gray-700 dark:text-gray-300">Session Management</span>
                                            <button id="viewSessionsBtn" class="text-primary dark:text-primaryLight hover:underline text-sm">
                                                View Active Sessions
                                            </button>
                                        </div>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Manage your active sessions and sign out from other devices.</p>
                                    </div>
                                    
                                    <div class="p-3 border border-red-200 dark:border-red-900/50 rounded-lg">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="font-medium text-red-600 dark:text-red-400">Delete Account</span>
                                            <button id="deleteAccountBtn" class="px-3 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-500/30 transition">
                                                Delete
                                            </button>
                                        </div>
                                        <p class="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all associated data.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Accessibility Settings Panel -->
                    <div id="accessibilitySettingsPanel" class="settings-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 hidden">
                        <h2 class="text-xl font-semibold mb-4">Accessibility Settings</h2>
                        
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-medium text-lg mb-2">Text Size</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Adjust the size of text throughout the application.</p>
                                
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-sm">A</span>
                                    <input type="range" id="textSizeRange" min="80" max="150" value="100" class="w-full mx-4">
                                    <span class="text-lg">A</span>
                                </div>
                                
                                <p class="text-base" id="textSizePreview">This is a preview of the text size.</p>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Motion & Animations</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Reduce motion and animations.</p>
                                
                                <div class="flex items-center mb-4">
                                    <input type="checkbox" id="reduceMotion" class="form-checkbox rounded text-primary focus:ring-primary h-4 w-4">
                                    <label for="reduceMotion" class="ml-2 text-gray-700 dark:text-gray-300">Reduce animations and motion effects</label>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 class="font-medium text-lg mb-2">Content Display</h3>
                                <p class="text-gray-600 dark:text-gray-400 mb-3">Adjust how content is displayed.</p>
                                
                                <div class="flex items-center mb-4">
                                    <input type="checkbox" id="highContrast" class="form-checkbox rounded text-primary focus:ring-primary h-4 w-4">
                                    <label for="highContrast" class="ml-2 text-gray-700 dark:text-gray-300">High contrast mode</label>
                                </div>
                                
                                <div class="flex items-center mb-4">
                                    <input type="checkbox" id="dyslexicFont" class="form-checkbox rounded text-primary focus:ring-primary h-4 w-4">
                                    <label for="dyslexicFont" class="ml-2 text-gray-700 dark:text-gray-300">Use dyslexia-friendly font</label>
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button id="saveAccessibilityBtn" class="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

        `;

        // Set up event listeners

        // Category navigation
        const categoryBtns = document.querySelectorAll('.settings-category-btn');
        const settingsPanels = document.querySelectorAll('.settings-panel');

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Determine which panel to show
                const targetPanelId = btn.id.replace('Btn', 'Panel');

                // Update active button
                categoryBtns.forEach(b => {
                    b.classList.remove('bg-primary', 'bg-opacity-10', 'text-primary', 'dark:bg-opacity-20', 'dark:text-primaryLight');
                    b.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-750');
                });

                btn.classList.add('bg-primary', 'bg-opacity-10', 'text-primary', 'dark:bg-opacity-20', 'dark:text-primaryLight');
                btn.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-750');

                // Update visible panel
                settingsPanels.forEach(panel => {
                    panel.classList.add('hidden');
                });

                document.getElementById(targetPanelId).classList.remove('hidden');
            });
        });

        // General settings save
        document.getElementById('saveGeneralBtn').addEventListener('click', async () => {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const bio = document.getElementById('bio').value;

            try {
                await userService.updateProfile({
                    firstName,
                    lastName,
                    email,
                    bio
                });

                showToast('General settings updated successfully!');
            } catch (error) {
                console.error('Error updating profile:', error);
                showToast('Failed to update profile settings', 'error');
            }
        });

        // Avatar change
        document.getElementById('changeAvatarBtn').addEventListener('click', () => {
            showChangeAvatarModal();
        });

        // Theme settings
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const theme = radio.value;
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            });
        });

        // Save appearance settings
        document.getElementById('saveAppearanceBtn').addEventListener('click', () => {
            const followSystem = document.getElementById('followSystemTheme').checked;
            const theme = document.querySelector('input[name="theme"]:checked').value;
            const density = document.querySelector('input[name="density"]:checked').value;

            // Save theme preference
            localStorage.setItem('theme', theme);
            localStorage.setItem('followSystemTheme', followSystem);
            localStorage.setItem('density', density);

            // Apply theme
            if (followSystem) {
                localStorage.removeItem('theme');
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } else {
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }

            // Apply density
            if (density === 'compact') {
                document.documentElement.classList.add('compact');
            } else {
                document.documentElement.classList.remove('compact');
            }

            showToast('Appearance settings updated successfully!');
        });

        // Language selection
        const languageSelect = document.getElementById('languageSelect');
        languageSelect.addEventListener('change', () => {
            const hausaInfoBox = document.getElementById('hausaInfoBox');
            const [lang, region] = languageSelect.value.split('|');

            if (lang === 'ha') {
                hausaInfoBox.classList.remove('hidden');
            } else {
                hausaInfoBox.classList.add('hidden');
            }
        });

        // Save language settings
        document.getElementById('saveLanguageBtn').addEventListener('click', async () => {
            const [language, region] = document.getElementById('languageSelect').value.split('|');
            const dateFormat = document.getElementById('dateFormatSelect').value;
            const timeFormat = document.getElementById('timeFormatSelect').value;

            try {
                await userService.updateLanguage({
                    language,
                    region,
                    dateFormat,
                    timeFormat
                });

                localStorage.setItem('dateFormat', dateFormat);
                localStorage.setItem('timeFormat', timeFormat);

                if (language === 'ha') {
                    // Apply Hausa translations
                    applyHausaTranslations();
                } else {
                    // Reset to default language
                    resetToDefaultLanguage();
                }

                showToast('Language settings updated successfully!');
                location.reload();
            } catch (error) {
                console.error('Error updating language settings:', error);
                showToast('Failed to update language settings', 'error');
            }
        });

        // Notification toggles
        const notificationToggles = document.querySelectorAll('.notification-toggle');
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                // If main toggle is unchecked, disable all others
                if (toggle.id === 'emailNotifications' && !toggle.checked) {
                    document.querySelectorAll('.notification-toggle:not(#emailNotifications)').forEach(t => {
                        t.checked = false;
                        t.disabled = true;
                    });
                }

                // If main toggle is checked, enable all others
                if (toggle.id === 'emailNotifications' && toggle.checked) {
                    document.querySelectorAll('.notification-toggle:not(#emailNotifications)').forEach(t => {
                        t.disabled = false;
                    });
                }
            });
        });

        // Browser notifications button
        document.getElementById('browserNotificationsBtn').addEventListener('click', () => {
            // Request notification permission
            if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        document.getElementById('browserNotificationsBtn').textContent = 'Enabled';
                        document.getElementById('browserNotificationsBtn').classList.add('bg-green-500');
                        document.getElementById('browserNotificationsBtn').classList.remove('bg-primary');

                        // Show example notification
                        new Notification('Notifications Enabled', {
                            body: 'You will now receive browser notifications for important updates.',
                            icon: '/favicon.ico'
                        });
                    }
                });
            }
        });

        // Save notification settings
        document.getElementById('saveNotificationsBtn').addEventListener('click', async () => {
            const emailNotifications = document.getElementById('emailNotifications').checked;
            const emailAssignmentReminders = document.getElementById('emailAssignmentReminders').checked;
            const emailCourseAnnouncements = document.getElementById('emailCourseAnnouncements').checked;
            const emailDiscussionReplies = document.getElementById('emailDiscussionReplies').checked;

            try {
                await userService.updateEmailSettings({
                    emailNotifications,
                    emailAssignmentReminders,
                    emailCourseAnnouncements,
                    emailDiscussionReplies
                });

                showToast('Notification settings updated successfully!');
            } catch (error) {
                console.error('Error updating notification settings:', error);
                showToast('Failed to update notification settings', 'error');
            }
        });

        // Change password button
        document.getElementById('changePasswordBtn').addEventListener('click', async () => {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast('All password fields are required', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }

            if (newPassword.length < 8) {
                showToast('Password must be at least 8 characters long', 'error');
                return;
            }

            try {
                await userService.updatePassword({
                    currentPassword,
                    newPassword,
                    confirmPassword
                });

                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';

                showToast('Password changed successfully!');
            } catch (error) {
                console.error('Error changing password:', error);
                showToast(error.message || 'Failed to change password', 'error');
            }
        });

        // View sessions button
        document.getElementById('viewSessionsBtn').addEventListener('click', () => {
            showSessionsModal();
        });

        // Delete account button
        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            showDeleteAccountModal();
        });

        // Text size slider
        const textSizeRange = document.getElementById('textSizeRange');
        const textSizePreview = document.getElementById('textSizePreview');

        textSizeRange.addEventListener('input', () => {
            const size = textSizeRange.value;
            textSizePreview.style.fontSize = `${size}%`;
        });

        // Save accessibility settings
        document.getElementById('saveAccessibilityBtn').addEventListener('click', () => {
            const textSize = document.getElementById('textSizeRange').value;
            const reduceMotion = document.getElementById('reduceMotion').checked;
            const highContrast = document.getElementById('highContrast').checked;
            const dyslexicFont = document.getElementById('dyslexicFont').checked;

            // Save settings to localStorage
            localStorage.setItem('textSize', textSize);
            localStorage.setItem('reduceMotion', reduceMotion);
            localStorage.setItem('highContrast', highContrast);
            localStorage.setItem('dyslexicFont', dyslexicFont);

            // Apply settings
            document.documentElement.style.fontSize = `${textSize}%`;

            if (reduceMotion) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }

            if (highContrast) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }

            if (dyslexicFont) {
                document.documentElement.classList.add('dyslexic-font');
                // Load dyslexic font if not already loaded
                if (!document.getElementById('dyslexicFontStylesheet')) {
                    const link = document.createElement('link');
                    link.id = 'dyslexicFontStylesheet';
                    link.rel = 'stylesheet';
                    link.href = 'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/dist/opendyslexic/opendyslexic.css';
                    document.head.appendChild(link);
                }
            } else {
                document.documentElement.classList.remove('dyslexic-font');
            }

            showToast('Accessibility settings updated successfully!');
        });

    } catch (error) {
        console.error('Error loading settings:', error);
        content.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
                <p class="font-medium">Error loading settings</p>
                <p>${error.message || 'Failed to load settings data'}</p>
                <button class="mt-2 px-4 py-2 bg-primary text-white rounded-lg" onclick="loadLoginPage()">Retry</button>
            </div>
        `;
    }
}

function showChangePasswordModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Change Password</h3>
                    <button id="closePasswordModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="changePasswordForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                        <input type="password" id="currentPassword" required placeholder="Enter current password"
                            class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                        <input type="password" id="newPassword" required placeholder="Enter new password"
                            class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                        <input type="password" id="confirmNewPassword" required placeholder="Confirm new password"
                            class="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-200">
                    </div>
                    <div id="passwordChangeError" class="text-red-500 hidden"></div>
                    <div>
                        <button type="submit" class="w-full px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-lg transition">
                            Update Password
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
    // Close modal event
    document.getElementById('closePasswordModal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Form submit event
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const errorDiv = document.getElementById('passwordChangeError');

        // Validate passwords
        if (newPassword !== confirmNewPassword) {
            errorDiv.textContent = "❌ New passwords do not match!";
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            errorDiv.classList.add('hidden');

            // Call API
            await userService.updatePassword({ currentPassword, newPassword });

            // Show success toast
            showToast('✅ Password updated successfully! Please log in again.', 'success');

            // Logout and redirect to login
            authService.logout();
            loadLoginPage();

        } catch (error) {
            errorDiv.textContent = `❌ ${error.message}`;
            errorDiv.classList.remove('hidden');
        }
    });
}
