import React from 'react';
import { Wifi, WifiOff, CloudUpload, RefreshCw, Layers, ClipboardEdit, History } from 'lucide-react';
import type { NetworkState } from '../types/survey';

interface HeaderProps {
  network: NetworkState;
  pendingCount: number;
  historyCount: number;
  activeTab: 'FORM' | 'HISTORY';
  onChangeTab: (tab: 'FORM' | 'HISTORY') => void;
  onOpenSyncModal: () => void;
  onManualSync: () => void;
  isSyncing: boolean;
  hasDraft: boolean;
  onClearDraft: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  network,
  pendingCount,
  historyCount,
  activeTab,
  onChangeTab,
  onOpenSyncModal,
  onManualSync,
  isSyncing,
  hasDraft,
  onClearDraft,
}) => {
  return (
    <header
      style={{
        paddingTop: 'max(14px, calc(env(safe-area-inset-top, 0px) + 10px))',
      }}
      className="sticky top-0 z-30 bg-white border-b border-slate-200 text-slate-800 shadow-2xs px-3 sm:px-4 pb-3"
    >
      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Top bar: Logo + Network + Sync actions */}
        <div className="flex items-center justify-between">
          {/* Logo và Tiêu đề VKU */}
          <div className="flex items-center space-x-2.5">
            {/* Logo xanh chủ đạo chuẩn VKU */}
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  VKU Field Survey
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Đại học CNTT & TT Việt - Hàn
              </p>
            </div>
          </div>

          {/* Action Controls & Indicators */}
          <div className="flex items-center space-x-2">
            {/* Trạng thái Mạng (Network Badge) */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                network.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
              title={network.connected ? 'Đang có kết nối Internet' : 'Đang mất kết nối (Offline)'}
            >
              {network.connected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline font-bold">Online</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <WifiOff className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-bold">Offline</span>
                </>
              )}
            </div>

            {/* Nút Hàng đợi Sync Queue với Badge Vàng */}
            <button
              onClick={onOpenSyncModal}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 border border-slate-200"
              title="Xem danh sách hàng đợi đồng bộ"
            >
              <CloudUpload className="w-4 h-4 text-blue-600" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-extrabold text-white bg-amber-500 rounded-full ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Nút Đồng bộ nhanh thủ công khi có mạng */}
            {network.connected && pendingCount > 0 && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang gửi...' : 'Đồng bộ'}</span>
              </button>
            )}

            {/* Nút Xóa bản nháp */}
            {hasDraft && activeTab === 'FORM' && (
              <button
                onClick={onClearDraft}
                className="text-xs font-medium text-slate-400 hover:text-red-600 px-1 py-1 underline transition-colors"
                title="Làm mới phiếu"
              >
                Hủy nháp
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation: Phiếu Khảo Sát vs Lịch Sử Đánh Giá */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => onChangeTab('FORM')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'FORM'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardEdit className="w-3.5 h-3.5" />
            <span>Phiếu Khảo Sát</span>
          </button>

          <button
            onClick={() => onChangeTab('HISTORY')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'HISTORY'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Đánh Giá</span>
            {historyCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'HISTORY'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
