import 'package:flutter/material.dart';
import '../config/app_theme.dart';

class Dialogs {
  static void showCreateCourseDialog(BuildContext context) {
    _showGenericDialog(
      context: context,
      title: 'Create New Course',
      children: [
        _buildTextField(context, 'Course Title', 'e.g. Introduction to Calculus'),
        const SizedBox(height: 16),
        _buildTextField(context, 'Course Code', 'e.g. MTH101'),
        const SizedBox(height: 16),
        _buildTextField(context, 'Description', 'Enter course description...', maxLines: 3),
      ],
      primaryButtonLabel: 'Create Course',
    );
  }

  static void showNewAssignmentDialog(BuildContext context) {
    _showGenericDialog(
      context: context,
      title: 'New Assignment',
      children: [
        _buildTextField(context, 'Assignment Title', 'e.g. Calculus Midterm'),
        const SizedBox(height: 16),
        _buildTextField(context, 'Points Possible', 'e.g. 100', keyboardType: TextInputType.number),
        const SizedBox(height: 16),
        _buildTextField(context, 'Due Date', 'YYYY-MM-DD', keyboardType: TextInputType.datetime),
        const SizedBox(height: 16),
        _buildTextField(context, 'Description', 'Enter assignment instructions...', maxLines: 4),
      ],
      primaryButtonLabel: 'Create Assignment',
    );
  }

  static void showUploadResourceDialog(BuildContext context) {
    _showGenericDialog(
      context: context,
      title: 'Upload Resource',
      children: [
        _buildTextField(context, 'Resource Title', 'e.g. Chapter 1 Notes'),
        const SizedBox(height: 16),
        _buildTextField(context, 'Description (Optional)', 'Enter description...', maxLines: 2),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.upload_file),
          label: const Text('Select File to Upload'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            side: BorderSide(color: Colors.grey.shade400),
          ),
        ),
      ],
      primaryButtonLabel: 'Upload',
    );
  }

  static void showStartDiscussionDialog(BuildContext context) {
    _showGenericDialog(
      context: context,
      title: 'Start Discussion',
      children: [
        _buildTextField(context, 'Discussion Title', 'e.g. Help with Chapter 2'),
        const SizedBox(height: 16),
        _buildTextField(context, 'Content', 'What do you want to discuss?', maxLines: 5),
      ],
      primaryButtonLabel: 'Post Discussion',
    );
  }

  static void showCreateAnnouncementDialog(BuildContext context) {
    _showGenericDialog(
      context: context,
      title: 'New Announcement',
      children: [
        _buildTextField(context, 'Announcement Title', 'e.g. Class cancelled tomorrow'),
        const SizedBox(height: 16),
        _buildTextField(context, 'Content', 'Enter announcement details...', maxLines: 4),
      ],
      primaryButtonLabel: 'Post Announcement',
    );
  }

  static void _showGenericDialog({
    required BuildContext context,
    required String title,
    required List<Widget> children,
    required String primaryButtonLabel,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: 500,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: children,
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('$primaryButtonLabel successful!')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: Text(primaryButtonLabel),
          ),
        ],
      ),
    );
  }

  static Widget _buildTextField(BuildContext context, String label, String hint, {int maxLines = 1, TextInputType keyboardType = TextInputType.text}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
        const SizedBox(height: 8),
        TextField(
          maxLines: maxLines,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: isDark ? Colors.grey.shade600 : Colors.grey.shade400, fontSize: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: isDark ? const Color(0xFF374151) : Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppTheme.primaryColor),
            ),
            filled: true,
            fillColor: isDark ? const Color(0xFF1F2937) : const Color(0xFFF9FAFB),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
