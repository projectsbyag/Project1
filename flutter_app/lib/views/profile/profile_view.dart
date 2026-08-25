import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isInstructor = user?.role == 'instructor' || user?.role == 'admin';

    final totalCourses = dataProvider.courses.length;
    final totalAssignments = dataProvider.assignments.length;
    final totalResources = dataProvider.resources.length;
    final totalDiscussions = dataProvider.discussions.length;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'My Profile',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile edit mode enabled.')),
                  );
                },
                icon: const Icon(Icons.edit_note_rounded, size: 18),
                label: const Text('Edit Profile'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Two Column Layout
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 850;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: User Profile Info Card & Quick Links
                  SizedBox(
                    width: isWide ? 300 : double.infinity,
                    child: Column(
                      children: [
                        // User Profile Info Card
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 38,
                                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.15),
                                child: Text(
                                  user?.firstName.isNotEmpty == true ? user!.firstName[0].toUpperCase() : 'A',
                                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                user?.fullName ?? 'Aliyu Garba',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                user?.email ?? 'a@gmail.com',
                                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                user?.bio ?? 'No Bio entered yet.',
                                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  user?.role != null ? (user!.role[0].toUpperCase() + user.role.substring(1)) : 'Student',
                                  style: const TextStyle(
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              Divider(color: isDark ? Colors.grey.shade800 : Colors.grey.shade200, height: 1),
                              const SizedBox(height: 16),

                              _buildInfoRow('Account Type', isInstructor ? 'Instructor' : 'Student', isDark),
                              const SizedBox(height: 8),
                              _buildInfoRow(isInstructor ? 'Teaching Courses' : 'Enrolled Courses', '$totalCourses', isDark),
                              const SizedBox(height: 8),
                              _buildInfoRow('Member Status', 'Active', isDark),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Quick Links Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Quick Links', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 12),
                              _buildQuickLink(Icons.menu_book, 'My Courses', isDark),
                              _buildQuickLink(Icons.task_outlined, 'Assignments', isDark),
                              _buildQuickLink(Icons.forum_outlined, 'Discussions', isDark),
                              _buildQuickLink(Icons.insert_drive_file_outlined, 'Resources', isDark),
                              _buildQuickLink(Icons.settings_outlined, 'Account Settings', isDark),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                  // Right Column: Overview, Activity & Courses
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Column(
                      children: [
                        // Overview Card (Instructor: Teaching Overview, Student: Academic Overview)
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isInstructor ? 'Teaching Overview' : 'Academic Overview',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: isInstructor
                                    ? [
                                        _buildStatBox('Total Students', '0', isDark),
                                        const SizedBox(width: 12),
                                        _buildStatBox('Courses', '$totalCourses', isDark),
                                        const SizedBox(width: 12),
                                        _buildStatBox('Resources', '$totalResources', isDark),
                                        const SizedBox(width: 12),
                                        _buildStatBox('Assignments', '$totalAssignments', isDark),
                                      ]
                                    : [
                                        _buildStatBox('Enrolled Courses', '$totalCourses', isDark),
                                        const SizedBox(width: 12),
                                        _buildStatBox('Assignments', '$totalAssignments', isDark),
                                        const SizedBox(width: 12),
                                        _buildStatBox('Discussions', '$totalDiscussions', isDark),
                                        const SizedBox(width: 12),
                                        _buildStatBox('Resources', '$totalResources', isDark),
                                      ],
                              ),
                              const SizedBox(height: 20),
                              Text(
                                isInstructor ? 'AVERAGE STUDENT PERFORMANCE' : 'SUBMISSION PROGRESS',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Expanded(
                                    child: LinearProgressIndicator(
                                      value: 0.0,
                                      backgroundColor: isDark ? const Color(0xFF334155) : Colors.grey.shade200,
                                      color: AppTheme.primaryColor,
                                      minHeight: 6,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  const Text('N/A', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Courses Card
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isInstructor ? 'Courses I Teach' : 'My Enrolled Courses',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              const SizedBox(height: 16),
                              if (dataProvider.courses.isEmpty)
                                Text('No courses to display.', style: TextStyle(color: Colors.grey.shade500, fontSize: 13))
                              else
                                ...dataProvider.courses.map((c) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 10),
                                    child: _buildTeachCourseItem(c.title, c.code, AppTheme.primaryColor, isDark),
                                  );
                                }),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(fontWeight: FontWeight.w500, fontSize: 12, color: isDark ? Colors.white : Colors.black87),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickLink(IconData icon, String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.primaryColor),
          const SizedBox(width: 10),
          Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
        ],
      ),
    );
  }

  Widget _buildStatBox(String title, String value, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(title, style: TextStyle(color: Colors.grey.shade500, fontSize: 10), textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildTeachCourseItem(String title, String code, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Text(code, style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
        ],
      ),
    );
  }
}
