import localforage from 'localforage';
import type { SurveyFormData, SyncRecord, SyncStatus } from '../types/survey';

/**
 * Cấu hình 3 IndexedDB Stores độc lập bằng localforage:
 * 1. draftStore: Dành riêng lưu trữ dữ liệu draft tự động
 * 2. syncQueueStore: Hàng đợi lưu các bản ghi PENDING_SYNC đợi gửi lên server
 * 3. historyStore: Lưu trữ vĩnh viễn toàn bộ lịch sử các phiếu kiểm toán đã thực hiện
 */

export const draftStore = localforage.createInstance({
  name: 'vku_field_survey_app',
  storeName: 'survey_draft_store',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  description: 'Lưu trữ tự động các trường dữ liệu đang nhập dở của kiểm toán viên'
});

export const syncQueueStore = localforage.createInstance({
  name: 'vku_field_survey_app',
  storeName: 'survey_sync_queue_store',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  description: 'Hàng đợi các bản ghi khảo sát cần đồng bộ lên máy chủ khi có kết nối mạng'
});

export const historyStore = localforage.createInstance({
  name: 'vku_field_survey_app',
  storeName: 'survey_history_store',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  description: 'Lưu trữ vĩnh viễn toàn bộ lịch sử các phiếu kiểm toán đã thực hiện'
});

const DRAFT_KEY = 'CURRENT_SURVEY_DRAFT';

// ==================== 1. QUẢN LÝ DRAFT FORM ====================

export async function saveDraft(data: SurveyFormData): Promise<void> {
  try {
    await draftStore.setItem(DRAFT_KEY, data);
  } catch (error) {
    console.error('[localforage] Lỗi khi lưu bản nháp:', error);
  }
}

export async function getDraft(): Promise<SurveyFormData | null> {
  try {
    const draft = await draftStore.getItem<SurveyFormData>(DRAFT_KEY);
    return draft || null;
  } catch (error) {
    console.error('[localforage] Lỗi khi đọc bản nháp:', error);
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await draftStore.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('[localforage] Lỗi khi xóa bản nháp:', error);
  }
}

// ==================== 2. QUẢN LÝ SYNC QUEUE ====================

export async function enqueueSyncRecord(record: SyncRecord): Promise<void> {
  try {
    await syncQueueStore.setItem(record.id, record);
    console.log(`[localforage] Đã thêm bản ghi vào Sync Queue: ${record.id}`);
  } catch (error) {
    console.error('[localforage] Lỗi khi lưu vào sync queue:', error);
    throw error;
  }
}

export async function getAllSyncRecords(): Promise<SyncRecord[]> {
  try {
    const records: SyncRecord[] = [];
    await syncQueueStore.iterate<SyncRecord, void>((value) => {
      records.push(value);
    });
    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[localforage] Lỗi khi đọc danh sách Sync Queue:', error);
    return [];
  }
}

export async function getPendingSyncRecords(): Promise<SyncRecord[]> {
  const records = await getAllSyncRecords();
  return records.filter(r => r.status === 'PENDING_SYNC' || r.status === 'FAILED');
}

export async function updateSyncRecord(record: SyncRecord): Promise<void> {
  try {
    await syncQueueStore.setItem(record.id, record);
  } catch (error) {
    console.error('[localforage] Lỗi khi cập nhật bản ghi Sync Queue:', error);
  }
}

export async function removeSyncRecord(id: string): Promise<void> {
  try {
    await syncQueueStore.removeItem(id);
    console.log(`[localforage] Đã giải phóng bộ nhớ IndexedDB cho bản ghi: ${id}`);
  } catch (error) {
    console.error(`[localforage] Lỗi khi xóa bản ghi ${id}:`, error);
  }
}

export async function clearAllSyncRecords(): Promise<void> {
  try {
    await syncQueueStore.clear();
  } catch (error) {
    console.error('[localforage] Lỗi khi xóa toàn bộ hàng đợi:', error);
  }
}

// ==================== 3. QUẢN LÝ LỊCH SỬ KHẢO SÁT (HISTORY) ====================

/**
 * Lưu bản ghi vào Lịch sử kiểm toán
 */
export async function saveToHistory(record: SyncRecord): Promise<void> {
  try {
    await historyStore.setItem(record.id, record);
    console.log(`[localforage] Đã lưu vào Lịch sử: ${record.id}`);
  } catch (error) {
    console.error('[localforage] Lỗi khi lưu vào lịch sử:', error);
  }
}

/**
 * Cập nhật trạng thái bản ghi trong lịch sử (PENDING_SYNC -> SYNCED)
 */
export async function updateHistoryRecordStatus(id: string, status: SyncStatus): Promise<void> {
  try {
    const record = await historyStore.getItem<SyncRecord>(id);
    if (record) {
      record.status = status;
      await historyStore.setItem(id, record);
    }
  } catch (error) {
    console.error('[localforage] Lỗi cập nhật trạng thái lịch sử:', error);
  }
}

/**
 * Lấy danh sách toàn bộ lịch sử các phiếu kiểm toán (sắp xếp mới nhất lên trước)
 */
export async function getAllHistoryRecords(): Promise<SyncRecord[]> {
  try {
    const records: SyncRecord[] = [];
    await historyStore.iterate<SyncRecord, void>((value) => {
      records.push(value);
    });
    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[localforage] Lỗi khi đọc lịch sử kiểm toán:', error);
    return [];
  }
}

/**
 * Xóa một bản ghi khỏi lịch sử
 */
export async function removeHistoryRecord(id: string): Promise<void> {
  try {
    await historyStore.removeItem(id);
  } catch (error) {
    console.error(`[localforage] Lỗi khi xóa bản ghi lịch sử ${id}:`, error);
  }
}

/**
 * Xóa toàn bộ lịch sử
 */
export async function clearAllHistory(): Promise<void> {
  try {
    await historyStore.clear();
  } catch (error) {
    console.error('[localforage] Lỗi khi xóa toàn bộ lịch sử:', error);
  }
}
