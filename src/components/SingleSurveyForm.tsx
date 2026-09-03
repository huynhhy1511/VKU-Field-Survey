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
  MapPin, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
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

// Cấu trúc phân khu và tòa nhà VKU theo yêu cầu
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
  1: { text: '1 Sao - Hỏng hóc nặng / Không thể sử dụng', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  2: { text: '2 Sao - Có lỗi nghiêm trọng / Cần sửa gấp', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  3: { text: '3 Sao - Hoạt động chập chờn / Cần bảo dưỡng', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  4: { text: '4 Sao - Tình trạng tốt / Có hao mòn nhẹ', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  5: { text: '5 Sao - Hoàn hảo / Mới và hoạt động rất tốt', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
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
    // Tự động chọn tòa đầu tiên của khu mới nếu tòa hiện tại không thuộc khu đó
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
      className="space-y-6"
    >
      {/* ==================== PHẦN 1: VỊ TRÍ KHUÔN VIÊN VKU ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
              1
            </span>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600" />
              Địa điểm & Vị trí kiểm toán
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">* Bắt buộc điền</span>
        </div>

        {/* 1.1 Người kiểm toán */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-sky-600" />
            Kiểm toán viên / Sinh viên phụ trách <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.auditorName}
            onChange={(e) => onChange('auditorName', e.target.value)}
            placeholder="VD: Lê Hoàng Nam (21IT089)"
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all shadow-2xs"
          />
        </div>

        {/* 1.2 Phân khu VKU (Khu K / Khu V) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            Chọn Phân khu VKU <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['Khu K', 'Khu V'] as CampusArea[]).map((area) => {
              const isSelected = formData.campusArea === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleSelectArea(area)}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20 scale-[1.01]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="text-base font-extrabold">{area}</div>
                  <div className={`text-[11px] font-normal mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                    {area === 'Khu K' ? 'Tòa A, B, C, Thư viện, KTX' : 'Tòa A, Tòa B'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.3 Chọn Tòa nhà theo khu đã chọn */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>Tòa nhà tại {formData.campusArea || 'Khu K'}</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentBuildings.map((b) => {
              const isSelected = formData.building === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChange('building', b.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-sky-50/90 border-sky-500 text-sky-950 ring-2 ring-sky-200 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">{b.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.4 Tầng & Số phòng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              Tầng <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.floor}
              onChange={(e) => onChange('floor', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all shadow-2xs"
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
              <DoorClosed className="w-3.5 h-3.5 text-sky-600" />
              Số phòng / Khu vực <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => onChange('room', e.target.value)}
              placeholder="VD: KA.204, KB.301, VA.102..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all shadow-2xs"
            />
          </div>
        </div>
      </section>

      {/* ==================== PHẦN 2: HẠNG MỤC & ĐÁNH GIÁ ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
              2
            </span>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-600" />
              Hạng mục & Đánh giá hiện trạng
            </h2>
          </div>
        </div>

        {/* 2.1 Chọn Hạng mục */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            Hạng mục cơ sở vật chất <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange('category', cat.id)}
                  className={`text-left p-3.5 rounded-xl border flex items-start space-x-3 transition-all ${
                    isSelected
                      ? 'bg-sky-50/90 border-sky-500 text-sky-950 ring-2 ring-sky-200 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2.2 Đánh giá 1 - 5 sao */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            Đánh giá tình trạng (1 - 5 sao) <span className="text-rose-500">*</span>
          </label>

          <div className="flex items-center space-x-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange('rating', star)}
                className="p-1 focus:outline-none transition-transform hover:scale-115 active:scale-95"
              >
                <Star
                  className={`w-9 h-9 transition-colors duration-200 ${
                    star <= formData.rating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                      : 'text-slate-300 fill-slate-100 hover:text-slate-400'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-base font-extrabold text-amber-600">
              {formData.rating > 0 ? `${formData.rating}/5 sao` : ''}
            </span>
          </div>

          {formData.rating > 0 && (
            <div
              className={`text-xs font-semibold p-2.5 rounded-lg border ${
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
            <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
            Ghi chú lỗi & Chi tiết hiện trạng
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={3}
            placeholder="Mô tả cụ thể sự cố (VD: Máy chiếu phòng KA.204 bị mờ, cổng HDMI chập chờn; Máy tính số 15 hỏng nguồn...)"
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all shadow-2xs"
          />
        </div>
      </section>

      {/* ==================== PHẦN 3: BẰNG CHỨNG HÌNH ẢNH ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs">
              3
            </span>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-sky-600" />
              Bằng chứng Hình ảnh hiện trường
            </h2>
          </div>
        </div>

        {/* 3.1 Chụp ảnh hiện trường */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
              Ảnh chụp hiện trường thiết bị / phòng học
            </label>
            {formData.photoBase64 && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã lưu Base64 Offline
              </span>
            )}
          </div>

          {formData.photoBase64 ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-sky-300 bg-slate-100 group shadow-md">
              <img
                src={formData.photoBase64}
                alt="Ảnh chụp hiện trường"
                className="w-full h-56 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end justify-between p-3.5">
                <span className="text-[11px] font-mono text-white bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg">
                  Ghi nhận: {formData.photoTimestamp ? new Date(formData.photoTimestamp).toLocaleTimeString('vi-VN') : ''}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={isCapturingPhoto}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCapturingPhoto ? 'animate-spin' : ''}`} />
                    Chụp lại
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
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
              className="w-full h-40 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl flex flex-col items-center justify-center p-4 transition-all group shadow-2xs"
            >
              <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-colors mb-2 shadow-xs">
                <Camera className={`w-5 h-5 ${isCapturingPhoto ? 'animate-bounce' : ''}`} />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-sky-700">
                {isCapturingPhoto ? 'Đang mở Camera...' : 'Bấm để chụp ảnh hoặc chọn ảnh'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Tự động nén và lưu Base64 an toàn vào IndexedDB
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ==================== PHẦN 4: THÔNG BÁO MẠNG & NÚT GỬI PHIẾU ==================== */}
      <section className="space-y-4">
        {/* Banner trạng thái kết nối */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs transition-all ${
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
                ? 'Dữ liệu phiếu sẽ được gửi trực tiếp lên hệ thống máy chủ VKU ngay lập tức.'
                : 'Phiếu kiểm toán sẽ được lưu an toàn vào IndexedDB. Khi bạn di chuyển đến nơi có sóng 4G/Wi-Fi, hệ thống sẽ tự động đồng bộ ngầm.'}
            </div>
          </div>
        </div>

        {/* Nút Submit & Hủy nháp */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full flex-1 py-3.5 px-6 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed ${
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

          <button
            type="button"
            onClick={onClearDraft}
            className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            title="Xóa trắng form hiện tại để nhập phiếu mới"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Làm mới phiếu</span>
          </button>
        </div>
      </section>
    </form>
  );
};
