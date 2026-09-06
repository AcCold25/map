const routeGroups = [
    {
        id: "east",
        name: "Atlantic corridor",
        color: "#087f75",
        miles: "1,180 mi",
        fuel: "$332",
        duration: "19h 40m",
        path: "Edenton, NC to Tampa, FL",
        points: [[36.057, -76.607], [35.5, -77.3], [34.9, -78.9], [33.8, -81.0], [32.4, -82.5], [30.4, -81.6], [27.95, -82.46]],
    },
    {
        id: "central",
        name: "Central relay",
        color: "#3c75aa",
        miles: "640 mi",
        fuel: "$180",
        duration: "10h 45m",
        path: "Hazelwood, MO to Montgomery, MN",
        points: [[38.77, -90.37], [39.8, -91.2], [41.4, -92.0], [43.1, -92.7], [44.45, -93.73]],
    },
    {
        id: "southwest",
        name: "Southwest loop",
        color: "#e2652e",
        miles: "1,920 mi",
        fuel: "$540",
        duration: "31h 50m",
        path: "Tolleson, AZ to Corona, CA",
        points: [[33.45, -112.26], [33.7, -111.1], [34.1, -109.5], [34.5, -107.5], [34.6, -105.2], [34.3, -102.2], [34.0, -99.2], [34.0, -96.0], [33.9, -92.0], [33.87, -89.0], [33.75, -85.0], [33.9, -82.6], [33.78, -81.0], [33.4, -79.0], [33.1, -77.5], [32.8, -80.0], [33.88, -117.57]],
    },
    {
        id: "west",
        name: "Pacific transfer",
        color: "#e2aa38",
        miles: "360 mi",
        fuel: "$101",
        duration: "6h 05m",
        path: "Ventura, CA to Corona, CA",
        points: [[34.28, -119.29], [34.15, -118.4], [34.03, -117.8], [33.88, -117.57]],
    },
    {
        id: "north",
        name: "Northern relay",
        color: "#6d63a8",
        miles: "3,390 mi",
        fuel: "$953",
        duration: "52h 40m",
        path: "Britton, SD to Lithia Springs, GA",
        points: [[45.81, -97.75], [44.8, -96.7], [43.8, -95.5], [42.8, -94.1], [41.8, -92.3], [40.6, -90.0], [39.2, -87.7], [38.0, -85.5], [36.7, -84.3], [34.8, -84.6], [33.78, -84.65]],
    },
];

const nodes = [
    { type: "start", name: "Edenton", detail: "818 Soundside Road, Suite B, Edenton, NC 27932", coords: [36.057, -76.607] },
    { type: "start", name: "St. Charles", detail: "301 Fountain Lakes Industrial Dr, St. Charles, MO 63301", coords: [38.79, -90.49] },
    { type: "start", name: "Hazelwood", detail: "310 James S. McDonnell Blvd., Hazelwood, MO 63042", coords: [38.77, -90.37] },
    { type: "start", name: "Tolleson", detail: "7890 W. Lincoln Street, Tolleson, AZ 85353", coords: [33.45, -112.26] },
    { type: "start", name: "Ventura", detail: "1732 Palma Drive, Ste 200, Ventura, CA 93003", coords: [34.28, -119.29] },
    { type: "start", name: "Britton", detail: "406 Vander Horck, Britton, SD 57430", coords: [45.81, -97.75] },
    { type: "hub", name: "Corona", detail: "555 S. Promenade Ave., Suite 104, Corona, CA 92879", coords: [33.88, -117.57] },
    { type: "hub", name: "Tolleson", detail: "7890 W. Lincoln Street, Tolleson, AZ 85353", coords: [33.45, -112.26] },
    { type: "hub", name: "Montgomery, MN", detail: "703 Rogers Drive, Montgomery, MN 56069", coords: [44.45, -93.73] },
    { type: "hub", name: "North Largo", detail: "11910 62nd Street, North Largo, FL 33773", coords: [27.88, -82.75] },
    { type: "hub", name: "Tampa", detail: "1801A Massaro Blvd., Tampa, FL 33619", coords: [27.95, -82.46] },
    { type: "hub", name: "Lithia Springs", detail: "1500 Distribution Court, Suite 200, Lithia Springs, GA 30122", coords: [33.78, -84.65] },
    { type: "hub", name: "Mission Viejo", detail: "25909 Pala, Suite 200, Mission Viejo, CA 92691", coords: [33.596, -117.66] },
];

const map = L.map("map", { zoomControl: false, minZoom: 3 }).setView([38.5, -96], 4);
L.control.zoom({ position: "bottomright" }).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);

const routeLayers = new Map();
let generatedLayer;
let activeRoute;

function markerIcon(type, label) {
    return L.divIcon({
        className: "marker-wrap",
        html: `<div class="custom-marker marker-${type}"><span>${type === "start" ? "S" : "E"}</span></div><div class="marker-label">${label}</div>`,
        iconSize: [25, 52],
        iconAnchor: [12, 12],
    });
}

nodes.forEach((node) => {
    const marker = L.marker(node.coords, { icon: markerIcon(node.type, node.name) }).addTo(map);
    marker.bindPopup(`<strong>${node.name}</strong><br><span>${node.detail}</span><br><small>${node.type === "start" ? "Start node" : "Destination hub"}</small>`);
});

