# React Weather App

Task 4 - React Weather App (ReactTS). A weather app built with React, TypeScript and Vite that shows current conditions and forecasts for the user's location or any searched city, and remembers saved locations between visits.

**Live site:** https://weather-katlego-nomsa.vercel.app

**Repository:** https://github.com/katlego-nomsa/weather

**Figma design:** (https://www.figma.com/design/ZQKzSGHvqYf8dshYyWF1hA/weather?node-id=0-1&p=f&t=nJAIRu2zJCtkX2V7-0)


---

## Features

- **Current weather:** temperature, humidity, wind speed and conditions
- **Hourly and daily forecasts:** switch between the two views
- **Location detection:** asks for permission to use your current location
- **Search:** look up weather for any city
- **Saved locations:** save several locations and switch between them
- **Units:** switch between Celsius and Fahrenheit
- **Themes:** customise the app's theme
- **Weather alerts:** local notifications for severe weather
- **Offline access:** cached weather data is shown when there is no connection
- **Responsive:** works at 320px, 480px, 768px, 1024px and 1200px

## Tech stack

- React + TypeScript
- Vite
- React Router DOM v6
- CSS Modules
- Weather data from a third-party weather API (_add the API name here_)
- `localStorage` for persistence
- Deployed on Vercel

## Getting started

```bash
git clone https://github.com/katlego-nomsa/weather.git
cd weather
git checkout Weather
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## Project structure

```
src/
  components/   Reusable UI components
  context/      React context (shared app state)
  hooks/        Custom hooks
  pages/        Weather page, NotFound page
  utils/        Helper functions
  types.ts      Shared TypeScript types
  App.tsx       Routes
  main.tsx      Entry point
public/         Static assets
```

## Step-by-step plan

1. Design the screens in Figma (search page, weather page, settings).
2. Write the pseudocode and algorithm before coding.
3. Set up the Vite + React + TypeScript project and install React Router.
4. Build the layout and reusable components.
5. Connect to the weather API and display current conditions.
6. Add search and geolocation.
7. Add hourly and daily forecast views.
8. Save locations, units and theme to `localStorage`.
9. Cache the last response for offline use.
10. Add severe weather notifications.
11. Make the layout responsive and test at each breakpoint.
12. Deploy to Vercel and test the live site.

## Algorithm

1. On load, read saved locations, units and theme from `localStorage`.
2. If the user has no saved location, ask for permission to use their location.
   - If granted, use the coordinates.
   - If denied, show the search box.
3. Request weather data for the active location from the API.
4. If the request succeeds, display the data and store a copy in `localStorage` with a timestamp.
5. If the request fails or the device is offline, display the cached copy and show an "offline" message.
6. When the user searches for a city, look it up, fetch its weather and show the result. The user can save it to their locations.
7. When the user switches location, units, theme or forecast view, update state and save the new setting.
8. If the data contains a severe weather alert, show a notification (with the user's permission).

## Privacy

- The user's location is only used to request weather and is never sent anywhere other than the weather API.
- Saved locations, units and theme are stored only in the user's browser (`localStorage`) and can be cleared at any time.
- Location and notification access are only requested with the user's permission.

## Author

katlego-nomsa
