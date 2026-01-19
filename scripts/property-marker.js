// property-marker.js
(() => {
  const map = window.map;
  if (!map) {
    console.error("[property-marker.js] window.map not found. Load map-init.js first.");
    return;
  }

  // ---- Property outline IDs ----
  const PROPERTY_OUTLINE_SOURCE_ID = "property-outline-source";
  const PROPERTY_OUTLINE_FILL_LAYER_ID = "property-outline-fill";
  const PROPERTY_OUTLINE_LINE_LAYER_ID = "property-outline-line";

  // Default property outline polygon (8 points, closed ring)
  let propertyOutlineFeature = {
    type: "Feature",
    properties: { id: "property-outline" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-76.5350, 39.2660],
        [-76.5250, 39.2690],
        [-76.5145, 39.2665],
        [-76.5105, 39.2595],
        [-76.5125, 39.2525],
        [-76.5200, 39.2495],
        [-76.5315, 39.2525],
        [-76.5370, 39.2585],
        [-76.5350, 39.2660], // close
      ]],
    },
  };

  function ensurePropertyOutlineLayers() {
    if (!map.getSource(PROPERTY_OUTLINE_SOURCE_ID)) {
      map.addSource(PROPERTY_OUTLINE_SOURCE_ID, {
        type: "geojson",
        data: propertyOutlineFeature,
      });
    } else {
      map.getSource(PROPERTY_OUTLINE_SOURCE_ID).setData(propertyOutlineFeature);
    }

    if (!map.getLayer(PROPERTY_OUTLINE_FILL_LAYER_ID)) {
      map.addLayer({
        id: PROPERTY_OUTLINE_FILL_LAYER_ID,
        type: "fill",
        source: PROPERTY_OUTLINE_SOURCE_ID,
        paint: {
          "fill-color": "#23F1E0",
          "fill-opacity": 0, // outline-only
        },
      });
    }

    if (!map.getLayer(PROPERTY_OUTLINE_LINE_LAYER_ID)) {
      map.addLayer({
        id: PROPERTY_OUTLINE_LINE_LAYER_ID,
        type: "line",
        source: PROPERTY_OUTLINE_SOURCE_ID,
        paint: {
          "line-color": "#23F1E0",
          "line-width": 1.8,
        },
      });
    }
  }

  // If you want to update outline dynamically later:
  function updatePropertyOutline(geojsonFeatureOrGeometry) {
    if (!geojsonFeatureOrGeometry) return;

    let feature = geojsonFeatureOrGeometry;

    if (geojsonFeatureOrGeometry.type === "Polygon" || geojsonFeatureOrGeometry.type === "MultiPolygon") {
      feature = { type: "Feature", properties: {}, geometry: geojsonFeatureOrGeometry };
    }

    if (!feature || feature.type !== "Feature") {
      console.error("[property-marker.js] Invalid outline GeoJSON:", geojsonFeatureOrGeometry);
      return;
    }

    propertyOutlineFeature = feature;

    const src = map.getSource(PROPERTY_OUTLINE_SOURCE_ID);
    if (src) src.setData(propertyOutlineFeature);
  }

  // Expose if you want to call it from elsewhere
  window.updatePropertyOutline = updatePropertyOutline;

  // ---- Tooltip builder (your existing logic) ----
  function buildPropertyTooltipEl(data) {
    const root = document.createElement("div");
    root.className = "property-tooltip";

    const body = document.createElement("div");
    body.className = "property-tooltip__body";
    root.appendChild(body);

    // Image (left)
    if (data.imageUrl) {
      const media = document.createElement("div");
      media.className = "property-tooltip__media";
      body.appendChild(media);

      const img = document.createElement("img");
      img.src = data.imageUrl;
      img.alt = data.title ? `${data.title} image` : "Location image";
      media.appendChild(img);

      if (data.badge) {
        const badge = document.createElement("div");
        badge.className = "property-tooltip__badge";
        badge.textContent = data.badge;
        media.appendChild(badge);
      }
    }

    // Text (right)
    const text = document.createElement("div");
    text.className = "property-tooltip__text";
    body.appendChild(text);

    if (data.kicker) {
      const kicker = document.createElement("p");
      kicker.className = "property-tooltip__kicker";
      kicker.textContent = data.kicker;
      text.appendChild(kicker);
    }

    if (data.metric) {
      const metric = document.createElement("p");
      metric.className = "property-tooltip__metric";
      metric.textContent = data.metric;

      if (data.unit) {
        const unit = document.createElement("span");
        unit.className = "property-tooltip__unit";
        unit.textContent = " " + data.unit;
        metric.appendChild(unit);
      }

      text.appendChild(metric);
    }

    const title = document.createElement("p");
    title.className = "property-tooltip__title";
    title.textContent = data.title || "";
    text.appendChild(title);

    if (data.description) {
      const desc = document.createElement("p");
      desc.className = "property-tooltip__desc";
      desc.textContent = data.description;
      text.appendChild(desc);
    }

    return root;
  }

  function addPropertyMarker() {
    const cityData = {
      img: "./assets/icons/city.svg",
      name: "City Center",
      lngLat: [-76.525583, 39.25904],
      tooltip: {
        badge: "Urban",
        kicker: "Verfügbarkeit September 2025",
        metric: "27,288",
        unit: "SF",
        title: "Prologis Business Center North #3",
        description: "5503 Havana Street, Unit 140\nDenver, Colorado, 80238",
        imageUrl: "./assets/icons/property.png",
      },
    };

    const cityMarkerEl = document.createElement("div");
    cityMarkerEl.className = "custom-city-marker";
    cityMarkerEl.innerHTML = `
      <div class="marker-pin">
        <img src="${cityData.img}" alt="${cityData.name}" class="marker-img" />
      </div>
    `;

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: true,
      anchor: "bottom",
      offset: 28,
      className: "property-tooltip-popup",
      maxWidth: "none",
    }).setDOMContent(buildPropertyTooltipEl(cityData.tooltip));

    new mapboxgl.Marker({ element: cityMarkerEl, anchor: "bottom" })
      .setLngLat(cityData.lngLat)
      .setPopup(popup)
      .addTo(map);
  }

  // Re-add outline after style changes
  map.on("style.load", () => {
    ensurePropertyOutlineLayers();
  });

  map.on("load", () => {
    ensurePropertyOutlineLayers();
    addPropertyMarker();
  });
})();
