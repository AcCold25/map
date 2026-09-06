## Route Atlas

Route Atlas is a static route-planning dashboard for comparing business transfer routes across the United States. It uses Leaflet and OpenStreetMap for the interactive map. Select a start point and endpoint in the route builder to generate a custom route and estimate distance, fuel, and duration.

## Run the page

Open `index.html` in a browser. The map tiles and fonts are loaded from the web, so an internet connection is required.

For a local server, run this from the project folder:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Current data model

- Start nodes: Edenton, Hazelwood, Tolleson, Ventura, and Britton
- Destination hubs: Tampa, Montgomery, Corona, and Lithia Springs
- Route metrics: estimated distance, fuel forecast, and transit time
- Data source: the supplied planning brief; coordinates and estimates are editable in `app.js`

## Folder Structure

The workspace contains two folders by default, where:

- `src`: the folder to maintain sources
- `lib`: the folder to maintain dependencies

Meanwhile, the compiled output files will be generated in the `bin` folder by default.

> If you want to customize the folder structure, open `.vscode/settings.json` and update the related settings there.

## Dependency Management

The `JAVA PROJECTS` view allows you to manage your dependencies. More details can be found [here](https://github.com/microsoft/vscode-java-dependency#manage-dependencies).
