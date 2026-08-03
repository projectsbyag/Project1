class ResourceModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String courseId;
  final String fileUrl;
  final String fileType;
  final String uploaderName;
  final int downloadCount;
  final DateTime? createdAt;

  ResourceModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.courseId,
    required this.fileUrl,
    required this.fileType,
    required this.uploaderName,
    this.downloadCount = 0,
    this.createdAt,
  });

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    String uploader = 'Anonymous';
    if (json['uploadedBy'] != null) {
      if (json['uploadedBy'] is Map) {
        uploader = '${json['uploadedBy']['firstName'] ?? ''} ${json['uploadedBy']['lastName'] ?? ''}'.trim();
      } else {
        uploader = json['uploadedBy'].toString();
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

    return ResourceModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? 'Untitled Resource',
      description: json['description'] ?? '',
      category: json['category'] ?? 'General',
      courseId: cId,
      fileUrl: json['fileUrl'] ?? json['file'] ?? '',
      fileType: json['fileType'] ?? 'pdf',
      uploaderName: uploader.isEmpty ? 'Student' : uploader,
      downloadCount: json['downloadCount'] ?? json['downloads'] ?? 0,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}
