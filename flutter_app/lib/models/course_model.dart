class CourseModel {
  final String id;
  final String title;
  final String code;
  final String description;
  final String? instructorName;
  final String? department;
  final int enrolledCount;
  final String? coverImage;
  final DateTime? createdAt;

  CourseModel({
    required this.id,
    required this.title,
    required this.code,
    required this.description,
    this.instructorName,
    this.department,
    this.enrolledCount = 0,
    this.coverImage,
    this.createdAt,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    String? instructor;
    if (json['instructor'] != null) {
      if (json['instructor'] is Map) {
        instructor = '${json['instructor']['firstName'] ?? ''} ${json['instructor']['lastName'] ?? ''}'.trim();
      } else if (json['instructor'] is String) {
        instructor = json['instructor'];
      }
    }

    return CourseModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      code: json['code'] ?? '',
      description: json['description'] ?? '',
      instructorName: instructor ?? json['instructorName'] ?? 'Instructor',
      department: json['department'],
      enrolledCount: json['enrolledCount'] ?? (json['students'] as List?)?.length ?? 0,
      coverImage: json['coverImage'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}
