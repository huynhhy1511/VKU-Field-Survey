import React from 'react';
import { Cpu, Projector, Wind, Zap, Armchair, Star, AlertCircle } from 'lucide-react';
import type { FacilityCategory, SurveyFormData } from '../types/survey';

interface Step2Props {
  formData: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const CATEGORIES: { id: FacilityCategory; label: string; icon: any; desc: string }[] = [
  { id: 'Phần cứng', label: 'Phần cứng & PC', icon: Cpu, desc: 'Máy tính thực hành, màn hình, chuột, bàn phím' },
  { id: 'Máy chiếu', label: 'Máy chiếu & Âm thanh', icon: Projector, desc: 'Máy chiếu, màn chiếu, cáp HDMI, loa mic' },
  { id: 'Điều hòa', label: 'Điều hòa & Thông gió', icon: Wind, desc: 'Máy lạnh, remote, quạt trần thông gió' },
  { id: 'Điện', label: 'Hệ thống Điện & Chiếu sáng', icon: Zap, desc: 'Ổ cắm điện bàn học, bóng đèn LED, aptomat' },
  { id: 'Nội thất', label: 'Bàn ghế & Nội thất', icon: Armchair, desc: 'Bàn ghế sinh viên, bảng viết, cửa sổ, rèm che' },
];

const RATING_DESCRIPTIONS: Record<number, { text: string; color: string; bg: string }> = {
  1: { text: '1 Sao - Hỏng hóc nặng / Không thể sử dụng', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  2: { text: '2 Sao - Có lỗi nghiêm trọng / Cần sửa chữa gấp', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  3: { text: '3 Sao - Hoạt động chập chờn / Cần bảo dưỡng', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  4: { text: '4 Sao - Tình trạng tốt / Có trầy xước nhẹ', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  5: { text: '5 Sao - Hoàn hảo / Mới và hoạt động rất tốt', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
};

export const Step2CategoryRating: React.FC<Step2Props> = ({
  formData,
  onChange,
  onNext,
  onPrev,
}) => {
  const isValid = formData.category && formData.rating > 0 && formData.notes.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Tiêu đề bước */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-600" />
          Bước 2: Hạng mục & Đánh giá hiện trạng
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Chọn loại thiết bị cơ sở vật chất và cho điểm chất lượng thực tế
        </p>
      </div>

      {/* 1. Chọn Hạng mục */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          Hạng mục kiểm tra <span className="text-rose-500">*</span>
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
                    ? 'bg-sky-50/90 border-sky-500 text-sky-950 ring-2 ring-sky-200 shadow-sm'
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

      {/* 2. Đánh giá tình trạng (1-5 sao) */}
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
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'text-slate-300 fill-slate-100 hover:text-slate-400'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-base font-extrabold text-amber-600">
            {formData.rating > 0 ? `${formData.rating}/5` : ''}
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

      {/* 3. Ghi chú chi tiết / Mô tả lỗi */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
          Ghi chú lỗi & Chi tiết hiện trạng <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          placeholder="Mô tả cụ thể sự cố (VD: Máy chiếu phòng K.302 bị mờ và đứt cáp HDMI; Máy số 12 bị xanh màn hình...)"
          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all shadow-2xs"
        />
      </div>

      {/* Điều hướng Next / Prev */}
      <div className="pt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition-all"
        >
          &larr; Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <span>Tiếp theo: Chụp ảnh & GPS</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
