function fetchRecruitingNews() {
  var container = document.getElementById('recruiting-container');
  var rssUrl = 'https://www.yardbarker.com/rss/school/511';
  
  console.log('Fetching recruiting news...');
  
  var proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(rssUrl);

  fetch(proxyUrl)
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function(data) {
      if (!data.contents) throw new Error('No contents');
      
      console.log('Got RSS feed');
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      var items = xmlDoc.querySelectorAll('item');
      
      if (items.length === 0) throw new Error('No items');

      var recruitingKeywords = ['recruit', 'commit', 'transfer', 'portal', 'signing', 'offer', 'visit', 'target', 'prospect', 'class', '2025', '2026', '2027'];
      var allArticles = [];
      
      items.forEach(function(item) {
        var title = item.querySelector('title') ? item.querySelector('title').textContent : '';
        var link = item.querySelector('link') ? item.querySelector('link').textContent : '#';
        var pubDate = item.querySelector('pubDate') ? item.querySelector('pubDate').textContent : '';
        var description = item.querySelector('description') ? item.querySelector('description').textContent : '';
        allArticles.push({ title: title, link: link, pubDate: pubDate, description: description });
      });

      var recruitingArticles = allArticles.filter(function(article) {
        var text = (article.title + ' ' + article.description).toLowerCase();
        return recruitingKeywords.some(function(kw) { return text.indexOf(kw) !== -1; });
      });

      var articles = recruitingArticles.length > 0 ? recruitingArticles.slice(0, 10) : allArticles.slice(0, 10);
      var html = '';
      
      articles.forEach(function(article) {
        var dateStr = '';
        if (article.pubDate) {
          var d = new Date(article.pubDate);
          dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        var desc = article.description.replace(/<[^>]*>/g, '').substring(0, 150);
        if (desc.length === 150) desc += '...';

        html += '<a href="' + article.link + '" target="_blank" class="news-card">' +
          '<div class="news-content">' +
          '<h3 class="news-title">' + article.title + '</h3>' +
          '<p class="news-meta">Yardbarker - ' + dateStr + '</p>' +
          (desc ? '<p class="news-excerpt">' + desc + '</p>' : '') +
          '</div></a>';
      });

      container.innerHTML = html;
      console.log('Recruiting news loaded:', articles.length);
    })
    .catch(function(error) {
      console.log('Recruiting news error:', error.message);
      var fallbackHtml = '<a href="https://www.yardbarker.com/colleges/lsu_tigers/511" target="_blank" class="news-card">' +
        '<div class="news-content">' +
        '<h3 class="news-title">Visit Yardbarker for Latest LSU Recruiting News</h3>' +
        '<p class="news-meta">Yardbarker</p>' +
        '<p class="news-excerpt">Click here to read the latest LSU Tigers news, recruiting updates, and more.</p>' +
        '</div></a>';
      container.innerHTML = fallbackHtml;
    });
}

document.addEventListener('DOMContentLoaded', function() {
  fetchRecruitingNews();
});
