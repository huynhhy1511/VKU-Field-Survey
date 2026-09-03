import React from 'react';
import { 
  X, 
  RefreshCw, 
  Trash2, 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Camera, 
  Star 
} from 'lucide-react';
import type { SyncRecord, NetworkState } from '../types/survey';

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SyncRecord[];
  network: NetworkState;
  onManualSync: () => void;
  onDeleteRecord: (id: string) => void;
  isSyncing: boolean;
}

export const SyncQueueModal: React.FC<SyncQueueModalProps> = ({
  isOpen,
  onClose,
  records,
  network,
  onManualSync,
  onDeleteRecord,
  isSyncing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Hàng đợi Đồng bộ (Sync Queue)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Dữ liệu lưu an toàn tại IndexedDB trên máy ({records.length} bản ghi)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                network.connected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-600 font-medium">
              {network.connected ? 'Sẵn sàng gửi dữ liệu lên máy chủ' : 'Đang mất mạng - Tiếp tục lưu offline'}
            </span>
          </div>

          <button
            onClick={onManualSync}
            disabled={!network.connected || isSyncing || records.length === 0}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
          </button>
        </div>

        {/* Records List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-700">Hàng đợi đồng bộ đang trống</p>
              <p className="text-xs text-slate-500 mt-1">
                Tất cả dữ liệu kiểm toán đã được đồng bộ an toàn lên hệ thống VKU.
              </p>
            </div>
          ) : (
            records.map((record) => {
              const isPending = record.status === 'PENDING_SYNC';
              const isSyncingRecord = record.status === 'SYNCING';
              const isFailed = record.status === 'FAILED';

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  {/* Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-semibold">
                        {record.id.substring(0, 8)}...
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {record.payload.building} • {record.payload.room}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {record.payload.category}
                      </span>
                    </div>

                    <div className="text-slate-500 flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(record.timestamp).toLocaleTimeString('vi-VN')} -{' '}
                        {new Date(record.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {record.payload.rating}/5
                      </span>
                      {record.payload.photoBase64 && (
                        <span className="flex items-center gap-1 text-sky-700 font-semibold">
                          <Camera className="w-3 h-3" /> Có ảnh
                        </span>
                      )}
                      {record.payload.location && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <MapPin className="w-3 h-3" /> Có GPS
                        </span>
                      )}
                    </div>

                    {record.payload.notes && (
                      <div className="text-slate-600 line-clamp-1 italic text-[11px]">
                        "{record.payload.notes}"
                      </div>
                    )}

                    {isFailed && record.errorMessage && (
                      <div className="text-rose-700 text-[10px] flex items-center gap-1 bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        Lỗi: {record.errorMessage} (Thử lại lần {record.retryCount})
                      </div>
                    )}
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isPending && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold">
                        Chờ gửi
                      </span>
                    )}
                    {isSyncingRecord && (
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang gửi...
                      </span>
                    )}
                    {isFailed && (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[10px] font-bold">
                        Thất bại
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa bản ghi này khỏi bộ nhớ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 bg-white text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
