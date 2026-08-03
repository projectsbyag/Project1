import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../models/assignment_model.dart';
import '../../models/course_model.dart';
import '../../models/discussion_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../assignments/assignment_detail_view.dart';
import '../courses/course_detail_view.dart';
import '../discussions/discussion_detail_view.dart';

class DashboardView extends StatelessWidget {
  final Function(int)? onNavigate;

  const DashboardView({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final user = authProvider.user;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Fallback demo items if backend database has no initial items yet
    final displayCourses = dataProvider.courses.isNotEmpty
        ? dataProvider.courses
        : [
            CourseModel(
              id: 'c1',
              title: 'Maths 101',
              code: 'MTH101',
              description: 'Introductory Mathematics',
              instructorName: user?.fullName ?? 'Aliyu Garba',
              enrolledCount: 12,
            ),
            CourseModel(
              id: 'c2',
              title: 'Intro To Cyber Security',
              code: 'CYB101',
              description: 'Fundamentals of Cyber Security',
              instructorName: user?.fullName ?? 'Aliyu Garba',
              enrolledCount: 24,
            ),
            CourseModel(
              id: 'c3',
              title: 'Forensic Computing',
              code: 'CYB301',
              description: 'Digital Forensics & Investigation',
              instructorName: user?.fullName ?? 'Aliyu Garba',
              enrolledCount: 18,
            ),
          ];

    final displayAssignments = dataProvider.assignments.isNotEmpty
        ? dataProvider.assignments
        : [
            AssignmentModel(
              id: 'a1',
              title: 'First Assignment',
              description: 'Calculus and limits exercises',
              courseId: 'c1',
              courseTitle: 'Maths 101',
              dueDate: DateTime.now().add(const Duration(days: 8)),
            ),
          ];

    final displayDiscussions = dataProvider.discussions.isNotEmpty
        ? dataProvider.discussions
        : [
            DiscussionModel(
              id: 'd1',
              title: 'Differentiation or Integration, which is better.',
              content: 'Discussing the fundamental principles of calculus...',
              category: 'General',
              courseId: 'c1',
              authorName: user?.fullName ?? 'Aliyu Garba',
              createdAt: DateTime.now(),
            ),
          ];

    final displayAnnouncements = dataProvider.announcements.isNotEmpty
        ? dataProvider.announcements
        : [
            DiscussionModel(
              id: 'an1',
              title: 'Welcome All!',
              content: 'Hello All, Welcome to the new semester, wishing you a successful journey as we proceed through this course....',
              category: 'Notice',
              courseId: 'c1',
              authorName: user?.fullName ?? 'Aliyu Garba',
              createdAt: DateTime.now().subtract(const Duration(minutes: 4)),
            ),
          ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Dashboard Header
          Text(
            'Dashboard',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isDark ? AppTheme.textDarkPrimary : AppTheme.textLightPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Welcome back, ${user?.firstName ?? 'Aliyu'}!',
            style: TextStyle(
              color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          Divider(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300, height: 1),
          const SizedBox(height: 24),

          // Section 1: My Courses
          _buildSectionHeader('My Courses', isDark, () {
            if (onNavigate != null) onNavigate!(1);
          }),
          const SizedBox(height: 16),
          _buildCoursesGrid(context, displayCourses, isDark),

          const SizedBox(height: 24),
          Divider(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300, height: 1),
          const SizedBox(height: 24),

          // Section 2: Two-Column Row (Upcoming Assignments & Recent Discussions)
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 800;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left: Upcoming Assignments
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader('Upcoming Assignments', isDark, () {
                          if (onNavigate != null) onNavigate!(3);
                        }),
                        const SizedBox(height: 12),
                        _buildAssignmentsCard(context, displayAssignments, isDark),
                      ],
                    ),
                  ),
                  if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                  // Right: Recent Discussions
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader('Recent Discussions', isDark, () {
                          if (onNavigate != null) onNavigate!(4);
                        }),
                        const SizedBox(height: 12),
                        _buildDiscussionsCard(context, displayDiscussions, isDark),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),

          const SizedBox(height: 24),

          // Section 3: Two-Column Row (Calendar & Recent Announcements)
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 800;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left: Calendar
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Calendar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
                        const SizedBox(height: 12),
                        _buildCalendarCard(context, isDark),
                      ],
                    ),
                  ),
                  if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                  // Right: Recent Announcements
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Recent Announcements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
                        const SizedBox(height: 12),
                        _buildAnnouncementsCard(context, displayAnnouncements, isDark),
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

  Widget _buildSectionHeader(String title, bool isDark, VoidCallback onViewAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        InkWell(
          onTap: onViewAll,
          child: const Text(
            'View All',
            style: TextStyle(
              color: AppTheme.primaryColor,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCoursesGrid(BuildContext context, List<CourseModel> courses, bool isDark) {
    final colors = [
      AppTheme.emeraldColor, // Green
      AppTheme.accentColor, // Red
      AppTheme.amberColor, // Orange/Amber
      AppTheme.primaryColor, // Purple
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 900 ? 4 : (constraints.maxWidth > 600 ? 2 : 1);
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisExtent: 175,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: courses.length + 1,
          itemBuilder: (context, index) {
            if (index < courses.length) {
              final course = courses[index];
              final bannerColor = colors[index % colors.length];
              return InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CourseDetailView(course: course),
                    ),
                  );
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkSurface : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Banner header
                    Container(
                      height: 65,
                      decoration: BoxDecoration(
                        color: bannerColor,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(11),
                          topRight: Radius.circular(11),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            course.title,
                            style: TextStyle(
                              fontWeight: FontWeight.bold, 
                              fontSize: 15,
                              color: isDark ? Colors.white : Colors.black,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: bannerColor.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  course.code.isNotEmpty ? course.code : 'MTH101',
                                  style: TextStyle(
                                    color: bannerColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                              Text(
                                course.instructorName ?? 'Aliyu Garba',
                                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              );
            } else {
              // Dotted Explore More Courses Card
              return Container(
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.grey.shade700 : Colors.grey.shade300,
                    style: BorderStyle.solid,
                    width: 1.5,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.12),
                      child: const Icon(Icons.add, color: AppTheme.primaryColor, size: 20),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Explore more courses',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              );
            }
          },
        );
      },
    );
  }

  Widget _buildAssignmentsCard(BuildContext context, List<AssignmentModel> assignments, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: assignments.map((assignment) {
          final dueDateStr = DateFormat('MMM d').format(assignment.dueDate);
          return InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => AssignmentDetailView(assignment: assignment),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFF3F4F6)),
              ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      assignment.title,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            assignment.courseTitle.isNotEmpty ? assignment.courseTitle : 'MTH101',
                            style: const TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text('• ${assignment.courseTitle}', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(dueDateStr, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text('8 days left', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDiscussionsCard(BuildContext context, List<DiscussionModel> discussions, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: discussions.map((discussion) {
          return InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => DiscussionDetailView(discussion: discussion),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFF3F4F6)),
              ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        discussion.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text('Just now', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('MTH101', style: TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 6),
                    Text('• by ${discussion.authorName}', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 6),
                Text('Discuss', style: TextStyle(color: AppTheme.primaryColor, fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCalendarCard(BuildContext context, bool isDark) {
    final dataProvider = Provider.of<DataProvider>(context);
    final assignments = dataProvider.assignments;
    
    final now = DateTime.now();
    final firstDayOfMonth = DateTime(now.year, now.month, 1);
    final lastDayOfMonth = DateTime(now.year, now.month + 1, 0);
    
    final daysInMonth = lastDayOfMonth.day;
    final startWeekday = firstDayOfMonth.weekday == 7 ? 0 : firstDayOfMonth.weekday;
    final totalCells = startWeekday + daysInMonth;
    final rowCount = (totalCells / 7).ceil();
    
    final monthName = DateFormat('MMMM yyyy').format(now);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(monthName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: days.map((d) => SizedBox(width: 32, child: Text(d, textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey.shade600)))).toList(),
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisExtent: 44, // Adjusted height for dot
            ),
            itemCount: rowCount * 7,
            itemBuilder: (context, index) {
              if (index < startWeekday || index >= startWeekday + daysInMonth) {
                return const SizedBox();
              }
              final dayNum = index - startWeekday + 1;
              final isToday = dayNum == now.day;
              
              final currentDayDate = DateTime(now.year, now.month, dayNum);
              final hasAssignment = assignments.any((a) => a.dueDate.year == currentDayDate.year && a.dueDate.month == currentDayDate.month && a.dueDate.day == currentDayDate.day);

              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: isToday ? AppTheme.primaryColor : Colors.transparent,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '$dayNum',
                          style: TextStyle(
                            color: isToday ? Colors.white : (isDark ? Colors.white : Colors.black87),
                            fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                    if (hasAssignment)
                      Container(
                        margin: const EdgeInsets.only(top: 2),
                        width: 4,
                        height: 4,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      )
                    else
                      const SizedBox(height: 6),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAnnouncementsCard(BuildContext context, List<dynamic> announcements, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: announcements.map((item) {
          return InkWell(
            onTap: () {
              final dataProvider = Provider.of<DataProvider>(context, listen: false);
              final course = dataProvider.courses.firstWhere(
                (c) => c.id == item.courseId,
                orElse: () => dataProvider.courses.isNotEmpty ? dataProvider.courses.first : CourseModel(id: '', title: '', code: '', description: '', instructorName: ''),
              );
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CourseDetailView(course: course),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF0F7FF),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE0F2FE)),
              ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.15),
                      child: const Text('A', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 12)),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      '${item.authorName ?? 'Aliyu Garba'} • 4 minutes ago',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.campaign, color: AppTheme.primaryColor, size: 18),
                    const SizedBox(width: 6),
                    Text(item.title ?? 'Welcome All!', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ],
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.emeraldColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('MTH101', style: TextStyle(color: AppTheme.emeraldColor, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 8),
                Text(
                  item.content ?? 'Hello All, Welcome to the new semester, wishing you a successful journey as we proceed through this course....',
                  style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.grey.shade700, fontSize: 13),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          );
        }).toList(),
      ),
    );
  }
}
