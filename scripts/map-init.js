// map-init.js
mapboxgl.accessToken =
  "pk.eyJ1IjoicGhvbGxpcy1wcm9sb2dpcyIsImEiOiJjbWl4cGt1ajUwN2JpM2RvOXdqOWFmb3U3In0.RyiaedumDC0gnw6FeFKqrA ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/phollis-prologis/cmixr0gqa000d01rj1py34kjg",
  attributionControl: false,
  center: [-76.525583, 39.25904],
  zoom: 12,
});

// ✅ Expose globally for other files
window.map = map;

function setMapStyle(style, el) {
  setStyle(style);
  const buttons = el.parentElement.querySelectorAll(".btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  el.classList.add("active");
  document.body.classList.toggle("is-satellite", style === "satellite");
}

function setStyle(type) {
  map.setStyle(
    type === "satellite"
      ? "./styles-hybrid/style-hybrid.json"
      : "./styles-map/style-map.json"
  );
}

function toggleMapFilters() {
  const filters = document.querySelector(".bottom-controls");
  filters.classList.toggle("is-visible");
}

// Optional: expose if your HTML calls these
window.setMapStyle = setMapStyle;
window.toggleMapFilters = toggleMapFilters;
