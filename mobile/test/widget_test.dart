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

  testWidgets('Login screen shows QR tab by default and email/password login tab', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FlamingoCodeApp()));

    // Wait for splash to navigate to login
    await tester.pumpAndSettle(const Duration(seconds: 4));

    // Default tab is Scan QR
    expect(find.text('Scan QR'), findsOneWidget);
    expect(find.text('Point camera at desktop QR code'), findsOneWidget);

    // Switch to the Login tab and verify the email/password form
    // (TabBarView keeps the inactive tab offstage, so allow offstage matches)
    await tester.tap(find.widgetWithText(Tab, 'Login'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('Welcome to FlamingoCode', skipOffstage: false), findsOneWidget);
    expect(find.text('Email', skipOffstage: false), findsOneWidget);
    expect(find.text('Password', skipOffstage: false), findsOneWidget);
    expect(find.text('Sign In', skipOffstage: false), findsOneWidget);
  });
}