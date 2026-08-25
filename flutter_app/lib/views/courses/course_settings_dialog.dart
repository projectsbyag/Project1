import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/api_endpoints.dart';
import '../../config/app_theme.dart';
import '../../models/course_link_model.dart';
import '../../models/course_model.dart';
import '../../providers/data_provider.dart';
import '../../services/api_service.dart';

class CourseSettingsDialog {
  static const List<String> availableColors = [
    '#5D5CDE', // Default blue-purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  static Color parseHexColor(String? hexString, {Color defaultColor = const Color(0xFF5D5CDE)}) {
    if (hexString == null || hexString.isEmpty) return defaultColor;
    try {
      final cleanHex = hexString.replaceAll('#', '').trim();
      if (cleanHex.length == 6) {
        return Color(int.parse('FF$cleanHex', radix: 16));
      } else if (cleanHex.length == 8) {
        return Color(int.parse(cleanHex, radix: 16));
      }
    } catch (_) {}
    return defaultColor;
  }

  static void showSettingsModal(
    BuildContext context, {
    required CourseModel course,
    required Function(CourseModel updatedCourse) onCourseUpdated,
    required VoidCallback onCourseDeleted,
  }) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => _MainSettingsDialog(
        course: course,
        onCourseUpdated: onCourseUpdated,
        onCourseDeleted: onCourseDeleted,
      ),
    );
  }
}

class _MainSettingsDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseModel) onCourseUpdated;
  final VoidCallback onCourseDeleted;

  const _MainSettingsDialog({
    required this.course,
    required this.onCourseUpdated,
    required this.onCourseDeleted,
  });

  @override
  State<_MainSettingsDialog> createState() => _MainSettingsDialogState();
}

class _MainSettingsDialogState extends State<_MainSettingsDialog> {
  late CourseModel _currentCourse;

  @override
  void initState() {
    super.initState();
    _currentCourse = widget.course;
  }

  void _updateCourse(CourseModel updated) {
    setState(() {
      _currentCourse = updated;
    });
    widget.onCourseUpdated(updated);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Container(
        width: 650,
        constraints: const BoxConstraints(maxHeight: 700),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Modal Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Course Settings',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  onPressed: () => Navigator.of(context).pop(),
                  tooltip: 'Close',
                ),
              ],
            ),
            const Divider(height: 24),
            Expanded(
              child: ListView(
                children: [
                  _buildSettingOption(
                    context: context,
                    title: 'Course Appearance',
                    subtitle: 'Customize how your course looks',
                    buttonLabel: 'Edit',
                    isDark: isDark,
                    onTap: () => _showAppearanceModal(context),
                  ),
                  _buildDivider(isDark),
                  _buildSettingOption(
                    context: context,
                    title: 'Course Information',
                    subtitle: 'Update course name, code and description',
                    buttonLabel: 'Edit',
                    isDark: isDark,
                    onTap: () => _showInfoModal(context),
                  ),
                  _buildDivider(isDark),
                  _buildSettingOption(
                    context: context,
                    title: 'Enrollment Options',
                    subtitle: 'Manage enrollment code and course access',
                    buttonLabel: 'Edit',
                    isDark: isDark,
                    onTap: () => _showEnrollmentModal(context),
                  ),
                  _buildDivider(isDark),
                  _buildSettingOption(
                    context: context,
                    title: 'Course Links',
                    subtitle: 'View and manage all generated enrollment links',
                    buttonLabel: 'View Links',
                    isDark: isDark,
                    onTap: () => _showCourseLinksModal(context),
                  ),
                  _buildDivider(isDark),
                  _buildSettingOption(
                    context: context,
                    title: 'Manage Students',
                    subtitle: 'View, add or remove students',
                    buttonLabel: 'Manage',
                    isDark: isDark,
                    onTap: () => _showManageStudentsModal(context),
                  ),
                  _buildDivider(isDark),
                  _buildSettingOption(
                    context: context,
                    title: 'Danger Zone',
                    subtitle: 'Archive or delete this course',
                    buttonLabel: 'Options',
                    isDark: isDark,
                    isDanger: true,
                    onTap: () => _showDangerZoneModal(context),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                  foregroundColor: isDark ? Colors.white : const Color(0xFF374151),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(
      height: 24,
      thickness: 1,
      color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
    );
  }

  Widget _buildSettingOption({
    required BuildContext context,
    required String title,
    required String subtitle,
    required String buttonLabel,
    required bool isDark,
    required VoidCallback onTap,
    bool isDanger = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDanger
                        ? (isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626))
                        : (isDark ? Colors.white : const Color(0xFF1F2937)),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          OutlinedButton(
            onPressed: onTap,
            style: OutlinedButton.styleFrom(
              foregroundColor: isDanger
                  ? (isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626))
                  : AppTheme.primaryColor,
              side: BorderSide(
                color: isDanger
                    ? (isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626))
                    : AppTheme.primaryColor,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text(buttonLabel, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  void _showAppearanceModal(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      builder: (ctx) => _CourseAppearanceDialog(
        course: _currentCourse,
        onUpdated: _updateCourse,
      ),
    );
  }

  void _showInfoModal(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      builder: (ctx) => _CourseInfoDialog(
        course: _currentCourse,
        onUpdated: _updateCourse,
      ),
    );
  }

  void _showEnrollmentModal(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      builder: (ctx) => _CourseEnrollmentDialog(
        course: _currentCourse,
        onUpdated: _updateCourse,
      ),
    );
  }

  void _showCourseLinksModal(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      builder: (ctx) => _CourseLinksDialog(course: _currentCourse),
    );
  }

  void _showManageStudentsModal(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      builder: (ctx) => _ManageStudentsDialog(
        course: _currentCourse,
        onUpdated: _updateCourse,
      ),
    );
  }

  void _showDangerZoneModal(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      builder: (ctx) => _DangerZoneDialog(
        course: _currentCourse,
        onUpdated: _updateCourse,
        onDeleted: () {
          Navigator.of(context).pop(); // Close Main Settings Dialog
          widget.onCourseDeleted();
        },
      ),
    );
  }
}

