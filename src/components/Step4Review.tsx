import React from 'react';
import { 
  FileCheck, 
  MapPin, 
  Building2, 
  Cpu, 
  Star, 
  Camera, 
  Send, 
  CloudOff, 
  CheckCircle2, 
  User, 
  Clock,
  Wifi
} from 'lucide-react';
import type { SurveyFormData, NetworkState } from '../types/survey';

interface Step4Props {
  formData: SurveyFormData;
  network: NetworkState;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export const Step4Review: React.FC<Step4Props> = ({
  formData,
  network,
  onSubmit,
  onPrev,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6">
      {/* Tiêu đề bước */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-sky-600" />
          Bước 4: Xác nhận thông tin phiếu kiểm toán
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kiểm tra lại toàn bộ dữ liệu trước khi gửi hoặc lưu trữ
        </p>
      </div>

      {/* Thông tin thẻ tổng hợp */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
        {/* Người kiểm toán & Thời gian */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <User className="w-3.5 h-3.5 text-sky-600" />
            Kiểm toán viên: <span className="font-bold text-slate-900">{formData.auditorName || 'Chưa nhập'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Địa điểm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-500 font-semibold flex items-center gap-1 mb-1">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              Tòa nhà & Khu vực
            </div>
            <div className="font-bold text-slate-900 text-sm">{formData.building || 'Chưa chọn'}</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              {formData.floor} • Phòng: <span className="text-sky-700 font-bold">{formData.room}</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-500 font-semibold flex items-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              Hạng mục & Điểm đánh giá
            </div>
            <div className="font-bold text-slate-900 text-sm">{formData.category}</div>
            <div className="flex items-center gap-1 text-amber-500 mt-0.5 font-bold">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-amber-700">({formData.rating}/5 sao)</span>
            </div>
          </div>
        </div>

        {/* Ghi chú lỗi */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
          <div className="text-slate-500 mb-1 font-semibold">Chi tiết lỗi / Hiện trạng ghi nhận:</div>
          <div className="text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
            {formData.notes || '(Không có ghi chú thêm)'}
          </div>
        </div>

        {/* Bằng chứng Ảnh & GPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Ảnh */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-500 flex items-center gap-1 mb-2 font-semibold">
              <Camera className="w-3.5 h-3.5 text-sky-600" />
              Ảnh hiện trường (Base64)
            </div>
            {formData.photoBase64 ? (
              <div className="flex items-center gap-3">
                <img
                  src={formData.photoBase64}
                  alt="Thumbnail"
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã sẵn sàng
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Lưu an toàn vào IndexedDB</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px]">Chưa đính kèm ảnh</div>
            )}
          </div>

          {/* GPS */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-500 flex items-center gap-1 mb-2 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              Tọa độ GPS thực địa
            </div>
            {formData.location ? (
              <div>
                <div className="font-mono text-sky-700 font-bold text-[11px]">
                  {formData.location.latitude.toFixed(5)}, {formData.location.longitude.toFixed(5)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Độ chính xác: ±{Math.round(formData.location.accuracy || 0)}m
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px]">Chưa ghi nhận GPS</div>
            )}
          </div>
        </div>
      </div>

      {/* Thông báo cơ chế Trực tuyến / Ngoại tuyến thông minh */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 text-xs transition-all ${
          network.connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        {network.connected ? (
          <Wifi className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <CloudOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-bold">
            {network.connected
              ? 'Thiết bị đang Trực tuyến (Online)'
              : 'Thiết bị đang Ngoại tuyến (Offline Mode)'}
          </div>
          <div className="text-[11px] opacity-90 mt-0.5 leading-normal">
            {network.connected
              ? 'Dữ liệu sẽ được gửi trực tiếp lên hệ thống máy chủ VKU ngay lập tức.'
              : 'Dữ liệu sẽ được lưu an toàn vào IndexedDB của máy. Khi bạn di chuyển đến nơi có sóng 4G/Wi-Fi, hệ thống sẽ tự động đồng bộ ngầm.'}
          </div>
        </div>
      </div>

      {/* Điều hướng Next / Prev & Submit */}
      <div className="pt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition-all"
        >
          &larr; Chỉnh sửa lại
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
            network.connected
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
              : 'bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 shadow-sky-600/20'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Đang xử lý...'
              : network.connected
              ? 'Gửi phiếu lên máy chủ VKU'
              : 'Lưu vào Hàng đợi Offline'}
          </span>
        </button>
      </div>
    </div>
  );
};
