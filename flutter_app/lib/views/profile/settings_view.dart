import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../services/api_service.dart';
import '../../config/api_endpoints.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({super.key});

  @override
  State<SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  int _activeCategory = 0; // 0: General, 1: Appearance, 2: Language, 3: Notifications, 4: Security, 5: Accessibility

  // General Settings
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _bioController = TextEditingController();

  // Appearance
  String _selectedTheme = 'light';
  bool _followSystemTheme = true;
  String _selectedDensity = 'comfortable';

  // Language
  String _selectedLanguage = 'en|US';
  String _dateFormat = 'MM/DD/YYYY';
  String _timeFormat = '12h';

  // Notifications
  bool _emailNotifications = true;
  bool _assignmentReminders = true;
  bool _courseAnnouncements = true;
  bool _discussionReplies = true;

  // Security
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  // Accessibility
  double _textSize = 100.0;
  bool _reduceMotion = false;
  bool _highContrast = false;
  bool _dyslexicFont = false;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final user = auth.user;
    if (user != null) {
      _firstNameController.text = user.firstName;
      _lastNameController.text = user.lastName;
      _emailController.text = user.email;
      _bioController.text = user.bio ?? '';
    }
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    _selectedTheme = themeProvider.isDarkMode ? 'dark' : 'light';
    _followSystemTheme = true;
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _bioController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveGeneralSettings() async {
    setState(() => _isSaving = true);
    try {
      await ApiService.patch(ApiEndpoints.updateMe, {
        'firstName': _firstNameController.text,
        'lastName': _lastNameController.text,
        'email': _emailController.text,
        'bio': _bioController.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('General settings updated successfully!')),
        );
        // Refresh user details
        Provider.of<AuthProvider>(context, listen: false).checkAuth();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update: $e')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _changePassword() async {
    if (_newPasswordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New passwords do not match')),
      );
      return;
    }
    setState(() => _isSaving = true);
    try {
      await ApiService.patch('${ApiEndpoints.baseUrl}/users/updateMyPassword', {
        'passwordCurrent': _currentPasswordController.text,
        'password': _newPasswordController.text,
        'passwordConfirm': _confirmPasswordController.text,
      });
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password changed successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to change password: $e')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isWide = screenWidth > 850;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Text(
            'Settings',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'Customize your experience',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
          ),
          const SizedBox(height: 24),

          // Layout Container
          Flex(
            direction: isWide ? Axis.horizontal : Axis.vertical,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left Category Select Bar
              SizedBox(
                width: isWide ? 250 : double.infinity,
                child: Card(
                  elevation: 0,
                  color: isDark ? AppTheme.darkSurface : Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Settings Categories',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 12),
                        _buildCategoryBtn(0, Icons.settings_outlined, 'General', isDark),
                        _buildCategoryBtn(1, Icons.palette_outlined, 'Appearance', isDark),
                        _buildCategoryBtn(2, Icons.language_outlined, 'Language', isDark),
                        _buildCategoryBtn(3, Icons.notifications_none_outlined, 'Notifications', isDark),
                        _buildCategoryBtn(4, Icons.security_outlined, 'Security', isDark),
                        _buildCategoryBtn(5, Icons.accessibility_new_outlined, 'Accessibility', isDark),
                      ],
                    ),
                  ),
                ),
              ),
              if (isWide) const SizedBox(width: 24) else const SizedBox(height: 16),

              // Right Category Panel Card
              Expanded(
                flex: isWide ? 1 : 0,
                child: Card(
                  elevation: 0,
                  color: isDark ? AppTheme.darkSurface : Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: _buildActivePanel(isDark),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryBtn(int index, IconData icon, String title, bool isDark) {
    final isSelected = _activeCategory == index;
    return InkWell(
      onTap: () => setState(() => _activeCategory = index),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primaryColor.withValues(alpha: 0.15)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.grey.shade400 : Colors.grey.shade600),
            ),
            const SizedBox(width: 12),
            Text(
              title,
              style: TextStyle(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.grey.shade200 : Colors.black87),
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivePanel(bool isDark) {
    switch (_activeCategory) {
      case 0:
        return _buildGeneralPanel(isDark);
      case 1:
        return _buildAppearancePanel(isDark);
      case 2:
        return _buildLanguagePanel(isDark);
      case 3:
        return _buildNotificationsPanel(isDark);
      case 4:
        return _buildSecurityPanel(isDark);
      case 5:
        return _buildAccessibilityPanel(isDark);
      default:
        return _buildGeneralPanel(isDark);
    }
  }

  Widget _buildGeneralPanel(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('General Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        const Text('ACCOUNT INFORMATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('First Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 6),
                  TextField(controller: _firstNameController, decoration: const InputDecoration(hintText: 'First Name')),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Last Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 6),
                  TextField(controller: _lastNameController, decoration: const InputDecoration(hintText: 'Last Name')),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Email Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(controller: _emailController, decoration: const InputDecoration(hintText: 'Email')),
        const SizedBox(height: 16),
        const Text('Bio', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(
          controller: _bioController,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Brief description about yourself...'),
        ),
        const SizedBox(height: 16),
        Align(
          alignment: Alignment.centerRight,
          child: ElevatedButton(
            onPressed: _isSaving ? null : _saveGeneralSettings,
            child: _isSaving ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Save Changes'),
          ),
        ),
        const Divider(height: 40),
        const Text('PROFILE PICTURE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        Row(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
              child: const Icon(Icons.person, size: 40, color: AppTheme.primaryColor),
            ),
            const SizedBox(width: 20),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                  child: const Text('Change Picture'),
                ),
                const SizedBox(height: 6),
                Text('JPG, PNG or GIF. Max size 5MB.', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
              ],
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAppearancePanel(bool isDark) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Appearance Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        const Text('THEME', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: RadioListTile<String>(
                title: const Text('Light Mode'),
                value: 'light',
                groupValue: _selectedTheme,
                onChanged: (val) {
                  setState(() => _selectedTheme = val!);
                  themeProvider.toggleTheme(false);
                },
              ),
            ),
            Expanded(
              child: RadioListTile<String>(
                title: const Text('Dark Mode'),
                value: 'dark',
                groupValue: _selectedTheme,
                onChanged: (val) {
                  setState(() => _selectedTheme = val!);
                  themeProvider.toggleTheme(true);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SwitchListTile(
          title: const Text('Use system theme preference when available'),
          value: _followSystemTheme,
          onChanged: (val) => setState(() => _followSystemTheme = val),
        ),
        const Divider(height: 40),
        const Text('LAYOUT DENSITY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        RadioListTile<String>(
          title: const Text('Comfortable (Default)'),
          value: 'comfortable',
          groupValue: _selectedDensity,
          onChanged: (val) => setState(() => _selectedDensity = val!),
        ),
        RadioListTile<String>(
          title: const Text('Compact'),
          value: 'compact',
          groupValue: _selectedDensity,
          onChanged: (val) => setState(() => _selectedDensity = val!),
        ),
      ],
    );
  }

  Widget _buildLanguagePanel(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Language Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        const Text('DISPLAY LANGUAGE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          initialValue: _selectedLanguage,
          decoration: const InputDecoration(labelText: 'Language'),
          items: const [
            DropdownMenuItem(value: 'en|US', child: Text('English (United States)')),
            DropdownMenuItem(value: 'en|GB', child: Text('English (United Kingdom)')),
            DropdownMenuItem(value: 'ha|NG', child: Text('Hausa (Nigeria)')),
          ],
          onChanged: (val) => setState(() => _selectedLanguage = val!),
        ),
        if (_selectedLanguage == 'ha|NG') ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.15),
              border: Border(left: BorderSide(color: Colors.amber.shade700, width: 4)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.amber.shade700),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hausa Language Support',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Hausa language is currently in beta. Some parts of the interface may still appear in English.',
                        style: TextStyle(color: Colors.amber.shade900, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
        const Divider(height: 40),
        const Text('DATE & TIME FORMAT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          initialValue: _dateFormat,
          decoration: const InputDecoration(labelText: 'Date Format'),
          items: const [
            DropdownMenuItem(value: 'MM/DD/YYYY', child: Text('MM/DD/YYYY (e.g., 12/31/2023)')),
            DropdownMenuItem(value: 'DD/MM/YYYY', child: Text('DD/MM/YYYY (e.g., 31/12/2023)')),
            DropdownMenuItem(value: 'YYYY-MM-DD', child: Text('YYYY-MM-DD (e.g., 2023-12-31)')),
          ],
          onChanged: (val) => setState(() => _dateFormat = val!),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          initialValue: _timeFormat,
          decoration: const InputDecoration(labelText: 'Time Format'),
          items: const [
            DropdownMenuItem(value: '12h', child: Text('12-hour (e.g., 3:30 PM)')),
            DropdownMenuItem(value: '24h', child: Text('24-hour (e.g., 15:30)')),
          ],
          onChanged: (val) => setState(() => _timeFormat = val!),
        ),
      ],
    );
  }

  Widget _buildNotificationsPanel(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Notification Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        const Text('EMAIL NOTIFICATIONS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        SwitchListTile(
          title: const Text('All Email Notifications'),
          subtitle: const Text('Main toggle for all email notifications'),
          value: _emailNotifications,
          onChanged: (val) => setState(() => _emailNotifications = val),
        ),
        SwitchListTile(
          title: const Text('Assignment Reminders'),
          subtitle: const Text('Notifications about upcoming assignments'),
          value: _assignmentReminders,
          onChanged: _emailNotifications ? (val) => setState(() => _assignmentReminders = val) : null,
        ),
        SwitchListTile(
          title: const Text('Course Announcements'),
          subtitle: const Text('Updates and announcements from your courses'),
          value: _courseAnnouncements,
          onChanged: _emailNotifications ? (val) => setState(() => _courseAnnouncements = val) : null,
        ),
        SwitchListTile(
          title: const Text('Discussion Replies'),
          subtitle: const Text('Responses to your discussion posts'),
          value: _discussionReplies,
          onChanged: _emailNotifications ? (val) => setState(() => _discussionReplies = val) : null,
        ),
      ],
    );
  }

  Widget _buildSecurityPanel(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Security Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        const Text('PASSWORD', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        TextField(
          controller: _currentPasswordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Current Password'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _newPasswordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'New Password'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _confirmPasswordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Confirm New Password'),
        ),
        const SizedBox(height: 16),
        Align(
          alignment: Alignment.centerRight,
          child: ElevatedButton(
            onPressed: _isSaving ? null : _changePassword,
            child: const Text('Change Password'),
          ),
        ),
        const Divider(height: 40),
        const Text('ACCOUNT SECURITY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        ListTile(
          title: const Text('Session Management'),
          subtitle: const Text('Manage your active sessions and sign out from other devices.'),
          trailing: TextButton(
            onPressed: () {},
            child: const Text('View Active Sessions'),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Delete Account', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                    SizedBox(height: 4),
                    Text(
                      'Permanently delete your account and all associated data.',
                      style: TextStyle(color: Colors.red, fontSize: 12),
                    ),
                  ],
                ),
              ),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text('Delete'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAccessibilityPanel(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Accessibility Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        const Text('TEXT SIZE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        Row(
          children: [
            const Text('A', style: TextStyle(fontSize: 12)),
            Expanded(
              child: Slider(
                min: 80,
                max: 150,
                value: _textSize,
                onChanged: (val) => setState(() => _textSize = val),
              ),
            ),
            const Text('A', style: TextStyle(fontSize: 18)),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          'This is a preview of the text size.',
          style: TextStyle(fontSize: 13 * (_textSize / 100)),
        ),
        const Divider(height: 40),
        const Text('MOTION & ANIMATIONS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        SwitchListTile(
          title: const Text('Reduce animations and motion effects'),
          value: _reduceMotion,
          onChanged: (val) => setState(() => _reduceMotion = val),
        ),
        const Divider(height: 40),
        const Text('CONTENT DISPLAY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 12),
        SwitchListTile(
          title: const Text('High contrast mode'),
          value: _highContrast,
          onChanged: (val) => setState(() => _highContrast = val),
        ),
        SwitchListTile(
          title: const Text('Use dyslexia-friendly font'),
          value: _dyslexicFont,
          onChanged: (val) => setState(() => _dyslexicFont = val),
        ),
      ],
    );
  }
}
