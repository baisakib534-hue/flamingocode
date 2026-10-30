#include "input_simulator.hpp"

#if defined(_WIN32)
#include <windows.h>
#elif defined(__APPLE__)
#include <ApplicationServices/ApplicationServices.h>
#include <Carbon/Carbon.h>
#else
#include <X11/Xlib.h>
#include <X11/extensions/XTest.h>
#include <X11/keysym.h>
#endif

namespace devforge {

#if defined(_WIN32)
static void sendMouseEvent(DWORD flags, int x, int y) {
  INPUT input = {0};
  input.type = INPUT_MOUSE;
  input.mi.dx = (x * 65535) / GetSystemMetrics(SM_CXSCREEN);
  input.mi.dy = (y * 65535) / GetSystemMetrics(SM_CYSCREEN);
  input.mi.dwFlags = flags | MOUSEEVENTF_ABSOLUTE;
  SendInput(1, &input, sizeof(INPUT));
}

static void sendKeyEvent(WORD vk, bool keyDown) {
  INPUT input = {0};
  input.type = INPUT_KEYBOARD;
  input.ki.wVk = vk;
  if (!keyDown) input.ki.dwFlags = KEYEVENTF_KEYUP;
  SendInput(1, &input, sizeof(INPUT));
}

static WORD charToVk(char c) {
  if (c >= 'a' && c <= 'z') return c - 'a' + 'A';
  if (c >= '0' && c <= '9') return c;
  switch (c) {
    case ' ': return VK_SPACE;
    case '\n': return VK_RETURN;
    case '\t': return VK_TAB;
    case '\b': return VK_BACK;
    case 27: return VK_ESCAPE;
    default: return VkKeyScanA(c);
  }
}
#elif defined(__APPLE__)
static void sendMouseEvent(CGEventType type, int x, int y) {
  CGPoint point = CGPointMake(x, y);
  CGEventRef event = CGEventCreateMouseEvent(NULL, type, point, kCGMouseButtonLeft);
  CGEventPost(kCGHIDEventTap, event);
  CFRelease(event);
}

static void sendKeyEvent(CGKeyCode keyCode, bool keyDown) {
  CGEventRef event = CGEventCreateKeyboardEvent(NULL, keyCode, keyDown);
  CGEventPost(kCGHIDEventTap, event);
  CFRelease(event);
}

static CGKeyCode charToKeyCode(char c) {
  return (CGKeyCode)c;
}
#else
static Display* getDisplay() {
  static Display* display = XOpenDisplay(NULL);
  return display;
}

static void sendMouseEvent(int button, bool press, int x, int y) {
  Display* display = getDisplay();
  if (!display) return;

  XTestFakeMotionEvent(display, -1, x, y, CurrentTime);
  XTestFakeButtonEvent(display, button, press, CurrentTime);
  XFlush(display);
}

static void sendKeyEvent(KeySym keysym, bool press) {
  Display* display = getDisplay();
  if (!display) return;

  KeyCode keycode = XKeysymToKeycode(display, keysym);
  XTestFakeKeyEvent(display, keycode, press, CurrentTime);
  XFlush(display);
}

static KeySym charToKeysym(char c) {
  if (c >= 'a' && c <= 'z') return XK_a + (c - 'a');
  if (c >= 'A' && c <= 'Z') return XK_A + (c - 'A');
  if (c >= '0' && c <= '9') return XK_0 + (c - '0');
  switch (c) {
    case ' ': return XK_space;
    case '\n': return XK_Return;
    case '\t': return XK_Tab;
    case '\b': return XK_BackSpace;
    case 27: return XK_Escape;
    default: return XStringToKeysym(&c);
  }
}
#endif

Napi::Value InputSimulator::Click(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "Expected (x: number, y: number)").ThrowAsJavaScriptException();
    return env.Null();
  }

  int x = info[0].As<Napi::Number>().Int32Value();
  int y = info[1].As<Napi::Number>().Int32Value();

#if defined(_WIN32)
  sendMouseEvent(MOUSEEVENTF_LEFTDOWN, x, y);
  sendMouseEvent(MOUSEEVENTF_LEFTUP, x, y);
#elif defined(__APPLE__)
  sendMouseEvent(kCGEventLeftMouseDown, x, y);
  sendMouseEvent(kCGEventLeftMouseUp, x, y);
#else
  sendMouseEvent(1, true, x, y);
  sendMouseEvent(1, false, x, y);
#endif

  return env.Undefined();
}

