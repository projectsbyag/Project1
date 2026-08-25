import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../widgets/dialogs.dart';
import 'resource_detail_view.dart';

class ResourceLibraryView extends StatefulWidget {
  const ResourceLibraryView({super.key});

  @override
  State<ResourceLibraryView> createState() => _ResourceLibraryViewState();
}

class _ResourceLibraryViewState extends State<ResourceLibraryView> {
  String _selectedCategory = 'All Resources';
  String _selectedCourse = 'All Courses';
  String _sortBy = 'Recently Added';
  bool _allTypes = true;
  bool _files = false;
  bool _links = false;
  bool _text = false;

  final List<Map<String, dynamic>> _categories = [
    {'name': 'All Resources', 'count': 0},
    {'name': 'Lecture Materials', 'count': 0},
    {'name': 'Reading Materials', 'count': 0},
    {'name': 'Practice Exercises', 'count': 0},
    {'name': 'Assignment Materials', 'count': 0},
    {'name': 'Tutorial Videos', 'count': 0},
    {'name': 'Other Resources', 'count': 0},
  ];

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dataProvider = Provider.of<DataProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isInstructor = user?.role == 'instructor' || user?.role == 'admin';

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
                'Resources',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              if (isInstructor)
                ElevatedButton.icon(
                  onPressed: () => Dialogs.showUploadResourceDialog(context),
                  icon: const Icon(Icons.upload, size: 18),
                  label: const Text('Upload Resource'),
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

          // Two-Column Layout
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 850;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: Filter Sidebar
                  SizedBox(
                    width: isWide ? 260 : double.infinity,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurface : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Filter Resources', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 38,
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: 'Search resources...',
                                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                                prefixIcon: const Icon(Icons.search, size: 16),
                                fillColor: isDark ? AppTheme.darkBackground : const Color(0xFFF9FAFB),
                                contentPadding: EdgeInsets.zero,
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(6),
                                  borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // CATEGORIES
                          const Text('CATEGORIES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 8),
                          Column(
                            children: _categories.map((cat) {
                              final isSelected = _selectedCategory == cat['name'];
                              return InkWell(
                                onTap: () => setState(() => _selectedCategory = cat['name']),
                                borderRadius: BorderRadius.circular(6),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  margin: const EdgeInsets.only(bottom: 2),
                                  decoration: BoxDecoration(
                                    color: isSelected ? (isDark ? const Color(0xFF334155) : const Color(0xFFEEF2FF)) : Colors.transparent,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        cat['name'],
                                        style: TextStyle(
                                          color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
                                          fontSize: 13,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                        ),
                                      ),
                                      Text(
                                        '${cat['count']}',
                                        style: TextStyle(
                                          color: isSelected ? AppTheme.primaryColor : Colors.grey.shade500,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 16),

                          // COURSES
                          const Text('COURSES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 6),
                          Container(
                            height: 38,
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: isDark ? AppTheme.darkBackground : Colors.white,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                isExpanded: true,
                                value: _selectedCourse,
                                style: TextStyle(fontSize: 13, color: isDark ? Colors.white : Colors.black87),
                                items: const [
                                  DropdownMenuItem(value: 'All Courses', child: Text('All Courses')),
                                  DropdownMenuItem(value: 'Maths 101', child: Text('Maths 101')),
                                  DropdownMenuItem(value: 'Intro To Cyber Security', child: Text('Intro To Cyber Security')),
                                ],
                                onChanged: (val) => setState(() => _selectedCourse = val ?? 'All Courses'),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // RESOURCE TYPE
                          const Text('RESOURCE TYPE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 4),
                          _buildCheckbox('All Types', _allTypes, (v) => setState(() => _allTypes = v!)),
                          _buildCheckbox('Files', _files, (v) => setState(() => _files = v!)),
                          _buildCheckbox('Links', _links, (v) => setState(() => _links = v!)),
                          _buildCheckbox('Text', _text, (v) => setState(() => _text = v!)),
                          const SizedBox(height: 16),

                          // SORT BY
                          const Text('SORT BY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 6),
                          Container(
                            height: 38,
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: isDark ? AppTheme.darkBackground : Colors.white,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                isExpanded: true,
                                value: _sortBy,
                                style: TextStyle(fontSize: 13, color: isDark ? Colors.white : Colors.black87),
                                items: const [
                                  DropdownMenuItem(value: 'Recently Added', child: Text('Recently Added')),
                                  DropdownMenuItem(value: 'Title', child: Text('Title')),
                                ],
                                onChanged: (val) => setState(() => _sortBy = val ?? 'Recently Added'),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                  // Right Column: Main Content Container (Empty state or items list)
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: dataProvider.resources.isEmpty
                        ? Container(
                            height: 320,
                            padding: const EdgeInsets.all(32),
                            decoration: BoxDecoration(
                              color: isDark ? AppTheme.darkSurface : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CircleAvatar(
                                  radius: 28,
                                  backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFF3F4F6),
                                  child: Icon(Icons.insert_drive_file, color: Colors.grey.shade600, size: 28),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No Resources Found',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'No resources match your current filters.',
                                  style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                                ),
                                const SizedBox(height: 20),
                                ElevatedButton(
                                  onPressed: () => Dialogs.showUploadResourceDialog(context),
                                  child: const Text('Upload First Resource'),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            itemCount: dataProvider.resources.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final resource = dataProvider.resources[index];
                              return Card(
                                child: ListTile(
                                    title: Text(resource.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text('${resource.category} • Uploaded by ${resource.uploaderName}'),
                                    trailing: const Icon(Icons.download_rounded, color: AppTheme.primaryColor),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => ResourceDetailView(resource: resource),
                                        ),
                                      );
                                    },
                                  ),
                              );
                            },
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

  Widget _buildCheckbox(String label, bool value, ValueChanged<bool?> onChanged) {
    return SizedBox(
      height: 30,
      child: Row(
        children: [
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: value,
              activeColor: AppTheme.primaryColor,
              onChanged: onChanged,
            ),
          ),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 13)),
        ],
      ),
    );
  }
}
