import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { SingleSurveyForm } from './components/SingleSurveyForm';
import { SurveyHistoryView } from './components/SurveyHistoryView';
import { SyncQueueModal } from './components/SyncQueueModal';
import { Toast } from './components/Toast';
import type { ToastMessage, ToastType } from './components/Toast';
import type { SurveyFormData, SyncRecord, NetworkState } from './types/survey';
import {
  saveDraft,
  getDraft,
  clearDraft,
  enqueueSyncRecord,
  getAllSyncRecords,
  removeSyncRecord,
  saveToHistory,
  getAllHistoryRecords,
  removeHistoryRecord,
  clearAllHistory,
  updateHistoryRecordStatus,
} from './services/db';
import { getNetworkStatus, registerNetworkListener } from './services/device';
import { processSyncQueue, startAutoBackgroundSync } from './services/syncEngine';

const INITIAL_FORM: SurveyFormData = {
  campusArea: 'Khu K',
  building: 'Tòa K.A',
  floor: '',
  room: '',
  category: 'Phần cứng',
  rating: 0,
  notes: '',
  photoBase64: null,
  location: null,
  auditorName: '',
  updatedAt: Date.now(),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'FORM' | 'HISTORY'>('FORM');
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM);
  const [isLoadedDraft, setIsLoadedDraft] = useState(false);
  const [network, setNetwork] = useState<NetworkState>({ connected: true, connectionType: 'wifi' });
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<SyncRecord[]>([]);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref lưu timer debounce auto-save draft
  const draftTimerRef = useRef<any>(null);

  // Helper hiển thị thông báo Toast
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Tải bản nháp và lịch sử từ IndexedDB khi mở ứng dụng
  useEffect(() => {
    async function loadInitialData() {
      try {
        const draft = await getDraft();
        if (draft && (draft.building || draft.room || draft.notes || draft.auditorName)) {
          setFormData((prev) => ({
            ...prev,
            ...draft,
            campusArea: draft.campusArea || 'Khu K',
            building: draft.building || 'Tòa K.A',
          }));
          showToast('Đã khôi phục bản nháp khảo sát từ IndexedDB', 'info');
        }
      } catch (err) {
        console.error('Lỗi load draft:', err);
      } finally {
        setIsLoadedDraft(true);
      }

      // Tải danh sách các phiếu trong Sync Queue
      try {
        const records = await getAllSyncRecords();
        setSyncRecords(records);
      } catch (err) {
        console.error('Lỗi load sync queue:', err);
      }

      // Tải toàn bộ lịch sử các phiếu đã làm
      try {
        const history = await getAllHistoryRecords();
        setHistoryRecords(history);
      } catch (err) {
        console.error('Lỗi load history:', err);
      }

      // Kiểm tra trạng thái mạng ban đầu
      const initialNet = await getNetworkStatus();
      setNetwork(initialNet);
    }

    loadInitialData();
  }, [showToast]);

  // 2. Lắng nghe thay đổi mạng & Khởi động Background Sync tự động
  useEffect(() => {
    const unsubNetwork = registerNetworkListener((state) => {
      setNetwork(state);
      if (!state.connected) {
        showToast('Mất kết nối mạng. Chế độ Offline lưu trữ IndexedDB được kích hoạt.', 'warning');
      } else {
        showToast('Đã kết nối Internet! Bắt đầu đồng bộ hàng đợi ngầm...', 'success');
      }
    });

    // Background Sync tự động chạy khi mạng online
    const unsubSync = startAutoBackgroundSync(async (result) => {
      const records = await getAllSyncRecords();
      setSyncRecords(records);
      const history = await getAllHistoryRecords();
      setHistoryRecords(history);
      showToast(`Đã tự động đồng bộ thành công ${result.success} phiếu kiểm toán lên hệ thống VKU!`, 'success');
    });

    return () => {
      unsubNetwork();
      unsubSync();
    };
  }, [showToast]);

  // 3. Tự động lưu bản nháp vào IndexedDB (Auto-save Draft with Debounce 300ms)
  const handleFieldChange = (field: keyof SurveyFormData, value: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
        updatedAt: Date.now(),
      };

      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }

      draftTimerRef.current = setTimeout(async () => {
        if (isLoadedDraft) {
          await saveDraft(updated);
        }
      }, 300);

      return updated;
    });
  };

  // 4. Xóa bản nháp thủ công
  const handleClearDraft = async () => {
    if (confirm('Bạn có chắc muốn làm mới toàn bộ phiếu khảo sát?')) {
      await clearDraft();
      setFormData({
        ...INITIAL_FORM,
        auditorName: formData.auditorName,
      });
      showToast('Đã làm mới phiếu khảo sát', 'info');
    }
  };

  // 5. Nộp phiếu kiểm toán (Submit - Lưu vào Sync Queue & Lưu vào Lịch sử)
  const handleSubmitSurvey = async () => {
    if (!formData.building || !formData.floor || !formData.room.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin Tòa nhà, Tầng và Số phòng!', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.category || formData.rating === 0) {
      showToast('Vui lòng chọn hạng mục và chấm điểm sao!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo đối tượng SyncRecord chuẩn
      const newRecord: SyncRecord = {
        id: uuidv4(),
        timestamp: Date.now(),
        status: 'PENDING_SYNC',
        payload: { ...formData },
        retryCount: 0,
      };

      // 1. Lưu vào Sync Queue IndexedDB
      await enqueueSyncRecord(newRecord);

      // 2. Lưu vĩnh viễn vào Lịch sử khảo sát
      await saveToHistory(newRecord);

      // 3. Xóa bản nháp hiện tại và reset form
      await clearDraft();
      setFormData({
        ...INITIAL_FORM,
        auditorName: formData.auditorName,
        campusArea: formData.campusArea,
        building: formData.building,
      });

      // 4. Cập nhật state Lịch sử
      const updatedHistory = await getAllHistoryRecords();
      setHistoryRecords(updatedHistory);

      // 5. Kiểm tra xem thiết bị đang Online hay Offline
      if (network.connected) {
        // TRƯỜNG HỢP CÓ MẠNG (ONLINE):
        setIsSyncing(true);
        try {
          const syncResult = await processSyncQueue();
          const updatedQueue = await getAllSyncRecords();
          setSyncRecords(updatedQueue);

          if (syncResult.success > 0) {
            // Cập nhật trạng thái trong lịch sử
            await updateHistoryRecordStatus(newRecord.id, 'SYNCED');
            const refreshedHistory = await getAllHistoryRecords();
            setHistoryRecords(refreshedHistory);
            showToast('Đã gửi phiếu kiểm toán thành công lên máy chủ VKU!', 'success');
          } else {
            showToast('Không thể kết nối máy chủ. Đã lưu vào hàng đợi offline và sẽ tự động gửi lại khi có mạng!', 'warning');
          }
        } catch {
          const updatedQueue = await getAllSyncRecords();
          setSyncRecords(updatedQueue);
          showToast('Lỗi gửi lên máy chủ. Đã lưu an toàn vào hàng đợi offline!', 'warning');
        } finally {
          setIsSyncing(false);
        }
      } else {
        // TRƯỜNG HỢP MẤT MẠNG (OFFLINE HOÀN TOÀN):
        const updatedQueue = await getAllSyncRecords();
        setSyncRecords(updatedQueue);
        showToast('Đã lưu offline. Dữ liệu sẽ tự động đồng bộ khi có mạng', 'info');
      }

      // Cuộn nhẹ lên đầu
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Lỗi khi nộp phiếu:', err);
      showToast('Có lỗi xảy ra khi lưu vào IndexedDB', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Kích hoạt đồng bộ thủ công
  const triggerManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await processSyncQueue();
      const updatedQueue = await getAllSyncRecords();
      setSyncRecords(updatedQueue);
      const updatedHistory = await getAllHistoryRecords();
      setHistoryRecords(updatedHistory);

      if (result.success > 0) {
        showToast(`Đồng bộ thành công ${result.success} phiếu lên máy chủ!`, 'success');
      } else if (result.failed > 0) {
        showToast(`Có ${result.failed} phiếu đồng bộ thất bại, sẽ thử lại sau`, 'warning');
      } else {
        showToast('Hàng đợi đã được đồng bộ hoàn tất!', 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi mạng';
      showToast(`Đồng bộ lỗi: ${msg}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 7. Xóa bản ghi trong Sync Queue
  const handleDeleteQueueRecord = async (id: string) => {
    await removeSyncRecord(id);
    const updated = await getAllSyncRecords();
    setSyncRecords(updated);
    showToast('Đã xóa bản ghi khỏi hàng đợi', 'info');
  };

  // 8. Xóa một bản ghi lịch sử
  const handleDeleteHistoryRecord = async (id: string) => {
    await removeHistoryRecord(id);
    const updated = await getAllHistoryRecords();
    setHistoryRecords(updated);
    showToast('Đã xóa bản ghi khỏi lịch sử', 'info');
  };

  // 9. Xóa toàn bộ lịch sử
  const handleClearAllHistory = async () => {
    await clearAllHistory();
    setHistoryRecords([]);
    showToast('Đã xóa sạch toàn bộ lịch sử', 'info');
  };

  const pendingCount = syncRecords.filter((r) => r.status === 'PENDING_SYNC' || r.status === 'FAILED').length;
  const hasDraftContent = Boolean(
    formData.room || formData.notes || formData.photoBase64
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {/* Header Bar */}
      <Header
        network={network}
        pendingCount={pendingCount}
        historyCount={historyRecords.length}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onManualSync={triggerManualSync}
        isSyncing={isSyncing}
        hasDraft={hasDraftContent}
        onClearDraft={handleClearDraft}
      />

      {/* Main Content: Phiếu Khảo Sát HOẶC Lịch Sử */}
      <main
        className="flex-1 max-w-2xl w-full mx-auto p-3 sm:p-6"
        style={{ paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom, 0px) + 3.5rem))' }}
      >
        {activeTab === 'FORM' ? (
          <>
            {/* Banner trạng thái Offline nếu mất mạng */}
            {!network.connected && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
                <span>
                  ⚡ <strong>Chế độ Ngoại tuyến:</strong> Đang mất mạng. Toàn bộ phiếu và ảnh sẽ được lưu trữ an toàn vào IndexedDB.
                </span>
              </div>
            )}

            {/* Tiêu đề phiếu kiểm toán */}
            <div className="mb-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Phiếu Kiểm Toán Cơ Sở Vật Chất
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)
                </p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-bold">
                Phiếu Khảo Sát
              </span>
            </div>

            {/* Single Long Form */}
            <SingleSurveyForm
              formData={formData}
              onChange={handleFieldChange}
              network={network}
              onSubmit={handleSubmitSurvey}
              onClearDraft={handleClearDraft}
              isSubmitting={isSubmitting}
              showToast={showToast}
            />
          </>
        ) : (
          <SurveyHistoryView
            historyRecords={historyRecords}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearAll={handleClearAllHistory}
            onNewSurvey={() => setActiveTab('FORM')}
          />
        )}
      </main>

      {/* Modal Hàng đợi Đồng bộ (Sync Queue) */}
      <SyncQueueModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        records={syncRecords}
        network={network}
        onManualSync={triggerManualSync}
        onDeleteRecord={handleDeleteQueueRecord}
        isSyncing={isSyncing}
      />

      {/* Hệ thống Toast thông báo */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
