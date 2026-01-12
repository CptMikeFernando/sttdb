const LSU_SCHEDULE_2026 = [
  { date: '2026-08-29', opponent: 'at Clemson', time: 'TBD', espnId: null },
  { date: '2026-09-05', opponent: 'Louisiana Tech', time: 'TBD', espnId: null },
  { date: '2026-09-12', opponent: 'Florida', time: 'TBD', espnId: null },
  { date: '2026-09-19', opponent: 'Southeastern LA', time: 'TBD', espnId: null },
  { date: '2026-09-26', opponent: 'at Ole Miss', time: 'TBD', espnId: null },
  { date: '2026-10-10', opponent: 'South Carolina', time: 'TBD', espnId: null },
  { date: '2026-10-17', opponent: 'at Vanderbilt', time: 'TBD', espnId: null },
  { date: '2026-10-24', opponent: 'Texas A&M', time: 'TBD', espnId: null },
  { date: '2026-11-07', opponent: 'at Alabama', time: 'TBD', espnId: null },
  { date: '2026-11-14', opponent: 'Arkansas', time: 'TBD', espnId: null },
  { date: '2026-11-21', opponent: 'Western Kentucky', time: 'TBD', espnId: null },
  { date: '2026-11-28', opponent: 'at Oklahoma', time: 'TBD', espnId: null }
];

async function fetchLSUScheduleFromESPN() {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/lsu/schedule?season=2026');
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (e) {
    console.log('Could not fetch ESPN schedule:', e);
    return null;
  }
}

async function fetchGameResult(gameDate) {
  try {
    const dateStr = gameDate.replace(/-/g, '');
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${dateStr}`);
    if (!response.ok) return null;
    const data = await response.json();
    
    for (const event of data.events || []) {
      const competitors = event.competitions?.[0]?.competitors || [];
      const lsuTeam = competitors.find(c => c.team?.abbreviation === 'LSU' || c.team?.displayName?.includes('LSU'));
      
      if (lsuTeam) {
        const opponent = competitors.find(c => c !== lsuTeam);
        const lsuScore = parseInt(lsuTeam.score) || 0;
        const oppScore = parseInt(opponent?.score) || 0;
        const status = event.status?.type?.completed;
        const isInProgress = event.status?.type?.state === 'in';
        
        return {
          completed: status,
          inProgress: isInProgress,
          lsuScore: lsuScore,
          oppScore: oppScore,
          lsuWon: lsuScore > oppScore,
          statusText: event.status?.type?.shortDetail || ''
        };
      }
    }
    return null;
  } catch (e) {
    console.log('Error fetching game result:', e);
    return null;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function isGameDayOrPast(dateStr) {
  const gameDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return gameDate <= today;
}

async function renderSchedule() {
  const container = document.getElementById('schedule-content');
  if (!container) return;
  
  let html = '';
  
  for (const game of LSU_SCHEDULE_2026) {
    const formattedDate = formatDate(game.date);
    let resultCell = '';
    let resultClass = '';
    
    if (isGameDayOrPast(game.date)) {
      const result = await fetchGameResult(game.date);
      if (result && result.completed) {
        const letter = result.lsuWon ? 'W' : 'L';
        resultClass = result.lsuWon ? 'win' : 'loss';
        resultCell = `<span class="result-letter ${resultClass}">${letter}</span> ${result.lsuScore}-${result.oppScore}`;
      } else if (result && result.inProgress) {
        resultCell = `<span class="result-live">LIVE</span> ${result.lsuScore}-${result.oppScore}`;
      } else {
        resultCell = `<span class="result-tbd">TBD</span>`;
      }
    } else {
      const gameTime = game.time !== 'TBD' ? game.time : 'TBD';
      resultCell = `<span class="result-tbd">${gameTime}</span>`;
    }
    
    html += `
      <div class="schedule-row">
        <div class="schedule-date">${formattedDate}</div>
        <div class="schedule-opponent">${game.opponent}</div>
        <div class="schedule-result ${resultClass}">${resultCell}</div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

function initSchedule() {
  renderSchedule();
  setInterval(renderSchedule, 300000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSchedule);
} else {
  initSchedule();
}
