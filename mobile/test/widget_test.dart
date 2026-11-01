// This is a basic Flutter widget test for FlamingoCode Mobile.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flamingocode_mobile/main.dart';

void main() {
  testWidgets('App launches with splash screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: FlamingoCodeApp()));

    // Verify that the splash screen shows the FlamingoCode logo
    expect(find.text('FlamingoCode'), findsOneWidget);
    expect(find.text('Local-First Agentic Coding Studio'), findsOneWidget);
    
    // Wait for splash screen timer to complete and navigate
    await tester.pumpAndSettle(const Duration(seconds: 4));
  });

  testWidgets('Login screen shows Google sign in button', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FlamingoCodeApp()));
    
    // Wait for splash to navigate to login
    await tester.pumpAndSettle(const Duration(seconds: 4));
    
    // Should be on login screen
    expect(find.text('Welcome to FlamingoCode'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
  });
}