// 1. COURSE APPEARANCE DIALOG
class _CourseAppearanceDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseModel) onUpdated;

  const _CourseAppearanceDialog({required this.course, required this.onUpdated});

  @override
  State<_CourseAppearanceDialog> createState() => _CourseAppearanceDialogState();
}

class _CourseAppearanceDialogState extends State<_CourseAppearanceDialog> {
  late String _selectedColor;
  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedColor = widget.course.color ?? '#5D5CDE';
  }

  Future<void> _saveChanges() async {
    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      await ApiService.patch(
        ApiEndpoints.updateCourse(widget.course.id),
        {'color': _selectedColor},
      );

      final updatedCourse = widget.course.copyWith(color: _selectedColor);
      widget.onUpdated(updatedCourse);

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchCourses();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Course appearance updated successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isSaving = false;
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
                  'Course Appearance',
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
            Text(
              'Course Color',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.2,
              ),
              itemCount: CourseSettingsDialog.availableColors.length,
              itemBuilder: (context, index) {
                final hex = CourseSettingsDialog.availableColors[index];
                final color = CourseSettingsDialog.parseHexColor(hex);
                final isSelected = _selectedColor.toUpperCase() == hex.toUpperCase();

                return InkWell(
                  onTap: () {
                    setState(() {
                      _selectedColor = hex;
                    });
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(8),
                      border: isSelected
                          ? Border.all(color: Colors.white, width: 2)
                          : null,
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: color.withValues(alpha: 0.6),
                                blurRadius: 8,
                                spreadRadius: 2,
                              )
                            ]
                          : null,
                    ),
                    child: isSelected
                        ? const Icon(Icons.check, color: Colors.white, size: 20)
                        : null,
                  ),
                );
              },
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
                  onPressed: _isSaving ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isSaving ? null : _saveChanges,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Save Changes'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 2. COURSE INFO DIALOG
class _CourseInfoDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseModel) onUpdated;

  const _CourseInfoDialog({required this.course, required this.onUpdated});

  @override
  State<_CourseInfoDialog> createState() => _CourseInfoDialogState();
}