Napi::Value InputSimulator::Type(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "Expected (text: string)").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string text = info[0].As<Napi::String>().Utf8Value();

  for (char c : text) {
#if defined(_WIN32)
    WORD vk = charToVk(c);
    sendKeyEvent(vk, true);
    sendKeyEvent(vk, false);
    Sleep(10);
#elif defined(__APPLE__)
    CGKeyCode keyCode = charToKeyCode(c);
    sendKeyEvent(keyCode, true);
    sendKeyEvent(keyCode, false);
    usleep(10000);
#else
    KeySym keysym = charToKeysym(c);
    sendKeyEvent(keysym, true);
    sendKeyEvent(keysym, false);
    usleep(10000);
#endif
  }

  return env.Undefined();
}

Napi::Value InputSimulator::Key(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "Expected (key: string, modifiers?: string[])").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string key = info[0].As<Napi::String>().Utf8Value();
  std::vector<std::string> modifiers;

  if (info.Length() > 1 && info[1].IsArray()) {
    Napi::Array arr = info[1].As<Napi::Array>();
    for (uint32_t i = 0; i < arr.Length(); i++) {
      modifiers.push_back(arr.Get(i).As<Napi::String>().Utf8Value());
    }
  }

  auto pressModifiers = [&](bool press) {
    for (const auto& mod : modifiers) {
#if defined(_WIN32)
      WORD vk = 0;
      if (mod == "ctrl") vk = VK_CONTROL;
      else if (mod == "alt") vk = VK_MENU;
      else if (mod == "shift") vk = VK_SHIFT;
      else if (mod == "meta") vk = VK_LWIN;
      if (vk) sendKeyEvent(vk, press);
#elif defined(__APPLE__)
      CGKeyCode keyCode = 0;
      if (mod == "ctrl") keyCode = 0x3B;
      else if (mod == "alt") keyCode = 0x3A;
      else if (mod == "shift") keyCode = 0x38;
      else if (mod == "meta") keyCode = 0x37;
      if (keyCode) sendKeyEvent(keyCode, press);
#else
      KeySym keysym = 0;
      if (mod == "ctrl") keysym = XK_Control_L;
      else if (mod == "alt") keysym = XK_Alt_L;
      else if (mod == "shift") keysym = XK_Shift_L;
      else if (mod == "meta") keysym = XK_Super_L;
      if (keysym) sendKeyEvent(keysym, press);
#endif
    }
  };

  pressModifiers(true);

  if (key.length() == 1) {
#if defined(_WIN32)
    WORD vk = charToVk(key[0]);
    sendKeyEvent(vk, true);
    sendKeyEvent(vk, false);
#elif defined(__APPLE__)
    CGKeyCode keyCode = charToKeyCode(key[0]);
    sendKeyEvent(keyCode, true);
    sendKeyEvent(keyCode, false);
#else
    KeySym keysym = charToKeysym(key[0]);
    sendKeyEvent(keysym, true);
    sendKeyEvent(keysym, false);
#endif
  } else {
    KeySym keysym = 0;
#if defined(_WIN32)
    WORD vk = 0;
    if (key == "enter") vk = VK_RETURN;
    else if (key == "escape") vk = VK_ESCAPE;
    else if (key == "tab") vk = VK_TAB;
    else if (key == "backspace") vk = VK_BACK;
    else if (key == "delete") vk = VK_DELETE;
    else if (key == "up") vk = VK_UP;
    else if (key == "down") vk = VK_DOWN;
    else if (key == "left") vk = VK_LEFT;
    else if (key == "right") vk = VK_RIGHT;
    else if (key == "home") vk = VK_HOME;
    else if (key == "end") vk = VK_END;
    else if (key == "pageup") vk = VK_PRIOR;
    else if (key == "pagedown") vk = VK_NEXT;
    else if (key == "f1") vk = VK_F1;
    else if (key == "f2") vk = VK_F2;
    else if (key == "f3") vk = VK_F3;
    else if (key == "f4") vk = VK_F4;
    else if (key == "f5") vk = VK_F5;
    else if (key == "f6") vk = VK_F6;
    else if (key == "f7") vk = VK_F7;
    else if (key == "f8") vk = VK_F8;
    else if (key == "f9") vk = VK_F9;
    else if (key == "f10") vk = VK_F10;
    else if (key == "f11") vk = VK_F11;
    else if (key == "f12") vk = VK_F12;
    if (vk) {
      sendKeyEvent(vk, true);
      sendKeyEvent(vk, false);
    }
#elif defined(__APPLE__)
    if (key == "enter") keysym = 0x24;
    else if (key == "escape") keysym = 0x35;
    else if (key == "tab") keysym = 0x30;
    else if (key == "backspace") keysym = 0x33;
    else if (key == "delete") keysym = 0x75;
    else if (key == "up") keysym = 0x7E;
    else if (key == "down") keysym = 0x7D;
    else if (key == "left") keysym = 0x7B;
    else if (key == "right") keysym = 0x7C;
    else if (key == "home") keysym = 0x73;
    else if (key == "end") keysym = 0x77;
    else if (key == "pageup") keysym = 0x74;
    else if (key == "pagedown") keysym = 0x79;
    else if (key == "f1") keysym = 0x7A;
    else if (key == "f2") keysym = 0x78;
    else if (key == "f3") keysym = 0x63;
    else if (key == "f4") keysym = 0x76;
    else if (key == "f5") keysym = 0x60;
    else if (key == "f6") keysym = 0x61;
    else if (key == "f7") keysym = 0x62;
    else if (key == "f8") keysym = 0x64;
    else if (key == "f9") keysym = 0x65;
    else if (key == "f10") keysym = 0x6D;
    else if (key == "f11") keysym = 0x67;
    else if (key == "f12") keysym = 0x6F;
    if (keysym) {
      sendKeyEvent(keysym, true);
      sendKeyEvent(keysym, false);
    }
#else
    if (key == "enter") keysym = XK_Return;
    else if (key == "escape") keysym = XK_Escape;
    else if (key == "tab") keysym = XK_Tab;
    else if (key == "backspace") keysym = XK_BackSpace;
    else if (key == "delete") keysym = XK_Delete;
    else if (key == "up") keysym = XK_Up;
    else if (key == "down") keysym = XK_Down;
    else if (key == "left") keysym = XK_Left;
    else if (key == "right") keysym = XK_Right;
    else if (key == "home") keysym = XK_Home;
    else if (key == "end") keysym = XK_End;
    else if (key == "pageup") keysym = XK_Page_Up;
    else if (key == "pagedown") keysym = XK_Page_Down;
    else if (key == "f1") keysym = XK_F1;
    else if (key == "f2") keysym = XK_F2;
    else if (key == "f3") keysym = XK_F3;
    else if (key == "f4") keysym = XK_F4;
    else if (key == "f5") keysym = XK_F5;
    else if (key == "f6") keysym = XK_F6;
    else if (key == "f7") keysym = XK_F7;
    else if (key == "f8") keysym = XK_F8;
    else if (key == "f9") keysym = XK_F9;
    else if (key == "f10") keysym = XK_F10;
    else if (key == "f11") keysym = XK_F11;
    else if (key == "f12") keysym = XK_F12;
    if (keysym) {
      sendKeyEvent(keysym, true);
      sendKeyEvent(keysym, false);
    }
#endif
  }

  pressModifiers(false);

  return env.Undefined();
}

