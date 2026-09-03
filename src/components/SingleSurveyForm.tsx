import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  DoorClosed, 
  User, 
  Cpu, 
  Projector, 
  Wind, 
  Zap, 
  Armchair, 
  Star, 
  AlertCircle, 
  Camera, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  Send,
  CloudOff,
  Wifi,
  RotateCcw
} from 'lucide-react';
import type { SurveyFormData, CampusArea, FacilityCategory, NetworkState } from '../types/survey';
import { capturePhoto } from '../services/device';

interface SingleSurveyFormProps {
  formData: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  network: NetworkState;
  onSubmit: () => void;
  onClearDraft: () => void;
  isSubmitting: boolean;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

// Cấu trúc phân khu và tòa nhà VKU
const VKU_BUILDINGS: Record<CampusArea, { id: string; name: string; desc: string }[]> = {
  'Khu K': [
    { id: 'Tòa K.A', name: 'Tòa A (K.A)', desc: 'Khu giảng đường lý thuyết A' },
    { id: 'Tòa K.B', name: 'Tòa B (K.B)', desc: 'Khu phòng thực hành & Lab tin học' },
    { id: 'Tòa K.C', name: 'Tòa C (K.C)', desc: 'Khu Hiệu bộ, Văn phòng & Hội trường' },
    { id: 'Thư viện (Khu K)', name: 'Thư viện số VKU', desc: 'Không gian tự học & đọc sách' },
    { id: 'Ký túc xá (KTX)', name: 'Khu Ký túc xá (KTX)', desc: 'Khu nhà ở sinh viên' },
  ],
  'Khu V': [
    { id: 'Tòa V.A', name: 'Tòa A (V.A)', desc: 'Tòa nhà Đa năng & Giảng đường V.A' },
    { id: 'Tòa V.B', name: 'Tòa B (V.B)', desc: 'Khu Thực hành & Nghiên cứu V.B' },
  ],
};

const FLOORS = [
  'Tầng hầm (B1)',
  'Tầng 1 (G)',
  'Tầng 2',
  'Tầng 3',
  'Tầng 4',
  'Tầng 5',
  'Tầng 6',
  'Sân thượng / Kỹ thuật',
];

const CATEGORIES: { id: FacilityCategory; label: string; icon: any; desc: string }[] = [
  { id: 'Phần cứng', label: 'Phần cứng & PC', icon: Cpu, desc: 'Máy tính, màn hình, bàn phím, chuột phòng lab' },
  { id: 'Máy chiếu', label: 'Máy chiếu & Âm thanh', icon: Projector, desc: 'Máy chiếu, màn chiếu, cáp HDMI, loa mic' },
  { id: 'Điều hòa', label: 'Điều hòa & Quạt', icon: Wind, desc: 'Máy lạnh, remote, quạt thông gió' },
  { id: 'Điện', label: 'Điện & Chiếu sáng', icon: Zap, desc: 'Ổ cắm điện, công tắc, bóng đèn LED, aptomat' },
  { id: 'Nội thất', label: 'Bàn ghế & Nội thất', icon: Armchair, desc: 'Bàn ghế sinh viên, bục giảng, bảng viết, rèm che' },
];

const RATING_DESCRIPTIONS: Record<number, { text: string; color: string; bg: string }> = {
  1: { text: '1 Sao - Hỏng hóc nặng / Không thể sử dụng', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  2: { text: '2 Sao - Có lỗi nghiêm trọng / Cần sửa gấp', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  3: { text: '3 Sao - Hoạt động chập chờn / Cần bảo dưỡng', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  4: { text: '4 Sao - Tình trạng tốt / Có hao mòn nhẹ', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  5: { text: '5 Sao - Hoàn hảo / Mới và hoạt động rất tốt', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export const SingleSurveyForm: React.FC<SingleSurveyFormProps> = ({
  formData,
  onChange,
  network,
  onSubmit,
  onClearDraft,
  isSubmitting,
  showToast,
}) => {
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  // Đổi phân khu (Khu K / Khu V)
  const handleSelectArea = (area: CampusArea) => {
    onChange('campusArea', area);
    const buildingsInArea = VKU_BUILDINGS[area];
    if (!buildingsInArea.some(b => b.id === formData.building)) {
      onChange('building', buildingsInArea[0].id);
    }
  };

  // Chụp ảnh bằng chứng
  const handleTakePhoto = async () => {
    setIsCapturingPhoto(true);
    try {
      const base64 = await capturePhoto();
      if (base64) {
        onChange('photoBase64', base64);
        onChange('photoTimestamp', Date.now());
        showToast('Đã chụp ảnh hiện trường thành công!', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể chụp ảnh';
      showToast(`Lỗi Camera: ${msg}`, 'error');
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  // Xóa ảnh
  const handleRemovePhoto = () => {
    onChange('photoBase64', null);
    onChange('photoTimestamp', undefined);
    showToast('Đã xóa ảnh đính kèm', 'info');
  };

  const currentBuildings = VKU_BUILDINGS[formData.campusArea || 'Khu K'];
  const isFormValid = Boolean(
    formData.auditorName.trim() &&
    formData.building &&
    formData.floor &&
    formData.room.trim() &&
    formData.category &&
    formData.rating > 0
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {/* ==================== PHẦN 1: VỊ TRÍ KHUÔN VIÊN VKU ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
              1
            </span>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Địa điểm & Vị trí kiểm toán
            </h2>
          </div>
          <span className="text-[11px] text-red-600 font-medium">* Bắt buộc</span>
        </div>

        {/* 1.1 Người kiểm toán */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Kiểm toán viên / Sinh viên <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.auditorName}
            onChange={(e) => onChange('auditorName', e.target.value)}
            placeholder="VD: Lê Hoàng Nam (21IT089)"
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* 1.2 Phân khu VKU (Khu K / Khu V) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Phân khu VKU <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['Khu K', 'Khu V'] as CampusArea[]).map((area) => {
              const isSelected = formData.campusArea === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleSelectArea(area)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-extrabold">{area}</div>
                  <div className={`text-[11px] font-normal mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {area === 'Khu K' ? 'Tòa A, B, C, Thư viện, KTX' : 'Tòa A, Tòa B'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.3 Chọn Tòa nhà theo khu đã chọn */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Tòa nhà tại {formData.campusArea || 'Khu K'} <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentBuildings.map((b) => {
              const isSelected = formData.building === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChange('building', b.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{b.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.4 Tầng & Số phòng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Tầng <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.floor}
              onChange={(e) => onChange('floor', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">-- Chọn tầng --</option>
              {FLOORS.map((f) => (
                <option key={f} value={f} className="bg-white text-slate-900">
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
              Số phòng / Khu vực <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => onChange('room', e.target.value)}
              placeholder="VD: KA.204, KB.301, VA.102..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </section>

      {/* ==================== PHẦN 2: HẠNG MỤC & ĐÁNH GIÁ ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
              2
            </span>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Hạng mục & Đánh giá hiện trạng
            </h2>
          </div>
        </div>

        {/* 2.1 Chọn Hạng mục */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Hạng mục thiết bị <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange('category', cat.id)}
                  className={`text-left p-3 rounded-xl border flex items-start space-x-3 transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2.2 Đánh giá 1 - 5 sao (Vàng nổi bật) */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            Đánh giá tình trạng (1 - 5 sao) <span className="text-red-600">*</span>
          </label>

          <div className="flex items-center space-x-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange('rating', star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                    star <= formData.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 fill-white hover:text-slate-400'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm sm:text-base font-bold text-amber-700">
              {formData.rating > 0 ? `${formData.rating}/5 sao` : ''}
            </span>
          </div>

          {formData.rating > 0 && (
            <div
              className={`text-xs font-medium p-2.5 rounded-lg border ${
                RATING_DESCRIPTIONS[formData.rating].bg
              } ${RATING_DESCRIPTIONS[formData.rating].color}`}
            >
              {RATING_DESCRIPTIONS[formData.rating].text}
            </div>
          )}
        </div>

        {/* 2.3 Ghi chú lỗi chi tiết */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Ghi chú chi tiết sự cố
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={3}
            placeholder="Mô tả cụ thể sự cố (VD: Máy chiếu phòng KA.204 bị mờ, quạt trần số 2 kêu to...)"
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </section>

      {/* ==================== PHẦN 3: BẰNG CHỨNG HÌNH ẢNH ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs">
              3
            </span>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Bằng chứng Hình ảnh hiện trường
            </h2>
          </div>
        </div>

        {/* Chụp ảnh hiện trường */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Ảnh chụp hiện trường
            </label>
            {formData.photoBase64 && (
              <span className="text-[11px] text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Đã lưu Offline
              </span>
            )}
          </div>

          {formData.photoBase64 ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
              <img
                src={formData.photoBase64}
                alt="Ảnh chụp hiện trường"
                className="w-full h-56 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end justify-between p-3.5">
                <span className="text-[11px] font-mono text-white bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg">
                  {formData.photoTimestamp ? new Date(formData.photoTimestamp).toLocaleTimeString('vi-VN') : ''}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={isCapturingPhoto}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCapturingPhoto ? 'animate-spin' : ''}`} />
                    Chụp lại
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={isCapturingPhoto}
              className="w-full h-36 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center p-4 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-2">
                <Camera className={`w-5 h-5 ${isCapturingPhoto ? 'animate-bounce' : ''}`} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-600">
                {isCapturingPhoto ? 'Đang mở Camera...' : 'Bấm để chụp ảnh hoặc chọn ảnh'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Tự động lưu trữ an toàn vào IndexedDB
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ==================== PHẦN 4: THÔNG BÁO MẠNG & NÚT GỬI PHIẾU ==================== */}
      <section className="space-y-3">
        {/* Banner trạng thái kết nối */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition-all ${
            network.connected
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {network.connected ? (
            <Wifi className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CloudOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">
              {network.connected ? 'Thiết bị đang Trực tuyến (Online)' : 'Thiết bị đang Ngoại tuyến (Offline)'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {network.connected
                ? 'Dữ liệu sẽ được gửi trực tiếp lên hệ thống máy chủ VKU.'
                : 'Phiếu kiểm toán sẽ được lưu an toàn vào IndexedDB và tự động đồng bộ khi có mạng.'}
            </div>
          </div>
        </div>

        {/* Nút Submit Đỏ Rực VKU & Nút Làm Mới */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full flex-1 py-3.5 px-6 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 text-white disabled:opacity-40 disabled:cursor-not-allowed ${
              network.connected
                ? 'bg-red-600 hover:bg-red-700 active:scale-[0.99]'
                : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Đang gửi...'
                : network.connected
                ? 'Gửi phiếu lên máy chủ VKU'
                : 'Lưu vào Hàng đợi Offline'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClearDraft}
            className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            title="Làm mới phiếu"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Làm mới</span>
          </button>
        </div>
      </section>
    </form>
  );
};
