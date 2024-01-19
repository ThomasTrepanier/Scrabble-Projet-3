class Account {
  final String username;
  final String password;
  final String email;
  final String avatar;

  Account({
    required this.username,
    required this.password,
    required this.email,
    required this.avatar,
  });

  factory Account.fromJson(Map<String, dynamic> json) {
    return Account(
      username: json['username'] as String,
      password: json['password'] as String,
      email: json['email'] as String,
      avatar: json['avatar'] as String,
    );
  }

  Map toJson() => {
        'username': username,
        'password': password,
        'email': email,
        'avatar': avatar
      };
}
