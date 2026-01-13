# STTDB Website

## Overview
A static HTML/CSS/JS website featuring a tiger mascot with social media links and audio. LSU Tigers sports fan site with live scores, news, and recruiting updates.

## Project Structure
- `docs/` - Main website files (static content)
  - `index.html` - Main page
  - `css/` - Stylesheets
  - `js/` - JavaScript files
    - `sports-ticker.js` - Live NCAA scores carousel (basketball, baseball, football)
    - `lsu-news.js` - LSU sports news from lsusports.net
    - `recruiting-news.js` - Recruiting news from LSU Tigers Wire RSS
    - `lsu-schedule.js` - 2026 LSU Football schedule with auto-updating game results
    - `daily-dump.js` - AI-generated daily sports summary
  - `img/` - Images
  - `audio/` - Audio files
- `server.js` - Node.js Express server with AI summary endpoint

## Features
- 2026 LSU Football Schedule sidebar (left side) with auto-updating W/L results
- Live NCAA Division I sports scores carousel (SEC games)
- Sports News, Recruiting, and Daily Dump tabs for news content
- Daily Dump: AI-generated summary of all LSU sports news (uses Replit AI integration)
- Custom audio player with "Neck" song labeled as "NECK"
- Mobile-responsive design with separate layouts
- Social media links
- LSU tiger head favicon with purple background

## Running the Project
The site is served using Node.js Express server on port 5000. The server provides static file serving and an API endpoint for AI-generated summaries.

## Deployment
Configured as a static site deployment serving from the `docs/` directory.

## Recent Changes (Jan 2026)
- Added Daily Dump tab with AI-generated LSU sports summaries (uses OpenAI via Replit AI Integrations)
- Added Sports News and Recruiting tabs above news articles (left-aligned, underline style)
- Sped up score carousel animation (45s CSS)
- Created recruiting news fetcher using Yardbarker LSU RSS via allorigins CORS proxy
- Mobile-specific audio player layout adjustments
