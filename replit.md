# STTDB Website

## Overview
A Flask-powered LSU Tigers sports fan site with live scores, news, recruiting updates, schedule display, and interactive polls.

## Project Structure
- `app.py` - Flask backend (serves static files + poll API)
- `docs/` - Main website files (static content)
  - `index.html` - Main page
  - `css/` - Stylesheets
  - `js/` - JavaScript files
    - `sports-ticker.js` - Live NCAA scores carousel (basketball, baseball, football)
    - `lsu-news.js` - LSU sports news from lsusports.net
    - `recruiting-news.js` - Recruiting news from LSU Tigers Wire RSS
  - `img/` - Images (includes favicon.svg with purple background)
  - `audio/` - Audio files

## Features
- Live NCAA Division I sports scores carousel (SEC games)
- Sports News and Recruiting tabs for news content
- Custom audio player with "Neck" song labeled
- 2026 LSU Football Schedule (sidebar on desktop, inline section on mid-size screens)
- SEC Baseball Championship Poll with voting and results (stored in PostgreSQL)
- Mobile-responsive design with separate layouts
- Social media links
- LSU purple/gold themed favicon

## Running the Project
Flask server on port 5000 (`python app.py`). Serves static files from `docs/` and provides poll API endpoints.

## API Endpoints
- `POST /api/poll/vote` - Submit a vote (body: `{"team": "LSU"}`)
- `GET /api/poll/results` - Get poll results with vote counts and percentages

## Deployment
Configured as autoscale deployment with Flask backend.

## Recent Changes (Jan 2026)
- Added 2026 LSU Football Schedule sidebar
- Added SEC Baseball Championship Poll with database-backed voting
- Created SVG favicon with LSU purple background
- Updated page title to "STTDB"
- Responsive layout: sidebars show as inline sections on 769-1500px, fixed on 1500px+, hidden on mobile
