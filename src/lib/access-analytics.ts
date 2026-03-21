export const getAccessStats = () => {
  const stats = localStorage.getItem('access_stats');
  if (stats) {
    return JSON.parse(stats);
  }
  
  // Default specified by user
  const defaultStats = {
    clicks: 158,
    impressions: 473
  };
  localStorage.setItem('access_stats', JSON.stringify(defaultStats));
  return defaultStats;
};

export const trackImpression = () => {
  const stats = getAccessStats();
  stats.impressions += 1;
  localStorage.setItem('access_stats', JSON.stringify(stats));
  window.dispatchEvent(new Event('access_stats_updated'));
};

export const trackClick = () => {
  const stats = getAccessStats();
  stats.clicks += 1;
  localStorage.setItem('access_stats', JSON.stringify(stats));
  window.dispatchEvent(new Event('access_stats_updated'));
};
