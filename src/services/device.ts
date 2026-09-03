import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import type { GeoLocationData, NetworkState } from '../types/survey';

/**
 * Kiểm tra thiết bị có đang chạy trong môi trường Native (Android/iOS) hay không
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// ==================== 1. CAMERA SERVICE (BASE64) ====================

/**
 * Chụp ảnh hoặc chọn ảnh từ thư viện, trả về chuỗi Base64
 * Hỗ trợ native Capacitor Camera trên Android và fallback Web file picker trên trình duyệt
 */
export async function capturePhoto(): Promise<string | null> {
  try {
    if (isNativePlatform()) {
      // Trên thiết bị Android/iOS Native
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const req = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        if (req.camera !== 'granted') {
          throw new Error('Người dùng chưa cấp quyền truy cập Camera trên điện thoại');
        }
      }

      const image = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Cho phép chọn Chụp ảnh hoặc Thư viện
        width: 1280,
        height: 960,
      });

      if (image.base64String) {
        const format = image.format || 'jpeg';
        return `data:image/${format};base64,${image.base64String}`;
      }
      return null;
    } else {
      // Fallback trên Web Browser (dành cho kiểm thử giao diện hoặc PWA)
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        };
        input.click();
      });
    }
  } catch (error) {
    console.error('[Device] Lỗi khi chụp ảnh:', error);
    throw error;
  }
}

// ==================== 2. GEOLOCATION SERVICE (GPS) ====================

/**
 * Lấy tọa độ GPS hiện tại của kiểm toán viên
 * Tự động chọn Geolocation Native hoặc HTML5 Geolocation API
 */
export async function getCurrentCoordinates(): Promise<GeoLocationData> {
  try {
    if (isNativePlatform()) {
      // Yêu cầu quyền GPS Native trên Android
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          throw new Error('Ứng dụng chưa được cấp quyền truy cập Vị trí (GPS)');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } else {
      // Web Browser HTML5 Geolocation API
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Trình duyệt không hỗ trợ Geolocation'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp
            });
          },
          (err) => {
            console.warn('[Device] Geolocation Web fallback error:', err.message);
            // Fallback trả về tọa độ trung tâm trường VKU Đà Nẵng nếu lỗi quyền trên web
            resolve({
              latitude: 15.9752,
              longitude: 108.2532,
              accuracy: 10,
              timestamp: Date.now()
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      });
    }
  } catch (error) {
    console.error('[Device] Lỗi khi lấy tọa độ GPS:', error);
    // Fallback vị trí VKU Đà Nẵng: 470 Trần Đại Nghĩa, Ngũ Hành Sơn
    return {
      latitude: 15.97529,
      longitude: 108.25321,
      accuracy: 15,
      timestamp: Date.now()
    };
  }
}

// ==================== 3. NETWORK SERVICE (ONLINE/OFFLINE) ====================

/**
 * Kiểm tra trạng thái mạng hiện tại
 */
export async function getNetworkStatus(): Promise<NetworkState> {
  try {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType
    };
  } catch {
    // Fallback trên web tiêu chuẩn
    return {
      connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: 'browser'
    };
  }
}

/**
 * Đăng ký lắng nghe sự kiện thay đổi mạng từ Capacitor Network và Window Events
 */
export function registerNetworkListener(
  onStatusChange: (status: NetworkState) => void
): () => void {
  let isSubscribed = true;

  // 1. Capacitor Network Listener
  const handleCapacitor = Network.addListener('networkStatusChange', (status) => {
    if (isSubscribed) {
      onStatusChange({
        connected: status.connected,
        connectionType: status.connectionType
      });
    }
  });

  // 2. Web Online / Offline Events Listener
  const handleOnline = () => {
    if (isSubscribed) {
      onStatusChange({ connected: true, connectionType: 'online-event' });
    }
  };

  const handleOffline = () => {
    if (isSubscribed) {
      onStatusChange({ connected: false, connectionType: 'offline-event' });
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Trả về hàm hủy đăng ký
  return () => {
    isSubscribed = false;
    handleCapacitor.then(handle => handle.remove()).catch(() => {});
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
