const LSU_OFFICIAL_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://lsusports.net/feed';
const ESPN_CFB_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.espn.com/espn/rss/ncf/news';
const ATVS_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.andthevalleyshook.com/rss/current.xml';

async function fetchFromFeed(url, source) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'ok' && data.items) {
      return data.items.map(item => ({
        ...item,
        source: source
      }));
    }
    return [];
  } catch (error) {
    console.log('Error fetching from ' + source + ':', error);
    return [];
  }
}

function filterLSUContent(articles) {
  const lsuKeywords = ['lsu', 'tigers', 'baton rouge', 'death valley', 'tiger stadium', 'lane kiffin', 'brian kelly'];
  
  return articles.filter(article => {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    return lsuKeywords.some(keyword => text.includes(keyword));
  });
}

async function fetchAllNews() {
  console.log('Fetching sports news from multiple sources...');
  
  const [lsuNews, espnNews, atvsNews] = await Promise.all([
    fetchFromFeed(LSU_OFFICIAL_FEED, 'LSU Athletics'),
    fetchFromFeed(ESPN_CFB_FEED, 'ESPN'),
    fetchFromFeed(ATVS_FEED, 'And The Valley Shook')
  ]);
  
  console.log('LSU Official articles:', lsuNews.length);
  console.log('ESPN articles:', espnNews.length);
  console.log('ATVS articles:', atvsNews.length);
  
  const lsuFromEspn = filterLSUContent(espnNews);
  console.log('ESPN LSU-filtered articles:', lsuFromEspn.length);
  
  const combined = [...lsuNews, ...lsuFromEspn, ...atvsNews];
  
  combined.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  return combined.slice(0, 15);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function extractImageFromContent(content) {
  if (!content) return null;
  
  var imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  var mediaMatch = content.match(/url=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i);
  if (mediaMatch && mediaMatch[1]) {
    return mediaMatch[1];
  }
  
  return null;
}

function createNewsCard(article) {
  var imageUrl = article.thumbnail || 
                 (article.enclosure && article.enclosure.link) || 
                 extractImageFromContent(article.content) || 
                 extractImageFromContent(article.description);
  
  var imageHtml = '';
  if (imageUrl) {
    imageHtml = '<div class="news-image"><img src="' + imageUrl + '" alt="' + (article.title || 'Article image') + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>';
  }
  
  var authorText = article.author || article.source || 'LSU Athletics';
  
  return `
    <a href="${article.link || '#'}" target="_blank" class="news-card">
      ${imageHtml}
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <p class="news-meta">${authorText} - ${formatDate(article.pubDate)}</p>
      </div>
    </a>
  `;
}

async function loadLSUNews() {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '<p class="loading-text">Loading LSU news...</p>';
  
  const news = await fetchAllNews();
  
  if (news.length === 0) {
    newsContainer.innerHTML = '<p class="loading-text">No recent LSU news available</p>';
    return;
  }
  
  newsContainer.innerHTML = news.map(createNewsCard).join('');
  console.log('Sports news loaded:', news.length, 'articles');
}

document.addEventListener('DOMContentLoaded', loadLSUNews);
