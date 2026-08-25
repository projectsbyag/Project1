import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../models/course_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../widgets/dialogs.dart';
import 'course_detail_view.dart';

class CourseListView extends StatefulWidget {
  const CourseListView({super.key});

  @override
  State<CourseListView> createState() => _CourseListViewState();
}

class _CourseListViewState extends State<CourseListView> {
  int _selectedTab = 0; // 0: My Courses, 1: Available Courses
  String _searchQuery = '';
  String _sortBy = 'Name';

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isInstructor = user?.role == 'instructor' || user?.role == 'admin';

    final allCourses = dataProvider.courses.isNotEmpty
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

    // For students: split into enrolled courses and available courses
    final List<CourseModel> myCourses;
    final List<CourseModel> availableCourses;

    if (isInstructor) {
      myCourses = allCourses;
      availableCourses = [];
    } else {
      final userEnrolledIds = user?.enrolledCourses ?? [];
      myCourses = allCourses.where((c) {
        return userEnrolledIds.contains(c.id) ||
            c.students.any((s) {
              final sId = s is Map ? (s['_id'] ?? s['id']) : s.toString();
              return sId == user?.id;
            });
      }).toList();

      // If list is empty due to initial mock, show allCourses in myCourses
      final activeMyCourses = myCourses.isNotEmpty ? myCourses : allCourses;

      availableCourses = allCourses.where((c) => !activeMyCourses.contains(c)).toList();
    }

    final activeList = _selectedTab == 0 ? (isInstructor ? myCourses : (myCourses.isNotEmpty ? myCourses : allCourses)) : availableCourses;

    final filteredCourses = activeList.where((c) {
      final q = _searchQuery.toLowerCase();
      return c.title.toLowerCase().contains(q) || c.code.toLowerCase().contains(q);
    }).toList();

    // Sort
    if (_sortBy == 'Name') {
      filteredCourses.sort((a, b) => a.title.compareTo(b.title));
    } else if (_sortBy == 'Code') {
      filteredCourses.sort((a, b) => a.code.compareTo(b.code));
    }

    final colors = [
      AppTheme.emeraldColor, // Green
      AppTheme.accentColor, // Red
      AppTheme.amberColor, // Orange
      AppTheme.primaryColor, // Purple
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Courses',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              isInstructor
                  ? ElevatedButton.icon(
                      onPressed: () => Dialogs.showCreateCourseDialog(context),
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Create Course'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    )
                  : ElevatedButton.icon(
                      onPressed: () => Dialogs.showEnrollCourseDialog(context),
                      icon: const Icon(Icons.school, size: 18),
                      label: const Text('Enroll in Course'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
            ],
          ),
          const SizedBox(height: 20),

          // Tabs Row
          Row(
            children: [
              _buildTab(
                isInstructor ? 'My Courses (${myCourses.length})' : 'Enrolled Courses (${myCourses.isNotEmpty ? myCourses.length : allCourses.length})',
                0,
                isDark,
              ),
              const SizedBox(width: 24),
              _buildTab('Available Courses (${availableCourses.length})', 1, isDark),
            ],
          ),
          Divider(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300, height: 1),
          const SizedBox(height: 20),

          // Search and Sort Filter Row
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 42,
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search courses...',
                      hintStyle: TextStyle(fontSize: 13, color: isDark ? Colors.grey.shade500 : Colors.grey.shade400),
                      prefixIcon: const Icon(Icons.search, size: 20),
                      filled: true,
                      fillColor: isDark ? AppTheme.darkSurface : Colors.white,
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                height: 42,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _sortBy,
                    style: TextStyle(fontSize: 13, color: isDark ? Colors.white : Colors.black87),
                    dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                    items: const [
                      DropdownMenuItem(value: 'Name', child: Text('Sort by Name')),
                      DropdownMenuItem(value: 'Code', child: Text('Sort by Code')),
                    ],
                    onChanged: (val) => setState(() => _sortBy = val ?? 'Name'),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Course Cards Grid
          filteredCourses.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(48),
                  alignment: Alignment.center,
                  child: Column(
                    children: [
                      Icon(Icons.menu_book_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      Text(
                        _selectedTab == 0 ? 'No courses found.' : 'There are no other courses available for enrollment at this time.',
                        style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade600, fontSize: 14),
                      ),
                    ],
                  ),
                )
              : LayoutBuilder(
                  builder: (context, constraints) {
                    final crossAxisCount = constraints.maxWidth > 1100
                        ? 3
                        : (constraints.maxWidth > 650 ? 2 : 1);
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 20,
                        mainAxisSpacing: 20,
                        mainAxisExtent: 260,
                      ),
                      itemCount: filteredCourses.length,
                      itemBuilder: (context, index) {
                        final course = filteredCourses[index];
                        final bannerColor = colors[index % colors.length];

                        return MouseRegion(
                          cursor: SystemMouseCursors.click,
                          child: InkWell(
                            onTap: () {
                              if (_selectedTab == 1 && !isInstructor) {
                                Dialogs.showEnrollCourseDialog(context, course: course);
                              } else {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => CourseDetailView(course: course),
                                  ),
                                );
                              }
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              decoration: BoxDecoration(
                                color: isDark ? AppTheme.darkSurface : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Top Colored Banner
                                  Container(
                                    height: 70,
                                    width: double.infinity,
                                    color: bannerColor,
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    alignment: Alignment.topLeft,
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(alpha: 0.25),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            course.code,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          '${course.enrolledCount} students',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Card Content Area
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
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
                                              const SizedBox(height: 6),
                                              Text(
                                                course.description,
                                                style: TextStyle(
                                                  color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                                                  fontSize: 12,
                                                ),
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                          Column(
                                            children: [
                                              Divider(color: isDark ? const Color(0xFF374151) : const Color(0xFFF3F4F6), height: 16),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Row(
                                                    children: [
                                                      CircleAvatar(
                                                        radius: 12,
                                                        backgroundColor: bannerColor.withValues(alpha: 0.2),
                                                        child: Text(
                                                          course.instructorName?.isNotEmpty == true ? course.instructorName![0].toUpperCase() : 'A',
                                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: bannerColor),
                                                        ),
                                                      ),
                                                      const SizedBox(width: 8),
                                                      Text(
                                                        (course.instructorName != null && course.instructorName!.isNotEmpty) ? course.instructorName! : 'Aliyu Garba',
                                                        style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade300 : Colors.grey.shade700),
                                                      ),
                                                    ],
                                                  ),
                                                  if (_selectedTab == 1 && !isInstructor)
                                                    ElevatedButton(
                                                      onPressed: () => Dialogs.showEnrollCourseDialog(context, course: course),
                                                      style: ElevatedButton.styleFrom(
                                                        backgroundColor: AppTheme.primaryColor,
                                                        foregroundColor: Colors.white,
                                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                        minimumSize: Size.zero,
                                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                      ),
                                                      child: const Text('Enroll', style: TextStyle(fontSize: 11)),
                                                    )
                                                  else
                                                    const Icon(Icons.arrow_forward, size: 16, color: Colors.grey),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildTab(String label, int index, bool isDark) {
    final isSelected = _selectedTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedTab = index),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? AppTheme.primaryColor : Colors.grey.shade500,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ),
          Container(
            height: 2,
            width: 100,
            color: isSelected ? AppTheme.primaryColor : Colors.transparent,
          ),
        ],
      ),
    );
  }
}
