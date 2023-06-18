import 'package:flutter/material.dart';
import 'package:rjdu/global_settings.dart';
import 'package:rjdu/rjdu.dart';

void main() async {
  GlobalSettings().setHost("http://192.168.0.5:8453");
  RjDu.init();

  runApp(await RjDu.runApp());
}