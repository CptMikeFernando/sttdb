const ESPN_APIS = {
  football: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
  basketball: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  baseball: 'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard'
};

const SPORT_ICONS = {
  football: '\u{1F3C8}',
  basketball: '\u{1F3C0}',
  baseball: '\u26BE'
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
        const status = competition.status.type.shortDetail;
        games.push({
          sport: sport,
          icon: SPORT_ICONS[sport],
          away: awayTeam.team.abbreviation || awayTeam.team.shortDisplayName,
          awayScore: awayTeam.score || '0',
          home: homeTeam.team.abbreviation || homeTeam.team.shortDisplayName,
          homeScore: homeTeam.score || '0',
          status: status
        });
      }
    });
  }
  return games;
}

function createTickerItem(game) {
  return `<span class="ticker-item">${game.icon} ${game.away} ${game.awayScore} - ${game.homeScore} ${game.home} <span class="game-status">(${game.status})</span></span>`;
}

async function loadAllScores() {
  const tickerContent = document.getElementById('ticker-content');
  tickerContent.innerHTML = '<span class="ticker-item">Loading scores...</span>';
  
  const allGames = [];
  
  const [footballGames, basketballGames, baseballGames] = await Promise.all([
    fetchScores('football', ESPN_APIS.football),
    fetchScores('basketball', ESPN_APIS.basketball),
    fetchScores('baseball', ESPN_APIS.baseball)
  ]);
  
  allGames.push(...footballGames, ...basketballGames, ...baseballGames);
  
  if (allGames.length === 0) {
    tickerContent.innerHTML = '<span class="ticker-item">No games scheduled today</span>';
    return;
  }
  
  const tickerHTML = allGames.map(createTickerItem).join('');
  tickerContent.innerHTML = tickerHTML + tickerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  loadAllScores();
  setInterval(loadAllScores, 60000);
});
