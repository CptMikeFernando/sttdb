async function fetchRecruitingNews() {
  const container = document.getElementById('recruiting-container');
  
  const rssUrl = 'https://lsutigerswire.usatoday.com/feed/';
  
  const proxyUrls = [
    'https://api.allorigins.win/get?url=' + encodeURIComponent(rssUrl),
    'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(rssUrl)
  ];

  for (const proxyUrl of proxyUrls) {
    try {
      console.log('Trying:', proxyUrl.substring(0, 50) + '...');
      const response = await fetch(proxyUrl);
      if (response.ok) {
        let xmlText;
        const data = await response.json().catch(function() { return null; });
        if (data && data.contents) {
          xmlText = data.contents;
        } else {
          xmlText = await response.text();
        }
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        if (items.length > 0) {
          const recruitingKeywords = ['recruit', 'commit', 'transfer', 'portal', 'signing', 'offer', 'visit', 'target', 'prospect', 'class of'];
          
          let allArticles = [];
          items.forEach(function(item) {
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            
            allArticles.push({ title, link, pubDate, description });
          });
          
          let recruitingArticles = allArticles.filter(function(article) {
            const titleLower = article.title.toLowerCase();
            const descLower = article.description.toLowerCase();
            return recruitingKeywords.some(function(keyword) {
              return titleLower.includes(keyword) || descLower.includes(keyword);
            });
          });
          
          let articles = recruitingArticles.length > 0 ? recruitingArticles.slice(0, 10) : allArticles.slice(0, 10);
          
          let html = '';
          articles.forEach(function(article) {
            const dateObj = article.pubDate ? new Date(article.pubDate) : null;
            const dateStr = dateObj ? dateObj.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : '';
            
            let desc = article.description.replace(/<[^>]*>/g, '');
            desc = desc.substring(0, 150);
            if (desc.length === 150) desc += '...';

            html += '<a href="' + article.link + '" target="_blank" class="news-card">' +
              '<div class="news-content">' +
              '<h3 class="news-title">' + article.title + '</h3>' +
              '<p class="news-meta">LSU Tigers Wire' + (dateStr ? ' - ' + dateStr : '') + '</p>' +
              (desc ? '<p class="news-excerpt">' + desc + '</p>' : '') +
              '</div></a>';
          });

          container.innerHTML = html;
          console.log('Recruiting news loaded:', articles.length, 'articles');
          return;
        }
      }
    } catch (error) {
      console.log('Proxy error:', error.message);
    }
  }

  container.innerHTML = '<p class="loading-text">Recruiting news coming soon. Check back later!</p>';
}

document.addEventListener('DOMContentLoaded', function() {
  fetchRecruitingNews();
});
