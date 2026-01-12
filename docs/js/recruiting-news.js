function fetchRecruitingNews() {
  var container = document.getElementById('recruiting-container');
  var rssUrl = 'https://www.yardbarker.com/rss/school/511';
  
  console.log('Fetching recruiting news...');
  
  var proxies = [
    'https://corsproxy.io/?' + encodeURIComponent(rssUrl),
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl),
    'https://api.codetabs.com/v1/proxy?quest=' + rssUrl
  ];
  
  function tryFetch(proxyIndex) {
    if (proxyIndex >= proxies.length) {
      console.log('All proxies failed, showing fallback');
      showFallback();
      return;
    }
    
    console.log('Trying proxy ' + (proxyIndex + 1) + '/' + proxies.length);
    
    fetch(proxies[proxyIndex])
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function(data) {
        if (!data || data.length < 100) throw new Error('Empty response');
        
        console.log('Got RSS feed from proxy ' + (proxyIndex + 1));
        parseAndDisplayNews(data);
      })
      .catch(function(error) {
        console.log('Proxy ' + (proxyIndex + 1) + ' failed:', error.message);
        tryFetch(proxyIndex + 1);
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
  
  function parseAndDisplayNews(xmlText) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    var items = xmlDoc.querySelectorAll('item');
    
    if (items.length === 0) {
      showFallback();
      return;
    }

    var recruitingKeywords = ['recruit', 'commit', 'transfer', 'portal', 'signing', 'offer', 'visit', 'target', 'prospect', 'class', '2025', '2026', '2027'];
    var allArticles = [];
    
    items.forEach(function(item) {
      var title = item.querySelector('title') ? item.querySelector('title').textContent : '';
      var link = item.querySelector('link') ? item.querySelector('link').textContent : '#';
      var pubDate = item.querySelector('pubDate') ? item.querySelector('pubDate').textContent : '';
      var description = item.querySelector('description') ? item.querySelector('description').textContent : '';
      
      var imageUrl = null;
      
      var allChildren = item.children;
      for (var i = 0; i < allChildren.length; i++) {
        var child = allChildren[i];
        var tagName = child.tagName ? child.tagName.toLowerCase() : '';
        if (tagName.includes('content') || tagName.includes('media') || tagName === 'enclosure') {
          var url = child.getAttribute('url');
          if (url) {
            imageUrl = url;
            break;
          }
        }
      }
      
      if (!imageUrl) {
        imageUrl = extractImageFromContent(description);
      }
      
      console.log('Article:', title.substring(0, 30), 'Image:', imageUrl ? 'YES' : 'NO');
      
      allArticles.push({ title: title, link: link, pubDate: pubDate, description: description, imageUrl: imageUrl });
    });

    var recruitingArticles = allArticles.filter(function(article) {
      var text = (article.title + ' ' + article.description).toLowerCase();
      return recruitingKeywords.some(function(kw) { return text.indexOf(kw) !== -1; });
    });

    var articles = recruitingArticles.length > 0 ? recruitingArticles.slice(0, 25) : allArticles.slice(0, 25);
    var html = '';
    
    articles.forEach(function(article) {
      var dateStr = '';
      if (article.pubDate) {
        var d = new Date(article.pubDate);
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      var desc = article.description.replace(/<[^>]*>/g, '').substring(0, 150);
      if (desc.length === 150) desc += '...';

      var imageHtml = '';
      if (article.imageUrl) {
        imageHtml = '<div class="news-image"><img src="' + article.imageUrl + '" alt="' + article.title + '" loading="lazy"></div>';
      }

      html += '<a href="' + article.link + '" target="_blank" class="news-card">' +
        imageHtml +
        '<div class="news-content">' +
        '<h3 class="news-title">' + article.title + '</h3>' +
        '<p class="news-meta">Yardbarker - ' + dateStr + '</p>' +
        (desc ? '<p class="news-excerpt">' + desc + '</p>' : '') +
        '</div></a>';
    });

    container.innerHTML = html;
    console.log('Recruiting news loaded:', articles.length);
  }
  
  function showFallback() {
    var fallbackHtml = '<a href="https://www.yardbarker.com/colleges/lsu_tigers/511" target="_blank" class="news-card">' +
      '<div class="news-content">' +
      '<h3 class="news-title">Visit Yardbarker for Latest LSU Recruiting News</h3>' +
      '<p class="news-meta">Yardbarker</p>' +
      '<p class="news-excerpt">Click here to read the latest LSU Tigers news, recruiting updates, and more.</p>' +
      '</div></a>';
    container.innerHTML = fallbackHtml;
  }
  
  tryFetch(0);
}

document.addEventListener('DOMContentLoaded', function() {
  fetchRecruitingNews();
});
