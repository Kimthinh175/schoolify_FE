export type CasioModel = 'FX580VN_X' | 'FX880BTG' | 'FX570VN_PLUS';

export type AngleUnit = 'DEG' | 'RAD' | 'GRA';

export interface CasioModelConfig {
  id: CasioModel;
  name: string;
  series: string;
  badge: string;
  bodyBg: string;
  bezelBorder: string;
  screenBg: string;
  screenText: string;
  screenHighlight: string;
  accentColor: string;
  dpadStyle: string;
  keyStyle: {
    numKey: string;
    funcKey: string;
    opKey: string;
    delKey: string;
    acKey: string;
    equalsKey: string;
    shiftKey: string;
    alphaKey: string;
  };
  shiftColor: string;
  alphaColor: string;
  description: string;
}

export const CASIO_MODELS: Record<CasioModel, CasioModelConfig> = {
  FX580VN_X: {
    id: 'FX580VN_X',
    name: 'fx-580VN X',
    series: 'CLASSWIZ HIGH-RESOLUTION',
    badge: 'Chuẩn GDPT 2018 - 521 Tính Năng',
    bodyBg: 'bg-[#13161c] bg-gradient-to-b from-[#1c222e] via-[#13161c] to-[#0c0e12]',
    bezelBorder: 'border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]',
    screenBg: 'bg-[#8d9e89] border border-black/40', // Authentic pale greenish-gray Casio ClassWiz LCD
    screenText: 'text-[#0e160e]',
    screenHighlight: 'text-[#1c2a1d]',
    accentColor: '#00B8DD',
    dpadStyle: 'bg-[radial-gradient(circle_at_center,#f8fafc_0%,#cbd5e1_45%,#64748b_100%)] border-slate-300 shadow-[0_3px_8px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.8)]',
    keyStyle: {
      // Iconic fx-580VN X: Pristine white ivory plastic keys for numbers
      numKey: 'bg-[#f8fafc] hover:bg-white text-slate-950 border-[#d1d5db] shadow-[0_2.5px_0_#94a3b8] active:translate-y-[2px] active:shadow-none font-black',
      // Function keys: Dark graphite keys
      funcKey: 'bg-[#202530] hover:bg-[#29303d] text-slate-100 border-[#323b49] shadow-[0_2px_0_#101318] active:translate-y-[1.5px] active:shadow-none font-bold',
      // Operator keys: Dark charcoal keys
      opKey: 'bg-[#252c38] hover:bg-[#2f3847] text-slate-100 border-[#374254] shadow-[0_2px_0_#12161e] active:translate-y-[1.5px] active:shadow-none font-bold',
      // DEL & AC: Deep navy blue
      delKey: 'bg-[#1a3454] hover:bg-[#22446d] text-white border-[#2b517e] shadow-[0_2.5px_0_#0f1f33] active:translate-y-[2px] active:shadow-none font-black',
      acKey: 'bg-[#1a3454] hover:bg-[#22446d] text-[#fca5a5] border-[#2b517e] shadow-[0_2.5px_0_#0f1f33] active:translate-y-[2px] active:shadow-none font-black',
      // Equals key: Signature cyan
      equalsKey: 'bg-gradient-to-r from-cyan-500 to-[#00B8DD] hover:from-cyan-400 hover:to-cyan-500 text-slate-950 border-cyan-300 shadow-[0_3px_0_#0891b2] active:translate-y-[2px] active:shadow-none font-black',
      shiftKey: 'bg-[#202530] hover:bg-[#29303d] text-[#facc15] border-[#423712] shadow-[0_2px_0_#101318] active:translate-y-[1.5px] active:shadow-none font-black',
      alphaKey: 'bg-[#202530] hover:bg-[#29303d] text-[#fb7185] border-[#461726] shadow-[0_2px_0_#101318] active:translate-y-[1.5px] active:shadow-none font-black',
    },
    shiftColor: 'text-[#facc15]',
    alphaColor: 'text-[#fb7185]',
    description: 'Bố cục bàn phím 2 tông màu nguyên bản Casio fx-580VN X: Phím số trắng ngà, phím chức năng đen than, D-pad kim loại đồng tâm.',
  },
  FX880BTG: {
    id: 'FX880BTG',
    name: 'fx-880BTG',
    series: 'CLASSWIZ NEXT-GEN BLUETOOTH',
    badge: 'Phím Tròn Ergonomic - Màn Hình OLED',
    bodyBg: 'bg-[#090e17] bg-gradient-to-b from-[#0f172a] via-[#090e17] to-[#04070c]',
    bezelBorder: 'border-cyan-800/60 shadow-[0_12px_45px_rgba(6,182,212,0.2)]',
    screenBg: 'bg-[#08131e] border border-cyan-900/60', // Modern dark OLED cyan display
    screenText: 'text-cyan-300 font-mono',
    screenHighlight: 'text-cyan-400',
    accentColor: '#38bdf8',
    dpadStyle: 'bg-gradient-to-b from-slate-800 to-slate-950 border-cyan-600/40 shadow-[0_2px_5px_rgba(0,184,221,0.25)]',
    keyStyle: {
      // Modern round pebble keys
      numKey: 'rounded-full aspect-square bg-[#1e293b] hover:bg-[#334155] text-slate-100 border-[#334155] shadow-[0_2px_0_#0f172a] active:translate-y-[1.5px] active:shadow-none font-bold',
      funcKey: 'rounded-full aspect-square bg-[#0f172a] hover:bg-[#1e293b] text-cyan-200 border-[#1e293b] shadow-[0_2px_0_#020617] active:translate-y-[1.5px] active:shadow-none font-semibold text-[10px]',
      opKey: 'rounded-full aspect-square bg-[#1e293b] hover:bg-[#334155] text-cyan-400 border-[#334155] shadow-[0_2px_0_#0f172a] active:translate-y-[1.5px] active:shadow-none font-bold',
      delKey: 'rounded-full aspect-square bg-[#7f1d1d] hover:bg-[#991b1b] text-white border-[#991b1b] shadow-[0_2px_0_#450a0a] active:translate-y-[1.5px] active:shadow-none font-bold',
      acKey: 'rounded-full aspect-square bg-[#7f1d1d] hover:bg-[#991b1b] text-white border-[#991b1b] shadow-[0_2px_0_#450a0a] active:translate-y-[1.5px] active:shadow-none font-bold',
      equalsKey: 'rounded-full aspect-square bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-300 shadow-[0_2px_0_#0891b2] active:translate-y-[1.5px] active:shadow-none font-black',
      shiftKey: 'rounded-full aspect-square bg-[#0f172a] hover:bg-[#1e293b] text-[#facc15] border-[#1e293b] shadow-[0_2px_0_#020617] active:translate-y-[1.5px] active:shadow-none font-bold',
      alphaKey: 'rounded-full aspect-square bg-[#0f172a] hover:bg-[#1e293b] text-[#fb7185] border-[#1e293b] shadow-[0_2px_0_#020617] active:translate-y-[1.5px] active:shadow-none font-bold',
    },
    shiftColor: 'text-[#facc15]',
    alphaColor: 'text-[#fb7185]',
    description: 'Thiết kế phím tròn phẳng độc quyền thế hệ ClassWiz mới nhất với màn hình LCD 4 cấp độ sáng.',
  },
  FX570VN_PLUS: {
    id: 'FX570VN_PLUS',
    name: 'fx-570VN PLUS',
    series: 'NATURAL-V.P.A.M. 2nd EDITION',
    badge: 'Màu Bạc Kinh Điển - 453 Tính Năng',
    bodyBg: 'bg-[#1d2737] bg-gradient-to-b from-[#333d4e] via-[#1d2737] to-[#141b26]',
    bezelBorder: 'border-slate-500/70 shadow-[0_12px_45px_rgba(0,0,0,0.65)]',
    screenBg: 'bg-[#9fb29b] dark:bg-[#869982]',
    screenText: 'text-[#122013]',
    screenHighlight: 'text-[#2a3c2b]',
    accentColor: '#f59e0b',
    dpadStyle: 'bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#64748b] border-slate-300 shadow-[0_2.5px_5px_rgba(0,0,0,0.35)]',
    keyStyle: {
      // Classic 570VN Plus: Silver upper, navy lower
      numKey: 'bg-[#1e2c3f] hover:bg-[#27384f] text-white border-[#33465e] shadow-[0_2.5px_0_#0f1722] active:translate-y-[2px] active:shadow-none font-black',
      funcKey: 'bg-[#2a3a50] hover:bg-[#344761] text-slate-100 border-[#3e536f] shadow-[0_2px_0_#141e2a] active:translate-y-[1.5px] active:shadow-none font-bold',
      opKey: 'bg-[#223145] hover:bg-[#2b3c54] text-slate-100 border-[#384a62] shadow-[0_2px_0_#101721] active:translate-y-[1.5px] active:shadow-none font-bold',
      delKey: 'bg-[#2a3a50] hover:bg-[#344761] text-sky-400 border-[#3e536f] shadow-[0_2.5px_0_#141e2a] active:translate-y-[2px] active:shadow-none font-black',
      acKey: 'bg-[#2a3a50] hover:bg-[#344761] text-amber-400 border-[#3e536f] shadow-[0_2.5px_0_#141e2a] active:translate-y-[2px] active:shadow-none font-black',
      equalsKey: 'bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 border-amber-300 shadow-[0_3px_0_#b45309] active:translate-y-[2px] active:shadow-none font-black',
      shiftKey: 'bg-[#2a3a50] hover:bg-[#344761] text-[#facc15] border-[#3e536f] shadow-[0_2px_0_#141e2a] active:translate-y-[1.5px] active:shadow-none font-black',
      alphaKey: 'bg-[#2a3a50] hover:bg-[#344761] text-[#f87171] border-[#3e536f] shadow-[0_2px_0_#141e2a] active:translate-y-[1.5px] active:shadow-none font-black',
    },
    shiftColor: 'text-[#facc15]',
    alphaColor: 'text-[#f87171]',
    description: 'Vỏ hai tông màu: Thân trên tráng bạc sang trọng, cụm phím số màu xanh navy kinh điển.',
  },
};

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}