routeGroups.forEach((route) => {
    const layer = L.polyline(route.points, {
        color: route.color,
        weight: 3,
        opacity: 0.86,
        dashArray: "7 6",
        lineCap: "round",
    }).addTo(map);
    routeLayers.set(route.id, layer);
});

const routeList = document.querySelector("#route-list");
const callout = document.querySelector("#map-callout");
const startSelect = document.querySelector("#start-select");
const endpointSelect = document.querySelector("#endpoint-select");
const starts = nodes.filter((node) => node.type === "start");
const endpoints = nodes.filter((node) => node.type === "hub");

function fillSelect(select, locations) {
    locations.forEach((location) => {
        const option = document.createElement("option");
        option.value = location.name;
        option.textContent = `${location.name} - ${location.detail}`;
        select.appendChild(option);
    });
}

fillSelect(startSelect, starts);
fillSelect(endpointSelect, endpoints);

function distanceBetween(first, second) {
    const earthRadius = 3958.8;
    const latitudeDelta = (second[0] - first[0]) * Math.PI / 180;
    const longitudeDelta = (second[1] - first[1]) * Math.PI / 180;
    const latitudeOne = first[0] * Math.PI / 180;
    const latitudeTwo = second[0] * Math.PI / 180;
    const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function routePoints(start, endpoint) {
    return Array.from({ length: 9 }, (_, index) => {
        const progress = index / 8;
        const curve = Math.sin(progress * Math.PI) * Math.min(4, Math.abs(endpoint.coords[1] - start.coords[1]) * 0.08);
        return [
            start.coords[0] + (endpoint.coords[0] - start.coords[0]) * progress,
            start.coords[1] + (endpoint.coords[1] - start.coords[1]) * progress + curve,
        ];
    });
}

function formatDuration(hours) {
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
}

function calculateRoute() {
    const start = starts.find((location) => location.name === startSelect.value);
    const endpoint = endpoints.find((location) => location.name === endpointSelect.value);
    const miles = Math.round(distanceBetween(start.coords, endpoint.coords) * 1.18);
    const fuel = Math.round((miles / 8.5) * 3.48);
    const duration = formatDuration(miles / 55);
    const points = routePoints(start, endpoint);
    activeRoute = { start, endpoint, miles, fuel, duration, points };

    if (generatedLayer) {
        map.removeLayer(generatedLayer);
    }
    generatedLayer = L.polyline(points, { color: "#17252b", weight: 5, opacity: 1, dashArray: "10 7", lineCap: "round" }).addTo(map);
    generatedLayer.bringToFront();
    map.fitBounds(generatedLayer.getBounds(), { padding: [90, 90], maxZoom: 6 });

    document.querySelector("#metric-distance").textContent = miles.toLocaleString();
    document.querySelector("#metric-fuel").textContent = `$${fuel.toLocaleString()}`;
    document.querySelector("#metric-duration").textContent = duration;
    document.querySelector("#metric-stops").textContent = "2";
    routeList.innerHTML = `
        <article class="route-card active">
            <div class="route-head">
                <div class="route-name"><i class="route-swatch" style="background:#17252b"></i>Custom transfer</div>
                <span class="route-miles">${miles.toLocaleString()} mi</span>
            </div>
            <p class="route-path">${start.name} to ${endpoint.name}</p>
            <div class="route-data"><b>${duration}</b><span>Fuel <b>$${fuel.toLocaleString()}</b></span></div>
        </article>
    `;
    callout.innerHTML = `<span class="callout-kicker">Calculated route</span><strong>${start.name} to ${endpoint.name}</strong><span>${miles.toLocaleString()} mi / ${duration} / $${fuel.toLocaleString()} estimated fuel</span>`;
}

document.querySelector("#route-builder").addEventListener("submit", (event) => {
    event.preventDefault();
    calculateRoute();
});

document.querySelector("#fit-routes").addEventListener("click", () => {
    const allBounds = L.latLngBounds(routeGroups.flatMap((route) => route.points));
    map.fitBounds(allBounds, { padding: [55, 55] });
    document.querySelectorAll(".route-card").forEach((card) => card.classList.remove("active"));
    routeGroups.forEach((route) => routeLayers.get(route.id).setStyle({ opacity: 0.86, weight: 3 }));
    if (generatedLayer) {
        generatedLayer.bringToFront();
    }
    callout.innerHTML = activeRoute
        ? `<span class="callout-kicker">Calculated route</span><strong>${activeRoute.start.name} to ${activeRoute.endpoint.name}</strong><span>${activeRoute.miles.toLocaleString()} mi / ${activeRoute.duration} / $${activeRoute.fuel.toLocaleString()} estimated fuel</span>`
        : `<span class="callout-kicker">Selected network</span><strong>All route groups</strong><span>Choose locations to calculate a custom movement.</span>`;
});

document.querySelector("#focus-start").addEventListener("click", () => {
    if (activeRoute) {
        map.setView(activeRoute.start.coords, 6);
    }
});

document.querySelector("#toggle-labels").addEventListener("click", (event) => {
    const hidden = event.currentTarget.textContent === "Show labels";
    event.currentTarget.textContent = hidden ? "Hide labels" : "Show labels";
    document.querySelectorAll(".marker-label").forEach((label) => label.classList.toggle("hidden", !hidden));
});

map.fitBounds(L.latLngBounds(routeGroups.flatMap((route) => route.points)), { padding: [55, 55] });
calculateRoute();
