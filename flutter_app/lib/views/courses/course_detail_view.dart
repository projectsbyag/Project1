import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/api_endpoints.dart';
import '../../config/app_theme.dart';
import '../../models/course_model.dart';
import '../../models/assignment_model.dart';
import '../../models/announcement_model.dart';
import '../../models/discussion_model.dart';
import '../../models/resource_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/dialogs.dart';
import '../assignments/assignment_detail_view.dart';
import '../discussions/discussion_detail_view.dart';
import '../resources/resource_detail_view.dart';
import 'course_settings_dialog.dart';

class CourseDetailView extends StatefulWidget {
  final CourseModel course;

  const CourseDetailView({super.key, required this.course});

  @override
  State<CourseDetailView> createState() => _CourseDetailViewState();
}

class _CourseDetailViewState extends State<CourseDetailView> {
  late CourseModel _course;

  @override
  void initState() {
    super.initState();
    _course = widget.course;
  }

  void _openSettingsModal() {
    CourseSettingsDialog.showSettingsModal(
      context,
      course: _course,
      onCourseUpdated: (updated) {
        setState(() {
          _course = updated;
        });
      },
      onCourseDeleted: () {
        Navigator.of(context).pop();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = authProvider.user;

    final assignments = dataProvider.assignments.where((a) => a.courseId == _course.id).toList();
    final announcements = dataProvider.announcements.where((a) => a.courseId == _course.id).toList();
    final discussions = dataProvider.discussions.where((d) => d.courseId == _course.id).toList();
    final resources = dataProvider.resources.where((r) => r.courseId == _course.id).toList();

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackground : const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: Text(_course.title),
        backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCourseHeader(isDark, user),
            const SizedBox(height: 24),
            _buildAnnouncements(announcements, isDark, user),
            const SizedBox(height: 24),
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth > 900) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 2,
                        child: Column(
                          children: [
                            _buildAssignments(assignments, isDark, user),
                            const SizedBox(height: 24),
                            _buildDiscussions(discussions, isDark),
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      Expanded(
                        flex: 1,
                        child: Column(
                          children: [
                            _buildResources(resources, isDark, user),
                            const SizedBox(height: 24),
                            _buildCourseInfo(isDark, user),
                          ],
                        ),
                      ),
                    ],
                  );
                } else {
                  return Column(
                    children: [
                      _buildAssignments(assignments, isDark, user),
                      const SizedBox(height: 24),
                      _buildDiscussions(discussions, isDark),
                      const SizedBox(height: 24),
                      _buildResources(resources, isDark, user),
                      const SizedBox(height: 24),
                      _buildCourseInfo(isDark, user),
                    ],
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseHeader(bool isDark, dynamic user) {
    final bannerColor = CourseSettingsDialog.parseHexColor(_course.color);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  bannerColor,
                  bannerColor.withValues(alpha: 0.8),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            alignment: Alignment.topRight,
            child: user?.role == 'instructor'
                ? Padding(
                    padding: const EdgeInsets.all(12),
                    child: TextButton.icon(
                      onPressed: _openSettingsModal,
                      icon: const Icon(Icons.settings, color: Colors.white, size: 16),
                      label: const Text('Course Settings', style: TextStyle(color: Colors.white)),
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                      ),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _course.title,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: bannerColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _course.code,
                        style: TextStyle(color: bannerColor, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    _buildDot(isDark),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.person, size: 16, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(_course.instructorName ?? 'Instructor', style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.grey.shade700)),
                      ],
                    ),
                    _buildDot(isDark),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.people, size: 16, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text('${_course.enrolledCount} students', style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.grey.shade700)),
                      ],
                    ),
                    if (_course.isArchived) ...[
                      _buildDot(isDark),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('Archived', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  _course.description.isNotEmpty ? _course.description : 'No course description provided.',
                  style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade600, height: 1.5),
                ),
                if (user?.role == 'student') ...[
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.email, size: 18),
                        label: const Text('Contact Instructor'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton.icon(
                        onPressed: _unenroll,
                        icon: const Icon(Icons.logout, size: 18),
                        label: const Text('Unenroll'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _unenroll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Unenroll from Course'),
        content: Text('Are you sure you want to unenroll from ${_course.title}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Unenroll'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ApiService.delete(ApiEndpoints.unenrollCourse(_course.id));
        if (mounted) {
          Provider.of<DataProvider>(context, listen: false).fetchCourses();
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Successfully unenrolled from course.')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to unenroll: $e')),
          );
        }
      }
    }
  }

  Widget _buildDot(bool isDark) {
    return Text('•', style: TextStyle(color: isDark ? Colors.grey.shade600 : Colors.grey.shade400, fontSize: 18));
  }

  Widget _buildAnnouncements(List<AnnouncementModel> announcements, bool isDark, dynamic user) {
    final isInstructor = user?.role == 'instructor' || user?.role == 'admin';
    return _buildSectionCard(
      title: 'Announcements',
      isDark: isDark,
      headerAction: isInstructor
          ? TextButton.icon(
              onPressed: () => Dialogs.showCreateAnnouncementDialog(context),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('New Announcement'),
            )
          : null,
      content: announcements.isEmpty
          ? Text('No announcements yet.', style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500))
          : Column(
              children: announcements.map((a) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E3A8A).withValues(alpha: 0.2) : Colors.blue.shade50,
                    border: Border.all(color: isDark ? const Color(0xFF1E3A8A) : Colors.blue.shade100),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                        child: const Icon(Icons.person, color: AppTheme.primaryColor),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(a.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 4),
                            Text(a.content, style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.black87)),
                            const SizedBox(height: 8),
                            Text(
                              DateFormat.yMMMd().add_jm().format(a.createdAt),
                              style: TextStyle(color: isDark ? Colors.grey.shade500 : Colors.grey.shade600, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildAssignments(List<AssignmentModel> assignments, bool isDark, dynamic user) {
    return _buildSectionCard(
      title: 'Assignments',
      isDark: isDark,
      headerAction: user?.role == 'instructor'
          ? TextButton.icon(
              onPressed: () => Dialogs.showNewAssignmentDialog(context),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('New Assignment'),
            )
          : null,
      content: assignments.isEmpty
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('No assignments have been created for this course yet.', style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500)),
                if (user?.role == 'instructor') ...[
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => Dialogs.showNewAssignmentDialog(context),
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor, foregroundColor: Colors.white),
                    child: const Text('Create First Assignment'),
                  )
                ]
              ],
            )
          : Column(
              children: assignments.map((a) {
                final now = DateTime.now();
                final isPastDue = a.dueDate.isBefore(now);
                final diff = a.dueDate.difference(now);
                final daysLeft = diff.inDays;

                String statusText = 'Upcoming';
                Color badgeBg = isDark ? const Color(0xFF1E1B4B).withValues(alpha: 0.4) : const Color(0xFFEEF2FF);
                Color badgeText = isDark ? const Color(0xFFA5B4FC) : AppTheme.primaryColor;

                if (isPastDue) {
                  statusText = 'Past Due';
                  badgeBg = isDark ? const Color(0xFF7F1D1D).withValues(alpha: 0.3) : const Color(0xFFFEE2E2);
                  badgeText = isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626);
                } else if (daysLeft <= 1) {
                  statusText = 'Due Soon';
                  badgeBg = isDark ? const Color(0xFF7C2D12).withValues(alpha: 0.3) : const Color(0xFFFFEDD5);
                  badgeText = isDark ? const Color(0xFFFDBA74) : const Color(0xFFEA580C);
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: isDark ? const Color(0xFF374151) : Colors.grey.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(a.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: badgeBg,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    statusText,
                                    style: TextStyle(color: badgeText, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Due: ${DateFormat.yMMMd().format(a.dueDate)} ${!isPastDue ? "(${daysLeft == 0 ? 'Due today' : '$daysLeft days left'})" : "(Past due)"}',
                              style: TextStyle(
                                color: isPastDue ? (isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626)) : (isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text('${a.maxPoints} points', style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.grey.shade700, fontSize: 13)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => AssignmentDetailView(assignment: a),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: const Text('View Details'),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildDiscussions(List<DiscussionModel> discussions, bool isDark) {
    return _buildSectionCard(
      title: 'Discussions',
      isDark: isDark,
      headerAction: TextButton.icon(
        onPressed: () => Dialogs.showStartDiscussionDialog(context),
        icon: const Icon(Icons.add, size: 16),
        label: const Text('New Discussion'),
      ),
      content: discussions.isEmpty
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('No discussions have been started in this course yet.', style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500)),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () => Dialogs.showStartDiscussionDialog(context),
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor, foregroundColor: Colors.white),
                  child: const Text('Start First Discussion'),
                )
              ],
            )
          : Column(
              children: discussions.map((d) {
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(d.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(d.content, maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: Text(DateFormat.MMMd().format(d.createdAt), style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DiscussionDetailView(discussion: d),
                      ),
                    );
                  },
                );
              }).toList(),
            ),
    );
  }

  Widget _buildResources(List<ResourceModel> resources, bool isDark, dynamic user) {
    final isInstructor = user?.role == 'instructor' || user?.role == 'admin';
    return _buildSectionCard(
      title: 'Resources',
      isDark: isDark,
      headerAction: isInstructor
          ? TextButton.icon(
              onPressed: () => Dialogs.showUploadResourceDialog(context),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Upload Resource'),
            )
          : null,
      content: resources.isEmpty
          ? Text('No resources have been added to this course yet.', style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500))
          : Column(
              children: resources.map((r) {
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.insert_drive_file, color: AppTheme.primaryColor),
                  title: Text(r.title, style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: Text(r.fileType.toUpperCase(), style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                  trailing: const Icon(Icons.download, size: 20),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ResourceDetailView(resource: r),
                      ),
                    );
                  },
                );
              }).toList(),
            ),
    );
  }

  Widget _buildCourseInfo(bool isDark, dynamic user) {
    return _buildSectionCard(
      title: 'Course Information',
      isDark: isDark,
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow('Instructor', _course.instructorName ?? 'Instructor', isDark),
          const SizedBox(height: 16),
          _buildInfoRow('Course Code', _course.code, isDark),
          const SizedBox(height: 16),
          _buildInfoRow('Students Enrolled', '${_course.enrolledCount} students', isDark),
          if (user?.role == 'instructor') ...[
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _openSettingsModal,
                icon: const Icon(Icons.settings),
                label: const Text('Course Settings'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
          ]
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildSectionCard({required String title, required bool isDark, required Widget content, Widget? headerAction}) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ?headerAction,
            ],
          ),
          const SizedBox(height: 20),
          content,
        ],
      ),
    );
  }
}
