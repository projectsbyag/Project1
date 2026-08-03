import 'package:flutter/material.dart';
import '../config/api_endpoints.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    checkAuth();
  }

  Future<void> checkAuth() async {
    final token = await ApiService.getToken();
    if (token != null && token.isNotEmpty) {
      try {
        _isLoading = true;
        notifyListeners();
        final res = await ApiService.get(ApiEndpoints.getMe);
        if (res['data'] != null && res['data']['user'] != null) {
          _user = UserModel.fromJson(res['data']['user']);
        }
      } catch (e) {
        await ApiService.clearToken();
        _user = null;
      } finally {
        _isLoading = false;
        notifyListeners();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(ApiEndpoints.login, {
        'email': email,
        'password': password,
      });

      if (res['token'] != null) {
        await ApiService.setToken(res['token']);
        if (res['data'] != null && res['data']['user'] != null) {
          _user = UserModel.fromJson(res['data']['user']);
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Invalid login response';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String passwordConfirm,
    required String role,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(ApiEndpoints.signup, {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'passwordConfirm': passwordConfirm,
        'role': role,
      });

      if (res['token'] != null) {
        await ApiService.setToken(res['token']);
        if (res['data'] != null && res['data']['user'] != null) {
          _user = UserModel.fromJson(res['data']['user']);
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Invalid signup response';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.get(ApiEndpoints.logout);
    } catch (_) {}
    await ApiService.clearToken();
    _user = null;
    notifyListeners();
  }
}
