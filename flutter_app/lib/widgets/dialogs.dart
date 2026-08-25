import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/api_endpoints.dart';
import '../config/app_theme.dart';
import '../models/course_model.dart';
import '../providers/data_provider.dart';
import '../services/api_service.dart';

class Dialogs {
  // Show Course Enrollment Dialog for Students
  static void showEnrollCourseDialog(BuildContext context, {CourseModel? course, VoidCallback? onEnrolled}) {
    showDialog(
      context: context,
      builder: (ctx) => _EnrollCourseDialog(course: course, onEnrolled: onEnrolled),
    );
  }

  // Show Create Course Dialog for Instructors
  static void showCreateCourseDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _CreateCourseDialog(),
    );
  }

  // Show New Assignment Dialog for Instructors
  static void showNewAssignmentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _NewAssignmentDialog(),
    );
  }

  // Show Upload Resource Dialog for Instructors
  static void showUploadResourceDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _UploadResourceDialog(),
    );
  }

  // Show Start Discussion Dialog
  static void showStartDiscussionDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _StartDiscussionDialog(),
    );
  }

  // Show Create Announcement Dialog for Instructors
  static void showCreateAnnouncementDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _CreateAnnouncementDialog(),
    );
  }
}

// 1. ENROLL COURSE DIALOG (STUDENT)
class _EnrollCourseDialog extends StatefulWidget {
  final CourseModel? course;
  final VoidCallback? onEnrolled;

  const _EnrollCourseDialog({this.course, this.onEnrolled});

  @override
  State<_EnrollCourseDialog> createState() => _EnrollCourseDialogState();
}

