# STTDB Website

## Overview
A static HTML/CSS/JS website featuring a tiger mascot with social media links and audio. LSU Tigers sports fan site with live scores, news, and recruiting updates.

## Project Structure
- `docs/` - Main website files (static content)
  - `index.html` - Main page
  - `css/` - Stylesheets
  - `js/` - JavaScript files
    - `sports-ticker.js` - Live NCAA scores carousel (basketball, baseball, football)
    - `lsu-news.js` - LSU sports news from lsusports.net (shows 30 articles)
    - `recruiting-news.js` - Recruiting news from Yardbarker RSS (shows 25 articles)
    - `schedule-v4.js` - Auto-updating schedules via ESPN API
  - `img/` - Images
  - `audio/` - Audio files

## Features
- **Auto-Updating Schedules** - All 4 schedule boxes (Football, Baseball, Men's Basketball, Women's Basketball) automatically fetch current season data from ESPN API
- Live NCAA Division I sports scores carousel (SEC games)
- Sports News and Recruiting tabs for news content (shows articles back to 1/7/2026)
- Custom audio player with "Neck" song labeled as "NECK"
- Mobile-responsive design with separate layouts
- Social media links
- LSU tiger head favicon with purple background

## Schedule System
Schedules automatically update each season by fetching from ESPN's team schedule API:
- Football: `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/99/schedule`
- Baseball: `https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams/99/schedule`
- Men's Basketball: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/99/schedule`
- Women's Basketball: `https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams/99/schedule`

No manual updates needed - schedules refresh automatically every 5 minutes and will show the new season when ESPN updates their data.

## Running the Project
The site is served using Python's built-in HTTP server on port 5000.

## Deployment
Configured as a static site deployment serving from the `docs/` directory.

## Recent Changes (Jan 12, 2026)
- Converted all schedules to use ESPN API for automatic updates each season
- Increased Sports News to show 30 articles (from 15)
- Increased Recruiting News to show 25 articles (from 10)
- Added Sports News and Recruiting tabs above news articles
- Mobile-specific audio player layout adjustments
