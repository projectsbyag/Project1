import 'package:flutter/material.dart';
import '../config/api_endpoints.dart';
import '../models/announcement_model.dart';
import '../models/assignment_model.dart';
import '../models/course_model.dart';
import '../models/discussion_model.dart';
import '../models/resource_model.dart';
import '../services/api_service.dart';

class DataProvider extends ChangeNotifier {
  List<CourseModel> _courses = [];
  List<AssignmentModel> _assignments = [];
  List<ResourceModel> _resources = [];
  List<DiscussionModel> _discussions = [];
  List<AnnouncementModel> _announcements = [];

  bool _isLoadingCourses = false;
  bool _isLoadingAssignments = false;
  bool _isLoadingResources = false;
  bool _isLoadingDiscussions = false;
  bool _isLoadingAnnouncements = false;

  List<CourseModel> get courses => _courses;
  List<AssignmentModel> get assignments => _assignments;
  List<ResourceModel> get resources => _resources;
  List<DiscussionModel> get discussions => _discussions;
  List<AnnouncementModel> get announcements => _announcements;

  bool get isLoadingCourses => _isLoadingCourses;
  bool get isLoadingAssignments => _isLoadingAssignments;
  bool get isLoadingResources => _isLoadingResources;
  bool get isLoadingDiscussions => _isLoadingDiscussions;
  bool get isLoadingAnnouncements => _isLoadingAnnouncements;

  Future<void> fetchAllData() async {
    fetchCourses();
    fetchAssignments();
    fetchResources();
    fetchDiscussions();
    fetchAnnouncements();
  }

  Future<void> fetchCourses() async {
    _isLoadingCourses = true;
    notifyListeners();
    try {
      final res = await ApiService.get(ApiEndpoints.courses);
      if (res['data'] != null && res['data']['courses'] != null) {
        _courses = (res['data']['courses'] as List)
            .map((c) => CourseModel.fromJson(c))
            .toList();
      }
    } catch (_) {}
    _isLoadingCourses = false;
    notifyListeners();
  }

  Future<void> fetchAssignments() async {
    _isLoadingAssignments = true;
    notifyListeners();
    try {
      final res = await ApiService.get(ApiEndpoints.assignments);
      if (res['data'] != null && res['data']['assignments'] != null) {
        _assignments = (res['data']['assignments'] as List)
            .map((a) => AssignmentModel.fromJson(a))
            .toList();
      }
    } catch (_) {}
    _isLoadingAssignments = false;
    notifyListeners();
  }

  Future<void> fetchResources() async {
    _isLoadingResources = true;
    notifyListeners();
    try {
      final res = await ApiService.get(ApiEndpoints.resources);
      if (res['data'] != null && res['data']['resources'] != null) {
        _resources = (res['data']['resources'] as List)
            .map((r) => ResourceModel.fromJson(r))
            .toList();
      }
    } catch (_) {}
    _isLoadingResources = false;
    notifyListeners();
  }

  Future<void> fetchDiscussions() async {
    _isLoadingDiscussions = true;
    notifyListeners();
    try {
      final res = await ApiService.get(ApiEndpoints.discussions);
      if (res['data'] != null && res['data']['discussions'] != null) {
        _discussions = (res['data']['discussions'] as List)
            .map((d) => DiscussionModel.fromJson(d))
            .toList();
      }
    } catch (_) {}
    _isLoadingDiscussions = false;
    notifyListeners();
  }

  Future<void> fetchAnnouncements() async {
    _isLoadingAnnouncements = true;
    notifyListeners();
    try {
      final res = await ApiService.get(ApiEndpoints.announcements);
      if (res['data'] != null && res['data']['announcements'] != null) {
        _announcements = (res['data']['announcements'] as List)
            .map((a) => AnnouncementModel.fromJson(a))
            .toList();
      }
    } catch (_) {}
    _isLoadingAnnouncements = false;
    notifyListeners();
  }

  Future<bool> createDiscussion(String title, String content, String category) async {
    try {
      await ApiService.post(ApiEndpoints.discussions, {
        'title': title,
        'content': content,
        'category': category,
      });
      await fetchDiscussions();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> enrollCourse(String courseId, [String enrollmentCode = '']) async {
    try {
      await ApiService.post(ApiEndpoints.enrollCourse, {
        'courseId': courseId,
        'enrollmentCode': enrollmentCode,
      });
      await fetchCourses();
      return true;
    } catch (_) {
      return false;
    }
  }
}
