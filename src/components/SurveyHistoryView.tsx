import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Star, 
  Camera, 
  User, 
  X, 
  PlusCircle,
  Maximize2
} from 'lucide-react';
import type { SyncRecord } from '../types/survey';

interface SurveyHistoryViewProps {
  historyRecords: SyncRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNewSurvey: () => void;
}

export const SurveyHistoryView: React.FC<SurveyHistoryViewProps> = ({
  historyRecords,
  onDeleteRecord,
  onClearAll,
  onNewSurvey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<'ALL' | 'Khu K' | 'Khu V' | 'SYNCED' | 'PENDING'>('ALL');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Lọc và tìm kiếm danh sách lịch sử
  const filteredRecords = useMemo(() => {
    return historyRecords.filter((record) => {
      const p = record.payload;
      const matchSearch =
        p.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.auditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterArea === 'Khu K') return p.campusArea === 'Khu K' || p.building.includes('K');
      if (filterArea === 'Khu V') return p.campusArea === 'Khu V' || p.building.includes('V');
      if (filterArea === 'SYNCED') return record.status === 'SYNCED';
      if (filterArea === 'PENDING') return record.status === 'PENDING_SYNC' || record.status === 'FAILED';

      return true;
    });
  }, [historyRecords, searchTerm, filterArea]);

  const syncedCount = historyRecords.filter((r) => r.status === 'SYNCED').length;
  const pendingCount = historyRecords.filter((r) => r.status === 'PENDING_SYNC' || r.status === 'FAILED').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header & Nút hành động */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                Lịch Sử Phiếu Kiểm Toán
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Toàn bộ các phiếu đã đánh giá lưu trên thiết bị ({historyRecords.length} phiếu)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNewSurvey}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Phiếu Mới</span>
          </button>

          {historyRecords.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử khảo sát?')) {
                  onClearAll();
                }
              }}
              className="px-3 py-2.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors"
              title="Xóa toàn bộ lịch sử"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Thống kê nhanh */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-semibold">Tổng số phiếu</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">{historyRecords.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-emerald-700 font-semibold">Đã đồng bộ</div>
          <div className="text-lg font-extrabold text-emerald-600 mt-0.5">{syncedCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-amber-700 font-semibold">Chờ gửi offline</div>
          <div className="text-lg font-extrabold text-amber-600 mt-0.5">{pendingCount}</div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và bộ lọc */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo phòng (KA.204), tòa nhà, người kiểm toán..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Các nút lọc */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'Khu K', label: 'Khu K' },
            { id: 'Khu V', label: 'Khu V' },
            { id: 'SYNCED', label: 'Đã gửi máy chủ' },
            { id: 'PENDING', label: 'Chờ đồng bộ' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterArea(f.id as any)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                filterArea === f.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Danh sách các phiếu khảo sát */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-2.5" />
            <h3 className="font-bold text-slate-700 text-sm">Chưa có phiếu kiểm toán nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filterArea !== 'ALL'
                ? 'Không tìm thấy phiếu nào phù hợp với bộ lọc hiện tại.'
                : 'Hãy bắt đầu khảo sát cơ sở vật chất các phòng học tại VKU.'}
            </p>
            <button
              onClick={onNewSurvey}
              className="mt-4 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Phiếu Ngay</span>
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const p = record.payload;
            const isSynced = record.status === 'SYNCED';

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 shadow-2xs transition-all space-y-3.5"
              >
                {/* Header thẻ: Địa điểm & Trạng thái */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900">
                        {p.building} • Phòng {p.room}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.campusArea || 'VKU'} • {p.floor}</span>
                    </div>
                  </div>

                  {/* Badge trạng thái đồng bộ */}
                  <div className="flex items-center gap-1.5">
                    {isSynced ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã đồng bộ
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-600" /> Chờ gửi offline
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa bản ghi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rating & Ghi chú */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= p.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-amber-700">{p.rating}/5 sao</span>
                  </div>

                  {p.notes && (
                    <div className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                      "{p.notes}"
                    </div>
                  )}
                </div>

                {/* Footer: Ảnh thumbnail & Người kiểm toán */}
                <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {p.photoBase64 && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(p.photoBase64)}
                        className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-2xs flex-shrink-0"
                        title="Bấm để xem ảnh lớn"
                      >
                        <img
                          src={p.photoBase64}
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    )}

                    <div>
                      <div className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        <span>{p.auditorName || 'Kiểm toán viên'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(record.timestamp).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ID: {record.id.substring(0, 8)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Modal Phóng to Ảnh (Image Preview) */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-600" /> Ảnh chụp hiện trường
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-slate-900 flex items-center justify-center">
              <img
                src={previewImage}
                alt="Ảnh phóng to"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
