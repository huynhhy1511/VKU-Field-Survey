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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs px-3 sm:px-4 py-2.5">
      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Top bar: Logo + Network + Sync actions */}
        <div className="flex items-center justify-between">
          {/* Logo and Campus Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/25 ring-2 ring-sky-100">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  VKU Field Survey
                </span>
                <span className="text-[9px] font-bold bg-sky-100 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-full">
                  Offline First
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Kiểm toán cơ sở vật chất VKU
              </p>
            </div>
          </div>

          {/* Action Controls & Indicators */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Trạng thái Mạng (Network Badge) */}
            <div
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                network.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  : 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
              }`}
              title={network.connected ? 'Đang có kết nối mạng Internet' : 'Đang mất kết nối mạng (Offline Mode)'}
            >
              {network.connected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span className="hidden sm:inline font-bold">Online</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <WifiOff className="w-3 h-3 text-rose-600" />
                  <span className="font-bold">Offline</span>
                </>
              )}
            </div>

            {/* Nút Hàng đợi Sync Queue */}
            <button
              onClick={onOpenSyncModal}
              className="relative p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 border border-slate-200"
              title="Xem danh sách hàng đợi đồng bộ"
            >
              <CloudUpload className="w-4 h-4 text-sky-600" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-amber-500 rounded-full ring-2 ring-white animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Nút Đồng bộ nhanh thủ công khi có mạng */}
            {network.connected && pendingCount > 0 && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-2xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang gửi...' : 'Đồng bộ'}</span>
              </button>
            )}

            {/* Nút Xóa bản nháp */}
            {hasDraft && activeTab === 'FORM' && (
              <button
                onClick={onClearDraft}
                className="text-[10px] font-medium text-slate-400 hover:text-rose-600 px-1 py-1 underline transition-colors"
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
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'FORM'
                ? 'bg-white text-sky-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardEdit className="w-3.5 h-3.5" />
            <span>Phiếu Khảo Sát</span>
          </button>

          <button
            onClick={() => onChangeTab('HISTORY')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'HISTORY'
                ? 'bg-white text-sky-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Đánh Giá</span>
            {historyCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'HISTORY'
                    ? 'bg-sky-100 text-sky-700'
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
