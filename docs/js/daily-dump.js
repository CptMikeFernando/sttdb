let dailyDumpLoaded = false;
let dailyDumpCache = null;

async function fetchNewsForDailyDump() {
  const LSU_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://lsusports.net/feed';
  const ESPN_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.espn.com/espn/rss/ncf/news';
  const ATVS_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.andthevalleyshook.com/rss/current.xml';

  const feeds = await Promise.allSettled([
    fetch(LSU_FEED).then(r => r.json()),
    fetch(ESPN_FEED).then(r => r.json()),
    fetch(ATVS_FEED).then(r => r.json())
  ]);

  const articles = [];
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  feeds.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.items) {
      const source = ['LSU Athletics', 'ESPN', 'And The Valley Shook'][index];
      result.value.items.forEach(item => {
        const pubDate = new Date(item.pubDate);
        if (pubDate >= threeDaysAgo) {
          const lsuKeywords = ['lsu', 'tigers', 'baton rouge', 'death valley', 'tiger stadium', 'brian kelly'];
          const text = (item.title + ' ' + (item.description || '')).toLowerCase();
          const isLSU = source === 'LSU Athletics' || source === 'And The Valley Shook' || 
                       lsuKeywords.some(k => text.includes(k));
          if (isLSU) {
            articles.push({
              title: item.title,
              source: source,
              date: pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
          }
        }
      });
    }
  });

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  return articles.slice(0, 20);
}

async function loadDailyDump() {
  if (dailyDumpLoaded && dailyDumpCache) {
    return;
  }

  const container = document.querySelector('.dailydump-content');
  if (!container) return;

  container.innerHTML = '<p class="loading-text">Generating your Daily Dump... This may take a moment.</p>';

  try {
    const articles = await fetchNewsForDailyDump();
    
    if (articles.length === 0) {
      container.innerHTML = '<p class="loading-text">No recent LSU news available to summarize.</p>';
      return;
    }

    const response = await fetch('/api/daily-dump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles })
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    dailyDumpCache = data.summary;
    dailyDumpLoaded = true;

    const formattedSummary = formatDailyDump(data.summary);
    const generatedTime = new Date(data.generatedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    container.innerHTML = `
      <div class="dailydump-header">
        <h2>Today's LSU Sports Daily Dump</h2>
        <span class="dailydump-time">Generated at ${generatedTime}</span>
      </div>
      <div class="dailydump-body">
        ${formattedSummary}
      </div>
      <button class="dailydump-refresh" onclick="refreshDailyDump()">
        <i class="fa fa-refresh"></i> Refresh Summary
      </button>
    `;
  } catch (error) {
    console.error('Error loading daily dump:', error);
    container.innerHTML = `
      <p class="loading-text">Unable to generate Daily Dump at this time.</p>
      <button class="dailydump-refresh" onclick="refreshDailyDump()">Try Again</button>
    `;
  }
}

function formatDailyDump(text) {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '<h3>$1</h3>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return '<p>' + formatted + '</p>';
}

function refreshDailyDump() {
  dailyDumpLoaded = false;
  dailyDumpCache = null;
  loadDailyDump();
}

function initDailyDump() {
  document.querySelectorAll('.news-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      if (this.getAttribute('data-tab') === 'dailydump' && !dailyDumpLoaded) {
        console.log('Daily Dump tab clicked, loading...');
        loadDailyDump();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDailyDump);
} else {
  initDailyDump();
}