class _CourseInfoDialogState extends State<_CourseInfoDialog> {
  late TextEditingController _nameController;
  late TextEditingController _codeController;
  late TextEditingController _descController;
  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.course.title);
    _codeController = TextEditingController(text: widget.course.code);
    _descController = TextEditingController(text: widget.course.description);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    final name = _nameController.text.trim();
    final code = _codeController.text.trim();
    final description = _descController.text.trim();

    if (name.isEmpty || code.isEmpty) {
      setState(() {
        _errorMessage = 'Course name and code are required.';
      });
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      await ApiService.patch(
        ApiEndpoints.updateCourse(widget.course.id),
        {
          'name': name,
          'code': code,
          'description': description,
        },
      );

      final updated = widget.course.copyWith(
        title: name,
        code: code,
        description: description,
      );
      widget.onUpdated(updated);

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchCourses();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Course information updated successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isSaving = false;
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
        width: 550,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Course Information',
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
            _buildFieldLabel('Course Name *', isDark),
            const SizedBox(height: 6),
            TextField(
              controller: _nameController,
              decoration: _inputDecoration(isDark, 'Enter course name'),
            ),
            const SizedBox(height: 16),
            _buildFieldLabel('Course Code *', isDark),
            const SizedBox(height: 6),
            TextField(
              controller: _codeController,
              decoration: _inputDecoration(isDark, 'e.g. MTH101'),
            ),
            const SizedBox(height: 16),
            _buildFieldLabel('Course Description', isDark),
            const SizedBox(height: 6),
            TextField(
              controller: _descController,
              maxLines: 4,
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
                  onPressed: _isSaving ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isSaving ? null : _saveChanges,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Save Changes'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label, bool isDark) {
    return Text(
      label,
      style: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 14,
        color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
      ),
    );
  }

  InputDecoration _inputDecoration(bool isDark, String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: isDark ? const Color(0xFF4B5563) : const Color(0xFFD1D5DB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: isDark ? const Color(0xFF4B5563) : const Color(0xFFD1D5DB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    );
  }
}

// 3. ENROLLMENT OPTIONS DIALOG
class _CourseEnrollmentDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseModel) onUpdated;

  const _CourseEnrollmentDialog({required this.course, required this.onUpdated});

  @override
  State<_CourseEnrollmentDialog> createState() => _CourseEnrollmentDialogState();
}

class _CourseEnrollmentDialogState extends State<_CourseEnrollmentDialog> {
  late TextEditingController _codeController;
  late bool _allowEnrollment;
  bool _codeChanged = false;
  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _codeController = TextEditingController(text: widget.course.enrollmentCode ?? 'ABC123');
    _allowEnrollment = widget.course.allowEnrollment;
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _generateNewCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final random = Random();
    final newCode = String.fromCharCodes(
      Iterable.generate(6, (_) => chars.codeUnitAt(random.nextInt(chars.length))),
    );

    setState(() {
      _codeController.text = newCode;
      _codeChanged = true;
    });
  }

  Future<void> _saveChanges() async {
    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      final updateData = <String, dynamic>{
        'allowEnrollment': _allowEnrollment,
      };
      if (_codeChanged) {
        updateData['enrollmentCode'] = _codeController.text.trim();
      }

      await ApiService.patch(
        ApiEndpoints.updateCourse(widget.course.id),
        updateData,
      );

      final updated = widget.course.copyWith(
        allowEnrollment: _allowEnrollment,
        enrollmentCode: _codeController.text.trim(),
      );
      widget.onUpdated(updated);

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchCourses();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enrollment options updated successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isSaving = false;
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
        width: 550,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Enrollment Options',
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
            Text(
              'Current Enrollment Code',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _codeController,
                    readOnly: true,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: isDark ? const Color(0xFF4B5563) : const Color(0xFFD1D5DB)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.copy, color: AppTheme.primaryColor),
                  tooltip: 'Copy Enrollment Code',
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: _codeController.text));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Enrollment code copied to clipboard!')),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _generateNewCode,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Generate New Enrollment Code'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.primaryColor,
                side: const BorderSide(color: AppTheme.primaryColor),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Note: This will invalidate the current enrollment code. Students will need the new code to enroll.',
              style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
            ),
            const SizedBox(height: 16),
            Divider(color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB)),
            const SizedBox(height: 8),
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                'Allow new student enrollments',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: isDark ? Colors.white : const Color(0xFF1F2937),
                ),
              ),
              subtitle: Text(
                "If disabled, new students won't be able to enroll in this course, even with the enrollment code.",
                style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
              ),
              value: _allowEnrollment,
              activeColor: AppTheme.primaryColor,
              onChanged: (val) {
                setState(() {
                  _allowEnrollment = val ?? true;
                });
              },
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
                  onPressed: _isSaving ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isSaving ? null : _saveChanges,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Save Changes'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 4. COURSE LINKS DIALOG
