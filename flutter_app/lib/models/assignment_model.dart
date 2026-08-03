class AssignmentModel {
  final String id;
  final String title;
  final String description;
  final String courseId;
  final String courseTitle;
  final DateTime dueDate;
  final int maxPoints;
  final bool isSubmitted;
  final String? status;

  AssignmentModel({
    required this.id,
    required this.title,
    required this.description,
    required this.courseId,
    required this.courseTitle,
    required this.dueDate,
    this.maxPoints = 100,
    this.isSubmitted = false,
    this.status,
  });

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    String cId = '';
    String cTitle = 'General Course';
    if (json['course'] != null) {
      if (json['course'] is Map) {
        cId = json['course']['_id'] ?? '';
        cTitle = json['course']['title'] ?? json['course']['code'] ?? 'Course';
      } else {
        cId = json['course'].toString();
      }
    }

    return AssignmentModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      courseId: cId,
      courseTitle: cTitle,
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : DateTime.now().add(const Duration(days: 7)),
      maxPoints: json['maxPoints'] ?? json['points'] ?? 100,
      isSubmitted: json['isSubmitted'] ?? false,
      status: json['status'] ?? (json['isSubmitted'] == true ? 'Submitted' : 'Pending'),
    );
  }
}
