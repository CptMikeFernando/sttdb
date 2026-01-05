const LSU_RSS_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://lsusports.net/feed';

async function fetchLSUNews() {
  try {
    const response = await fetch(LSU_RSS_FEED);
    const data = await response.json();
    
    if (data.status === 'ok' && data.items) {
      return data.items.slice(0, 10);
    }
    return [];
  } catch (error) {
    console.log('Error fetching LSU news:', error);
    return [];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function getSportFromCategories(categories) {
  if (!categories || categories.length === 0) return '';
  const sports = ['Football', 'Basketball', 'Baseball', 'Gymnastics', 'Volleyball', 'Soccer', 'Track', 'Swimming', 'Golf', 'Tennis', 'Softball'];
  for (const cat of categories) {
    for (const sport of sports) {
      if (cat.toLowerCase().includes(sport.toLowerCase())) {
        return sport;
      }
    }
  }
  return '';
}

function createNewsCard(article) {
  return `
    <a href="${article.link || '#'}" target="_blank" class="news-card">
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <p class="news-meta">By ${article.author || 'LSU Athletics'} - ${formatDate(article.pubDate)}</p>
      </div>
    </a>
  `;
}

function createInFeedAd() {
  return `
    <div class="news-card in-feed-ad">
      <div class="ad-label">Advertisement</div>
      <div class="in-feed-ad-content">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-6t+ed+2i-1n-4w"
             data-ad-client="ca-pub-2180098394455320"
             data-ad-slot="INFEED_SLOT"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
    </div>
  `;
}

async function loadLSUNews() {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '<p class="loading-text">Loading LSU news...</p>';
  
  const news = await fetchLSUNews();
  
  if (news.length === 0) {
    newsContainer.innerHTML = '<p class="loading-text">No recent LSU news available</p>';
    return;
  }
  
  let html = '';
  news.forEach((article, index) => {
    html += createNewsCard(article);
    if (index === 2 || index === 6) {
      html += createInFeedAd();
    }
  });
  
  newsContainer.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadLSUNews);