class _CourseLinksDialog extends StatefulWidget {
  final CourseModel course;

  const _CourseLinksDialog({required this.course});

  @override
  State<_CourseLinksDialog> createState() => _CourseLinksDialogState();
}

class _CourseLinksDialogState extends State<_CourseLinksDialog> {
  List<CourseLinkModel> _links = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchLinks();
  }

  Future<void> _fetchLinks() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await ApiService.get(ApiEndpoints.courseLinks(widget.course.id));
      if (res['data'] != null && res['data']['courseLinks'] != null) {
        final list = (res['data']['courseLinks'] as List)
            .map((e) => CourseLinkModel.fromJson(e))
            .toList();
        setState(() {
          _links = list;
          _isLoading = false;
        });
      } else {
        setState(() {
          _links = [];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception:', '').trim();
        _isLoading = false;
      });
    }
  }

  void _openGenerateLinkModal() {
    showDialog(
      context: context,
      builder: (ctx) => _GenerateLinkDialog(
        course: widget.course,
        onGenerated: (newLink) {
          _fetchLinks();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 700,
        constraints: const BoxConstraints(maxHeight: 650),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Course Enrollment Links',
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
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Manage enrollment links for ${widget.course.title}',
                  style: TextStyle(
                    color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                    fontSize: 14,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _openGenerateLinkModal,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Generate New Link'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _errorMessage != null
                      ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))
                      : _links.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.link_off, size: 48, color: Colors.grey.shade400),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No enrollment links generated yet.',
                                    style: TextStyle(
                                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.separated(
                              itemCount: _links.length,
                              separatorBuilder: (context, index) => Divider(
                                color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                              ),
                              itemBuilder: (context, index) {
                                final link = _links[index];
                                final linkUrl = 'http://localhost:5000?join=${link.token}';
                                final isExpired = link.expiresAt != null && DateTime.now().isAfter(link.expiresAt!);

                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              decoration: BoxDecoration(
                                                color: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                                                borderRadius: BorderRadius.circular(6),
                                                border: Border.all(
                                                  color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                                                ),
                                              ),
                                              child: Text(
                                                linkUrl,
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
                                                  fontFamily: 'monospace',
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          IconButton(
                                            icon: const Icon(Icons.copy, color: AppTheme.primaryColor),
                                            tooltip: 'Copy Link',
                                            onPressed: () {
                                              Clipboard.setData(ClipboardData(text: linkUrl));
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(content: Text('Enrollment link copied to clipboard!')),
                                              );
                                            },
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          Text(
                                            'Expires: ${link.expiresAt != null ? DateFormat('MMM d, yyyy h:mm a').format(link.expiresAt!) : 'Never'}',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: isExpired ? Colors.red : (isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Text(
                                            'Uses: ${link.usedCount} / ${link.maxUses != null ? link.maxUses.toString() : 'Unlimited'}',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                  foregroundColor: isDark ? Colors.white : const Color(0xFF374151),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 5. GENERATE LINK DIALOG
class _GenerateLinkDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseLinkModel) onGenerated;

  const _GenerateLinkDialog({required this.course, required this.onGenerated});

  @override
  State<_GenerateLinkDialog> createState() => _GenerateLinkDialogState();
}

class _GenerateLinkDialogState extends State<_GenerateLinkDialog> {
  final _expiresInController = TextEditingController(text: '168');
  final _maxUsesController = TextEditingController();
  bool _isGenerating = false;
  String? _errorMessage;

  @override
  void dispose() {
    _expiresInController.dispose();
    _maxUsesController.dispose();
    super.dispose();
  }

  Future<void> _generateLink() async {
    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });

    try {
      final expiresIn = int.tryParse(_expiresInController.text.trim()) ?? 0;
      final maxUses = int.tryParse(_maxUsesController.text.trim());

      final body = <String, dynamic>{};
      if (expiresIn > 0) body['expiresIn'] = expiresIn;
      if (maxUses != null && maxUses > 0) body['maxUses'] = maxUses;

      final res = await ApiService.post(
        ApiEndpoints.courseLinks(widget.course.id),
        body,
      );

      if (res['data'] != null && res['data']['courseLink'] != null) {
        final link = CourseLinkModel.fromJson(res['data']['courseLink']);
        widget.onGenerated(link);

        if (mounted) {
          Navigator.of(context).pop();
          _showLinkSuccessDialog(link);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isGenerating = false;
        });
      }
    }
  }

  void _showLinkSuccessDialog(CourseLinkModel link) {
    final linkUrl = 'http://localhost:5000?join=${link.token}';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
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
                    'Course Link Generated',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF1F2937),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green.shade700, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Link generated successfully!',
                      style: TextStyle(
                        color: Colors.green.shade800,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Share this link with students:',
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 13,
                  color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      readOnly: true,
                      controller: TextEditingController(text: linkUrl),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.copy, color: AppTheme.primaryColor),
                    tooltip: 'Copy Link',
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: linkUrl));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Enrollment link copied to clipboard!')),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Expires: ${link.expiresAt != null ? DateFormat('MMM d, yyyy h:mm a').format(link.expiresAt!) : 'Never'}',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
              ),
              Text(
                'Max uses: ${link.maxUses != null ? link.maxUses.toString() : 'Unlimited'}',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
              ),
              const SizedBox(height: 20),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Done'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                  'Generate Enrollment Link',
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
            Text(
              'Expires in (hours)',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _expiresInController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'hours',
                  style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Default is 168 hours (7 days). Enter 0 for no expiration.',
              style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
            ),
            const SizedBox(height: 16),
            Text(
              'Maximum uses (optional)',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _maxUsesController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Unlimited',
                filled: true,
                fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Leave blank for unlimited uses.',
              style: TextStyle(fontSize: 12, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
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
                  onPressed: _isGenerating ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isGenerating ? null : _generateLink,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isGenerating
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Generate Link'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 6. MANAGE STUDENTS DIALOG
class _ManageStudentsDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseModel) onUpdated;

  const _ManageStudentsDialog({required this.course, required this.onUpdated});

  @override
  State<_ManageStudentsDialog> createState() => _ManageStudentsDialogState();
}

class _ManageStudentsDialogState extends State<_ManageStudentsDialog> {
  List<dynamic> _students = [];
  String _searchQuery = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiService.get(ApiEndpoints.courseDetails(widget.course.id));
      if (res['data'] != null && res['data']['course'] != null) {
        final courseData = res['data']['course'];
        final studentsList = courseData['students'] as List? ?? [];
        setState(() {
          _students = studentsList;
          _isLoading = false;
        });
      } else {
        setState(() {
          _students = widget.course.students;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _students = widget.course.students;
        _isLoading = false;
      });
    }
  }

  Future<void> _removeStudent(dynamic student) async {
    final studentId = student is Map ? (student['_id'] ?? student['id']) : student.toString();
    final studentName = student is Map
        ? '${student['firstName'] ?? ''} ${student['lastName'] ?? ''}'.trim()
        : 'Student';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Student'),
        content: Text('Are you sure you want to remove $studentName from this course?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ApiService.delete(
          ApiEndpoints.removeCourseStudent(widget.course.id, studentId),
        );

        setState(() {
          _students.removeWhere((s) {
            final sId = s is Map ? (s['_id'] ?? s['id']) : s.toString();
            return sId == studentId;
          });
        });

        final updatedCourse = widget.course.copyWith(
          enrolledCount: _students.length,
          students: _students,
        );
        widget.onUpdated(updatedCourse);

        if (mounted) {
          Provider.of<DataProvider>(context, listen: false).fetchCourses();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$studentName has been removed from the course.')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to remove student: $e')),
          );
        }
      }
    }
  }

  void _showAddStudentModal() {
    showDialog(
      context: context,
      builder: (ctx) => _AddStudentDialog(
        course: widget.course,
        onStudentAdded: () {
          _fetchStudents();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredStudents = _students.where((s) {
      if (_searchQuery.isEmpty) return true;
      if (s is Map) {
        final name = '${s['firstName'] ?? ''} ${s['lastName'] ?? ''}'.toLowerCase();
        final email = (s['email'] ?? '').toString().toLowerCase();
        return name.contains(_searchQuery.toLowerCase()) || email.contains(_searchQuery.toLowerCase());
      }
      return true;
    }).toList();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
      child: Container(
        width: 750,
        constraints: const BoxConstraints(maxHeight: 700),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Manage Students',
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
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_students.length} students enrolled',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
                  ),
                ),
                Row(
                  children: [
                    ElevatedButton.icon(
                      onPressed: _showAddStudentModal,
                      icon: const Icon(Icons.person_add, size: 16),
                      label: const Text('Add Student'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      width: 200,
                      height: 38,
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText: 'Search students...',
                          prefixIcon: const Icon(Icons.search, size: 18),
                          filled: true,
                          fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: isDark ? const Color(0xFF4B5563) : const Color(0xFFD1D5DB)),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 24),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filteredStudents.isEmpty
                      ? Center(
                          child: Text(
                            _students.isEmpty
                                ? 'No students enrolled in this course yet.'
                                : 'No students found matching "$_searchQuery".',
                            style: TextStyle(
                              color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                            ),
                          ),
                        )
                      : ListView.separated(
                          itemCount: filteredStudents.length,
                          separatorBuilder: (context, index) => Divider(
                            color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                          ),
                          itemBuilder: (context, index) {
                            final student = filteredStudents[index];
                            final firstName = student is Map ? (student['firstName'] ?? 'Student') : 'Student';
                            final lastName = student is Map ? (student['lastName'] ?? '') : '';
                            final fullName = '$firstName $lastName'.trim();
                            final email = student is Map ? (student['email'] ?? 'N/A') : 'N/A';

                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 18,
                                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.15),
                                    child: Text(
                                      fullName.isNotEmpty ? fullName[0].toUpperCase() : 'S',
                                      style: const TextStyle(
                                        color: AppTheme.primaryColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    flex: 3,
                                    child: Text(
                                      fullName,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                        color: isDark ? Colors.white : const Color(0xFF1F2937),
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    flex: 4,
                                    child: Text(
                                      email,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text(
                                      'Enrolled',
                                      style: TextStyle(
                                        color: Colors.green,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  TextButton.icon(
                                    onPressed: () => _removeStudent(student),
                                    icon: const Icon(Icons.person_remove, color: Colors.red, size: 16),
                                    label: const Text('Remove', style: TextStyle(color: Colors.red, fontSize: 12)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                  foregroundColor: isDark ? Colors.white : const Color(0xFF374151),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 7. ADD STUDENT DIALOG
class _AddStudentDialog extends StatefulWidget {
  final CourseModel course;
  final VoidCallback onStudentAdded;

  const _AddStudentDialog({required this.course, required this.onStudentAdded});

  @override
  State<_AddStudentDialog> createState() => _AddStudentDialogState();
}

class _AddStudentDialogState extends State<_AddStudentDialog> {
  final _emailController = TextEditingController();
  bool _isAdding = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _addStudent() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() {
        _errorMessage = 'Student email is required.';
      });
      return;
    }

    setState(() {
      _isAdding = true;
      _errorMessage = null;
    });

    try {
      await ApiService.post(
        ApiEndpoints.courseStudents(widget.course.id),
        {'email': email},
      );

      widget.onStudentAdded();

      if (mounted) {
        Provider.of<DataProvider>(context, listen: false).fetchCourses();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Student added to the course successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _isAdding = false;
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
        width: 450,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Add Student to Course',
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
            Text(
              'Student Email *',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isDark ? Colors.grey.shade300 : const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                hintText: "Enter student's email address",
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
                  onPressed: _isAdding ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isAdding ? null : _addStudent,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isAdding
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Add Student'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// 8. DANGER ZONE DIALOG
class _DangerZoneDialog extends StatefulWidget {
  final CourseModel course;
  final Function(CourseModel) onUpdated;
  final VoidCallback onDeleted;

  const _DangerZoneDialog({
    required this.course,
    required this.onUpdated,
    required this.onDeleted,
  });

  @override
  State<_DangerZoneDialog> createState() => _DangerZoneDialogState();
}

class _DangerZoneDialogState extends State<_DangerZoneDialog> {
  bool _isArchiving = false;
  bool _isDeleting = false;

  Future<void> _toggleArchive() async {
    final willArchive = !widget.course.isArchived;
    final action = willArchive ? 'archive' : 'unarchive';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${willArchive ? 'Archive' : 'Unarchive'} Course'),
        content: Text(
          willArchive
              ? 'Are you sure you want to archive ${widget.course.title}? This will make the course read-only.'
              : 'Are you sure you want to unarchive ${widget.course.title}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade700,
              foregroundColor: Colors.white,
            ),
            child: Text(willArchive ? 'Archive' : 'Unarchive'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() => _isArchiving = true);
      try {
        await ApiService.patch(
          ApiEndpoints.updateCourse(widget.course.id),
          {'isArchived': willArchive},
        );

        final updated = widget.course.copyWith(isArchived: willArchive);
        widget.onUpdated(updated);

        if (mounted) {
          Provider.of<DataProvider>(context, listen: false).fetchCourses();
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Course ${willArchive ? 'archived' : 'unarchived'} successfully!')),
          );
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isArchiving = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to $action course: $e')),
          );
        }
      }
    }
  }

  Future<void> _deleteCourse() async {
    final confirmText = 'DELETE ${widget.course.code}';
    final controller = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Course Permanently', style: TextStyle(color: Colors.red)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'This action is IRREVERSIBLE. All course data, assignments, discussions, and resources will be permanently deleted.',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 16),
            Text('To confirm, type "$confirmText" below:'),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: confirmText,
                border: const OutlineInputBorder(),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.trim() == confirmText) {
                Navigator.of(ctx).pop(true);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Confirmation text did not match.')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Permanently Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() => _isDeleting = true);
      try {
        await ApiService.delete(ApiEndpoints.deleteCourse(widget.course.id));

        if (mounted) {
          Provider.of<DataProvider>(context, listen: false).fetchCourses();
          Navigator.of(context).pop(); // Close Danger Zone dialog
          widget.onDeleted();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Course deleted successfully!')),
          );
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isDeleting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete course: $e')),
          );
        }
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
        width: 550,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Danger Zone',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Archive card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? Colors.red.shade900.withValues(alpha: 0.5) : Colors.red.shade200,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.course.isArchived ? 'Unarchive Course' : 'Archive Course',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Archiving a course will make it read-only for all students. No new submissions or discussions will be allowed.',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.grey.shade300 : const Color(0xFF4B5563),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _isArchiving ? null : _toggleArchive,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber.shade600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: _isArchiving
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(widget.course.isArchived ? 'Unarchive Course' : 'Archive Course'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Delete card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? Colors.red.shade900.withValues(alpha: 0.5) : Colors.red.shade200,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Delete Course',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'This action is irreversible. All course data, assignments, resources, and discussions will be permanently deleted.',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.grey.shade300 : const Color(0xFF4B5563),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _isDeleting ? null : _deleteCourse,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDC2626),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: _isDeleting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text('Delete Course'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                  foregroundColor: isDark ? Colors.white : const Color(0xFF374151),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Cancel'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
