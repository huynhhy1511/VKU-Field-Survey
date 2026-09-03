import React, { useState } from 'react';
import { Camera, MapPin, Trash2, RefreshCw, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';
import { capturePhoto, getCurrentCoordinates } from '../services/device';

interface Step3Props {
  formData: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const Step3Evidence: React.FC<Step3Props> = ({
  formData,
  onChange,
  onNext,
  onPrev,
  showToast,
}) => {
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Xử lý chụp ảnh hiện trường (Base64)
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

  // Xóa ảnh đã chụp
  const handleRemovePhoto = () => {
    onChange('photoBase64', null);
    onChange('photoTimestamp', undefined);
    showToast('Đã xóa ảnh bằng chứng', 'info');
  };

  // Xử lý lấy tọa độ GPS
  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await getCurrentCoordinates();
      onChange('location', coords);
      showToast('Đã ghi nhận tọa độ GPS tại cơ sở VKU!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lấy tọa độ';
      showToast(`Lỗi GPS: ${msg}`, 'warning');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề bước */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-sky-600" />
          Bước 3: Bằng chứng Hình ảnh & Tọa độ GPS
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Chụp ảnh lỗi thực tế (lưu Base64 offline) và ghim tọa độ thực địa
        </p>
      </div>

      {/* 1. Phần Chụp ảnh hiện trường */}
      <div className="space-y-3">
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
            className="w-full h-44 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl flex flex-col items-center justify-center p-4 transition-all group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-colors mb-2 shadow-xs">
              <Camera className={`w-6 h-6 ${isCapturingPhoto ? 'animate-bounce' : ''}`} />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-sky-700">
              {isCapturingPhoto ? 'Đang mở Camera...' : 'Bấm để chụp ảnh hoặc chọn ảnh'}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Ảnh được nén và chuyển thành chuỗi Base64 lưu an toàn vào IndexedDB
            </span>
          </button>
        )}
      </div>

      {/* 2. Phần Tọa độ GPS */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            Tọa độ thực địa (GPS Geolocation)
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3 h-3 ${isGettingLocation ? 'animate-spin' : ''}`} />
            {isGettingLocation ? 'Đang định vị...' : formData.location ? 'Cập nhật GPS' : 'Lấy tọa độ'}
          </button>
        </div>

        {formData.location ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-semibold">Vĩ độ (Latitude)</div>
              <div className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                {formData.location.latitude.toFixed(6)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-semibold">Kinh độ (Longitude)</div>
              <div className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                {formData.location.longitude.toFixed(6)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-500 font-semibold">Độ chính xác</div>
              <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                ±{Math.round(formData.location.accuracy || 5)} mét
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Chưa ghi nhận GPS. Hãy bấm nút <strong>"Lấy tọa độ"</strong> để xác định vị trí thực địa tại VKU.</span>
          </div>
        )}
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
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <span>Tiếp theo: Xem lại & Đệ trình</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
