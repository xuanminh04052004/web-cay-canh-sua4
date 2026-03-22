// Historical hardcoded data that was in the old baseMockData (March 7–20, 2026)
const HISTORICAL_DAILY: Record<string, { clicks: number; impressions: number }> = {
  '2026-03-07': { clicks: 0, impressions: 0 },
  '2026-03-08': { clicks: 0, impressions: 0 },
  '2026-03-09': { clicks: 0, impressions: 0 },
  '2026-03-10': { clicks: 0, impressions: 0 },
  '2026-03-11': { clicks: 0, impressions: 0 },
  '2026-03-12': { clicks: 0, impressions: 0 },
  '2026-03-13': { clicks: 10, impressions: 30 },
  '2026-03-14': { clicks: 15, impressions: 45 },
  '2026-03-15': { clicks: 28, impressions: 75 },
  '2026-03-16': { clicks: 32, impressions: 90 },
  '2026-03-17': { clicks: 27, impressions: 66 },
  '2026-03-18': { clicks: 22, impressions: 54 },
  '2026-03-19': { clicks: 2, impressions: 48 },
  '2026-03-20': { clicks: 14, impressions: 42 },
};

// Sum of all historical clicks/impressions from the hardcoded data
const HISTORICAL_CLICKS_TOTAL = Object.values(HISTORICAL_DAILY).reduce((s, d) => s + d.clicks, 0); // 150
const HISTORICAL_IMPRESSIONS_TOTAL = Object.values(HISTORICAL_DAILY).reduce((s, d) => s + d.impressions, 0); // 450

export interface DailyEntry {
  clicks: number;
  impressions: number;
}

export interface AccessStatsData {
  clicks: number;
  impressions: number;
  dailyStats: Record<string, DailyEntry>;
  migratedV2?: boolean; // flag to track migration status
}

/** Returns today's date key in YYYY-MM-DD format */
export const getTodayKey = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Migrate old stats format (just {clicks, impressions}) to new format with dailyStats.
 * Preserves all historical hardcoded data and assigns remaining counts to "today" (March 21)
 * or spreads them if needed.
 */
const migrateStats = (oldStats: { clicks: number; impressions: number }): AccessStatsData => {
  const dailyStats: Record<string, DailyEntry> = { ...HISTORICAL_DAILY };

  // Whatever is in the old total above the historical sum is "extra" accumulated after March 20
  const extraClicks = Math.max(0, oldStats.clicks - HISTORICAL_CLICKS_TOTAL);
  const extraImpressions = Math.max(0, oldStats.impressions - HISTORICAL_IMPRESSIONS_TOTAL);

  // Check if there was a March 21 day (yesterday in the old data as "Hôm nay")
  // The old code had "Hôm nay" as the last entry which showed clicks accumulated after the historical data
  // We'll assign those extras to 2026-03-21 since that was the last "Hôm nay" before the fix
  const march21Key = '2026-03-21';
  const todayKey = getTodayKey();

  if (todayKey === march21Key) {
    // If today is still March 21, put extras on today
    dailyStats[todayKey] = { clicks: extraClicks, impressions: extraImpressions };
  } else {
    // Today is March 22 or later; assign extras to March 21 and start today fresh
    dailyStats[march21Key] = { clicks: extraClicks, impressions: extraImpressions };
    dailyStats[todayKey] = { clicks: 0, impressions: 0 };
  }

  return {
    clicks: oldStats.clicks,
    impressions: oldStats.impressions,
    dailyStats,
    migratedV2: true,
  };
};

export const getAccessStats = (): AccessStatsData => {
  const raw = localStorage.getItem('access_stats');

  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      // Already migrated to v2 format
      if (parsed.migratedV2 && parsed.dailyStats) {
        // Ensure today's entry exists
        const todayKey = getTodayKey();
        if (!parsed.dailyStats[todayKey]) {
          parsed.dailyStats[todayKey] = { clicks: 0, impressions: 0 };
          localStorage.setItem('access_stats', JSON.stringify(parsed));
        }
        return parsed as AccessStatsData;
      }

      // Old format — needs migration
      const migrated = migrateStats({
        clicks: parsed.clicks || 0,
        impressions: parsed.impressions || 0,
      });
      localStorage.setItem('access_stats', JSON.stringify(migrated));
      return migrated;
    } catch {
      // Corrupted data — fall through to defaults
    }
  }

  // First time — initialize with historical data + empty today
  const todayKey = getTodayKey();
  const defaultStats: AccessStatsData = {
    clicks: HISTORICAL_CLICKS_TOTAL,
    impressions: HISTORICAL_IMPRESSIONS_TOTAL,
    dailyStats: {
      ...HISTORICAL_DAILY,
      [todayKey]: { clicks: 0, impressions: 0 },
    },
    migratedV2: true,
  };
  localStorage.setItem('access_stats', JSON.stringify(defaultStats));
  return defaultStats;
};

/** Get the dailyStats map for chart rendering */
export const getDailyStats = (): Record<string, DailyEntry> => {
  return getAccessStats().dailyStats;
};

export const trackImpression = () => {
  const stats = getAccessStats();
  const todayKey = getTodayKey();

  stats.impressions += 1;

  if (!stats.dailyStats[todayKey]) {
    stats.dailyStats[todayKey] = { clicks: 0, impressions: 0 };
  }
  stats.dailyStats[todayKey].impressions += 1;

  localStorage.setItem('access_stats', JSON.stringify(stats));
  window.dispatchEvent(new Event('access_stats_updated'));
};

export const trackClick = () => {
  const stats = getAccessStats();
  const todayKey = getTodayKey();

  stats.clicks += 1;

  if (!stats.dailyStats[todayKey]) {
    stats.dailyStats[todayKey] = { clicks: 0, impressions: 0 };
  }
  stats.dailyStats[todayKey].clicks += 1;

  localStorage.setItem('access_stats', JSON.stringify(stats));
  window.dispatchEvent(new Event('access_stats_updated'));
};
