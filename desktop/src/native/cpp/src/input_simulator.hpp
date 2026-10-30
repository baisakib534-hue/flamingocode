#pragma once

#include <napi.h>
#include <vector>
#include <string>

namespace devforge {

class InputSimulator {
public:
  static Napi::Value Click(const Napi::CallbackInfo& info);
  static Napi::Value Type(const Napi::CallbackInfo& info);
  static Napi::Value Key(const Napi::CallbackInfo& info);
  static Napi::Value Drag(const Napi::CallbackInfo& info);
};

}