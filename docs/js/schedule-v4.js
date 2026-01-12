const ESPN_TEAM_ID = 99;

async function fetchESPNSchedule(sport) {
  const endpoints = {
    'football': `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${ESPN_TEAM_ID}/schedule`,
    'baseball': `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams/${ESPN_TEAM_ID}/schedule`,
    'mens-basketball': `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${ESPN_TEAM_ID}/schedule`,
    'womens-basketball': `https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams/${ESPN_TEAM_ID}/schedule`
  };

  try {
    const response = await fetch(endpoints[sport]);
    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data.events || data.events.length === 0) return null;
    
    const schedule = data.events.map(event => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      const lsuTeam = competitors.find(c => c.id === String(ESPN_TEAM_ID) || c.team?.abbreviation === 'LSU');
      const opponent = competitors.find(c => c !== lsuTeam);
      
      const isHome = lsuTeam?.homeAway === 'home';
      const isNeutral = competition?.neutralSite;
      let opponentName = opponent?.team?.shortDisplayName || opponent?.team?.displayName || 'TBD';
      
      if (isNeutral) {
        opponentName = 'vs ' + opponentName;
      } else if (!isHome) {
        opponentName = 'at ' + opponentName;
      }
      
      const gameDate = new Date(event.date);
      const dateStr = gameDate.toISOString().split('T')[0];
      
      let timeStr = 'TBD';
      if (event.status?.type?.state !== 'pre' || event.date) {
        const localDate = new Date(event.date);
        const hours = localDate.getHours();
        const minutes = localDate.getMinutes();
        if (!(hours === 0 && minutes === 0) && !(hours === 7 && minutes === 0)) {
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
      }
      
      let result = null;
      if (event.status?.type?.completed) {
        const lsuScore = parseInt(lsuTeam?.score) || 0;
        const oppScore = parseInt(opponent?.score) || 0;
        const won = lsuScore > oppScore;
        result = `${won ? 'W' : 'L'} ${lsuScore}-${oppScore}`;
      }
      
      return {
        date: dateStr,
        opponent: opponentName,
        time: timeStr,
        result: result,
        status: event.status?.type?.state
      };
    });
    
    return schedule;
  } catch (e) {
    console.log('Error fetching ESPN schedule for ' + sport + ':', e);
    return null;
  }
}

function formatScheduleDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function parseHardcodedResult(resultStr) {
  if (!resultStr) return null;
  const match = resultStr.match(/([WL])\s+(\d+)-(\d+)/);
  if (match) {
    return {
      completed: true,
      lsuWon: match[1] === 'W',
      lsuScore: parseInt(match[2]),
      oppScore: parseInt(match[3])
    };
  }
  const otMatch = resultStr.match(/([WL])\s+(\d+)-(\d+)\s*OT/);
  if (otMatch) {
    return {
      completed: true,
      lsuWon: otMatch[1] === 'W',
      lsuScore: parseInt(otMatch[2]),
      oppScore: parseInt(otMatch[3]),
      overtime: true
    };
  }
  return null;
}

async function renderScheduleFromAPI(containerId, sport) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '<div class="schedule-loading">Loading...</div>';
  
  const schedule = await fetchESPNSchedule(sport);
  
  if (!schedule || schedule.length === 0) {
    container.innerHTML = '<div class="schedule-row"><div class="schedule-opponent">Schedule unavailable</div></div>';
    return;
  }
  
  let html = '';
  
  for (const game of schedule) {
    const formattedDate = formatScheduleDate(game.date);
    let resultCell = '';
    let resultClass = '';
    
    if (game.result) {
      const parsed = parseHardcodedResult(game.result);
      if (parsed) {
        const letter = parsed.lsuWon ? 'W' : 'L';
        resultClass = parsed.lsuWon ? 'win' : 'loss';
        resultCell = `<span class="result-letter ${resultClass}">${letter}</span> ${parsed.lsuScore}-${parsed.oppScore}${parsed.overtime ? ' OT' : ''}`;
      }
    } else if (game.status === 'in') {
      resultCell = `<span class="result-live">LIVE</span>`;
    } else {
      resultCell = `<span class="result-tbd">${game.time}</span>`;
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

async function initSchedules() {
  await Promise.all([
    renderScheduleFromAPI('football-schedule-content', 'football'),
    renderScheduleFromAPI('baseball-schedule-content', 'baseball'),
    renderScheduleFromAPI('mens-basketball-schedule-content', 'mens-basketball'),
    renderScheduleFromAPI('womens-basketball-schedule-content', 'womens-basketball')
  ]);
  
  setInterval(() => {
    renderScheduleFromAPI('football-schedule-content', 'football');
    renderScheduleFromAPI('baseball-schedule-content', 'baseball');
    renderScheduleFromAPI('mens-basketball-schedule-content', 'mens-basketball');
    renderScheduleFromAPI('womens-basketball-schedule-content', 'womens-basketball');
  }, 300000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSchedules);
} else {
  initSchedules();
}
