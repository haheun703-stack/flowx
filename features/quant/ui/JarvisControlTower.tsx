"use client";

import { useEffect, useState } from "react";

/* ─── 타입 ─── */

interface PickItem {
  ticker: string;
  name: string;
  grade: string;
  total_score: number;
  sources: string[];
  n_sources: number;
  close: number;
  rsi: number;
  stoch_k: number;
  foreign_5d: number;
  inst_5d: number;
  reasons: string[];
  entry_price?: number;
  stop_loss?: number;
  target_price?: number;
  entry_info?: { entry: number; stop: number; target: number };
}

interface SectorItem {
  rank: number;
  sector: string;
  etf_code: string;
  score: number;
  ret_5: number;
  ret_20: number;
  rsi: number;
  acceleration: boolean;
  rank_change: number;
}

/* ─── 킬러픽 타입 ─── */

interface KillerPicksMarketEnv {
  regime?: string;
  vix?: number;
  shield?: string;
  mdd_pct?: number;
  cash_pct?: number;
  us_mood?: string;
  geopolitical_risk?: number;
  summary?: string;
}

interface KillerPicksSignalValidation {
  best_signal?: string;
  best_hit_rate?: number;
  best_avg_ret?: number;
  signal_summary?: Record<string, { hit_rate: number; avg_ret: number; total: number }>;
  daily_trend?: { date: string; accum_hr: number; accum_ret: number; picks_hr: number; picks_ret: number }[];
  insight?: string;
}

interface KillerPicksInstitutional {
  ticker: string;
  name: string;
  sector?: string;
  inst_consecutive: number;
  inst_5d_bil?: number;
  inst_20d_bil?: number;
  foreign_5d_bil?: number;
  dual_buying?: boolean;
  grade?: string;
  consensus?: { target?: number; upside?: number; per?: number; pbr?: number; dividend?: number; grade?: string };
  sector_rank?: number;
  verdict?: string;
}

interface KillerPicksRetail {
  ticker: string;
  name: string;
  retail_net_5d_bil?: number;
  retail_net_20d_bil?: number;
  retail_consecutive?: number;
  absorb_rate?: number;
  pattern?: string;
  verdict?: string;
}

interface KillerPicksCrossValidated {
  rank: number;
  ticker: string;
  name: string;
  signals_matched: number;
  matched_from?: string[];
  consensus?: { target?: number; upside?: number; per?: number; pbr?: number; dividend?: number };
  inst_consecutive?: number;
  inst_20d_bil?: number;
  entry_price?: number;
  stop_loss?: number;
  target_price?: number;
  conviction?: string;
  action?: string;
}

interface KillerPicksEtf {
  rank: number;
  ticker: string;
  name: string;
  category?: string;
  signal?: string;
  action?: string;
  sizing?: string;
  reason?: string;
}

interface KillerPicksDeepDive {
  ticker: string;
  name: string;
  sector?: string;
  question?: string;
  bull_case?: string;
  bear_case?: string;
  verdict?: string;
  entry_condition?: string;
  target?: string;
}

interface KillerPicksData {
  date?: string;
  target_label?: string;
  generated_at?: string;
  market_environment?: KillerPicksMarketEnv;
  signal_validation?: KillerPicksSignalValidation;
  institutional_picks?: KillerPicksInstitutional[];
  retail_support?: KillerPicksRetail[];
  cross_validated_top5?: KillerPicksCrossValidated[];
  etf_top5?: KillerPicksEtf[];
  portfolio_suggestion?: {
    defense_pct?: number;
    offense_pct?: number;
    defense?: { name: string; ticker: string; pct: number }[];
    offense?: { name: string; ticker: string; pct: number }[];
  };
  sector_analysis?: {
    top_sectors?: { sector: string; score: number; regime?: string; inst_5d?: number; foreign_5d?: number; ret_5d?: number }[];
    avoid_sectors?: string[];
    money_flow?: string;
  };
  individual_deep_dive?: KillerPicksDeepDive[];
}

interface JarvisData {
  picks: {
    target_date_label?: string;
    mode_label?: string;
    total_candidates?: number;
    stats?: Record<string, number>;
    picks?: PickItem[];
  } | null;
  accuracy: Record<string, { hit_rate?: number; total?: number }> | null;
  brain: {
    regime?: string;
    direction?: string;
    vix?: number;
    vix_grade?: string;
    cash_ratio?: number;
    recommendation?: string;
    danger_mode?: string;
  } | null;
  shield: {
    status?: string;
    sector_concentration?: number;
    max_drawdown?: number;
  } | null;
  market_guide?: {
    summary?: string;
    strategy?: string;
    hot_sectors?: { sector: string; ret_5: number }[];
    cold_sectors?: { sector: string; ret_5: number }[];
    vix?: number;
    vix_grade?: string;
    cash_ratio?: number;
    danger_mode?: string;
    stale?: {
      stale: boolean;
      age_days: number;
      last_update: string;
      message: string;
    } | null;
  } | null;
  sectors?: {
    date?: string;
    top?: SectorItem[];
  } | null;
  etf_picks?: {
    regime?: string;
    allocation?: Record<string, number>;
    accelerations?: {
      sector: string;
      rank_change: number;
      score: number;
      ret_5d: number;
    }[];
  } | null;
  signals?: {
    total?: number;
    sources?: {
      source: string;
      count: number;
      hit_rate: number;
      total_tested: number;
    }[];
    cross_validation?: {
      single: number;
      double: number;
      triple_plus: number;
    };
    top_combos?: { combo: string; count: number }[];
  } | null;
  performance?: {
    daily_trend?: {
      date: string;
      avg_hit_rate: number;
      market_avg_ret: number;
      up_ratio: number;
      sources: Record<string, { hit_rate: number; total: number; avg_ret: number }>;
    }[];
    latest?: {
      date: string;
      avg_hit_rate: number;
      market_avg_ret: number;
      up_ratio: number;
      sources: Record<string, { hit_rate: number; total: number; avg_ret: number }>;
    };
  } | null;
  cfo?: {
    health_score: number;
    risk_level: string;
    positions_count: number;
    cash_ratio: number;
    max_sector_name: string;
    max_sector_pct: number;
    var_95: number;
    warnings: string[];
    recommendations: string[];
    drawdown_action: string;
    drawdown_pct: number;
    regime: string;
  } | null;
  cto?: {
    total_records: number;
    source_performance: {
      source: string;
      win_rate: number;
      avg_return: number;
      total: number;
      decay: boolean;
    }[];
    decay_alerts: string[];
    data_health_score: number;
    stale_count: number;
    missing_count: number;
    suggestions: {
      action: string;
      detail: string;
      priority: string;
    }[];
  } | null;
  fundamentals?: {
    earnings: {
      date: string;
      total_analyzed: number;
      status_counts: Record<string, number>;
      turnaround_strong: FundamentalStock[];
      turnaround_early: FundamentalStock[];
      accelerating: FundamentalStock[];
    };
    turnaround: {
      date: string;
      total_screened: number;
      candidates_found: number;
      strong: TurnaroundStock[];
      early: TurnaroundStock[];
    };
  } | null;
  killer_picks?: KillerPicksData | null;
  updated_at?: string | null;
  date?: string | null;
}

interface FundamentalStock {
  ticker: string;
  name: string;
  status: string;
  score: number;
  latest_op_income: number;
  prev_op_income: number;
  qoq_change: number;
  acceleration: number;
}

interface TurnaroundStock {
  ticker: string;
  name: string;
  turnaround_type: string;
  score: number;
  op_income_q1: number;
  op_income_latest: number;
  debt_ratio: number;
  est_turnaround: string;
}

interface EtfSignalItem {
  ticker: string;
  name: string;
  sector: string;
  close: number;
  change_pct: number;
  aum: number;
  aum_change: number;
  aum_change_pct: number;
  volume: number;
  value: number;
  signal_type: string;
  score: number;
}

interface RelayItem {
  lead_sector: string;
  lag_sector: string;
  lead_return_1d: number;
  lead_return_5d: number;
  lead_breadth: number;
  lag_return_1d: number;
  lag_return_5d: number;
  gap: number;
  signal_type: string;
  score: number;
}

interface SniperItem {
  ticker: string;
  name: string;
  sector: string;
  close: number;
  change_pct: number;
  rsi: number;
  ma20_gap: number;
  bb_position: number;
  adx: number;
  foreign_days: number;
  inst_days: number;
  exec_strength: number;
  vol_ratio: number;
  signal_type: string;
  score: number;
}

/* ─── 아이콘 (유니코드 이스케이프) ─── */
const ICO = {
  WARN: "\u26A0\uFE0F",
  STOP: "\uD83D\uDED1",
  SIREN: "\uD83D\uDEA8",
  SHIELD: "\uD83D\uDEE1\uFE0F",
  CHART_DOWN: "\uD83D\uDCC9",
  FIRE: "\uD83D\uDD25",
  ICE: "\uD83E\uDDCA",
  YELLOW_CIRCLE: "\uD83D\uDFE1",
};

/* ─── 상수 ─── */

const GRADE_COLORS: Record<string, string> = {
  "\uC801\uADF9\uB9E4\uC218": "bg-red-600 text-white",
  "\uB9E4\uC218": "bg-green-600 text-white",
  "\uAD00\uC2EC\uB9E4\uC218": "bg-blue-600 text-white",
  "\uAD00\uCC30": "bg-yellow-600 text-white",
  "\uBCF4\uB958": "bg-gray-300 text-[var(--text-dim)]",
};

