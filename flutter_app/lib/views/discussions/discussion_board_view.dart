import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../models/discussion_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../widgets/dialogs.dart';
import 'discussion_detail_view.dart';

class DiscussionBoardView extends StatefulWidget {
  const DiscussionBoardView({super.key});

  @override
  State<DiscussionBoardView> createState() => _DiscussionBoardViewState();
}

class _DiscussionBoardViewState extends State<DiscussionBoardView> {
  String _selectedFilter = 'All';
  String _selectedCourse = 'All Courses';
  String _sortBy = 'Sort: Latest';

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
              createdAt: DateTime.now().subtract(const Duration(minutes: 18)),
            ),
          ];

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
                'Discussions',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Row(
                children: [
                  SizedBox(
                    height: 38,
                    width: 220,
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search discussions...',
                        hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                        prefixIcon: const Icon(Icons.search, size: 16),
                        fillColor: isDark ? AppTheme.darkSurface : Colors.white,
                        contentPadding: EdgeInsets.zero,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(6),
                          borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: () => Dialogs.showStartDiscussionDialog(context),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Start New Discussion'),
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
          const SizedBox(height: 24),

          // Two-Column Layout
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 850;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: Main Discussions List Card
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurface : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Filters Bar
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: ['All', 'Unread', 'My Posts'].map((filter) {
                                  final isSelected = _selectedFilter == filter;
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: InkWell(
                                      onTap: () => setState(() => _selectedFilter = filter),
                                      borderRadius: BorderRadius.circular(6),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: isSelected ? AppTheme.primaryColor : (isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB)),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          filter,
                                          style: TextStyle(
                                            color: isSelected ? Colors.white : (isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
                                            fontSize: 13,
                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              Row(
                                children: [
                                  Container(
                                    height: 34,
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: _selectedCourse,
                                        style: TextStyle(fontSize: 12, color: isDark ? Colors.white : Colors.black87),
                                        items: const [
                                          DropdownMenuItem(value: 'All Courses', child: Text('All Courses')),
                                          DropdownMenuItem(value: 'MTH101', child: Text('Maths 101')),
                                        ],
                                        onChanged: (v) => setState(() => _selectedCourse = v ?? 'All Courses'),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    height: 34,
                                    padding: const EdgeInsets.symmetric(horizontal: 8),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<String>(
                                        value: _sortBy,
                                        style: TextStyle(fontSize: 12, color: isDark ? Colors.white : Colors.black87),
                                        items: const [
                                          DropdownMenuItem(value: 'Sort: Latest', child: Text('Sort: Latest')),
                                          DropdownMenuItem(value: 'Sort: Popular', child: Text('Sort: Popular')),
                                        ],
                                        onChanged: (v) => setState(() => _sortBy = v ?? 'Sort: Latest'),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // Discussion Cards List
                          Column(
                            children: displayDiscussions.map((discussion) {
                              return Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          discussion.title,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                        ),
                                        Row(
                                          children: [
                                            Icon(Icons.chat_bubble_outline_rounded, size: 14, color: Colors.grey.shade500),
                                            const SizedBox(width: 4),
                                            Text('${discussion.commentCount} replies', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
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
                                        const SizedBox(width: 8),
                                        Text(
                                          '• Started by ${discussion.authorName} • 18 minutes ago',
                                          style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    InkWell(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => DiscussionDetailView(discussion: discussion),
                                          ),
                                        );
                                      },
                                      child: const Text(
                                        'Discuss',
                                        style: TextStyle(
                                          color: AppTheme.primaryColor,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
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
                  ),
                  if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                  // Right Column: Side Cards (Popular Discussions & My Activity)
                  SizedBox(
                    width: isWide ? 280 : double.infinity,
                    child: Column(
                      children: [
                        // Popular Discussions Card
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
                              const Text('Popular Discussions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 12),
                              Text('No popular discussions yet.', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // My Activity Card
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
                              const Text('My Activity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 12),
                              Text('My Discussions: 1', style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.black87, fontSize: 13, fontWeight: FontWeight.w500)),
                              const SizedBox(height: 4),
                              Text('Total Replies: 0', style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.black87, fontSize: 13, fontWeight: FontWeight.w500)),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () {},
                                  child: const Text('View My Discussions'),
                                ),
                              ),
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
}
