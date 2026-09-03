import { getPendingSyncRecords, removeSyncRecord, updateSyncRecord, updateHistoryRecordStatus } from './db';
import { getNetworkStatus, registerNetworkListener } from './device';
import type { SyncRecord } from '../types/survey';

let isSyncing = false;

export interface SyncResult {
  total: number;
  success: number;
  failed: number;
}

/**
 * Xử lý hàng đợi đồng bộ (Sync Queue):
 * 1. Đọc tất cả các bản ghi PENDING_SYNC từ IndexedDB
 * 2. Gửi tuần tự (sequential) lên endpoint /api/sync
 * 3. Nếu HTTP 200 OK: Xóa bản ghi khỏi IndexedDB để giải phóng dung lượng bộ nhớ
 * 4. Nếu thất bại: Tăng retryCount và đánh dấu FAILED để thử lại lần sau
 */
export async function processSyncQueue(
  onProgress?: (current: number, total: number, record: SyncRecord) => void
): Promise<SyncResult> {
  if (isSyncing) {
    console.log('[SyncEngine] Đang có tiến trình đồng bộ khác chạy, bỏ qua.');
    return { total: 0, success: 0, failed: 0 };
  }

  const network = await getNetworkStatus();
  if (!network.connected) {
    console.log('[SyncEngine] Thiết bị đang offline, không thể đồng bộ.');
    return { total: 0, success: 0, failed: 0 };
  }

  isSyncing = true;
  let successCount = 0;
  let failedCount = 0;

  try {
    const pendingRecords = await getPendingSyncRecords();
    const total = pendingRecords.length;

    if (total === 0) {
      console.log('[SyncEngine] Hàng đợi trống, không có bản ghi nào cần đồng bộ.');
      return { total: 0, success: 0, failed: 0 };
    }

    console.log(`[SyncEngine] Bắt đầu đồng bộ ${total} bản ghi khảo sát lên máy chủ...`);

    for (let i = 0; i < total; i++) {
      const record = pendingRecords[i];
      if (onProgress) {
        onProgress(i + 1, total, record);
      }

      // Đánh dấu bản ghi đang được đồng bộ
      record.status = 'SYNCING';
      record.lastAttempt = Date.now();
      await updateSyncRecord(record);

      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: record.id,
            timestamp: record.timestamp,
            auditor: record.payload.auditorName,
            building: record.payload.building,
            floor: record.payload.floor,
            room: record.payload.room,
            category: record.payload.category,
            rating: record.payload.rating,
            notes: record.payload.notes,
            location: record.payload.location,
            photoBase64: record.payload.photoBase64,
            clientTimestamp: record.timestamp
          }),
        });

        if (response.ok) {
          // HTTP 200 OK: Xóa khỏi Sync Queue và cập nhật trạng thái trong Lịch sử
          await removeSyncRecord(record.id);
          await updateHistoryRecordStatus(record.id, 'SYNCED');
          successCount++;
          console.log(`[SyncEngine] Đồng bộ thành công & đã lưu lịch sử cho record: ${record.id}`);
        } else {
          throw new Error(`Server trả về mã lỗi HTTP ${response.status}`);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Lỗi mạng không xác định';
        console.warn(`[SyncEngine] Thất bại khi gửi record ${record.id}:`, errorMsg);
        
        record.status = 'FAILED';
        record.retryCount = (record.retryCount || 0) + 1;
        record.errorMessage = errorMsg;
        await updateSyncRecord(record);
        failedCount++;
      }
    }

    return { total, success: successCount, failed: failedCount };
  } finally {
    isSyncing = false;
  }
}

/**
 * Khởi tạo trình lắng nghe mạng ngầm (Background Sync Listener):
 * Tự động chạy processSyncQueue() ngay khi điện thoại kết nối lại Internet
 */
export function startAutoBackgroundSync(
  onSyncCompleted?: (result: SyncResult) => void
): () => void {
  const unsubscribe = registerNetworkListener(async (state) => {
    if (state.connected) {
      console.log('[BackgroundSync] Phát hiện có kết nối Internet. Đang kiểm tra hàng đợi...');
      try {
        const result = await processSyncQueue();
        if (result.success > 0 && onSyncCompleted) {
          onSyncCompleted(result);
        }
      } catch (e) {
        console.error('[BackgroundSync] Lỗi trong quá trình auto-sync:', e);
      }
    }
  });

  return unsubscribe;
}
