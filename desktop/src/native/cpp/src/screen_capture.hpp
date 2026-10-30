#pragma once

#include <napi.h>
#include <string>
#include <vector>

namespace devforge {

class ScreenCapture {
public:
  static Napi::Value Capture(const Napi::CallbackInfo& info);

private:
  static std::string captureScreenLinux();
  static std::string captureScreenWindows();
  static std::string captureScreenMacOS();
  static std::string encodeToBase64(const std::vector<unsigned char>& data, int width, int height);
};

}