const REGIME_DISPLAY: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  BULL: { icon: "\uD83D\uDFE2", label: "\uC0C1\uC2B9\uC7A5", color: "text-[var(--green)]", bg: "border-green-200" },
  BEAR: { icon: "\uD83D\uDD34", label: "\uD558\uB77D\uC7A5", color: "text-[var(--up)]", bg: "border-red-200" },
  CAUTION: { icon: "\uD83D\uDFE1", label: "\uC8FC\uC758", color: "text-[var(--yellow)]", bg: "border-yellow-200" },
  NEUTRAL: { icon: "\u26AA", label: "\uBCF4\uD569", color: "text-[var(--text-dim)]", bg: "border-[var(--border)]" },
  CRISIS: { icon: "\uD83D\uDD34", label: "\uC704\uAE30", color: "text-red-500", bg: "border-red-200" },
};

const SHIELD_DISPLAY: Record<string, { icon: string; label: string; color: string }> = {
  GREEN: { icon: "\uD83D\uDFE2", label: "\uC548\uC804", color: "text-[var(--green)]" },
  YELLOW: { icon: "\uD83D\uDFE1", label: "\uC8FC\uC758", color: "text-[var(--yellow)]" },
  RED: { icon: "\uD83D\uDD34", label: "\uC704\uD5D8", color: "text-[var(--up)]" },
};

