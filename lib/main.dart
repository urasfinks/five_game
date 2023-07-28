import 'package:flutter/material.dart';
import 'package:rjdu/global_settings.dart';
import 'package:rjdu/rjdu.dart';

void main() async {
  GlobalSettings().setHost("https://5gm.ru");
  GlobalSettings().setWs("wss://5gm.ru");
  RjDu.init();

  runApp(await RjDu.runApp());
}