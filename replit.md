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
  - `img/` - Images
  - `audio/` - Audio files

## Features
- 2026 LSU Football Schedule sidebar (left side) with auto-updating W/L results
- Live NCAA Division I sports scores carousel (SEC games)
- Sports News and Recruiting tabs for news content
- Custom audio player with "Neck" song labeled as "NECK"
- Mobile-responsive design with separate layouts
- Social media links
- LSU tiger head favicon with purple background

## Running the Project
The site is served using Python's built-in HTTP server on port 5000.

## Deployment
Configured as a static site deployment serving from the `docs/` directory.

## Recent Changes (Jan 2026)
- Added Sports News and Recruiting tabs above news articles (left-aligned, underline style)
- Sped up score carousel animation (45s CSS)
- Created recruiting news fetcher using Yardbarker LSU RSS via allorigins CORS proxy
- Mobile-specific audio player layout adjustments
