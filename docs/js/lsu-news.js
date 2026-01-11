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

function extractImageFromContent(content) {
  if (!content) return null;
  var imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

function createNewsCard(article) {
  var imageUrl = article.thumbnail || article.enclosure?.link || extractImageFromContent(article.content) || extractImageFromContent(article.description);
  
  var imageHtml = '';
  if (imageUrl) {
    imageHtml = '<div class="news-image"><img src="' + imageUrl + '" alt="' + (article.title || 'Article image') + '" loading="lazy"></div>';
  }
  
  return `
    <a href="${article.link || '#'}" target="_blank" class="news-card">
      ${imageHtml}
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <p class="news-meta">By ${article.author || 'LSU Athletics'} - ${formatDate(article.pubDate)}</p>
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