class _EnrollCourseDialogState extends State<_EnrollCourseDialog> {
  final _codeController = TextEditingController();
  CourseModel? _selectedCourse;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedCourse = widget.course;
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _enroll() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      setState(() => _errorMessage = 'Please enter the enrollment code.');
      return;
    }

    if (_selectedCourse == null) {
      setState(() => _errorMessage = 'Please select a course to enroll in.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.enrollCourse,
        {
          'courseId': _selectedCourse!.id,
          'enrollmentCode': code,
        },
      );

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchCourses();
        Navigator.of(context).pop();
        if (widget.onEnrolled != null) widget.onEnrolled!();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully enrolled in course!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dataProvider = Provider.of<DataProvider>(context, listen: false);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 480,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Enroll in Course',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (widget.course != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        widget.course!.code,
                        style: const TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        widget.course!.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ] else if (dataProvider.courses.isNotEmpty) ...[
              Text(
                'Select Course',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
                ),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<CourseModel>(
                initialValue: _selectedCourse ?? dataProvider.courses.first,
                dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: dataProvider.courses.map((c) {
                  return DropdownMenuItem(
                    value: c,
                    child: Text('${c.code} - ${c.title}'),
                  );
                }).toList(),
                onChanged: (c) => setState(() => _selectedCourse = c),
              ),
              const SizedBox(height: 16),
            ],
            Text(
              'Enrollment Code *',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _codeController,
              decoration: InputDecoration(
                hintText: 'Enter the 6-character course code',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _enroll,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Enroll'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 2. CREATE COURSE DIALOG (INSTRUCTOR)
class _CreateCourseDialog extends StatefulWidget {
  const _CreateCourseDialog();

  @override
  State<_CreateCourseDialog> createState() => _CreateCourseDialogState();
}

class _CreateCourseDialogState extends State<_CreateCourseDialog> {
  final _nameController = TextEditingController();
  final _codeController = TextEditingController();
  final _descController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final name = _nameController.text.trim();
    final code = _codeController.text.trim();
    final description = _descController.text.trim();

    if (name.isEmpty || code.isEmpty) {
      setState(() => _errorMessage = 'Course name and code are required.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.courses,
        {
          'name': name,
          'code': code,
          'description': description,
        },
      );

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchCourses();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Course created successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 520,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Create New Course',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildLabel('Course Name *', isDark),
            const SizedBox(height: 6),
            TextField(
              controller: _nameController,
              decoration: _inputDecoration(isDark, 'e.g. Introduction to Calculus'),
            ),
            const SizedBox(height: 16),
            _buildLabel('Course Code *', isDark),
            const SizedBox(height: 6),
            TextField(
              controller: _codeController,
              decoration: _inputDecoration(isDark, 'e.g. MTH101'),
            ),
            const SizedBox(height: 16),
            _buildLabel('Description', isDark),
            const SizedBox(height: 6),
            TextField(
              controller: _descController,
              maxLines: 3,
              decoration: _inputDecoration(isDark, 'Enter course description...'),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _create,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Create Course'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text, bool isDark) {
    return Text(
      text,
      style: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 13,
        color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
      ),
    );
  }

  InputDecoration _inputDecoration(bool isDark, String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    );
  }
}

// 3. NEW ASSIGNMENT DIALOG (INSTRUCTOR)
class _NewAssignmentDialog extends StatefulWidget {
  const _NewAssignmentDialog();

  @override
  State<_NewAssignmentDialog> createState() => _NewAssignmentDialogState();
}

class _NewAssignmentDialogState extends State<_NewAssignmentDialog> {
  final _titleController = TextEditingController();
  final _pointsController = TextEditingController(text: '100');
  final _descController = TextEditingController();
  CourseModel? _selectedCourse;
  DateTime _dueDate = DateTime.now().add(const Duration(days: 7));
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _titleController.dispose();
    _pointsController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final title = _titleController.text.trim();
    final points = int.tryParse(_pointsController.text.trim()) ?? 100;
    final description = _descController.text.trim();

    if (title.isEmpty) {
      setState(() => _errorMessage = 'Assignment title is required.');
      return;
    }

    if (_selectedCourse == null) {
      setState(() => _errorMessage = 'Please select a course.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.assignments,
        {
          'title': title,
          'course': _selectedCourse!.id,
          'pointsPossible': points,
          'dueDate': _dueDate.toIso8601String(),
          'instructions': description,
        },
      );

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchAssignments();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Assignment created successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dataProvider = Provider.of<DataProvider>(context, listen: false);

    if (_selectedCourse == null && dataProvider.courses.isNotEmpty) {
      _selectedCourse = dataProvider.courses.first;
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 520,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'New Assignment',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (dataProvider.courses.isNotEmpty) ...[
              Text(
                'Course *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<CourseModel>(
                initialValue: _selectedCourse,
                dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: dataProvider.courses.map((c) => DropdownMenuItem(value: c, child: Text('${c.code} - ${c.title}'))).toList(),
                onChanged: (c) => setState(() => _selectedCourse = c),
              ),
              const SizedBox(height: 14),
            ],
            Text(
              'Assignment Title *',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: 'e.g. Calculus Problem Set 1',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Points Possible', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _pointsController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Due Date', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: _dueDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (picked != null) {
                            setState(() => _dueDate = picked);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: isDark ? const Color(0xFF4B5563) : const Color(0xFFD1D5DB)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${_dueDate.month}/${_dueDate.day}/${_dueDate.year}'),
                              const Icon(Icons.calendar_today, size: 16),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              'Instructions / Description',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _descController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Enter assignment instructions...',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _create,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Create Assignment'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 4. UPLOAD RESOURCE DIALOG (INSTRUCTOR)
class _UploadResourceDialog extends StatefulWidget {
  const _UploadResourceDialog();

  @override
  State<_UploadResourceDialog> createState() => _UploadResourceDialogState();
}

class _UploadResourceDialogState extends State<_UploadResourceDialog> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _urlController = TextEditingController();
  CourseModel? _selectedCourse;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _upload() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _errorMessage = 'Resource title is required.');
      return;
    }
    if (_selectedCourse == null) {
      setState(() => _errorMessage = 'Please select a course.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.resources,
        {
          'title': title,
          'course': _selectedCourse!.id,
          'description': _descController.text.trim(),
          'type': 'link',
          'url': _urlController.text.trim().isNotEmpty ? _urlController.text.trim() : 'https://virtualcampus.edu',
        },
      );

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchResources();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Resource uploaded successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dataProvider = Provider.of<DataProvider>(context, listen: false);

    if (_selectedCourse == null && dataProvider.courses.isNotEmpty) {
      _selectedCourse = dataProvider.courses.first;
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Upload Resource',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (dataProvider.courses.isNotEmpty) ...[
              Text(
                'Course *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<CourseModel>(
                initialValue: _selectedCourse,
                dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: dataProvider.courses.map((c) => DropdownMenuItem(value: c, child: Text('${c.code} - ${c.title}'))).toList(),
                onChanged: (c) => setState(() => _selectedCourse = c),
              ),
              const SizedBox(height: 14),
            ],
            Text('Resource Title *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: 'e.g. Chapter 1 Lecture Notes',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 14),
            Text('Resource Link / URL', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _urlController,
              decoration: InputDecoration(
                hintText: 'https://...',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 14),
            Text('Description', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _descController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'Optional description...',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _upload,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Upload Resource'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 5. START DISCUSSION DIALOG
class _StartDiscussionDialog extends StatefulWidget {
  const _StartDiscussionDialog();

  @override
  State<_StartDiscussionDialog> createState() => _StartDiscussionDialogState();
}

class _StartDiscussionDialogState extends State<_StartDiscussionDialog> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  CourseModel? _selectedCourse;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _post() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.isEmpty || content.isEmpty) {
      setState(() => _errorMessage = 'Title and content are required.');
      return;
    }
    if (_selectedCourse == null) {
      setState(() => _errorMessage = 'Please select a course.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.discussions,
        {
          'title': title,
          'content': content,
          'course': _selectedCourse!.id,
          'category': 'General',
        },
      );

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchDiscussions();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Discussion posted successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dataProvider = Provider.of<DataProvider>(context, listen: false);

    if (_selectedCourse == null && dataProvider.courses.isNotEmpty) {
      _selectedCourse = dataProvider.courses.first;
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 520,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Start Discussion',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (dataProvider.courses.isNotEmpty) ...[
              Text(
                'Course *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<CourseModel>(
                initialValue: _selectedCourse,
                dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: dataProvider.courses.map((c) => DropdownMenuItem(value: c, child: Text('${c.code} - ${c.title}'))).toList(),
                onChanged: (c) => setState(() => _selectedCourse = c),
              ),
              const SizedBox(height: 14),
            ],
            Text('Discussion Title *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: 'What is this discussion about?',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 14),
            Text('Content *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _contentController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Write your thoughts or questions here...',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _post,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Post Discussion'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 6. CREATE ANNOUNCEMENT DIALOG (INSTRUCTOR)
class _CreateAnnouncementDialog extends StatefulWidget {
  const _CreateAnnouncementDialog();

  @override
  State<_CreateAnnouncementDialog> createState() => _CreateAnnouncementDialogState();
}

class _CreateAnnouncementDialogState extends State<_CreateAnnouncementDialog> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  CourseModel? _selectedCourse;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.isEmpty || content.isEmpty) {
      setState(() => _errorMessage = 'Title and content are required.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.announcements,
        {
          'title': title,
          'content': content,
          if (_selectedCourse != null) 'course': _selectedCourse!.id,
          'category': 'Notice',
        },
      );

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchAnnouncements();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Announcement posted successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dataProvider = Provider.of<DataProvider>(context, listen: false);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 500,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'New Announcement',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (dataProvider.courses.isNotEmpty) ...[
              Text(
                'Course (Optional)',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<CourseModel?>(
                initialValue: _selectedCourse,
                dropdownColor: isDark ? AppTheme.darkSurface : Colors.white,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('All Courses / Campus Wide')),
                  ...dataProvider.courses.map((c) => DropdownMenuItem(value: c, child: Text('${c.code} - ${c.title}'))),
                ],
                onChanged: (c) => setState(() => _selectedCourse = c),
              ),
              const SizedBox(height: 14),
            ],
            Text('Announcement Title *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: 'e.g. Class cancelled tomorrow',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 14),
            Text('Content *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.grey.shade300 : const Color(0xFF374151))),
            const SizedBox(height: 6),
            TextField(
              controller: _contentController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Enter announcement details...',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _create,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Post Announcement'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
