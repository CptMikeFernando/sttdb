const LSU_NEWS_APIS = [
  'https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/99/news',
  'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/99/news',
  'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams/99/news'
];

async function fetchLSUNews() {
  const allNews = [];
  
  for (const url of LSU_NEWS_APIS) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.articles) {
        allNews.push(...data.articles);
      }
    } catch (error) {
      console.log('Error fetching news:', error);
    }
  }
  
  allNews.sort((a, b) => new Date(b.published) - new Date(a.published));
  
  return allNews.slice(0, 10);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function createNewsCard(article) {
  const imageUrl = article.images && article.images.length > 0 
    ? article.images[0].url 
    : 'img/chillinmikecigar2.png';
  
  return `
    <a href="${article.links?.web?.href || '#'}" target="_blank" class="news-card">
      <div class="news-image" style="background-image: url('${imageUrl}')"></div>
      <div class="news-content">
        <h3 class="news-title">${article.headline}</h3>
        <p class="news-description">${article.description || ''}</p>
        <span class="news-date">${formatDate(article.published)}</span>
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
