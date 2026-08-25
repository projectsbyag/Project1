import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../models/assignment_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../widgets/dialogs.dart';
import 'assignment_detail_view.dart';

class AssignmentListView extends StatefulWidget {
  const AssignmentListView({super.key});

  @override
  State<AssignmentListView> createState() => _AssignmentListViewState();
}

class _AssignmentListViewState extends State<AssignmentListView> {
  int _selectedTab = 0; // 0: Active, 1: Past Due
  String _selectedCourse = 'all';

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isInstructor = user?.role == 'instructor' || user?.role == 'admin';
    final now = DateTime.now();

    final allAssignments = dataProvider.assignments.isNotEmpty
        ? dataProvider.assignments
        : [
            AssignmentModel(
              id: 'a1',
              title: 'First Assignment',
              description: 'Calculus and limits exercises',
              courseId: 'c1',
              courseTitle: 'MTH101',
              dueDate: DateTime(2026, 8, 6, 14, 4),
              maxPoints: 100,
            ),
          ];

    // Filter by selected course
    final filteredAssignments = allAssignments.where((a) {
      if (_selectedCourse == 'all') return true;
      return a.courseId == _selectedCourse || a.courseTitle == _selectedCourse;
    }).toList();

    // Group into Active and Past Due
    final activeAssignments = filteredAssignments.where((a) => !a.dueDate.isBefore(now)).toList();
    final pastDueAssignments = filteredAssignments.where((a) => a.dueDate.isBefore(now)).toList();

    // Sort: Active by nearest due date first, Past Due by most recent first
    activeAssignments.sort((a, b) => a.dueDate.compareTo(b.dueDate));
    pastDueAssignments.sort((a, b) => b.dueDate.compareTo(a.dueDate));

    final currentList = _selectedTab == 0 ? activeAssignments : pastDueAssignments;

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
                'Assignments',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Row(
                children: [
                  Container(
                    height: 38,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedCourse,
                        style: TextStyle(fontSize: 13, color: isDark ? Colors.white : Colors.black87),
                        dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                        items: [
                          const DropdownMenuItem(value: 'all', child: Text('All Courses')),
                          ...dataProvider.courses.map((c) => DropdownMenuItem(
                                value: c.id,
                                child: Text('${c.code} - ${c.title}'),
                              )),
                          if (dataProvider.courses.isEmpty)
                            const DropdownMenuItem(value: 'c1', child: Text('MTH101 - Maths 101')),
                        ],
                        onChanged: (val) => setState(() => _selectedCourse = val ?? 'all'),
                      ),
                    ),
                  ),
                  if (isInstructor) ...[
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () => Dialogs.showNewAssignmentDialog(context),
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('New Assignment'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Tabs Row
          Row(
            children: [
              _buildTab('Active (${activeAssignments.length})', 0, isDark),
              const SizedBox(width: 24),
              _buildTab('Past Due (${pastDueAssignments.length})', 1, isDark),
            ],
          ),
          Divider(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300, height: 1),
          const SizedBox(height: 24),

          // Assignments Table Card
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
                  _selectedTab == 0 ? 'Active Assignments' : 'Past Due Assignments',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 16),

                // Table Header Row
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFF3F4F6))),
                  ),
                  child: const Row(
                    children: [
                      Expanded(flex: 3, child: Text('ASSIGNMENT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 2, child: Text('COURSE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 3, child: Text('DUE DATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 2, child: Text('STATUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 1, child: Text('ACTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                    ],
                  ),
                ),

                // Table Data Rows
                currentList.isEmpty
                    ? Container(
                        padding: const EdgeInsets.all(32),
                        alignment: Alignment.center,
                        child: Text(
                          _selectedTab == 0 ? 'No active assignments.' : 'No past due assignments.',
                          style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500, fontSize: 14),
                        ),
                      )
                    : Column(
                        children: currentList.map((assignment) {
                          final isPastDue = assignment.dueDate.isBefore(now);
                          final diff = assignment.dueDate.difference(now);
                          final daysLeft = diff.inDays;
                          final hoursLeft = diff.inHours;

                          String timeRemainingText;
                          if (isPastDue) {
                            timeRemainingText = 'Past due';
                          } else if (daysLeft == 0) {
                            timeRemainingText = hoursLeft > 0 ? '$hoursLeft hours left' : 'Due today';
                          } else if (daysLeft == 1) {
                            timeRemainingText = '1 day left';
                          } else {
                            timeRemainingText = '$daysLeft days left';
                          }

                          String statusText;
                          Color badgeBg;
                          Color badgeText;

                          if (isPastDue) {
                            statusText = 'Past Due';
                            badgeBg = isDark ? const Color(0xFF7F1D1D).withValues(alpha: 0.3) : const Color(0xFFFEE2E2);
                            badgeText = isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626);
                          } else if (daysLeft <= 1) {
                            statusText = 'Due Soon';
                            badgeBg = isDark ? const Color(0xFF7C2D12).withValues(alpha: 0.3) : const Color(0xFFFFEDD5);
                            badgeText = isDark ? const Color(0xFFFDBA74) : const Color(0xFFEA580C);
                          } else {
                            statusText = 'Upcoming';
                            badgeBg = isDark ? const Color(0xFF1E1B4B).withValues(alpha: 0.4) : const Color(0xFFEEF2FF);
                            badgeText = isDark ? const Color(0xFFA5B4FC) : AppTheme.primaryColor;
                          }

                          final formattedDate = DateFormat('MMM d, yyyy, hh:mm a').format(assignment.dueDate);

                          return Container(
                            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                            decoration: BoxDecoration(
                              border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFF3F4F6))),
                            ),
                            child: Row(
                              children: [
                                // ASSIGNMENT
                                Expanded(
                                  flex: 3,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        assignment.title,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                          color: isDark ? Colors.white : Colors.black87,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text('${assignment.maxPoints} points', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                // COURSE
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    assignment.courseTitle.isNotEmpty ? assignment.courseTitle : 'MTH101',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: isDark ? Colors.grey.shade300 : Colors.black87,
                                    ),
                                  ),
                                ),
                                // DUE DATE
                                Expanded(
                                  flex: 3,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        formattedDate,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w500,
                                          fontSize: 13,
                                          color: isDark ? Colors.grey.shade300 : Colors.black87,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        timeRemainingText,
                                        style: TextStyle(
                                          color: isPastDue ? (isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626)) : Colors.grey.shade500,
                                          fontSize: 11,
                                          fontWeight: isPastDue ? FontWeight.w500 : FontWeight.normal,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // STATUS
                                Expanded(
                                  flex: 2,
                                  child: Container(
                                    alignment: Alignment.centerLeft,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: badgeBg,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        statusText,
                                        style: TextStyle(
                                          color: badgeText,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                // ACTIONS
                                Expanded(
                                  flex: 1,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => AssignmentDetailView(assignment: assignment),
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primaryColor,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                    ),
                                    child: const Text('View', style: TextStyle(fontSize: 12)),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
              ],
            ),
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
                color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.grey.shade400 : Colors.grey.shade500),
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
