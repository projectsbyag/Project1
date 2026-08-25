class CourseModel {
  final String id;
  final String title;
  final String code;
  final String description;
  final String? instructorName;
  final String? instructorId;
  final String? department;
  final int enrolledCount;
  final String? coverImage;
  final String? color;
  final String? enrollmentCode;
  final bool allowEnrollment;
  final bool isArchived;
  final List<dynamic> students;
  final DateTime? createdAt;

  CourseModel({
    required this.id,
    required this.title,
    required this.code,
    required this.description,
    this.instructorName,
    this.instructorId,
    this.department,
    this.enrolledCount = 0,
    this.coverImage,
    this.color,
    this.enrollmentCode,
    this.allowEnrollment = true,
    this.isArchived = false,
    this.students = const [],
    this.createdAt,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    String? instructor;
    String? instructorId;
    if (json['instructor'] != null) {
      if (json['instructor'] is Map) {
        instructor = '${json['instructor']['firstName'] ?? ''} ${json['instructor']['lastName'] ?? ''}'.trim();
        instructorId = json['instructor']['_id'] ?? json['instructor']['id'];
      } else if (json['instructor'] is String) {
        instructor = json['instructor'];
        instructorId = json['instructor'];
      }
    }

    final rawStudents = json['students'] as List? ?? [];

    return CourseModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['name'] ?? json['title'] ?? '',
      code: json['code'] ?? '',
      description: json['description'] ?? '',
      instructorName: instructor ?? json['instructorName'] ?? 'Instructor',
      instructorId: instructorId ?? json['instructorId'],
      department: json['department'],
      enrolledCount: json['enrolledCount'] ?? rawStudents.length,
      coverImage: json['coverImage'] ?? json['image'],
      color: json['color'] ?? '#5D5CDE',
      enrollmentCode: json['enrollmentCode'],
      allowEnrollment: json['allowEnrollment'] ?? true,
      isArchived: json['isArchived'] ?? false,
      students: rawStudents,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': title,
      'code': code,
      'description': description,
      'instructor': instructorId,
      'department': department,
      'enrolledCount': enrolledCount,
      'image': coverImage,
      'color': color,
      'enrollmentCode': enrollmentCode,
      'allowEnrollment': allowEnrollment,
      'isArchived': isArchived,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  CourseModel copyWith({
    String? id,
    String? title,
    String? code,
    String? description,
    String? instructorName,
    String? instructorId,
    String? department,
    int? enrolledCount,
    String? coverImage,
    String? color,
    String? enrollmentCode,
    bool? allowEnrollment,
    bool? isArchived,
    List<dynamic>? students,
    DateTime? createdAt,
  }) {
    return CourseModel(
      id: id ?? this.id,
      title: title ?? this.title,
      code: code ?? this.code,
      description: description ?? this.description,
      instructorName: instructorName ?? this.instructorName,
      instructorId: instructorId ?? this.instructorId,
      department: department ?? this.department,
      enrolledCount: enrolledCount ?? this.enrolledCount,
      coverImage: coverImage ?? this.coverImage,
      color: color ?? this.color,
      enrollmentCode: enrollmentCode ?? this.enrollmentCode,
      allowEnrollment: allowEnrollment ?? this.allowEnrollment,
      isArchived: isArchived ?? this.isArchived,
      students: students ?? this.students,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
