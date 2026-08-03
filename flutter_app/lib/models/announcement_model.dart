class AnnouncementModel {
  final String id;
  final String title;
  final String content;
  final String category;
  final String courseId;
  final String authorName;
  final DateTime createdAt;

  AnnouncementModel({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.courseId,
    required this.authorName,
    required this.createdAt,
  });

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) {
    String author = 'Admin';
    if (json['author'] != null) {
      if (json['author'] is Map) {
        author = '${json['author']['firstName'] ?? ''} ${json['author']['lastName'] ?? ''}'.trim();
      } else {
        author = json['author'].toString();
      }
    }
    String cId = '';
    if (json['course'] != null) {
      if (json['course'] is Map) {
        cId = json['course']['_id'] ?? '';
      } else {
        cId = json['course'].toString();
      }
    }

    return AnnouncementModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      category: json['category'] ?? 'General',
      courseId: cId,
      authorName: author.isEmpty ? 'System Admin' : author,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}