const ETF_SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  "\uB300\uB7C9 \uC790\uAE08\uC720\uC785": { color: "text-[var(--up)]", bg: "bg-red-50 border-red-200" },
  "\uC790\uAE08\uC720\uC785": { color: "text-[var(--up)]", bg: "bg-red-50 border-red-200" },
  "\uAC15\uC138 \uAE09\uB4F1": { color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  "\uAC15\uC138": { color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  "\uB300\uB7C9 \uC790\uAE08\uC720\uCD9C": { color: "text-[var(--down)]", bg: "bg-blue-50 border-blue-200" },
  "\uC790\uAE08\uC720\uCD9C": { color: "text-[var(--down)]", bg: "bg-blue-50 border-blue-200" },
  "\uC57D\uC138 \uAE09\uB77D": { color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" },
  "\uC57D\uC138": { color: "text-cyan-500", bg: "bg-cyan-50 border-cyan-800/30" },
  "\uBCF4\uD569": { color: "text-[var(--text-dim)]", bg: "bg-gray-50 border-[var(--border)]" },
};

const RELAY_SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  "\uAC15\uD55C \uB9E4\uC218 \uAE30\uD68C": { color: "text-[var(--up)]", bg: "bg-red-50 border-red-200" },
  "\uB9E4\uC218 \uAE30\uD68C": { color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  "\uAD00\uC2EC \uAD6C\uAC04": { color: "text-[var(--yellow)]", bg: "bg-yellow-50 border-yellow-200" },
  "\uCD94\uACA9 \uC9C4\uD589\uC911": { color: "text-[var(--green)]", bg: "bg-green-50 border-green-200" },
  "\uC120\uD589 \uD558\uB77D": { color: "text-[var(--down)]", bg: "bg-blue-50 border-blue-200" },
  "\uB300\uAE30": { color: "text-[var(--text-dim)]", bg: "bg-gray-50 border-[var(--border)]" },
};

const SNIPER_SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  "\uACE8\uB4E0\uD06C\uB85C\uC2A4": { color: "text-[var(--up)]", bg: "bg-red-50 border-red-200" },
  "\uACFC\uB9E4\uB3C4 \uBC18\uB4F1": { color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  "\uC218\uAE09 \uBC18\uC804": { color: "text-[var(--green)]", bg: "bg-green-50 border-green-200" },
  "\uBCFC\uBC34 \uD558\uB2E8": { color: "text-[var(--down)]", bg: "bg-blue-50 border-blue-200" },
  "\uCD94\uC138 \uC2DC\uC791": { color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
};

function formatBil(n: number) {
  const bil = n / 100_000_000;
  if (Math.abs(bil) >= 100) return `${bil >= 0 ? "+" : ""}${(bil / 10000).toFixed(1)}\uC870`;
  if (Math.abs(bil) >= 1) return `${bil >= 0 ? "+" : ""}${bil.toFixed(0)}\uC5B5`;
  return `${bil >= 0 ? "+" : ""}${bil.toFixed(1)}\uC5B5`;
}

const TAB_ITEMS = [
  { key: "killer-picks", label: "\uD0AC\uB7EC\uD53D", icon: "\uD83C\uDFAF" },
  { key: "recommend", label: "\uC624\uB298\uC758 \uCD94\uCC9C", icon: "\uD83D\uDCCA" },
  { key: "etf-signals", label: "ETF\uC2DC\uADF8\uB110", icon: "\uD83D\uDCB0" },
  { key: "relay", label: "\uB9B4\uB808\uC774", icon: "\uD83D\uDD04" },
  { key: "sniper", label: "\uC2A4\uB098\uC774\uD37C", icon: "\u26A1" },
  { key: "sectors", label: "\uC5C5\uC885 \uBD84\uC11D", icon: "\uD83D\uDCCA" },
  { key: "signals", label: "\uB9E4\uB9E4 \uC2E0\uD638", icon: "\uD83D\uDCE1" },
  { key: "performance", label: "\uC131\uACFC", icon: "\uD83D\uDCC8" },
  { key: "fundamentals", label: "\uD39C\uB354\uBA58\uD138", icon: "\uD83D\uDCCB" },
];

/* ─── 메인 컴포넌트 ─── */

export default function JarvisControlTower() {
  const [data, setData] = useState<JarvisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("killer-picks");
  const [etfData, setEtfData] = useState<{ items: EtfSignalItem[]; date: string | null } | null>(null);
  const [relayData, setRelayData] = useState<{ items: RelayItem[]; date: string | null } | null>(null);
  const [sniperData, setSniperData] = useState<{ items: SniperItem[]; date: string | null } | null>(null);
  const [tabLoading, setTabLoading] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch("/api/quant-jarvis", { signal: controller.signal });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setData(null);
      }
      setLoading(false);
    }
    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeTab === "etf-signals" && !etfData) {
      setTabLoading("etf-signals");
      fetch("/api/etf-signals")
        .then((r) => r.json())
        .then((json) => setEtfData({ items: json.items ?? [], date: json.date }))
        .catch(() => setEtfData({ items: [], date: null }))
        .finally(() => setTabLoading(null));
    }
    if (activeTab === "relay" && !relayData) {
      setTabLoading("relay");
      fetch("/api/relay")
        .then((r) => r.json())
        .then((json) => setRelayData({ items: json.items ?? [], date: json.date }))
        .catch(() => setRelayData({ items: [], date: null }))
        .finally(() => setTabLoading(null));
    }
    if (activeTab === "sniper" && !sniperData) {
      setTabLoading("sniper");
      fetch("/api/sniper")
        .then((r) => r.json())
        .then((json) => setSniperData({ items: json.items ?? [], date: json.date }))
        .catch(() => setSniperData({ items: [], date: null }))
        .finally(() => setTabLoading(null));
    }
  }, [activeTab, etfData, relayData, sniperData]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-6">
        <div className="h-20 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!data || !data.picks) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[var(--text-muted)]">퀀트 데이터가 아직 없습니다.</p>
        <p className="text-gray-600 text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
      </div>
    );
  }

  const { picks, accuracy, brain, shield, market_guide, etf_picks } = data;
  const regime = brain?.regime || brain?.direction || "NEUTRAL";
  const regimeInfo = REGIME_DISPLAY[regime] || REGIME_DISPLAY.NEUTRAL;
  const shieldStatus = shield?.status || "YELLOW";
  const shieldInfo = SHIELD_DISPLAY[shieldStatus] || SHIELD_DISPLAY.YELLOW;

  const allPicks = picks?.picks ?? [];
  const buyable = allPicks
    .filter((p) => ["\uC801\uADF9\uB9E4\uC218", "\uB9E4\uC218", "\uAD00\uC2EC\uB9E4\uC218", "\uAD00\uCC30"].includes(p.grade))
    .sort((a, b) => b.total_score - a.total_score);

  const stats = picks?.stats ?? {};

  const sourceCounts: Record<string, number> = {};
  for (const p of allPicks) {
    for (const s of p.sources ?? []) {
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-6">
      {/* ★ 시장 맥락 배너 */}
      {market_guide && <MarketGuideBanner guide={market_guide} regimeInfo={regimeInfo} />}

      {/* 상태판 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusCard label="시장 분위기" value={regimeInfo.label} icon={regimeInfo.icon} color={regimeInfo.color}
          sub={brain?.vix ? `공포지수 ${brain.vix}` : undefined} />
        <StatusCard label="위험 방어" value={shieldInfo.label} icon={shieldInfo.icon} color={shieldInfo.color}
          sub={shield?.max_drawdown ? `최대낙폭 ${shield.max_drawdown.toFixed(1)}%` : undefined} />
        <StatusCard label="현금 비중" value={brain?.cash_ratio ? `${brain.cash_ratio}%` : "-"}
          icon="💰" color="text-[var(--down)]" />
        <StatusCard label="추천 대상일" value={picks?.target_date_label ?? "-"}
          icon="📅" color="text-[var(--text-primary)]" sub={picks?.mode_label} />
      </section>

      {/* 탭 네비게이션 */}
      <nav className="flex gap-1 bg-gray-100 rounded-lg p-1 border border-[var(--border)] overflow-x-auto">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-gray-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* 탭 콘텐츠 */}
      {activeTab === "killer-picks" && (
        <KillerPicksTab kp={data.killer_picks} />
      )}

      {activeTab === "recommend" && (
        <div className="space-y-6">
          {etf_picks && <ETFSection etf={etf_picks} />}

          <section>
            <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">
              {buyable.length > 0
                ? `개별종목 추천 (${buyable.length}건)`
                : "전체 관망 — 조건 강화 대기"}
            </h2>
            {buyable.length > 0 ? (
              <div className="space-y-3">
                {buyable.map((p) => <PickRow key={p.ticker} pick={p} />)}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-[var(--border)] text-center">
                <p className="text-[var(--text-dim)] text-sm">현재 교차검증 통과 종목이 없습니다</p>
                <p className="text-gray-600 text-xs mt-1">
                  2개 이상 시그널 + 거래량 2배 이상 조건 충족 시 표시됩니다
                </p>
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-[var(--border)]">
              <h3 className="text-[var(--text-dim)] text-xs mb-3">등급 분포 ({picks?.total_candidates ?? 0}종목)</h3>
              <div className="space-y-2">
                {Object.entries(stats).map(([grade, count]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded ${GRADE_COLORS[grade] || "bg-gray-700 text-[var(--text-dim)]"}`}>
                      {grade}
                    </span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 rounded-full h-2"
                        style={{ width: `${Math.min(((count as number) / (picks?.total_candidates ?? 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[var(--text-dim)] text-xs w-12 text-right">{count as number}건</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-[var(--border)]">
              <h3 className="text-[var(--text-dim)] text-xs mb-3">매매 신호 감지 현황</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(sourceCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between bg-gray-100 rounded px-2 py-1">
                      <span className="text-[var(--text-primary)] text-xs">{source}</span>
                      <span className="text-blue-400 text-xs font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {accuracy && (
            <section>
              <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">매매 신호 적중률</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(accuracy)
                  .filter(([, v]) => typeof v === "object" && v !== null && ((v as Record<string, number>).total ?? 0) > 0)
                  .sort(([, a], [, b]) => ((b as Record<string, number>).hit_rate ?? 0) - ((a as Record<string, number>).hit_rate ?? 0))
                  .map(([name, detail]) => {
                    const d = detail as Record<string, number>;
                    const rate = d.hit_rate ?? 0;
                    const color = rate >= 60 ? "text-[var(--green)]" : rate >= 45 ? "text-[var(--yellow)]" : "text-[var(--up)]";
                    return (
                      <div key={name} className="bg-white rounded-lg p-3 border border-[var(--border)] text-center">
                        <p className="text-gray-500 text-xs">{name}</p>
                        <p className={`${color} text-xl font-bold`}>{rate}%</p>
                        <p className="text-gray-600 text-xs">{d.total ?? 0}건</p>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === "sectors" && data.sectors?.top && (
        <SectorsTab sectors={data.sectors} />
      )}

      {activeTab === "signals" && (
        <SignalsTab signals={data.signals} accuracy={data.accuracy} />
      )}

      {activeTab === "performance" && (
        <PerformanceTab performance={data.performance} cfo={data.cfo} cto={data.cto} />
      )}

      {activeTab === "fundamentals" && (
        <FundamentalsTab fundamentals={data.fundamentals} />
      )}

      {activeTab === "etf-signals" && (
        tabLoading === "etf-signals" ? <TabLoadingSkeleton /> :
        etfData && etfData.items.length > 0 ? <EtfSignalsTabContent data={etfData} /> :
        <TabEmpty label="ETF 시그널" />
      )}

      {activeTab === "relay" && (
        tabLoading === "relay" ? <TabLoadingSkeleton /> :
        relayData && relayData.items.length > 0 ? <RelayTabContent data={relayData} /> :
        <TabEmpty label="릴레이" />
      )}

      {activeTab === "sniper" && (
        tabLoading === "sniper" ? <TabLoadingSkeleton /> :
        sniperData && sniperData.items.length > 0 ? <SniperTabContent data={sniperData} /> :
        <TabEmpty label="스나이퍼" />
      )}
    </div>
  );
}

/* ─── 서브 컴포넌트 ─── */

function MarketGuideBanner({
  guide,
  regimeInfo,
}: {
  guide: NonNullable<JarvisData["market_guide"]>;
  regimeInfo: { icon: string; label: string; color: string; bg: string };
}) {
  const hot = guide.hot_sectors ?? [];
  const cold = guide.cold_sectors ?? [];
  const dangerMode = guide.danger_mode ?? "NORMAL";
  const stale = guide.stale;

  const bannerStyle = dangerMode === "PANIC"
    ? "bg-red-50 rounded-xl p-5 ring-2 ring-red-400"
    : dangerMode === "DANGER"
      ? "bg-orange-50 rounded-xl p-5 ring-1 ring-orange-300"
      : `bg-white rounded-xl p-5 shadow-sm ${regimeInfo.bg ? `border ${regimeInfo.bg}` : ""}`;

  const summaryColor = dangerMode === "PANIC"
    ? "text-[var(--up)]"
    : dangerMode === "DANGER"
      ? "text-orange-600"
      : regimeInfo.color;

  const summaryIcon = dangerMode === "PANIC"
    ? ICO.WARN
    : dangerMode === "DANGER"
      ? ICO.SIREN
      : regimeInfo.icon;

  return (
    <div className={bannerStyle}>
      {stale && (
        <div className="bg-yellow-50 text-yellow-400 text-xs px-3 py-2 rounded-lg mb-3">
          {ICO.WARN} {stale.message}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`${summaryColor} text-sm font-bold`}>
            {summaryIcon} {guide.summary}
          </p>
          {guide.strategy && (
            <p className="text-[var(--text-dim)] text-xs mt-1">{guide.strategy}</p>
          )}
        </div>
        <div className="flex gap-2">
          {guide.vix != null && guide.vix > 0 && (
            <span className={`text-xs px-2 py-1 rounded ${
              guide.vix >= 40 ? "bg-red-100 text-[var(--up)] font-bold animate-pulse" :
              guide.vix >= 30 ? "bg-red-50 text-[var(--up)]" :
              guide.vix >= 20 ? "bg-yellow-50 text-[var(--yellow)]" :
              "bg-green-50 text-[var(--green)]"
            }`}>
              공포지수 {guide.vix}
            </span>
          )}
          {dangerMode !== "NORMAL" && (
            <span className={`text-xs px-2 py-1 rounded font-bold ${
              dangerMode === "PANIC" ? "bg-red-600 text-white animate-pulse" :
              dangerMode === "DANGER" ? "bg-orange-50 text-orange-600" :
              "bg-yellow-50 text-[var(--yellow)]"
            }`}>
              {dangerMode === "PANIC" ? `${ICO.STOP} 긴급경보` :
               dangerMode === "DANGER" ? `${ICO.WARN} 위험경보` :
               `${ICO.YELLOW_CIRCLE} 주의경보`}
            </span>
          )}
        </div>
      </div>

      {dangerMode === "PANIC" && (
        <div className="bg-red-50 text-red-300 text-xs px-3 py-2 rounded-lg mb-3">
          {ICO.SHIELD} <strong>ETF(금/채권) 95%</strong> + 개별주 5% 이하 | 현금 55% 이상 유지 권장
        </div>
      )}

      {(hot.length > 0 || cold.length > 0) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {hot.map((s) => (
            <span key={s.sector} className="bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
              {ICO.FIRE} {s.sector} {s.ret_5 > 0 ? `+${s.ret_5.toFixed(1)}%` : `${s.ret_5.toFixed(1)}%`}
            </span>
          ))}
          {cold.map((s) => (
            <span key={s.sector} className="bg-blue-50 text-blue-300/60 px-2 py-0.5 rounded-full">
              {ICO.ICE} {s.sector} {s.ret_5.toFixed(1)}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ETFSection({ etf }: { etf: NonNullable<JarvisData["etf_picks"]> }) {
  const alloc = etf.allocation ?? {};
  const accel = etf.accelerations ?? [];

  const activeAlloc = Object.entries(alloc).filter(([, v]) => v > 0);

  const ALLOC_LABELS: Record<string, string> = {
    sector: "섹터", leverage: "레버리지", index: "지수",
    gold: "금", small_cap: "소형주", bonds: "채권",
    dollar: "달러", cash: "현금",
  };

  const ALLOC_COLORS: Record<string, string> = {
    gold: "bg-yellow-600", bonds: "bg-blue-600", dollar: "bg-green-600",
    cash: "bg-gray-600", sector: "bg-purple-600", leverage: "bg-red-600",
    index: "bg-cyan-600", small_cap: "bg-orange-600",
  };

  return (
    <section className="bg-white rounded-lg p-4 border border-[var(--border)]">
      <h3 className="text-[var(--text-primary)] text-sm font-bold mb-3">자산 배분 현황</h3>

      {activeAlloc.length > 0 && (
        <div className="mb-3">
          <div className="flex rounded-full h-3 overflow-hidden">
            {activeAlloc.map(([key, val]) => (
              <div
                key={key}
                className={`${ALLOC_COLORS[key] || "bg-gray-500"}`}
                style={{ width: `${val}%` }}
                title={`${ALLOC_LABELS[key] || key}: ${val}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            {activeAlloc.map(([key, val]) => (
              <span key={key} className="text-[var(--text-dim)]">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${ALLOC_COLORS[key] || "bg-gray-500"}`} />
                {ALLOC_LABELS[key] || key} {val}%
              </span>
            ))}
          </div>
        </div>
      )}

      {accel.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs mb-2">급부상 업종 (순위 급상승)</p>
          <div className="flex flex-wrap gap-2">
            {accel.map((a) => (
              <span key={a.sector} className="bg-orange-50 text-orange-400 text-xs px-2 py-1 rounded border border-orange-200">
                🚀 {a.sector}
                <span className="text-orange-300 ml-1">+{a.rank_change}↑</span>
                <span className="text-gray-500 ml-1">({a.ret_5d > 0 ? "+" : ""}{a.ret_5d.toFixed(1)}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatusCard({ label, value, icon, color, sub }: {
  label: string; value: string; icon: string; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-[var(--border)]">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`${color} text-lg font-bold mt-1`}>{icon} {value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function PickRow({ pick }: { pick: PickItem }) {
  const f5 = (pick.foreign_5d ?? 0) / 1e8;
  const i5 = (pick.inst_5d ?? 0) / 1e8;
  const entry = pick.entry_info ?? (
    pick.entry_price ? { entry: pick.entry_price, stop: pick.stop_loss ?? 0, target: pick.target_price ?? 0 } : null
  );

  return (
    <div className="bg-white rounded-lg p-4 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${GRADE_COLORS[pick.grade] || "bg-gray-700 text-[var(--text-dim)]"}`}>
            {pick.grade}
          </span>
          <span className="text-[var(--text-primary)] font-medium">{pick.name}</span>
          <span className="text-gray-500 text-xs">{pick.ticker}</span>
        </div>
        <span className="text-blue-400 font-bold">{pick.total_score}점</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {(pick.sources ?? []).map((s) => (
          <span key={s} className="bg-blue-50 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-[var(--text-muted)]">외국인 5일</span>{" "}
          <span className={f5 >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}>
            {f5 >= 0 ? "+" : ""}{f5.toFixed(0)}억
          </span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">기관 5일</span>{" "}
          <span className={i5 >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}>
            {i5 >= 0 ? "+" : ""}{i5.toFixed(0)}억
          </span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">과열도</span>{" "}
          <span className="text-[var(--text-primary)]">{pick.rsi?.toFixed(0) ?? "-"}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">반등력</span>{" "}
          <span className="text-[var(--text-primary)]">{pick.stoch_k?.toFixed(0) ?? "-"}</span>
        </div>
      </div>

      {entry && entry.entry > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs bg-gray-100 rounded p-2">
          <div>
            <span className="text-[var(--text-muted)]">진입</span>{" "}
            <span className="text-[var(--text-primary)]">{entry.entry.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">손절</span>{" "}
            <span className="text-[var(--up)]">{entry.stop.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">목표</span>{" "}
            <span className="text-[var(--green)]">{entry.target.toLocaleString()}</span>
          </div>
        </div>
      )}

      {(pick.reasons?.length ?? 0) > 0 && (
        <p className="text-gray-500 text-xs mt-2">
          {pick.reasons.slice(0, 3).join(" · ")}
        </p>
      )}
    </div>
  );
}

function SectorsTab({ sectors }: { sectors: NonNullable<JarvisData["sectors"]> }) {
  const top = sectors.top ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-bold">
          {ICO.CHART_DOWN} 업종 모멘텀 TOP 10
        </h2>
        {sectors.date && (
          <span className="text-gray-500 text-xs">{sectors.date} 기준</span>
        )}
      </div>

      {top.length > 0 ? (
        <div className="space-y-2">
          {top.map((s) => {
            const isAccel = s.acceleration;
            const ret5Color = s.ret_5 >= 0 ? "text-[var(--up)]" : "text-[var(--down)]";
            const ret20Color = s.ret_20 >= 0 ? "text-[var(--up)]" : "text-[var(--down)]";
            const rankColor = s.rank_change > 0 ? "text-[var(--green)]" : s.rank_change < 0 ? "text-[var(--up)]" : "text-[var(--text-muted)]";

            return (
              <div key={s.sector} className={`bg-white rounded-xl p-4 ${isAccel ? "ring-1 ring-orange-200" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm font-mono w-6">{s.rank}</span>
                    <span className="text-gray-900 font-bold">
                      {isAccel && `${ICO.FIRE} `}{s.sector}
                    </span>
                    {s.rank_change !== 0 && (
                      <span className={`text-xs ${rankColor}`}>
                        {s.rank_change > 0 ? `+${s.rank_change}\u2191` : `${s.rank_change}\u2193`}
                      </span>
                    )}
                  </div>
                  <span className="text-blue-400 font-bold text-sm">{s.score.toFixed(0)}점</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">5일 수익</span>{" "}
                    <span className={ret5Color}>
                      {s.ret_5 >= 0 ? "+" : ""}{s.ret_5.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">20일 수익</span>{" "}
                    <span className={ret20Color}>
                      {s.ret_20 >= 0 ? "+" : ""}{s.ret_20.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">과열도</span>{" "}
                    <span className={`${s.rsi >= 70 ? "text-[var(--up)]" : s.rsi <= 30 ? "text-[var(--green)]" : "text-[var(--text-primary)]"}`}>
                      {s.rsi.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-[var(--text-dim)] text-sm">업종 데이터가 아직 없습니다</p>
        </div>
      )}
    </div>
  );
}

/* ─── Phase 3: 매매 신호 탭 ─── */

function SignalsTab({
  signals,
  accuracy,
}: {
  signals: JarvisData["signals"];
  accuracy: JarvisData["accuracy"];
}) {
  const sources = signals?.sources ?? [];
  const cv = signals?.cross_validation;
  const combos = signals?.top_combos ?? [];
  const total = signals?.total ?? 0;
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {cv && (
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-[var(--text-dim)] text-xs mb-3">교차검증 필터링</h3>
          <div className="flex items-end justify-between gap-2 h-24">
            {[
              { label: "전체 감지", value: total, color: "bg-gray-600" },
              { label: "1소스", value: cv.single, color: "bg-gray-500" },
              { label: "2소스", value: cv.double, color: "bg-blue-500" },
              { label: "3소스+", value: cv.triple_plus, color: "bg-green-500" },
            ].map((item) => {
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-gray-900 text-sm font-bold">{item.value}</span>
                  <div className="w-full flex justify-center" style={{ height: "80px" }}>
                    <div
                      className={`${item.color} rounded-t w-full max-w-[48px]`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-gray-500 text-[10px]">{item.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-gray-500 text-[10px] mt-2 text-center">
            2소스 이상 교차검증 통과 = 실제 매수 후보
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4">
        <h3 className="text-[var(--text-dim)] text-xs mb-3">시그널 소스 활성도</h3>
        <div className="space-y-2">
          {sources.map((s) => {
            const barPct = (s.count / maxCount) * 100;
            const hasAccuracy = s.total_tested > 0;
            const accColor = s.hit_rate >= 60 ? "text-[var(--green)]" : s.hit_rate >= 45 ? "text-[var(--yellow)]" : "text-[var(--up)]";
            return (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-[var(--text-primary)] text-xs w-16 shrink-0 truncate">{s.source}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div
                    className="bg-blue-600 rounded-full h-3 transition-all"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <span className="text-[var(--text-dim)] text-xs w-8 text-right">{s.count}</span>
                {hasAccuracy ? (
                  <span className={`${accColor} text-xs w-12 text-right font-medium`}>
                    {s.hit_rate}%
                  </span>
                ) : (
                  <span className="text-gray-600 text-xs w-12 text-right">-</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-2 gap-4 text-[10px] text-gray-600">
          <span>| 감지수</span>
          <span>| 적중률</span>
        </div>
      </div>

      {combos.length > 0 && (
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-[var(--text-dim)] text-xs mb-3">자주 나타나는 시그널 조합</h3>
          <div className="space-y-2">
            {combos.map((c) => (
              <div key={c.combo} className="flex items-center justify-between bg-gray-200 rounded-lg px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {c.combo.split("+").map((src) => (
                    <span key={src} className="bg-blue-50 text-blue-300 text-xs px-2 py-0.5 rounded">
                      {src}
                    </span>
                  ))}
                </div>
                <span className="text-[var(--text-primary)] text-sm font-medium ml-3">{c.count}건</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {accuracy && Object.keys(accuracy).length > 0 && (
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-[var(--text-dim)] text-xs mb-3">시그널 적중률 상세</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(accuracy)
              .filter(([, v]) => typeof v === "object" && v !== null && ((v as Record<string, number>).total ?? 0) > 0)
              .sort(([, a], [, b]) => ((b as Record<string, number>).hit_rate ?? 0) - ((a as Record<string, number>).hit_rate ?? 0))
              .map(([name, detail]) => {
                const d = detail as Record<string, number>;
                const rate = d.hit_rate ?? 0;
                const color = rate >= 60 ? "text-[var(--green)]" : rate >= 45 ? "text-[var(--yellow)]" : "text-[var(--up)]";
                return (
                  <div key={name} className="bg-gray-200 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-[10px] truncate">{name}</p>
                    <p className={`${color} text-xl font-bold`}>{rate}%</p>
                    <p className="text-gray-600 text-[10px]">{d.total ?? 0}건 검증</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Phase 4: 성과 탭 ─── */

function PerformanceTab({ performance, cfo, cto }: {
  performance: JarvisData["performance"];
  cfo: JarvisData["cfo"];
  cto: JarvisData["cto"];
}) {
  const trend = performance?.daily_trend ?? [];
  const latest = performance?.latest;

  const hasCfoOrCto = cfo || cto;

  if (trend.length === 0 && !hasCfoOrCto) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <p className="text-[var(--text-dim)] text-sm">성과 데이터가 아직 없습니다</p>
      </div>
    );
  }

  const maxHit = Math.max(...trend.map((d) => d.avg_hit_rate), 1);

  const DRAWDOWN_STYLE: Record<string, { color: string; label: string }> = {
    "\uC720\uC9C0": { color: "text-[var(--green)]", label: "\uC720\uC9C0" },
    "\uCD95\uC18C": { color: "text-[var(--yellow)]", label: "\uCD95\uC18C" },
    "\uC911\uB2E8": { color: "text-[var(--up)]", label: "\uC911\uB2E8" },
    "\uAE34\uAE09": { color: "text-[var(--up)] animate-pulse", label: "\uAE34\uAE09" },
  };

  return (
    <div className="space-y-6">
      {/* CFO 포트폴리오 건강 */}
      {cfo && (
        <div className="bg-white rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--text-primary)] text-sm font-bold">CFO 포트폴리오 건강</h3>
            <span className={`text-xs font-bold ${
              DRAWDOWN_STYLE[cfo.drawdown_action]?.color ?? "text-[var(--text-dim)]"
            }`}>
              {DRAWDOWN_STYLE[cfo.drawdown_action]?.label ?? cfo.drawdown_action}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {/* 건강 점수 게이지 */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                cfo.health_score >= 70 ? "border-green-500" : cfo.health_score >= 40 ? "border-yellow-500" : "border-red-500"
              }`}>
                <span className={`text-xl font-bold ${
                  cfo.health_score >= 70 ? "text-[var(--green)]" : cfo.health_score >= 40 ? "text-[var(--yellow)]" : "text-[var(--up)]"
                }`}>{Math.round(cfo.health_score)}</span>
              </div>
              <p className="text-gray-500 text-[10px] mt-1">\uAC74\uAC15\uC810\uC218</p>
            </div>

            <div className="text-center">
              <p className={`text-2xl font-bold font-mono ${cfo.cash_ratio < 10 ? "text-[var(--up)]" : cfo.cash_ratio < 20 ? "text-[var(--yellow)]" : "text-[var(--green)]"}`}>
                {cfo.cash_ratio.toFixed(1)}%
              </p>
              <p className="text-gray-500 text-[10px]">\uD604\uAE08\uBE44\uC728</p>
            </div>

            <div className="text-center">
              <p className={`text-2xl font-bold font-mono ${cfo.max_sector_pct > 50 ? "text-[var(--up)]" : "text-[var(--text-primary)]"}`}>
                {cfo.max_sector_pct.toFixed(0)}%
              </p>
              <p className="text-gray-500 text-[10px]">{cfo.max_sector_name} \uC9D1\uC911</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-red-400">
                {cfo.var_95.toFixed(1)}%
              </p>
              <p className="text-gray-500 text-[10px]">VaR-95</p>
            </div>
          </div>

          {/* 경고 */}
          {cfo.warnings.length > 0 && (
            <div className="space-y-1">
              {cfo.warnings.map((w, i) => (
                <div key={i} className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded border border-red-200">
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTO 시스템 성과 */}
      {cto && (
        <div className="bg-white rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--text-primary)] text-sm font-bold">CTO \uC2DC\uC2A4\uD15C \uC131\uACFC</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${
                cto.data_health_score >= 90 ? "text-[var(--green)]" : cto.data_health_score >= 70 ? "text-[var(--yellow)]" : "text-[var(--up)]"
              }`}>
                \uB370\uC774\uD130 {cto.data_health_score.toFixed(0)}\uC810
              </span>
              <span className="text-gray-600 text-xs">{cto.total_records}\uAC74</span>
            </div>
          </div>

          {/* 소스별 승률 바 차트 */}
          {cto.source_performance.length > 0 && (
            <div className="space-y-2 mb-4">
              {cto.source_performance
                .sort((a, b) => b.win_rate - a.win_rate)
                .map((s) => {
                  const barColor = s.decay ? "bg-red-500" : s.win_rate >= 50 ? "bg-green-500" : s.win_rate >= 35 ? "bg-yellow-500" : "bg-red-500";
                  const retColor = s.avg_return >= 0 ? "text-[var(--green)]" : "text-[var(--up)]";
                  return (
                    <div key={s.source} className="flex items-center gap-2">
                      <span className="text-[var(--text-primary)] text-xs w-16 shrink-0 truncate">
                        {s.decay && "\uD83D\uDD34 "}{s.source}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className={`${barColor} rounded-full h-3 transition-all`}
                          style={{ width: `${Math.min(s.win_rate, 100)}%` }} />
                      </div>
                      <span className={`text-xs w-10 text-right font-mono ${
                        s.win_rate >= 50 ? "text-[var(--green)]" : s.win_rate >= 35 ? "text-[var(--yellow)]" : "text-[var(--up)]"
                      }`}>{s.win_rate.toFixed(0)}%</span>
                      <span className={`text-xs w-14 text-right font-mono ${retColor}`}>
                        {s.avg_return >= 0 ? "+" : ""}{s.avg_return.toFixed(1)}%
                      </span>
                      <span className="text-gray-600 text-xs w-8 text-right">{s.total}</span>
                    </div>
                  );
                })}
              <div className="flex justify-end gap-4 text-[10px] text-gray-600 mt-1">
                <span>| \uC2B9\uB960</span>
                <span>| \uD3C9\uADE0\uC218\uC775</span>
                <span>| \uAC74\uC218</span>
              </div>
            </div>
          )}

          {/* 제안 */}
          {cto.suggestions.length > 0 && (
            <div className="space-y-1">
              {cto.suggestions.map((s, i) => (
                <div key={i} className={`text-xs px-3 py-1.5 rounded border ${
                  s.priority === "HIGH" ? "bg-red-50 text-red-400 border-red-200" :
                  s.priority === "MEDIUM" ? "bg-yellow-900/20 text-yellow-400 border-yellow-800/30" :
                  "bg-gray-100 text-[var(--text-dim)] border-[var(--border)]"
                }`}>
                  {s.detail}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {trend.length > 0 && (
        <>
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-[var(--text-dim)] text-xs mb-3">일별 시그널 적중률 추이</h3>
            <div className="flex items-end gap-2 h-32">
              {trend.map((d) => {
                const pct = (d.avg_hit_rate / maxHit) * 100;
                const color = d.avg_hit_rate >= 60 ? "bg-green-500" : d.avg_hit_rate >= 40 ? "bg-yellow-500" : "bg-red-500";
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-gray-200 text-xs font-bold">{d.avg_hit_rate}%</span>
                    <div className="w-full flex justify-center" style={{ height: "80px" }}>
                      <div
                        className={`${color} rounded-t w-full max-w-[40px] transition-all`}
                        style={{ height: `${Math.max(pct, 5)}%`, marginTop: "auto" }}
                      />
                    </div>
                    <span className="text-gray-500 text-[10px]">{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="text-[var(--text-dim)] text-xs mb-3">일별 시장 현황</h3>
            <div className="space-y-2">
              {trend.map((d) => {
                const retColor = d.market_avg_ret >= 0 ? "text-[var(--up)]" : "text-[var(--down)]";
                return (
                  <div key={d.date} className="flex items-center justify-between bg-gray-200 rounded-lg px-3 py-2">
                    <span className="text-[var(--text-primary)] text-xs">{d.date.slice(5)}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-[var(--text-dim)]">
                        상승 <span className="text-[var(--up)]">{d.up_ratio}%</span>
                      </span>
                      <span className={retColor}>
                        평균 {d.market_avg_ret >= 0 ? "+" : ""}{d.market_avg_ret}%
                      </span>
                      <span className={`${d.avg_hit_rate >= 50 ? "text-[var(--green)]" : "text-[var(--yellow)]"}`}>
                        적중 {d.avg_hit_rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {latest?.sources && Object.keys(latest.sources).length > 0 && (
            <div className="bg-white rounded-xl p-4">
              <h3 className="text-[var(--text-dim)] text-xs mb-3">
                {latest.date ? `${latest.date} ` : ""}소스별 적중률
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(latest.sources)
                  .sort(([, a], [, b]) => b.hit_rate - a.hit_rate)
                  .map(([name, s]) => {
                    const color = s.hit_rate >= 60 ? "text-[var(--green)]" : s.hit_rate >= 45 ? "text-[var(--yellow)]" : "text-[var(--up)]";
                    const retColor = s.avg_ret >= 0 ? "text-[var(--up)]" : "text-[var(--down)]";
                    return (
                      <div key={name} className="bg-gray-200 rounded-lg p-3">
                        <p className="text-[var(--text-dim)] text-[10px] truncate mb-1">{name}</p>
                        <div className="flex items-baseline justify-between">
                          <span className={`${color} text-lg font-bold`}>{s.hit_rate}%</span>
                          <span className={`${retColor} text-xs`}>
                            {s.avg_ret >= 0 ? "+" : ""}{s.avg_ret}%
                          </span>
                        </div>
                        <p className="text-gray-600 text-[10px] mt-1">{s.total}건 검증</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── 공통 탭 유틸 ─── */

function TabLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}

function TabEmpty({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl p-6 text-center">
      <p className="text-[var(--text-dim)] text-sm">{label} 데이터가 아직 없습니다</p>
      <p className="text-gray-600 text-xs mt-1">매일 장마감 후 업데이트됩니다</p>
    </div>
  );
}

/* ─── 펀더멘탈 탭 ─── */

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  TURNAROUND_STRONG: { color: "bg-emerald-600 text-white", label: "강한 전환" },
  TURNAROUND_EARLY: { color: "bg-amber-600 text-white", label: "초기 전환" },
  ACCELERATING: { color: "bg-blue-600 text-white", label: "성장 가속" },
  DECELERATING: { color: "bg-orange-600 text-white", label: "성장 둔화" },
  DETERIORATING: { color: "bg-gray-400 text-white", label: "악화" },
};

function fmtBil(v: number) {
  const b = v / 1e8;
  if (Math.abs(b) >= 10000) return `${(b / 10000).toFixed(1)}조`;
  return `${b.toFixed(0)}억`;
}

function FundamentalsTab({ fundamentals }: { fundamentals: JarvisData["fundamentals"] }) {
  if (!fundamentals) {
    return <TabEmpty label="펀더멘탈" />;
  }

  const { earnings, turnaround } = fundamentals;
  const counts = earnings?.status_counts ?? {};
  const totalAnalyzed = earnings?.total_analyzed ?? 0;

  const STATUS_ORDER = ["TURNAROUND_STRONG", "TURNAROUND_EARLY", "ACCELERATING", "DECELERATING", "DETERIORATING"];
  const STATUS_COLORS: Record<string, string> = {
    TURNAROUND_STRONG: "bg-emerald-500",
    TURNAROUND_EARLY: "bg-amber-500",
    ACCELERATING: "bg-blue-500",
    DECELERATING: "bg-orange-500",
    DETERIORATING: "bg-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* 실적 상태 분포 */}
      {totalAnalyzed > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[var(--border)]">
          <h3 className="text-[var(--text-primary)] text-sm font-bold mb-3">
            실적 상태 분포 ({totalAnalyzed}종목)
          </h3>
          {/* 바 차트 */}
          <div className="flex rounded-full h-4 overflow-hidden mb-3">
            {STATUS_ORDER.map((key) => {
              const count = counts[key] ?? 0;
              if (count === 0) return null;
              return (
                <div key={key} className={STATUS_COLORS[key]}
                  style={{ width: `${(count / totalAnalyzed) * 100}%` }}
                  title={`${STATUS_STYLE[key]?.label}: ${count}`} />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {STATUS_ORDER.map((key) => {
              const count = counts[key] ?? 0;
              if (count === 0) return null;
              return (
                <span key={key} className="text-[var(--text-dim)] flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[key]}`} />
                  {STATUS_STYLE[key]?.label} {count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 턴어라운드 — Strong */}
      {turnaround?.strong && turnaround.strong.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)]">적자→흑자 전환 (강력)</span>
            <span className="text-xs text-gray-500">{turnaround.candidates_found}종목 중 {turnaround.strong.length}건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 text-[10px] border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">종목</th>
                  <th className="text-right px-2">점수</th>
                  <th className="text-right px-2">이전 영업이익</th>
                  <th className="text-right px-2">최근 영업이익</th>
                  <th className="text-right px-2">부채비율</th>
                  <th className="text-center px-2">전환시점</th>
                </tr>
              </thead>
              <tbody>
                {turnaround.strong.map((s) => (
                  <tr key={s.ticker} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="text-[var(--text-primary)]">{s.name}</span>
                      <span className="text-gray-600 text-[10px] ml-1">{s.ticker}</span>
                    </td>
                    <td className="text-right px-2 font-mono font-bold text-emerald-400">{s.score}</td>
                    <td className="text-right px-2 font-mono text-red-400">{fmtBil(s.op_income_q1)}</td>
                    <td className="text-right px-2 font-mono text-green-400">{fmtBil(s.op_income_latest)}</td>
                    <td className={`text-right px-2 font-mono ${s.debt_ratio > 100 ? "text-[var(--up)]" : "text-[var(--text-primary)]"}`}>
                      {s.debt_ratio.toFixed(0)}%
                    </td>
                    <td className="text-center px-2 text-[var(--text-dim)]">{s.est_turnaround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 턴어라운드 — Early */}
      {turnaround?.early && turnaround.early.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <span className="text-sm font-bold text-[var(--text-primary)]">적자 축소 중 (EARLY)</span>
            <span className="text-xs text-gray-500 ml-2">{turnaround.early.length}건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 text-[10px] border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">종목</th>
                  <th className="text-right px-2">점수</th>
                  <th className="text-right px-2">이전 영업이익</th>
                  <th className="text-right px-2">최근 영업이익</th>
                  <th className="text-right px-2">부채비율</th>
                  <th className="text-center px-2">예상전환</th>
                </tr>
              </thead>
              <tbody>
                {turnaround.early.map((s) => (
                  <tr key={s.ticker} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="text-[var(--text-primary)]">{s.name}</span>
                      <span className="text-gray-600 text-[10px] ml-1">{s.ticker}</span>
                    </td>
                    <td className="text-right px-2 font-mono font-bold text-amber-400">{s.score}</td>
                    <td className="text-right px-2 font-mono text-red-400">{fmtBil(s.op_income_q1)}</td>
                    <td className="text-right px-2 font-mono text-yellow-400">{fmtBil(s.op_income_latest)}</td>
                    <td className={`text-right px-2 font-mono ${s.debt_ratio > 100 ? "text-[var(--up)]" : "text-[var(--text-primary)]"}`}>
                      {s.debt_ratio.toFixed(0)}%
                    </td>
                    <td className="text-center px-2 text-[var(--text-dim)]">{s.est_turnaround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 실적 가속 (Accelerating) */}
      {earnings?.accelerating && earnings.accelerating.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <span className="text-sm font-bold text-[var(--text-primary)]">실적 가속 종목</span>
            <span className="text-xs text-gray-500 ml-2">{earnings.accelerating.length}건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 text-[10px] border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">종목</th>
                  <th className="text-right px-2">점수</th>
                  <th className="text-right px-2">이전 영업이익</th>
                  <th className="text-right px-2">최근 영업이익</th>
                  <th className="text-right px-2">QoQ</th>
                  <th className="text-right px-2">가속도</th>
                </tr>
              </thead>
              <tbody>
                {earnings.accelerating.slice(0, 30).map((s) => (
                  <tr key={s.ticker} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="text-[var(--text-primary)]">{s.name}</span>
                      <span className="text-gray-600 text-[10px] ml-1">{s.ticker}</span>
                    </td>
                    <td className="text-right px-2 font-mono font-bold text-blue-400">{s.score}</td>
                    <td className="text-right px-2 font-mono text-[var(--text-dim)]">{fmtBil(s.prev_op_income)}</td>
                    <td className={`text-right px-2 font-mono ${s.latest_op_income >= 0 ? "text-[var(--green)]" : "text-[var(--up)]"}`}>
                      {fmtBil(s.latest_op_income)}
                    </td>
                    <td className={`text-right px-2 font-mono ${s.qoq_change >= 0 ? "text-[var(--green)]" : "text-[var(--up)]"}`}>
                      {s.qoq_change >= 0 ? "+" : ""}{(s.qoq_change * 100).toFixed(0)}%
                    </td>
                    <td className={`text-right px-2 font-mono font-bold ${s.acceleration > 0 ? "text-[var(--down)]" : "text-[var(--text-muted)]"}`}>
                      {s.acceleration.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {earnings.accelerating.length > 30 && (
              <div className="text-center py-2 text-gray-600 text-xs">
                +{earnings.accelerating.length - 30}건 더 있음
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ETF시그널 탭 ─── */

function EtfSignalsTabContent({ data }: { data: { items: EtfSignalItem[]; date: string | null } }) {
  const { items, date } = data;
  const inflow = items.filter((i) => i.signal_type.includes("유입") || i.signal_type.includes("강세"));
  const outflow = items.filter((i) => i.signal_type.includes("유출") || i.signal_type.includes("약세"));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-bold">ETF 자금흐름 시그널</h2>
        {date && <span className="text-gray-500 text-xs">{date}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">유입/강세</p>
          <p className="text-red-400 text-xl font-bold">{inflow.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">유출/약세</p>
          <p className="text-blue-400 text-xl font-bold">{outflow.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">전체</p>
          <p className="text-[var(--text-primary)] text-xl font-bold">{items.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-[10px] border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">ETF</th>
              <th className="text-center py-2 px-2">시그널</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">등락</th>
              <th className="text-right py-2 px-2">설정액변동</th>
              <th className="text-right py-2 px-2">변동률</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sig = ETF_SIGNAL_STYLE[item.signal_type] ?? { color: "text-[var(--text-dim)]", bg: "bg-gray-100 border-[var(--border)]" };
              return (
                <tr key={item.ticker} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <span className="text-[var(--text-primary)]">{item.name}</span>
                    <span className="text-gray-600 text-[10px] ml-1">{item.ticker}</span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2 px-2">
                    <span className={`font-bold font-mono ${item.score >= 70 ? "text-[var(--up)]" : item.score >= 40 ? "text-[var(--yellow)]" : "text-[var(--text-dim)]"}`}>{item.score}</span>
                  </td>
                  <td className="text-right py-2 px-2 text-[var(--text-primary)] font-mono">{item.close.toLocaleString()}</td>
                  <td className={`text-right py-2 px-2 font-mono ${item.change_pct >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {item.change_pct >= 0 ? "+" : ""}{Number(item.change_pct).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${item.aum_change >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {formatBil(item.aum_change)}
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.aum_change_pct) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {Number(item.aum_change_pct) >= 0 ? "+" : ""}{Number(item.aum_change_pct).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── 릴레이 탭 ─── */

function RelayTabContent({ data }: { data: { items: RelayItem[]; date: string | null } }) {
  const { items, date } = data;
  const buySignals = items.filter((i) => i.signal_type.includes("매수") || i.signal_type === "관심 구간");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-bold">섹터 릴레이 (Lead-Lag)</h2>
        {date && <span className="text-gray-500 text-xs">{date}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">매수 기회</p>
          <p className="text-red-400 text-xl font-bold">{buySignals.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">기타</p>
          <p className="text-blue-400 text-xl font-bold">{items.length - buySignals.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">전체 쌍</p>
          <p className="text-[var(--text-primary)] text-xl font-bold">{items.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-[10px] border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">선행 → 후행</th>
              <th className="text-center py-2 px-2">시그널</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">괴리율</th>
              <th className="text-right py-2 px-2">선행 5D</th>
              <th className="text-right py-2 px-2">후행 5D</th>
              <th className="text-right py-2 px-2">종목비</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sig = RELAY_SIGNAL_STYLE[item.signal_type] ?? { color: "text-[var(--text-dim)]", bg: "bg-gray-100 border-[var(--border)]" };
              const gapNum = Number(item.gap);
              return (
                <tr key={`${item.lead_sector}-${item.lag_sector}`} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <span className="text-[var(--text-primary)]">{item.lead_sector}</span>
                    <span className="text-gray-600 mx-1">→</span>
                    <span className="text-[var(--text-primary)]">{item.lag_sector}</span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2 px-2">
                    <span className={`font-bold font-mono ${item.score >= 50 ? "text-[var(--up)]" : item.score >= 30 ? "text-[var(--yellow)]" : "text-[var(--text-dim)]"}`}>{item.score}</span>
                  </td>
                  <td className={`text-right py-2 px-2 font-mono font-bold ${gapNum >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {gapNum >= 0 ? "+" : ""}{gapNum.toFixed(1)}%p
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.lead_return_5d) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {Number(item.lead_return_5d) >= 0 ? "+" : ""}{Number(item.lead_return_5d).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.lag_return_5d) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {Number(item.lag_return_5d) >= 0 ? "+" : ""}{Number(item.lag_return_5d).toFixed(2)}%
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-[var(--text-dim)]">
                    {Number(item.lead_breadth).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── 스나이퍼 탭 ─── */

function SniperTabContent({ data }: { data: { items: SniperItem[]; date: string | null } }) {
  const { items, date } = data;
  const highScore = items.filter((i) => i.score >= 70);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-bold">스나이퍼워치</h2>
        {date && <span className="text-gray-500 text-xs">{date}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">고점수 (70+)</p>
          <p className="text-red-400 text-xl font-bold">{highScore.length}</p>
        </div>
        <div className="bg-yellow-900/20 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">관심 (40-69)</p>
          <p className="text-yellow-400 text-xl font-bold">{items.filter((i) => i.score >= 40 && i.score < 70).length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-[var(--border)] text-center">
          <p className="text-gray-500 text-[10px]">전체</p>
          <p className="text-[var(--text-primary)] text-xl font-bold">{items.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-[10px] border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">종목</th>
              <th className="text-center py-2 px-2">시그널</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">등락</th>
              <th className="text-right py-2 px-2">RSI</th>
              <th className="text-right py-2 px-2">MA20갭</th>
              <th className="text-right py-2 px-2">외인</th>
              <th className="text-right py-2 px-2">기관</th>
              <th className="text-right py-2 px-2">거래량비</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sig = SNIPER_SIGNAL_STYLE[item.signal_type] ?? { color: "text-[var(--text-dim)]", bg: "bg-gray-100 border-[var(--border)]" };
              return (
                <tr key={item.ticker} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <span className="text-[var(--text-primary)]">{item.name}</span>
                    <span className="text-gray-600 text-[10px] ml-1">{item.ticker}</span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2 px-2">
                    <span className={`font-bold font-mono ${item.score >= 70 ? "text-[var(--up)]" : item.score >= 40 ? "text-[var(--yellow)]" : "text-[var(--text-dim)]"}`}>{item.score}</span>
                  </td>
                  <td className="text-right py-2 px-2 text-[var(--text-primary)] font-mono">{item.close.toLocaleString()}</td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.change_pct) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {Number(item.change_pct) >= 0 ? "+" : ""}{Number(item.change_pct).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.rsi) <= 30 ? "text-[var(--green)]" : Number(item.rsi) >= 70 ? "text-[var(--up)]" : "text-[var(--text-primary)]"}`}>
                    {Number(item.rsi).toFixed(0)}
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.ma20_gap) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                    {Number(item.ma20_gap) >= 0 ? "+" : ""}{Number(item.ma20_gap).toFixed(1)}%
                  </td>
                  <td className="text-right py-2 px-2">
                    {item.foreign_days > 0 ? <span className="text-green-400 font-mono">{item.foreign_days}일</span> : <span className="text-[var(--text-muted)]">-</span>}
                  </td>
                  <td className="text-right py-2 px-2">
                    {item.inst_days > 0 ? <span className="text-blue-400 font-mono">{item.inst_days}일</span> : <span className="text-[var(--text-muted)]">-</span>}
                  </td>
                  <td className={`text-right py-2 px-2 font-mono ${Number(item.vol_ratio) >= 2 ? "text-[var(--yellow)]" : "text-[var(--text-muted)]"}`}>
                    {Number(item.vol_ratio).toFixed(1)}x
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── 킬러픽 탭 ─── */

const SIGNAL_NAME_MAP: Record<string, string> = {
  tomorrow_picks: "종합추천",
  pullback_scan: "눌림목",
  accumulation_tracker: "매집추적",
  whale_detect: "세력감지",
  dart_event: "공시이벤트",
  volume_spike: "거래량폭발",
  overnight_signal: "야간신호",
};

const CONVICTION_STYLE: Record<string, string> = {
  HIGH: "bg-green-50 text-green-700 border-green-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
};

const CONVICTION_LABEL: Record<string, string> = {
  HIGH: "확신 높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

const INST_GRADE_LABEL: Record<string, string> = {
  STRONG: "강력",
  MODERATE: "양호",
  NOTABLE: "주목",
  WATCH: "관찰",
};

const ACTION_STYLE: Record<string, string> = {
  "\uB9E4\uC218": "bg-red-50 text-[var(--up)] border-red-200",
  "\uAD00\uC2EC\uB9E4\uC218": "bg-amber-50 text-amber-700 border-amber-200",
  "\uAD00\uCC30": "bg-gray-100 text-gray-600 border-gray-200",
  BUY: "bg-red-50 text-[var(--up)] border-red-200",
  "\uAD00\uC2EC": "bg-amber-50 text-amber-700 border-amber-200",
};

const INST_GRADE_STYLE: Record<string, string> = {
  STRONG: "bg-green-50 text-green-700 border-green-200",
  MODERATE: "bg-blue-50 text-blue-700 border-blue-200",
  NOTABLE: "bg-amber-50 text-amber-700 border-amber-200",
  WATCH: "bg-gray-100 text-gray-600 border-gray-200",
};

function KillerPicksTab({ kp }: { kp?: KillerPicksData | null }) {
  const [openDive, setOpenDive] = useState<string | null>(null);

  if (!kp) {
    return (
      <div className="bg-white rounded-lg p-8 border border-[var(--border)] text-center">
        <p className="text-[var(--text-muted)]">킬러픽 데이터가 아직 없습니다.</p>
        <p className="text-gray-500 text-xs mt-1">매일 장마감 후 생성됩니다.</p>
      </div>
    );
  }

  const env = kp.market_environment;
  const sv = kp.signal_validation;
  const cross = kp.cross_validated_top5 ?? [];
  const instPicks = kp.institutional_picks ?? [];
  const retailPicks = kp.retail_support ?? [];
  const etfs = kp.etf_top5 ?? [];
  const portfolio = kp.portfolio_suggestion;
  const sectorA = kp.sector_analysis;
  const dives = kp.individual_deep_dive ?? [];

  const regimeColor = env?.regime === "NORMAL" ? "text-green-600 bg-green-50 border-green-200"
    : env?.regime === "CAUTION" ? "text-amber-600 bg-amber-50 border-amber-200"
    : env?.regime === "BEAR" || env?.regime === "CRISIS" ? "text-red-600 bg-red-50 border-red-200"
    : "text-gray-600 bg-gray-50 border-gray-200";

  const shieldColor = env?.shield === "GREEN" ? "text-green-600 bg-green-50 border-green-200"
    : env?.shield === "YELLOW" ? "text-amber-600 bg-amber-50 border-amber-200"
    : env?.shield === "RED" ? "text-red-600 bg-red-50 border-red-200"
    : "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[var(--text-primary)]">
            킬러픽 — {kp.target_label ?? kp.date ?? ""}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            12개 데이터소스 교차검증 · 생성 {kp.generated_at ?? ""}
          </p>
        </div>
      </div>

      {/* 섹션 1: 시장 환경 */}
      {env && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">시장 환경</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className={`rounded-lg p-3 border ${regimeColor}`}>
              <p className="text-[10px] opacity-70">시장상태</p>
              <p className="text-lg font-black">{
                env.regime === "NORMAL" ? "정상" :
                env.regime === "CAUTION" ? "주의" :
                env.regime === "BEAR" ? "하락장" :
                env.regime === "CRISIS" ? "위기" : env.regime ?? "-"
              }</p>
            </div>
            <div className={`rounded-lg p-3 border ${
              (env.vix ?? 0) < 20 ? "text-green-600 bg-green-50 border-green-200"
              : (env.vix ?? 0) <= 25 ? "text-amber-600 bg-amber-50 border-amber-200"
              : "text-red-600 bg-red-50 border-red-200"
            }`}>
              <p className="text-[10px] opacity-70">공포지수</p>
              <p className="text-lg font-black">{env.vix ?? "-"}</p>
            </div>
            <div className={`rounded-lg p-3 border ${shieldColor}`}>
              <p className="text-[10px] opacity-70">방어등급</p>
              <p className="text-lg font-black">{
                env.shield === "GREEN" ? "안전" :
                env.shield === "YELLOW" ? "주의" :
                env.shield === "RED" ? "위험" : env.shield ?? "-"
              }</p>
            </div>
            <div className="rounded-lg p-3 border border-[var(--border)] bg-white">
              <p className="text-[10px] text-[var(--text-muted)]">현금비중</p>
              <p className="text-lg font-black text-[var(--text-primary)]">{env.cash_pct ?? "-"}%</p>
            </div>
          </div>
          {env.summary && (
            <div className={`rounded-lg px-4 py-2.5 text-sm border ${regimeColor}`}>
              {env.summary}
            </div>
          )}
        </section>
      )}

      {/* 섹션 2: 시그널 검증 */}
      {sv && sv.signal_summary && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">시그널 검증</h3>
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="space-y-2 mb-4">
              {Object.entries(sv.signal_summary)
                .sort(([, a], [, b]) => b.hit_rate - a.hit_rate)
                .map(([key, val]) => {
                  const pct = val.hit_rate;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-dim)] w-20 shrink-0 text-right">
                        {SIGNAL_NAME_MAP[key] ?? key}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${pct > 55 ? "bg-green-500" : pct > 45 ? "bg-amber-400" : "bg-gray-400"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-12 text-right ${pct > 55 ? "text-green-600" : pct > 45 ? "text-amber-600" : "text-gray-500"}`}>
                        {pct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] w-12 text-right">{val.total}건</span>
                    </div>
                  );
                })}
            </div>
            {sv.insight && (
              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg border border-blue-200">
                {sv.insight}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 섹션 3: 교차검증 TOP */}
      {cross.length > 0 && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">
            교차검증 TOP {cross.length}
          </h3>
          <div className="space-y-3">
            {cross.map((c) => (
              <div key={c.ticker} className="bg-white rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] font-mono">#{c.rank}</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">{c.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{c.ticker}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.conviction && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${CONVICTION_STYLE[c.conviction] ?? CONVICTION_STYLE.LOW}`}>
                        {CONVICTION_LABEL[c.conviction] ?? c.conviction}
                      </span>
                    )}
                    {c.action && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ACTION_STYLE[c.action] ?? ACTION_STYLE["\uAD00\uCC30"]}`}>
                        {c.action}
                      </span>
                    )}
                  </div>
                </div>
                {c.matched_from && c.matched_from.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {c.matched_from.map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-[var(--text-dim)] px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-dim)]">
                  {c.signals_matched > 0 && <span>{c.signals_matched}개 시그널 교차</span>}
                  {c.inst_consecutive != null && c.inst_consecutive > 0 && <span>기관 {c.inst_consecutive}일 연속</span>}
                  {c.inst_20d_bil != null && <span>20일 {c.inst_20d_bil > 0 ? "+" : ""}{c.inst_20d_bil.toFixed(0)}억</span>}
                  {c.consensus?.upside != null && (
                    <span className="text-[var(--up)]">목표 +{c.consensus.upside.toFixed(1)}%</span>
                  )}
                  {c.consensus?.per != null && <span>PER {c.consensus.per.toFixed(1)}</span>}
                  {c.consensus?.dividend != null && c.consensus.dividend > 0 && <span>배당 {c.consensus.dividend.toFixed(1)}%</span>}
                </div>
                {(c.entry_price || c.stop_loss || c.target_price) && (
                  <div className="flex gap-4 mt-2 text-xs font-mono">
                    {c.entry_price != null && <span className="text-[var(--text-primary)]">진입 {c.entry_price.toLocaleString()}</span>}
                    {c.stop_loss != null && <span className="text-[var(--down)]">손절 {c.stop_loss.toLocaleString()}</span>}
                    {c.target_price != null && <span className="text-[var(--up)]">목표 {c.target_price.toLocaleString()}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 섹션 4: ETF 추천 */}
      {etfs.length > 0 && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">ETF 추천</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {etfs.map((e) => (
              <div key={e.ticker} className="bg-white rounded-lg border border-[var(--border)] p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{e.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{e.ticker}</span>
                    {e.category && (
                      <span className="text-[10px] bg-gray-100 text-[var(--text-dim)] px-1 py-px rounded">{e.category}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{e.signal ?? e.reason ?? ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {e.sizing && <span className="text-[10px] text-[var(--text-muted)]">{e.sizing}</span>}
                  {e.action && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ACTION_STYLE[e.action] ?? ACTION_STYLE["\uAD00\uCC30"]}`}>
                      {e.action === "BUY" ? "매수" : e.action}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 섹션 5: 포트폴리오 제안 */}
      {portfolio && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">포트폴리오 제안</h3>
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-[var(--text-primary)] font-bold">방어 {portfolio.defense_pct ?? 0}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-[var(--text-primary)] font-bold">공격 {portfolio.offense_pct ?? 0}%</span>
              </div>
              <div className="flex-1 h-3 rounded-full overflow-hidden flex">
                <div className="bg-blue-500 h-full" style={{ width: `${portfolio.defense_pct ?? 50}%` }} />
                <div className="bg-red-500 h-full" style={{ width: `${portfolio.offense_pct ?? 50}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-blue-600 font-bold mb-1 uppercase">방어</p>
                {(portfolio.defense ?? []).map((d) => (
                  <div key={d.ticker} className="flex items-center justify-between py-1 text-xs">
                    <span className="text-[var(--text-primary)]">{d.name}</span>
                    <span className="text-[var(--text-dim)] font-mono">{d.pct}%</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] text-red-600 font-bold mb-1 uppercase">공격</p>
                {(portfolio.offense ?? []).map((d) => (
                  <div key={d.ticker} className="flex items-center justify-between py-1 text-xs">
                    <span className="text-[var(--text-primary)]">{d.name}</span>
                    <span className="text-[var(--text-dim)] font-mono">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 섹션 6: 기관 매집 */}
      {instPicks.length > 0 && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">
            기관 매집 ({instPicks.length}종목)
          </h3>
          <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]/50">
              {instPicks.map((p) => (
                <div key={p.ticker} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-[100px]">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{p.name}</span>
                    {p.dual_buying && <span className="ml-1 text-amber-500 text-[10px]" title="외인+기관 동반매수">★</span>}
                  </div>
                  {p.grade && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${INST_GRADE_STYLE[p.grade] ?? INST_GRADE_STYLE.WATCH}`}>
                      {INST_GRADE_LABEL[p.grade] ?? p.grade}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <div className="bg-blue-500 rounded-sm h-2.5" style={{ width: Math.min(p.inst_consecutive * 12, 80) }} />
                    <span className="text-[10px] text-blue-600 font-bold">{p.inst_consecutive}일</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-dim)] flex-1 truncate">{p.verdict ?? ""}</span>
                  {p.inst_20d_bil != null && (
                    <span className={`text-[10px] font-mono shrink-0 ${p.inst_20d_bil >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                      {p.inst_20d_bil >= 0 ? "+" : ""}{p.inst_20d_bil.toFixed(0)}억
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 섹션 7: 개인 지지 */}
      {retailPicks.length > 0 && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">
            개인 지지 ({retailPicks.length}종목)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {retailPicks.map((r) => (
              <div key={r.ticker} className="bg-white rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{r.name}</span>
                  {r.absorb_rate != null && (
                    <span className={`text-xs font-bold ${r.absorb_rate >= 100 ? "text-green-600" : "text-amber-600"}`}>
                      흡수 {r.absorb_rate}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-dim)]">
                  {r.retail_consecutive != null && <span>{r.retail_consecutive}일 연속</span>}
                  {r.retail_net_5d_bil != null && <span>5일 {r.retail_net_5d_bil > 0 ? "+" : ""}{r.retail_net_5d_bil.toFixed(0)}억</span>}
                </div>
                {r.verdict && <p className="text-[11px] text-[var(--text-dim)] mt-1">{r.verdict}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 섹션: 섹터 분석 */}
      {sectorA && sectorA.top_sectors && sectorA.top_sectors.length > 0 && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">섹터 분석</h3>
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="space-y-2 mb-3">
              {sectorA.top_sectors.map((s) => (
                <div key={s.sector} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-primary)] font-bold w-16 shrink-0">{s.sector}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(s.score, 100)}%` }} />
                  </div>
                  <span className="text-xs text-[var(--text-dim)] font-mono w-10 text-right">{s.score.toFixed(0)}</span>
                  {s.ret_5d != null && (
                    <span className={`text-[10px] font-mono w-14 text-right ${s.ret_5d >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                      {s.ret_5d >= 0 ? "+" : ""}{s.ret_5d.toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
            {sectorA.money_flow && (
              <p className="text-xs text-[var(--text-dim)] border-t border-[var(--border)] pt-2">{sectorA.money_flow}</p>
            )}
          </div>
        </section>
      )}

      {/* 섹션 8: 딥다이브 */}
      {dives.length > 0 && (
        <section>
          <h3 className="text-[var(--text-dim)] text-xs font-bold mb-2 uppercase tracking-wider">종목 딥다이브</h3>
          <div className="space-y-2">
            {dives.map((d) => {
              const isOpen = openDive === d.ticker;
              return (
                <div key={d.ticker} className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
                  <button
                    onClick={() => setOpenDive(isOpen ? null : d.ticker)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-sm font-bold text-[var(--text-primary)]">{d.question ?? d.name}</span>
                    <span className="text-[var(--text-muted)] text-xs">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2 border-t border-[var(--border)]">
                      {d.bull_case && (
                        <div className="flex gap-2 pt-2">
                          <span className="text-green-600 text-xs font-bold shrink-0 w-10">강점</span>
                          <span className="text-xs text-[var(--text-dim)]">{d.bull_case}</span>
                        </div>
                      )}
                      {d.bear_case && (
                        <div className="flex gap-2">
                          <span className="text-red-600 text-xs font-bold shrink-0 w-10">약점</span>
                          <span className="text-xs text-[var(--text-dim)]">{d.bear_case}</span>
                        </div>
                      )}
                      {d.verdict && (
                        <div className="flex gap-2">
                          <span className="text-blue-600 text-xs font-bold shrink-0 w-10">판단</span>
                          <span className="text-xs text-[var(--text-primary)] font-bold">{d.verdict}</span>
                        </div>
                      )}
                      {d.entry_condition && (
                        <div className="flex gap-2">
                          <span className="text-[var(--text-muted)] text-xs shrink-0 w-10">진입</span>
                          <span className="text-xs text-[var(--text-dim)]">{d.entry_condition}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
