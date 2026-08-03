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

    final displayCourses = dataProvider.courses.isNotEmpty
        ? dataProvider.courses
        : [
            CourseModel(
              id: 'c1',
              title: 'Maths 101',
              code: 'MTH101',
              description: 'Introductory Mathematics',
              instructorName: user?.fullName ?? 'Aliyu Garba',
              enrolledCount: 0,
            ),
            CourseModel(
              id: 'c2',
              title: 'Intro To Cyber Security',
              code: 'CYB101',
              description: 'Fundamentals of Cyber Security',
              instructorName: user?.fullName ?? 'Aliyu Garba',
              enrolledCount: 0,
            ),
            CourseModel(
              id: 'c3',
              title: 'Forensic Computing',
              code: 'CYB301',
              description: 'Digital Forensics & Investigation',
              instructorName: user?.fullName ?? 'Aliyu Garba',
              enrolledCount: 0,
            ),
          ];

    final filteredCourses = displayCourses.where((c) {
      final q = _searchQuery.toLowerCase();
      return c.title.toLowerCase().contains(q) || c.code.toLowerCase().contains(q);
    }).toList();

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
              ElevatedButton.icon(
                onPressed: () => Dialogs.showCreateCourseDialog(context),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Create Course'),
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
              _buildTab('My Courses (${displayCourses.length})', 0, isDark),
              const SizedBox(width: 24),
              _buildTab('Available Courses (0)', 1, isDark),
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
                      hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                      prefixIcon: const Icon(Icons.search, size: 18),
                      fillColor: isDark ? AppTheme.darkSurface : Colors.white,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
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
                    items: const [
                      DropdownMenuItem(value: 'Name', child: Text('Sort by: Name')),
                      DropdownMenuItem(value: 'Code', child: Text('Sort by: Code')),
                    ],
                    onChanged: (val) => setState(() => _sortBy = val ?? 'Name'),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Courses Grid
          _selectedTab == 1
              ? Container(
                  height: 200,
                  alignment: Alignment.center,
                  child: Text('No available courses to join.', style: TextStyle(color: Colors.grey.shade500)),
                )
              : LayoutBuilder(
                  builder: (context, constraints) {
                    final crossAxisCount = constraints.maxWidth > 900 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        mainAxisExtent: 240,
                        crossAxisSpacing: 20,
                        mainAxisSpacing: 20,
                      ),
                      itemCount: filteredCourses.length,
                      itemBuilder: (context, index) {
                        final course = filteredCourses[index];
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
                                // Color banner with Instructor Badge
                                Stack(
                                  children: [
                                    Container(
                                      height: 100,
                                      decoration: BoxDecoration(
                                        color: bannerColor,
                                        borderRadius: const BorderRadius.only(
                                          topLeft: Radius.circular(11),
                                          topRight: Radius.circular(11),
                                        ),
                                      ),
                                    ),
                                    Positioned(
                                      top: 10,
                                      right: 10,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.9),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Text(
                                          'Instructor',
                                          style: TextStyle(
                                            color: Colors.black87,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        course.title,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
                                            '${course.enrolledCount} students',
                                            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          CircleAvatar(
                                            radius: 10,
                                            backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.15),
                                            child: Text(
                                              user?.firstName.isNotEmpty == true ? user!.firstName[0].toUpperCase() : 'A',
                                              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            user?.fullName ?? 'Aliyu Garba',
                                            style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.black87, fontSize: 12, fontWeight: FontWeight.w500),
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
