class CommentModel {
  final String id;
  final String content;
  final String authorName;
  final DateTime createdAt;

  CommentModel({
    required this.id,
    required this.content,
    required this.authorName,
    required this.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    String author = 'Anonymous';
    if (json['author'] != null || json['user'] != null) {
      final userObj = json['author'] ?? json['user'];
      if (userObj is Map) {
        author = '${userObj['firstName'] ?? ''} ${userObj['lastName'] ?? ''}'.trim();
      }
    }
    return CommentModel(
      id: json['_id'] ?? json['id'] ?? '',
      content: json['content'] ?? '',
      authorName: author.isEmpty ? 'User' : author,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

class DiscussionModel {
  final String id;
  final String title;
  final String content;
  final String category;
  final String authorName;
  final String courseId;
  final int upvotes;
  final int commentCount;
  final List<CommentModel> comments;
  final DateTime createdAt;

  DiscussionModel({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.courseId,
    required this.authorName,
    this.upvotes = 0,
    this.commentCount = 0,
    this.comments = const [],
    required this.createdAt,
  });

  factory DiscussionModel.fromJson(Map<String, dynamic> json) {
    String author = 'Anonymous';
    if (json['author'] != null || json['user'] != null) {
      final userObj = json['author'] ?? json['user'];
      if (userObj is Map) {
        author = '${userObj['firstName'] ?? ''} ${userObj['lastName'] ?? ''}'.trim();
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

    final commentList = (json['comments'] as List<dynamic>?)
            ?.map((c) => CommentModel.fromJson(c as Map<String, dynamic>))
            .toList() ??
        [];

    return DiscussionModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      category: json['category'] ?? 'General',
      courseId: cId,
      authorName: author.isEmpty ? 'Student' : author,
      upvotes: json['upvotes'] ?? (json['upvotesList'] as List?)?.length ?? 0,
      commentCount: commentList.isNotEmpty ? commentList.length : (json['commentCount'] ?? 0),
      comments: commentList,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}
