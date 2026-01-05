const LSU_RSS_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://lsusports.net/feed&count=15';

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

function extractImage(content) {
  if (!content) return 'img/chillinmikecigar2.png';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : 'img/chillinmikecigar2.png';
}

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function createNewsCard(article) {
  const imageUrl = article.thumbnail || article.enclosure?.link || extractImage(article.content);
  const description = stripHtml(article.description || article.content || '').substring(0, 150);
  
  return `
    <a href="${article.link || '#'}" target="_blank" class="news-card">
      <div class="news-image" style="background-image: url('${imageUrl}')"></div>
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <p class="news-description">${description}...</p>
        <span class="news-date">${formatDate(article.pubDate)}</span>
      </div>
    </a>
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
  
  newsContainer.innerHTML = news.map(createNewsCard).join('');
}

document.addEventListener('DOMContentLoaded', loadLSUNews);
