class CourseLinkModel {
  final String id;
  final String courseId;
  final String token;
  final DateTime? expiresAt;
  final int? maxUses;
  final int usedCount;
  final bool isActive;
  final DateTime? createdAt;

  CourseLinkModel({
    required this.id,
    required this.courseId,
    required this.token,
    this.expiresAt,
    this.maxUses,
    this.usedCount = 0,
    this.isActive = true,
    this.createdAt,
  });

  factory CourseLinkModel.fromJson(Map<String, dynamic> json) {
    return CourseLinkModel(
      id: json['_id'] ?? json['id'] ?? '',
      courseId: json['course'] is Map ? (json['course']['_id'] ?? '') : (json['course'] ?? ''),
      token: json['token'] ?? '',
      expiresAt: json['expiresAt'] != null ? DateTime.tryParse(json['expiresAt'].toString()) : null,
      maxUses: json['maxUses'] is int ? json['maxUses'] : (json['maxUses'] != null ? int.tryParse(json['maxUses'].toString()) : null),
      usedCount: json['usedCount'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'course': courseId,
      'token': token,
      'expiresAt': expiresAt?.toIso8601String(),
      'maxUses': maxUses,
      'usedCount': usedCount,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
