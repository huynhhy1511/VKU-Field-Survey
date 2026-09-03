# VKU Field Survey — Offline Data Collection

Ứng dụng kiểm toán cơ sở vật chất dành cho kiểm toán viên và sinh viên tại **Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**.

Ứng dụng hoạt động **100% Offline** (khi kiểm tra tại các phòng máy, giảng đường xa hoặc tầng hầm mất sóng 4G/Wi-Fi) và hỗ trợ triển khai đa nền tảng: **PWA Web** & **Native Android Mobile (Capacitor)**.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao diện Phiếu Dài Liền Mạch (Single Continuous Form)**:
   - Thao tác một tay mượt mà trên di động, không cần chuyển trang.
   - Giao diện sáng (Light Theme) hiện đại, độ tương phản cao với nhận diện thương hiệu VKU.

2. **Cơ cấu Phân khu VKU Chuẩn xác**:
   - **Khu K**: Tòa A (K.A), Tòa B (K.B), Tòa C (K.C), Thư viện số VKU, Khu Ký túc xá (KTX).
   - **Khu V**: Tòa A (V.A), Tòa B (V.B).

3. **Lưu Nháp Tự Động (Auto-save Draft)**:
   - Dùng `localforage` (IndexedDB) lưu dữ liệu dở dang theo thời gian thực (debounce 300ms).
   - Tắt ứng dụng hoặc tải lại trang không bị mất dữ liệu.

4. **Hàng Đợi Đồng Bộ Offline (Offline Sync Queue)**:
   - Khi mất mạng, phiếu được cấp mã UUID, timestamp và lưu vào hàng đợi `PENDING_SYNC`.
   - Báo thông báo trực quan: *"Đã lưu offline. Dữ liệu sẽ tự động đồng bộ khi có mạng"*.

5. **Tự Động Đồng Bộ Ngầm (Background Sync)**:
   - Lắng nghe sự kiện mạng qua `@capacitor/network` và sự kiện `online`.
   - Tự động đẩy tuần tự các phiếu lên server và xóa khỏi hàng đợi khi máy chủ trả về HTTP 200 OK.

6. **Mục Xem Lịch Sử Đánh Giá (Survey History)**:
   - Quản lý toàn bộ các phiếu đã đánh giá đã lưu vĩnh viễn trên máy.
   - Tìm kiếm theo số phòng, tòa nhà, người kiểm toán; lọc theo phân khu Khu K / Khu V.
   - Hỗ trợ xem lại và phóng to ảnh chụp hiện trường (Base64).

7. **PWA Standalone & App Shell Cache**:
   - Tích hợp `vite-plugin-pwa` với chiến lược Workbox `CacheFirst`.
   - Khởi động tức thì < 1 giây ngay cả khi tắt mạng hoàn toàn.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS.
- **Icons**: Lucide React.
- **PWA**: `vite-plugin-pwa`, Workbox Service Worker, Web Manifest.
- **Local Database**: `localforage` (IndexedDB).
- **Mobile Bridge**: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.
- **Native Plugins**: `@capacitor/camera`, `@capacitor/geolocation`, `@capacitor/network`.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Phát Triển

```bash
# 1. Cài đặt các thư viện
npm install

# 2. Chạy môi trường phát triển (Dev server)
npm run dev

# 3. Đóng gói bản build Production (PWA)
npm run build
```

---

## ☁️ Hướng Dẫn Deploy Lên Cloudflare Pages

Dự án hoàn toàn tương thích và tối ưu hóa 100% cho **Cloudflare Pages**:

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) > chọn mục **Workers & Pages**.
2. Chọn **Create application** > chọn tab **Pages** > bấm **Connect to Git**.
3. Chọn tài khoản GitHub của bạn và chọn repository **`VKU-Field-Survey`**.
4. Cấu hình cài đặt Build (Build Settings):
   - **Framework preset**: `Vite` (hoặc `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Bấm **Save and Deploy**. Cloudflare sẽ tự động build và cấp phát tên miền miễn phí dạng `*.pages.dev` hỗ trợ HTTPS và CDN toàn cầu!

---

## 📱 Hướng Dẫn Đóng Gói Native Android APK

```bash
# 1. Đóng gói mã nguồn web
npm run build

# 2. Đồng bộ mã nguồn và plugin sang thư mục android
npx cap sync android

# 3. Mở dự án trong Android Studio
npx cap open android
```

Xuất file APK nhanh bằng dòng lệnh:
```powershell
cd android
./gradlew assembleDebug
```
File APK nằm tại: `android/app/build/outputs/apk/debug/app-debug.apk`.
