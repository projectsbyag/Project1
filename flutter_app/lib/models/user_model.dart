class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final String? profilePicture;
  final String? bio;
  final String? major;
  final List<String> enrolledCourses;

  UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    this.profilePicture,
    this.bio,
    this.major,
    this.enrolledCourses = const [],
  });

  String get fullName => '$firstName $lastName';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'student',
      profilePicture: json['profilePicture'],
      bio: json['bio'],
      major: json['major'],
      enrolledCourses: (json['enrolledCourses'] as List<dynamic>?)
              ?.map((e) => e is String ? e : (e['_id'] ?? '').toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'role': role,
      'profilePicture': profilePicture,
      'bio': bio,
      'major': major,
      'enrolledCourses': enrolledCourses,
    };
  }
}
