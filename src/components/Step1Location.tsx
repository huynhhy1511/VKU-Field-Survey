import React from 'react';
import { Building2, Layers, DoorClosed, User } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';

interface Step1Props {
  formData: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  onNext: () => void;
}

const BUILDINGS = [
  { id: 'Tòa K', name: 'Tòa K (Khu Hành chính & Đào tạo)', desc: 'Tòa nhà trung tâm' },
  { id: 'Tòa V', name: 'Tòa V (Khu Đa Năng & Hội trường)', desc: 'Phòng thực hành, hội trường' },
  { id: 'Tòa H', name: 'Tòa H (Trung tâm Viễn thông & AI)', desc: 'Phòng Lab, Server' },
  { id: 'Tòa F', name: 'Tòa F (Giảng đường Sinh viên)', desc: 'Các phòng học lý thuyết' },
  { id: 'Thư viện', name: 'Thư viện số & Không gian tự học', desc: 'Khu tự học, đọc sách' },
  { id: 'Ký túc xá', name: 'Khu Ký túc xá Sinh viên', desc: 'Phòng ở & tiện ích SV' },
];

const FLOORS = [
  'Tầng hầm (B1)',
  'Tầng 1 (G)',
  'Tầng 2',
  'Tầng 3',
  'Tầng 4',
  'Tầng 5',
  'Tầng 6',
  'Sân thượng / Khu kỹ thuật',
];

export const Step1Location: React.FC<Step1Props> = ({ formData, onChange, onNext }) => {
  const isValid = formData.building && formData.floor && formData.room.trim() && formData.auditorName.trim();

  return (
    <div className="space-y-6">
      {/* Tiêu đề bước */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-600" />
          Bước 1: Vị trí kiểm toán tại VKU
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Chọn khu vực và phòng học cần đánh giá hiện trạng cơ sở vật chất
        </p>
      </div>

      {/* 1. Người kiểm định */}
      <div className="space-y-2">
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

      {/* 2. Chọn Tòa nhà */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-sky-600" />
          Tòa nhà <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BUILDINGS.map((b) => {
            const isSelected = formData.building === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange('building', b.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-500 text-sky-950 ring-2 ring-sky-200 shadow-sm'
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

      {/* 3. Tầng và Số phòng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tầng */}
        <div className="space-y-2">
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

        {/* Số phòng */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <DoorClosed className="w-3.5 h-3.5 text-sky-600" />
            Số phòng / Khu vực <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => onChange('room', e.target.value)}
            placeholder="VD: K.302, Lab 4, Sảnh T1..."
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Chuyển sang bước tiếp */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <span>Tiếp theo: Hạng mục & Đánh giá</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
