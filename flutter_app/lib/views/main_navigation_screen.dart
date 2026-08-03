import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/responsive_layout.dart';
import 'assignments/assignment_list_view.dart';
import 'courses/course_list_view.dart';
import 'dashboard/dashboard_view.dart';
import 'discussions/discussion_board_view.dart';
import 'profile/profile_view.dart';
import 'resources/resource_library_view.dart';
import 'profile/settings_view.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DataProvider>(context, listen: false).fetchAllData();
    });
  }

  List<Widget> get _pages => [
    DashboardView(onNavigate: _onSelectNav),
    const CourseListView(),
    const ResourceLibraryView(),
    const AssignmentListView(),
    const DiscussionBoardView(),
    const ProfileView(),
    const SettingsView(),
  ];

  void _onSelectNav(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveLayout.isMobile(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final user = authProvider.user;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: isMobile
          ? AppBar(
              title: const Text('Virtual Campus', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
              actions: [
                IconButton(
                  icon: Icon(themeProvider.isDarkMode ? Icons.wb_sunny_outlined : Icons.nightlight_round),
                  onPressed: () => themeProvider.toggleTheme(!themeProvider.isDarkMode),
                ),
              ],
            )
          : null,
      drawer: isMobile
          ? Drawer(
              child: _buildSidebarContent(context, user, isDark, themeProvider, authProvider),
            )
          : null,
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isMobile)
            Container(
              width: 250,
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : Colors.white,
                border: Border(
                  right: BorderSide(
                    color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                    width: 1,
                  ),
                ),
              ),
              child: _buildSidebarContent(context, user, isDark, themeProvider, authProvider),
            ),
          Expanded(
            child: _pages[_selectedIndex],
          ),
        ],
      ),
      bottomNavigationBar: isMobile
          ? BottomNavigationBar(
              currentIndex: _selectedIndex > 4 ? 0 : _selectedIndex,
              onTap: _onSelectNav,
              selectedItemColor: AppTheme.primaryColor,
              unselectedItemColor: Colors.grey.shade600,
              type: BottomNavigationBarType.fixed,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Dashboard'),
                BottomNavigationBarItem(icon: Icon(Icons.menu_book_outlined), activeIcon: Icon(Icons.menu_book), label: 'Courses'),
                BottomNavigationBarItem(icon: Icon(Icons.insert_drive_file_outlined), activeIcon: Icon(Icons.insert_drive_file), label: 'Resources'),
                BottomNavigationBarItem(icon: Icon(Icons.task_outlined), activeIcon: Icon(Icons.task), label: 'Assignments'),
                BottomNavigationBarItem(icon: Icon(Icons.forum_outlined), activeIcon: Icon(Icons.forum), label: 'Discussions'),
              ],
            )
          : null,
    );
  }

  Widget _buildSidebarContent(
    BuildContext context,
    dynamic user,
    bool isDark,
    ThemeProvider themeProvider,
    AuthProvider authProvider,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Brand Header
        Padding(
          padding: const EdgeInsets.only(left: 20, right: 20, top: 24, bottom: 20),
          child: Text(
            'Virtual Campus',
            style: TextStyle(
              color: AppTheme.primaryColor,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
        ),

        // Navigation Menu Items
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Group 1: MAIN
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Text(
                    'MAIN',
                    style: TextStyle(
                      color: Color(0xFF9CA3AF),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
                _buildNavItem(0, Icons.home_outlined, Icons.home, 'Dashboard', isDark),
                _buildNavItem(1, Icons.menu_book_outlined, Icons.menu_book, 'My Courses', isDark),
                _buildNavItem(2, Icons.insert_drive_file_outlined, Icons.insert_drive_file, 'Resources', isDark),
                _buildNavItem(3, Icons.task_outlined, Icons.task, 'Assignments', isDark),
                _buildNavItem(4, Icons.forum_outlined, Icons.forum, 'Discussions', isDark),

                const SizedBox(height: 16),

                // Group 2: SETTINGS
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Text(
                    'SETTINGS',
                    style: TextStyle(
                      color: Color(0xFF9CA3AF),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
                _buildNavItem(5, Icons.person_outline, Icons.person, 'Profile', isDark),
                _buildNavItem(6, Icons.settings_outlined, Icons.settings, 'Settings', isDark),
              ],
            ),
          ),
        ),

        // User Info Box & Logout at bottom
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(
                color: isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB),
                width: 1,
              ),
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.15),
                    child: Text(
                      user?.firstName.isNotEmpty == true ? user.firstName[0].toUpperCase() : 'A',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 14),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.fullName ?? 'Aliyu Garba',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          user?.role != null ? (user.role[0].toUpperCase() + user.role.substring(1)) : 'Instructor',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      isDark ? Icons.wb_sunny_outlined : Icons.nightlight_round,
                      size: 18,
                      color: isDark ? Colors.amber : Colors.grey.shade700,
                    ),
                    onPressed: () => themeProvider.toggleTheme(!themeProvider.isDarkMode),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: () => authProvider.logout(),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                  child: Row(
                    children: const [
                      Icon(Icons.logout_rounded, color: AppTheme.accentColor, size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Logout',
                        style: TextStyle(
                          color: AppTheme.accentColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNavItem(int index, IconData icon, IconData activeIcon, String label, bool isDark) {
    final isSelected = _selectedIndex == index;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: InkWell(
        onTap: () => _onSelectNav(index),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark ? const Color(0xFF334155) : const Color(0xFFF3F4F6))
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? activeIcon : icon,
                color: isSelected ? AppTheme.primaryColor : Colors.grey.shade600,
                size: 20,
              ),
              const SizedBox(width: 14),
              Text(
                label,
                style: TextStyle(
                  color: isSelected
                      ? AppTheme.primaryColor
                      : (isDark ? Colors.grey.shade300 : const Color(0xFF374151)),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
