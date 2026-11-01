#include "screen_capture.hpp"
#include <vector>

#if defined(_WIN32)
#include <windows.h>
#include <objidl.h>
#include <gdiplus.h>
#pragma comment(lib, "gdiplus.lib")
#elif defined(__APPLE__)
#include <ApplicationServices/ApplicationServices.h>
#include <CoreGraphics/CoreGraphics.h>
#else
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/extensions/Xfixes.h>
#include <X11/extensions/Xdamage.h>
#include <X11/extensions/Xcomposite.h>
#endif

namespace devforge {

static const char* base64_chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

std::string ScreenCapture::encodeToBase64(const std::vector<unsigned char>& data, int width, int height) {
  std::string encoded;
  encoded.reserve((data.size() + 2) / 3 * 4);

  for (size_t i = 0; i < data.size(); i += 3) {
    uint32_t triple = 0;
    int padding = 0;

    if (i < data.size()) triple |= (data[i] << 16);
    if (i + 1 < data.size()) triple |= (data[i + 1] << 8); else padding++;
    if (i + 2 < data.size()) triple |= data[i + 2]; else padding++;

    encoded.push_back(base64_chars[(triple >> 18) & 0x3F]);
    encoded.push_back(base64_chars[(triple >> 12) & 0x3F]);
    encoded.push_back(padding > 1 ? '=' : base64_chars[(triple >> 6) & 0x3F]);
    encoded.push_back(padding > 0 ? '=' : base64_chars[triple & 0x3F]);
  }

  return encoded;
}

Napi::Value ScreenCapture::Capture(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Object result = Napi::Object::New(env);

#if defined(_WIN32)
  std::string base64 = captureScreenWindows();
#elif defined(__APPLE__)
  std::string base64 = captureScreenMacOS();
#else
  std::string base64 = captureScreenLinux();
#endif

  if (base64.empty()) {
    Napi::Error::New(env, "Failed to capture screen").ThrowAsJavaScriptException();
    return env.Null();
  }

  result.Set("data", base64);
  return result;
}

#if defined(_WIN32)
// Standard GDI+ helper (MSDN pattern): retrieves the CLSID of the image
// encoder matching a MIME type. This is a free helper function, not a
// member of the Gdiplus API.
static int GetEncoderClsid(const WCHAR* format, CLSID* pClsid) {
  UINT num = 0;
  UINT size = 0;
  Gdiplus::GetImageEncodersSize(&num, &size);
  if (size == 0) return -1;
  Gdiplus::ImageCodecInfo* pImageCodecInfo =
      static_cast<Gdiplus::ImageCodecInfo*>(malloc(size));
  if (pImageCodecInfo == NULL) return -1;
  Gdiplus::GetImageEncoders(num, size, pImageCodecInfo);
  for (UINT j = 0; j < num; ++j) {
    if (wcscmp(pImageCodecInfo[j].MimeType, format) == 0) {
      *pClsid = pImageCodecInfo[j].Clsid;
      free(pImageCodecInfo);
      return static_cast<int>(j);
    }
  }
  free(pImageCodecInfo);
  return -1;
}

std::string ScreenCapture::captureScreenWindows() {
  Gdiplus::GdiplusStartupInput gdiplusStartupInput;
  ULONG_PTR gdiplusToken;
  Gdiplus::GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

  HDC hScreenDC = GetDC(NULL);
  HDC hMemoryDC = CreateCompatibleDC(hScreenDC);

  int width = GetSystemMetrics(SM_CXSCREEN);
  int height = GetSystemMetrics(SM_CYSCREEN);

  HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, width, height);
  HBITMAP hOldBitmap = (HBITMAP)SelectObject(hMemoryDC, hBitmap);

  BitBlt(hMemoryDC, 0, 0, width, height, hScreenDC, 0, 0, SRCCOPY);

  SelectObject(hMemoryDC, hOldBitmap);
  DeleteDC(hMemoryDC);
  ReleaseDC(NULL, hScreenDC);

  Gdiplus::Bitmap bitmap(hBitmap, NULL);
  DeleteObject(hBitmap);

  CLSID pngClsid;
  GetEncoderClsid(L"image/png", &pngClsid);

  IStream* stream = NULL;
  CreateStreamOnHGlobal(NULL, TRUE, &stream);
  bitmap.Save(stream, &pngClsid, NULL);

  STATSTG stat;
  stream->Stat(&stat, STATFLAG_NONAME);
  ULARGE_INTEGER size = stat.cbSize;

  HGLOBAL hGlobal = NULL;
  GetHGlobalFromStream(stream, &hGlobal);
  void* data = GlobalLock(hGlobal);

  std::vector<unsigned char> buffer(static_cast<size_t>(size.QuadPart));
  memcpy(buffer.data(), data, static_cast<size_t>(size.QuadPart));

  GlobalUnlock(hGlobal);
  stream->Release();

  Gdiplus::GdiplusShutdown(gdiplusToken);

  return encodeToBase64(buffer, width, height);
}
#elif defined(__APPLE__)
std::string ScreenCapture::captureScreenMacOS() {
  CGDirectDisplayID displayID = CGMainDisplayID();
  size_t width = CGDisplayPixelsWide(displayID);
  size_t height = CGDisplayPixelsHigh(displayID);

  CGImageRef imageRef = CGDisplayCreateImage(displayID);
  if (!imageRef) return "";

  CFMutableDataRef dataRef = CFDataCreateMutable(kCFAllocatorDefault, 0);
  CGImageDestinationRef destRef = CGImageDestinationCreateWithData(dataRef, kUTTypePNG, 1, NULL);
  CGImageDestinationAddImage(destRef, imageRef, NULL);
  CGImageDestinationFinalize(destRef);

  CFRelease(destRef);
  CFRelease(imageRef);

  CFIndex dataLength = CFDataGetLength(dataRef);
  const UInt8* dataPtr = CFDataGetBytePtr(dataRef);

  std::vector<unsigned char> buffer(dataLength);
  memcpy(buffer.data(), dataPtr, dataLength);

  CFRelease(dataRef);

  return encodeToBase64(buffer, static_cast<int>(width), static_cast<int>(height));
}
#else
std::string ScreenCapture::captureScreenLinux() {
  Display* display = XOpenDisplay(NULL);
  if (!display) return "";

  int screen = DefaultScreen(display);
  Window root = RootWindow(display, screen);

  XWindowAttributes attributes;
  XGetWindowAttributes(display, root, &attributes);

  int width = attributes.width;
  int height = attributes.height;

  XImage* image = XGetImage(display, root, 0, 0, width, height, AllPlanes, ZPixmap);
  if (!image) {
    XCloseDisplay(display);
    return "";
  }

  std::vector<unsigned char> buffer(width * height * 4);
  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      unsigned long pixel = XGetPixel(image, x, y);
      size_t idx = (y * width + x) * 4;
      buffer[idx] = (pixel >> 16) & 0xFF;
      buffer[idx + 1] = (pixel >> 8) & 0xFF;
      buffer[idx + 2] = pixel & 0xFF;
      buffer[idx + 3] = 0xFF;
    }
  }

  XDestroyImage(image);
  XCloseDisplay(display);

  return encodeToBase64(buffer, width, height);
}
#endif

}