Napi::Value InputSimulator::Drag(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 4 || !info[0].IsNumber() || !info[1].IsNumber() ||
      !info[2].IsNumber() || !info[3].IsNumber()) {
    Napi::TypeError::New(env, "Expected (fromX: number, fromY: number, toX: number, toY: number)").ThrowAsJavaScriptException();
    return env.Null();
  }

  int fromX = info[0].As<Napi::Number>().Int32Value();
  int fromY = info[1].As<Napi::Number>().Int32Value();
  int toX = info[2].As<Napi::Number>().Int32Value();
  int toY = info[3].As<Napi::Number>().Int32Value();

#if defined(_WIN32)
  sendMouseEvent(MOUSEEVENTF_LEFTDOWN, fromX, fromY);
  Sleep(50);
  sendMouseEvent(MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE, toX, toY);
  Sleep(50);
  sendMouseEvent(MOUSEEVENTF_LEFTUP, toX, toY);
#elif defined(__APPLE__)
  sendMouseEvent(kCGEventLeftMouseDown, fromX, fromY);
  usleep(50000);
  sendMouseEvent(kCGEventMouseMoved, toX, toY);
  usleep(50000);
  sendMouseEvent(kCGEventLeftMouseUp, toX, toY);
#else
  sendMouseEvent(1, true, fromX, fromY);
  usleep(50000);
  sendMouseEvent(1, false, toX, toY);
  usleep(50000);
  sendMouseEvent(1, false, toX, toY);
#endif

  return env.Undefined();
}

}