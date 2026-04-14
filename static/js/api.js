// API Service Layer
const API_BASE_URL = window.location.hostname.includes("127.0.0.1")
? "http://localhost:5000/api/v1"
: "https://project1-1bz0.onrender.com/api/v1";
// Store the JWT token
let token = localStorage.getItem('token') || null;
window.currentUser = null;

/**
 * PERFORMANCE OPTIMIZATION: Request Caching
 * Caches GET requests for 5 minutes to reduce server load
 */
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
}

function getCachedData(endpoint, options = {}) {
    const key = getCacheKey(endpoint, options);
    const cached = requestCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 Using cached response for ${endpoint}`);
        return cached.data;
    }
    
    if (cached) {
        requestCache.delete(key);
    }
    return null;
}

function setCachedData(endpoint, options, data) {
    const key = getCacheKey(endpoint, options);
    requestCache.set(key, { data, timestamp: Date.now() });
}

/**
 * PERFORMANCE OPTIMIZATION: Request Debouncing
 * Prevents duplicate requests within 500ms
 */
const requestQueue = new Map();

async function debouncedFetch(endpoint, options = {}, fetchFn) {
    const key = getCacheKey(endpoint, options);
    
    if (requestQueue.has(key)) {
        console.log(`⏳ Debouncing duplicate request for ${endpoint}`);
        return requestQueue.get(key);
    }
    
    const promise = fetchFn();
    requestQueue.set(key, promise);
    
    try {
        const result = await promise;
        return result;
    } finally {
        setTimeout(() => requestQueue.delete(key), 500);
    }
}

// Helper for making authenticated requests
const fetchWithAuth = async (endpoint, options = {}) => {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
        const cached = getCachedData(endpoint, options);
        if (cached) return cached;
    }
    
    // Use debounced fetch to prevent duplicate requests
    return debouncedFetch(endpoint, options, async () => {
        if (!options.headers) options.headers = {};
        
        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }
        
        if (!options.noContentType && !options.formData) {
            options.headers['Content-Type'] = 'application/json';
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // If no content (204), return an empty object
        if (response.status === 204) return {};
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Clear token and redirect to login
            authService.logout();
            loadLoginPage();
            throw new Error('Session expired. Please log in again.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        // Cache GET requests
        if (!options.method || options.method === 'GET') {
            setCachedData(endpoint, options, data);
        }
        
        return data;
    });
};

const fetchWithoutAuth = async (endpoint, options = {}) => {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
        const cached = getCachedData(endpoint, options);
        if (cached) return cached;
    }
    
    // Use debounced fetch to prevent duplicate requests
    return debouncedFetch(endpoint, options, async () => {
        if (!options.headers) options.headers = {};
       
        // Set content type if not specified and not form data
        if (!options.noContentType && !options.formData) {
            options.headers['Content-Type'] = 'application/json';
        }
       
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
       
            // If no content (204), return an empty object
            if (response.status === 204) return {};
            
            // Try to parse as JSON
            const data = await response.json();
            
            // Handle non-2xx responses with proper error messages
            if (!response.ok) {
                const error = new Error(data.message || 'Something went wrong');
                error.status = response.status;
                error.data = data;
                throw error;
            }
            
            // Cache GET requests
            if (!options.method || options.method === 'GET') {
                setCachedData(endpoint, options, data);
            }
            
            return data;
        } catch (error) {
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }
            
            // Handle JSON parsing errors
            if (error instanceof SyntaxError) {
                throw new Error('Invalid response from server. Please try again.');
            }
            
            // If it's our custom error with status, throw it as is
            if (error.status) {
                throw error;
            }
            
            // For any other errors
            throw new Error('An unexpected error occurred. Please try again.');
        }
    });
};

// Auth services
const authService = {
    login: async (email, password) => {
        const data = await fetchWithoutAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        token = data.token;
        currentUser = data.data.user;
        localStorage.setItem('token', token);
        return data;
    },
    
    signup: async (userData) => {
        const data = await fetchWithoutAuth('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        token = data.token;
        currentUser = data.data.user;
        localStorage.setItem('token', token);
        return data;
    },

    logout: () => {
        token = null;
        currentUser = null;
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        const data = await fetchWithAuth('/auth/me');
        currentUser = data.data.user;
        return data;
    }
};


// Courses service
const courseService = {
    getAllCourses: async () => {
        return await fetchWithAuth('/courses');
    },
    
    getMyCourses: async () => {
        return await fetchWithAuth('/courses/my-courses');
    },
    
    getCourse: async (id) => {
        return await fetchWithAuth(`/courses/${id}`);
    },
    
    createCourse: async (courseData) => {
        return await fetchWithAuth('/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    },

    enrollInCourse: async (enrollmentData) => {
        const { courseId, enrollmentCode } = enrollmentData;
        console.log("📌 Enrolling in course with ID:", courseId);
        return await fetchWithAuth('/courses/enroll', {
            method: 'POST',
            body: JSON.stringify({ courseId, enrollmentCode }),
        });
    },
    // Update course
    updateCourse: async (courseId, data) => {
        return await fetchWithAuth(`/courses/${courseId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    // Add student to course (by email)
    addStudentToCourse: async (courseId, data) => {
        return await fetchWithAuth(`/courses/${courseId}/students`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // Remove student from course
    removeStudentFromCourse: async (courseId, studentId) => {
        return await fetchWithAuth(`/courses/${courseId}/students/${studentId}`, {
            method: 'DELETE'
        });
    },
    
    // Delete course
    deleteCourse: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}`, {
            method: 'DELETE'
        });
    },

    unenrollFromCourse: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/unenroll`, {
            method: 'DELETE'
        });
    }
};

