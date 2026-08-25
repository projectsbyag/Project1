import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Determine base host based on platform/environment
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api/v1';
    }
    // Android emulator host loopback is 10.0.2.2
    return 'http://10.0.2.2:5000/api/v1';
  }

  static String get uploadsUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/uploads';
    }
    return 'http://10.0.2.2:5000/uploads';
  }

  // Authentication
  static String login = '$baseUrl/auth/login';
  static String signup = '$baseUrl/auth/signup';
  static String logout = '$baseUrl/auth/logout';
  static String getMe = '$baseUrl/users/me';
  static String updateMe = '$baseUrl/users/updateMe';

  // Courses
  static String courses = '$baseUrl/courses';
  static String myCourses = '$baseUrl/courses/my-courses';
  static String courseDetails(String id) => '$baseUrl/courses/$id';
  static String updateCourse(String id) => '$baseUrl/courses/$id';
  static String deleteCourse(String id) => '$baseUrl/courses/$id';
  static String enrollCourse = '$baseUrl/courses/enroll';
  static String unenrollCourse(String courseId) => '$baseUrl/courses/$courseId/unenroll';
  static String courseStudents(String id) => '$baseUrl/courses/$id/students';
  static String removeCourseStudent(String courseId, String studentId) => '$baseUrl/courses/$courseId/students/$studentId';

  // Course Links
  static String courseLinks(String courseId) => '$baseUrl/courses/$courseId/links';
  static String revokeCourseLink(String linkId) => '$baseUrl/links/$linkId/revoke';

  // Assignments
  static String assignments = '$baseUrl/assignments';
  static String assignmentDetails(String id) => '$baseUrl/assignments/$id';
  static String submitAssignment(String id) => '$baseUrl/assignments/$id/submissions';

  // Resources
  static String resources = '$baseUrl/resources';
  static String resourceDetails(String id) => '$baseUrl/resources/$id';

  // Discussions
  static String discussions = '$baseUrl/discussions';
  static String discussionDetails(String id) => '$baseUrl/discussions/$id';
  static String discussionComments(String id) => '$baseUrl/discussions/$id/comments';

  // Announcements
  static String announcements = '$baseUrl/announcements';

  // Reports
  static String reports = '$baseUrl/reports';
}
