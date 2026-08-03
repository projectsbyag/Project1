import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../models/assignment_model.dart';
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
  String _selectedCourse = 'All Courses';

  @override
  Widget build(BuildContext context) {
    final dataProvider = Provider.of<DataProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final displayAssignments = dataProvider.assignments.isNotEmpty
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
                        items: const [
                          DropdownMenuItem(value: 'All Courses', child: Text('All Courses')),
                          DropdownMenuItem(value: 'MTH101', child: Text('Maths 101')),
                        ],
                        onChanged: (val) => setState(() => _selectedCourse = val ?? 'All Courses'),
                      ),
                    ),
                  ),
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
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Tabs Row
          Row(
            children: [
              _buildTab('Active (${displayAssignments.length})', 0, isDark),
              const SizedBox(width: 24),
              _buildTab('Past Due (0)', 1, isDark),
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
                  child: Row(
                    children: const [
                      Expanded(flex: 3, child: Text('ASSIGNMENT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 2, child: Text('COURSE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 3, child: Text('DUE DATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 2, child: Text('STATUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                      Expanded(flex: 1, child: Text('ACTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey))),
                    ],
                  ),
                ),

                // Table Data Rows
                _selectedTab == 1
                    ? Container(
                        padding: const EdgeInsets.all(24),
                        alignment: Alignment.center,
                        child: Text('No past due assignments.', style: TextStyle(color: Colors.grey.shade500)),
                      )
                    : Column(
                        children: displayAssignments.map((assignment) {
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
                                      Text(assignment.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                  ),
                                ),
                                // DUE DATE
                                Expanded(
                                  flex: 3,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(formattedDate, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                                      const SizedBox(height: 2),
                                      Text('8 days left', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
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
                                        color: const Color(0xFFEEF2FF),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Text(
                                        'Upcoming',
                                        style: TextStyle(
                                          color: AppTheme.primaryColor,
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
                color: isSelected ? AppTheme.primaryColor : Colors.grey.shade500,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ),
          Container(
            height: 2,
            width: 80,
            color: isSelected ? AppTheme.primaryColor : Colors.transparent,
          ),
        ],
      ),
    );
  }
}