// Assignments service
const assignmentService = {
    getCourseAssignments: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/assignments`);
    },
    
    getAllAssignments: async () => {
        return await fetchWithAuth('/assignments');
    },

    getAssignment: async (id) => {
        return await fetchWithAuth(`/assignments/${id}`);
    },

    getMyAssignments: async () => {
        return await fetchWithAuth('/assignments/my-assignments'); // Fetch only the user's assignments
    },
    getInstructorAssignments: async () => {
        return await fetchWithAuth('/assignments/instructor-assignments'); // For instructors
    },
    createAssignment: async (assignmentData) => {
        return await fetchWithAuth('/assignments', {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });
    },
    deleteAssignment: async (assignmentId) => {
        return await fetchWithAuth(`/assignments/${assignmentId}`, {
            method: 'DELETE'
        });
    },
    updateAssignment: async (assignmentId, assignmentData) => {
        return await fetchWithAuth(`/assignments/${assignmentId}`, {
            method: 'PATCH',
            body: JSON.stringify(assignmentData)
        });
    },
    submitAssignment: async (assignmentId, formData) => {
        // For file uploads, use FormData instead of JSON
        return await fetch(`${API_URL}/assignments/${assignmentId}/submit`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }).then(async res => {
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to submit assignment');
            }
            return res.json();
        });
    },

    getSubmissions: async (assignmentId) => {
        return await fetchWithAuth(`/assignments/${assignmentId}/submissions`);
    },

    gradeSubmission: async (submissionId, gradeData) => {
        return await fetchWithAuth(`/assignments/submissions/${submissionId}/grade`, {
            method: 'PATCH',
            body: JSON.stringify(gradeData)
        });
    }
    
};

// Resources service
const resourceService = {
    createResource: async (courseId, formData) => {
        return await fetchWithAuth(`/resources/${courseId}`, {
            method: 'POST',
            body: formData,
            formData: true
             // Using FormData directly
            // No Content-Type header - browser sets this automatically for FormData
        });
    },
    getCourseResources: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/resources`);
    },
    
    getAllResources: async () => {
        return await fetchWithAuth('/resources');
    },

    getResource: async (id) => {
        return await fetchWithAuth(`/resources/${id}`);
    },      
    getPopularResources: async () => {
        return await fetchWithAuth('/resources/popular');
    },
    getMyResources: async () => {
        return await fetchWithAuth('/resources/my-resources'); // Fetch only the user's resources
    },
    updateResource: async (id, formData) => {
        return await fetchWithAuth(`/resources/${id}`, {
            method: 'PATCH',
            body: formData,
            formData: true
        });
    },
    
    // Delete a resource
    deleteResource: async (id) => {
        return await fetchWithAuth(`/resources/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Like a resource
    likeResource: async (resourceId) => {
        return await fetchWithAuth(`/resources/${resourceId}/like`, {
            method: 'POST'
        });
    },
    
    // Unlike a resource
    unlikeResource: async (resourceId) => {
        return await fetchWithAuth(`/resources/${resourceId}/unlike`, {
            method: 'DELETE'
        });
    },
    
    // Pin a resource (for instructors)
    pinResource: async (resourceId) => {
        return await fetchWithAuth(`/resources/${resourceId}/pin`, {
            method: 'POST'
        });
    },
    
    // Unpin a resource
    unpinResource: async (resourceId) => {
        return await fetchWithAuth(`/resources/${resourceId}/pin`, {
            method: 'DELETE'
        });
    },
    
    // Record a resource view
    recordResourceView: async (resourceId) => {
        return await fetchWithAuth(`/resources/${resourceId}/view`, {
            method: 'POST'
        });
    },
    
    // Comment functions
    addComment: async (resourceId, data) => {
        return await fetchWithAuth(`/resources/${resourceId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    updateComment: async (resourceId, commentId, data) => {
        return await fetchWithAuth(`/resources/${resourceId}/comments/${commentId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    deleteComment: async (resourceId, commentId) => {
        return await fetchWithAuth(`/resources/${resourceId}/comments/${commentId}`, {
            method: 'DELETE'
        });
    }
};

// Discussions service
const discussionService = {
    getCourseDiscussions: async (courseId) => {
        return await fetchWithAuth(`/courses/${courseId}/discussions`);
    },
    
    getAllDiscussions: async () => {
        return await fetchWithAuth('/discussions');
    },
    
    getPopularDiscussions: async () => {
        return await fetchWithAuth('/discussions/popular');
    },
    
    getDiscussion: async (id) => {
        return await fetchWithAuth(`/discussions/${id}`);
    },

    getMyDiscussions: async () => {
        return await fetchWithAuth('/discussions/my-discussions'); // Fetch only the user's discussions
    },

    createDiscussion: async (discussionData) => {
        console.log("📌 Sending Discussion Data:", discussionData); // ✅ Debug
        return await fetchWithAuth('/discussions', {
            method: 'POST',
            body: JSON.stringify({
                title: discussionData.title,
                content: discussionData.content,
                course: discussionData.course, // ✅ Ensure this is the correct course I
            }),
        });
    },
    
    
    addReply: async (discussionId, replyData) => {
        return await fetchWithAuth(`/discussions/${discussionId}/replies`, {
            method: 'POST',
            body: JSON.stringify(replyData),
        });
    },
    deleteReply: async (discussionId, replyId) => {
        return await fetchWithAuth(`/discussions/${discussionId}/replies/${replyId}`, {
            method: 'DELETE'
        });
    },
    deleteDiscussion: async (id) => {
        return await fetchWithAuth(`/discussions/${id}`, {
            method: 'DELETE'
        });
    }
};

const userService = {
    getCurrentUser: async () => {
        return await fetchWithAuth('/auth/me'); // ✅ Fetch user profile
    },
    
    // Get user activity data
    getUserActivity: async () => {
        return await fetchWithAuth('/users/me/activity');
    },
    
    // Get detailed activity history
    getActivityHistory: async () => {
        return await fetchWithAuth('/users/me/activity/history');
    },
    
    // Get student performance analytics
    getStudentPerformance: async () => {
        return await fetchWithAuth('/users/me/performance');
    },
    
    // Get instructor statistics
    getInstructorStats: async () => {
        return await fetchWithAuth('/users/me/teaching');
    },
    
    // Update user profile
    updateProfile: async (data) => {
        return await fetchWithAuth('/users/updateMe', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    // Update user password
    updatePassword: async (data) => {
        return await fetchWithAuth('/users/updateMyPassword', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    // Update user avatar
    updateAvatar: async (formData) => {
        return await fetchWithAuth('/users/updateAvatar', {
            method: 'PATCH',
            body: formData,
            formData: true // Use FormData for file uploads
        });
    },
    
   // Update language settings
   updateLanguage: async (data) => {
    return await fetchWithAuth('/users/updateLanguage', {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
},

// Update email notification settings
updateEmailSettings: async (data) => {
    return await fetchWithAuth('/users/updateEmailSettings', {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
},

// Get user sessions
getUserSessions: async () => {
    return await fetchWithAuth('/users/sessions');
},

// Revoke a specific session
revokeSession: async (sessionId) => {
    return await fetchWithAuth(`/users/sessions/${sessionId}`, {
        method: 'DELETE'
    });
},

// Revoke all other sessions
revokeAllOtherSessions: async () => {
    return await fetchWithAuth('/users/sessions/all', {
        method: 'DELETE'
    });
},

// Delete user account
deleteAccount: async (data) => {
    return await fetchWithAuth('/users/deleteMe', {
        method: 'DELETE',
        body: JSON.stringify(data)
    });
},

// Verify token is still valid
verifyToken: async (token) => {
    return await fetchWithAuth('/users/verifyToken');
},
    
};

const announcementService = {
    getCourseAnnouncements: async (courseId) => {
        return await fetchWithAuth(`/announcements/${courseId}`);
    },
    getAllAnnouncements: async () => {
        return await fetchWithAuth('/announcements/all');
    },
    createAnnouncement: async (announcementData) => {
        return await fetchWithAuth('/announcements', {
            method: 'POST',
            body: JSON.stringify(announcementData),
        });
    }
};

// SecureLink service
const courseLinkService = {
    generateCourseLink: async (courseId, options = {}) => {
      return await fetchWithAuth(`/courses/${courseId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
    },
  
    getCourseLinks: async (courseId) => {
      return await fetchWithAuth(`/courses/${courseId}/links`);
    },
  
    revokeCourseLink: async (linkId) => {
      return await fetchWithAuth(`/links/${linkId}/revoke`, {
        method: 'PATCH'
      });
    },
  
    // For joining via a secure link, do not send a Content-Type header
    joinViaLink: async (token) => {
      return await fetchWithAuth(`/join/${token}`, {
        method: 'POST',
        noContentType: true  // This flag prevents adding the default JSON header
      });
    }
  };
  
  // Add to api.js
const reportService = {
  createReport: async (reportData) => {
    return await fetchWithAuth('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  getReports: async () => {
    return await fetchWithAuth('/reports');
  },

  updateReportStatus: async (reportId, statusData) => {
    return await fetchWithAuth(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
  }
};