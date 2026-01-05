function getWeekDates() {
  const today = new Date();
  const pastWeek = new Date(today);
  pastWeek.setDate(today.getDate() - 7);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };
  
  return {
    start: formatDate(pastWeek),
    end: formatDate(nextWeek)
  };
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getESPNUrls() {
  const dates = getWeekDates();
  const today = getTodayDate();
  return {
    football: `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${dates.start}-${dates.end}`,
    basketball: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${today}`,
    baseball: `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard?dates=${today}`
  };
}

const SEC_TEAMS = [
  'ALA', 'BAMA', 'Alabama',
  'ARK', 'Arkansas',
  'AUB', 'Auburn',
  'FLA', 'Florida',
  'UGA', 'GA', 'Georgia',
  'UK', 'Kentucky',
  'LSU', 'Louisiana State',
  'MISS', 'OLE MISS', 'Ole Miss', 'Mississippi',
  'MSST', 'MSU', 'Miss St', 'Mississippi State',
  'MIZZ', 'MIZ', 'Missouri',
  'OKLA', 'OU', 'Oklahoma',
  'SCAR', 'SC', 'South Carolina',
  'TENN', 'UT', 'Tennessee',
  'TEX', 'Texas',
  'TXAM', 'TA&M', 'TAMU', 'Texas A&M',
  'VAN', 'VANDY', 'Vanderbilt'
];

function isSECTeam(teamName) {
  const upperName = teamName.toUpperCase();
  return SEC_TEAMS.some(sec => upperName.includes(sec.toUpperCase()));
}

const SPORT_LABELS = {
  football: { icon: '\u{1F3C8}', name: 'CFB' },
  basketball: { icon: '\u{1F3C0}', name: 'CBB' },
  baseball: { icon: '\u26BE', name: 'CBASE' }
};

// Fetch with timeout for mobile reliability
async function fetchWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchScores(sport, url) {
  try {
    console.log(`Fetching ${sport} from: ${url}`);
    const response = await fetchWithTimeout(url, 15000);
    const data = await response.json();
    const games = parseGames(data, sport);
    console.log(`${sport} games found: ${games.length}`);
    return games;
  } catch (error) {
    console.log(`Error fetching ${sport}:`, error);
    return [];
  }
}

function parseGames(data, sport) {
  const games = [];
  if (data.events) {
    data.events.forEach(event => {
      const competition = event.competitions[0];
      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
      
      if (homeTeam && awayTeam) {
        const homeName = homeTeam.team.abbreviation || homeTeam.team.shortDisplayName || homeTeam.team.displayName;
        const awayName = awayTeam.team.abbreviation || awayTeam.team.shortDisplayName || awayTeam.team.displayName;
        const status = competition.status.type.shortDetail;
        
        games.push({
          sport: sport,
          sportLabel: SPORT_LABELS[sport],
          away: awayName,
          awayScore: awayTeam.score || '0',
          home: homeName,
          homeScore: homeTeam.score || '0',
          status: status
        });
      }
    });
  }
  return games;
}

function createTickerItem(game) {
  return `<span class="ticker-item"><span class="sport-icon">${game.sportLabel.icon}</span> ${game.away} ${game.awayScore} - ${game.homeScore} ${game.home} <span class="game-status">(${game.status})</span></span>`;
}

// Cache scores in localStorage for instant display
function getCachedScores() {
  try {
    const cached = localStorage.getItem('sttdb_scores_v2');
    if (cached) {
      const data = JSON.parse(cached);
      // Cache valid for 2 minutes
      if (Date.now() - data.timestamp < 120000) {
        return data.html;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedScores(html) {
  try {
    localStorage.setItem('sttdb_scores_v2', JSON.stringify({
      html: html,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

async function loadAllScores() {
  const tickerContent = document.getElementById('ticker-content');
  if (!tickerContent) return;
  
  // Ensure loading message is visible
  if (tickerContent.textContent.includes('Loading') || tickerContent.innerHTML.trim() === '') {
    tickerContent.innerHTML = '<span class="ticker-item">Loading scores...</span>';
  }
  
  // Show cached scores immediately while fetching fresh data
  const cached = getCachedScores();
  if (cached && tickerContent.textContent.includes('Loading')) {
    tickerContent.innerHTML = cached;
    applyTickerAnimation();
    scoresLoaded = true;
  }
  
  const allGames = [];
  const urls = getESPNUrls();
  
  const [footballGames, basketballGames, baseballGames] = await Promise.all([
    fetchScores('football', urls.football),
    fetchScores('basketball', urls.basketball),
    fetchScores('baseball', urls.baseball)
  ]);
  
  allGames.push(...basketballGames, ...baseballGames, ...footballGames);
  
  if (allGames.length === 0) {
    const noGamesHTML = '<span class="ticker-item">No games available</span><span class="ticker-item">No games available</span>';
    tickerContent.innerHTML = noGamesHTML;
    return;
  }
  
  const tickerHTML = allGames.map(createTickerItem).join('');
  const fullHTML = tickerHTML + tickerHTML + tickerHTML;
  tickerContent.innerHTML = fullHTML;
  
  // Cache for next visit
  setCachedScores(fullHTML);
  
  applyTickerAnimation();
}

function applyTickerAnimation() {
  const tickerContent = document.getElementById('ticker-content');
  const ticker = document.querySelector('.sports-ticker');
  if (!ticker || !tickerContent) return;
  
  ticker.scrollLeft = 0;
  tickerContent.style.animation = 'none';
  tickerContent.style.transform = 'translateX(-33.33%)';
  void tickerContent.offsetWidth;
  tickerContent.style.animation = 'scroll-right 180s linear infinite';
}

// Track if scores loaded successfully
var scoresLoaded = false;
var loadAttempts = 0;

// Expose globally for inline script fallback
window.loadAllScores = loadAllScores;

// Direct load function
function tryLoadScores() {
  loadAttempts++;
  console.log('Score load attempt #' + loadAttempts);
  loadAllScores().then(function() {
    var tickerContent = document.getElementById('ticker-content');
    if (tickerContent && !tickerContent.textContent.includes('Loading')) {
      scoresLoaded = true;
      console.log('Scores loaded successfully');
    }
  }).catch(function(e) {
    console.log('Load attempt failed:', e);
  });
}

// Persistent retry loop - runs every 500ms until success (faster for mobile)
function startRetryLoop() {
  var retryInterval = setInterval(function() {
    var tickerContent = document.getElementById('ticker-content');
    if (!tickerContent) return;
    
    if (tickerContent.textContent.includes('Loading')) {
      tryLoadScores();
    } else {
      scoresLoaded = true;
      clearInterval(retryInterval);
      console.log('Retry loop stopped - scores loaded');
    }
  }, 500);
  
  // Also try with requestAnimationFrame for immediate mobile response
  function rafRetry() {
    if (!scoresLoaded) {
      var tickerContent = document.getElementById('ticker-content');
      if (tickerContent && tickerContent.textContent.includes('Loading')) {
        tryLoadScores();
      }
      if (!scoresLoaded) {
        setTimeout(function() { requestAnimationFrame(rafRetry); }, 300);
      }
    }
  }
  requestAnimationFrame(rafRetry);
}

// Multiple init strategies for mobile compatibility
function initScores() {
  var tickerContent = document.getElementById('ticker-content');
  if (tickerContent) {
    // Immediate first attempt
    tryLoadScores();
    
    // Start persistent retry loop
    startRetryLoop();
    
    // Regular refresh every 60 seconds
    setInterval(loadAllScores, 60000);
  } else {
    // DOM not ready, try again
    setTimeout(initScores, 50);
  }
}

// Strategy 0: Immediate inline execution for mobile (Safari compatible)
(function() {
  function safariInit() {
    var el = document.getElementById('ticker-content');
    if (el) {
      initScores();
    } else {
      // Wait for element with polling
      var poll = setInterval(function() {
        var el = document.getElementById('ticker-content');
        if (el) {
          clearInterval(poll);
          initScores();
        }
      }, 10);
      // Fallback timeout for Safari
      setTimeout(function() {
        clearInterval(poll);
        var el = document.getElementById('ticker-content');
        if (el && !scoresLoaded) initScores();
      }, 100);
    }
  }
  
  // Safari needs readyState check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safariInit);
  } else {
    safariInit();
  }
  
  // Extra Safari trigger on interactive state
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(safariInit, 0);
  }
})();

// Strategy 2: DOM Content Loaded (Safari priority)
document.addEventListener('DOMContentLoaded', function() {
  if (!scoresLoaded) {
    initScores();
  }
  // Safari sometimes needs a tiny delay after DOMContentLoaded
  setTimeout(function() {
    if (!scoresLoaded) tryLoadScores();
  }, 50);
});

// Strategy 3: Window load (everything including images)
window.addEventListener('load', function() {
  if (!scoresLoaded) {
    tryLoadScores();
  }
  // Safari backup after full load
  setTimeout(function() {
    if (!scoresLoaded) tryLoadScores();
  }, 100);
});


// Drag scrolling functionality
document.addEventListener('DOMContentLoaded', () => {
  // Enable drag scrolling on the ticker
  const ticker = document.querySelector('.sports-ticker');
  let isDown = false;
  let startX;
  let scrollLeft;
  let resumeTimeout;
  
  ticker.addEventListener('mousedown', (e) => {
    isDown = true;
    ticker.classList.add('paused');
    startX = e.pageX - ticker.offsetLeft;
    scrollLeft = ticker.scrollLeft;
    clearTimeout(resumeTimeout);
  });
  
  ticker.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      resumeTimeout = setTimeout(() => {
        ticker.classList.remove('paused');
      }, 2000);
    }
  });
  
  ticker.addEventListener('mouseup', () => {
    isDown = false;
    resumeTimeout = setTimeout(() => {
      ticker.classList.remove('paused');
    }, 2000);
  });
  
  ticker.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - ticker.offsetLeft;
    const walk = (x - startX) * 2;
    ticker.scrollLeft = scrollLeft - walk;
  });
  
  // Touch support
  ticker.addEventListener('touchstart', (e) => {
    ticker.classList.add('paused');
    startX = e.touches[0].pageX - ticker.offsetLeft;
    scrollLeft = ticker.scrollLeft;
    clearTimeout(resumeTimeout);
  });
  
  ticker.addEventListener('touchend', () => {
    resumeTimeout = setTimeout(() => {
      ticker.classList.remove('paused');
    }, 2000);
  });
  
  ticker.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - ticker.offsetLeft;
    const walk = (x - startX) * 2;
    ticker.scrollLeft = scrollLeft - walk;
  });
});
