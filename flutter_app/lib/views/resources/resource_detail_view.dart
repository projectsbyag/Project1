import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../models/resource_model.dart';
import '../../providers/auth_provider.dart';

class ResourceDetailView extends StatelessWidget {
  final ResourceModel resource;

  const ResourceDetailView({super.key, required this.resource});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    IconData resourceIcon = Icons.insert_drive_file;
    Color iconColor = Colors.grey;

    if (resource.fileType == 'pdf') {
      resourceIcon = Icons.picture_as_pdf;
      iconColor = Colors.red;
    } else if (resource.fileType == 'link') {
      resourceIcon = Icons.link;
      iconColor = Colors.blue;
    } else if (resource.fileType == 'video') {
      resourceIcon = Icons.video_file;
      iconColor = Colors.pink;
    } else if (resource.fileType == 'document') {
      resourceIcon = Icons.description;
      iconColor = Colors.blue;
    }

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackground : const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('Resource Details'),
        backgroundColor: isDark ? AppTheme.darkSurface : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        elevation: 1,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: iconColor.withValues(alpha: 0.15),
                    child: Icon(resourceIcon, size: 40, color: iconColor),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    resource.title,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          resource.fileType.toUpperCase(),
                          style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        resource.createdAt != null 
                            ? DateFormat.yMMMd().format(resource.createdAt!)
                            : 'Unknown Date',
                        style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (resource.description.isNotEmpty) ...[
                    Text(
                      resource.description,
                      style: TextStyle(color: isDark ? Colors.grey.shade300 : Colors.black87, height: 1.5, fontSize: 15),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                  ],
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // TODO: Implement download or open link logic
                      },
                      icon: Icon(resource.fileType == 'link' ? Icons.open_in_new : Icons.download),
                      label: Text(resource.fileType == 'link' ? 'Open Link' : 'Download File'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  if (user?.role == 'instructor') ...[
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.edit),
                        label: const Text('Edit Resource'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.primaryColor,
                          side: const BorderSide(color: AppTheme.primaryColor),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                  ]
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
