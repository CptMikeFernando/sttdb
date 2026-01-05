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

function getESPNUrls() {
  const dates = getWeekDates();
  return {
    football: `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${dates.start}-${dates.end}`,
    basketball: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${dates.start}-${dates.end}`,
    baseball: `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard?dates=${dates.start}-${dates.end}`
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

async function fetchScores(sport, url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return parseGames(data, sport);
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
        
        if (isSECTeam(homeName) || isSECTeam(awayName) || 
            isSECTeam(homeTeam.team.displayName || '') || isSECTeam(awayTeam.team.displayName || '')) {
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
      }
    });
  }
  return games;
}

function createTickerItem(game) {
  return `<span class="ticker-item"><span class="sport-label">${game.sportLabel.icon} ${game.sportLabel.name}</span> ${game.away} ${game.awayScore} - ${game.homeScore} ${game.home} <span class="game-status">(${game.status})</span></span>`;
}

async function loadAllScores() {
  const tickerContent = document.getElementById('ticker-content');
  tickerContent.innerHTML = '<span class="ticker-item">Loading scores...</span>';
  
  const allGames = [];
  
  const urls = getESPNUrls();
  
  const [footballGames, basketballGames, baseballGames] = await Promise.all([
    fetchScores('football', urls.football),
    fetchScores('basketball', urls.basketball),
    fetchScores('baseball', urls.baseball)
  ]);
  
  allGames.push(...footballGames, ...basketballGames, ...baseballGames);
  
  if (allGames.length === 0) {
    tickerContent.innerHTML = '<span class="ticker-item">No SEC games this week</span><span class="ticker-item">No SEC games this week</span>';
    return;
  }
  
  const tickerHTML = allGames.map(createTickerItem).join('');
  tickerContent.innerHTML = tickerHTML + tickerHTML + tickerHTML;
  
  // Reset scroll position and animation to start from beginning
  const ticker = document.querySelector('.sports-ticker');
  ticker.scrollLeft = 0;
  tickerContent.style.animation = 'none';
  tickerContent.style.transform = 'translateX(-33.33%)';
  void tickerContent.offsetWidth; // Force reflow
  tickerContent.style.animation = 'scroll-right 180s linear infinite';
}

document.addEventListener('DOMContentLoaded', () => {
  loadAllScores();
  setInterval(loadAllScores, 60000);
  
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
