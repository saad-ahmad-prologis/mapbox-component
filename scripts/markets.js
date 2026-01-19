// markets.js
(() => {
  const map = window.map;
  if (!map) {
    console.error("[markets.js] window.map not found. Load map-init.js first.");
    return;
  }

  // IDs
  const MARKET_SOURCE_ID = "market-active-source";
  const MARKET_FILL_LAYER_ID = "market-active-fill";
  const MARKET_OUTLINE_LAYER_ID = "market-active-outline";

  const MARKET_LABEL_SOURCE_ID = "market-label-source";
  const MARKET_LABEL_LAYER_ID = "market-label-layer";

  // Markets data (6–10 points each + mixed structures)
  const MARKETS = {
    "dc-md-va": {
      name: "Maryland, Washington D.C., and Northern Virginia",
      labelLngLat: [-77.0369, 38.9072],
      feature: {
        type: "Feature",
        properties: { id: "dc-md-va" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-77.60, 39.10],
            [-77.30, 39.35],
            [-76.95, 39.45],
            [-76.55, 39.40],
            [-76.25, 39.05],
            [-76.30, 38.70],
            [-76.70, 38.55],
            [-77.20, 38.55],
            [-77.55, 38.75],
            [-77.60, 39.10], // close
          ]],
        },
      },
    },

    "baltimore": {
      name: "Baltimore Metro",
      labelLngLat: [-76.6122, 39.2904],
      feature: {
        type: "Feature",
        properties: { id: "baltimore" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-76.92, 39.45],
            [-76.75, 39.56],
            [-76.52, 39.60],
            [-76.30, 39.52],
            [-76.22, 39.36],
            [-76.33, 39.20],
            [-76.58, 39.14],
            [-76.82, 39.24],
            [-76.92, 39.45], // close
          ]],
        },
      },
    },

    // Polygon WITH HOLE
    "annapolis-eastern-shore": {
      name: "Annapolis & Eastern Shore",
      labelLngLat: [-76.4922, 38.9784],
      feature: {
        type: "Feature",
        properties: { id: "annapolis-eastern-shore" },
        geometry: {
          type: "Polygon",
          coordinates: [
            // Outer ring
            [
              [-76.80, 39.20],
              [-76.55, 39.30],
              [-76.30, 39.25],
              [-76.05, 39.10],
              [-75.95, 38.85],
              [-76.15, 38.70],
              [-76.45, 38.65],
              [-76.75, 38.80],
              [-76.80, 39.20], // close
            ],
            // Inner ring (hole)
            [
              [-76.55, 39.10],
              [-76.35, 39.15],
              [-76.20, 39.00],
              [-76.30, 38.85],
              [-76.50, 38.85],
              [-76.55, 39.10], // close
            ],
          ],
        },
      },
    },

    // MULTIPOLYGON
    "chesapeake-bay": {
      name: "Chesapeake Bay",
      labelLngLat: [-76.55, 39.05],
      feature: {
        type: "Feature",
        properties: { id: "chesapeake-bay" },
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [[
                [-76.78, 39.34],
                [-76.62, 39.38],
                [-76.45, 39.32],
                [-76.42, 39.18],
                [-76.55, 39.08],
                [-76.72, 39.16],
                [-76.78, 39.34], // close
              ]],
            ],
            [
              [[
                [-76.70, 39.05],
                [-76.52, 39.12],
                [-76.35, 39.05],
                [-76.28, 38.92],
                [-76.38, 38.78],
                [-76.58, 38.80],
                [-76.70, 39.05], // close
              ]],
            ],
          ],
        },
      },
    },
  };

  let activeMarketId = "dc-md-va";

  function getActiveMarketFeature() {
    return MARKETS[activeMarketId]?.feature;
  }

  function getActiveLabelFeatureCollection() {
    const m = MARKETS[activeMarketId];
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: activeMarketId,
            name: m.name,
          },
          geometry: {
            type: "Point",
            coordinates: m.labelLngLat,
          },
        },
      ],
    };
  }

  function ensureMarketLayers() {
    const feature = getActiveMarketFeature();
    if (!feature) return;

    // Source: active market polygon
    if (!map.getSource(MARKET_SOURCE_ID)) {
      map.addSource(MARKET_SOURCE_ID, { type: "geojson", data: feature });
    } else {
      map.getSource(MARKET_SOURCE_ID).setData(feature);
    }

    // Source: label point
    const labelFC = getActiveLabelFeatureCollection();
    if (!map.getSource(MARKET_LABEL_SOURCE_ID)) {
      map.addSource(MARKET_LABEL_SOURCE_ID, { type: "geojson", data: labelFC });
    } else {
      map.getSource(MARKET_LABEL_SOURCE_ID).setData(labelFC);
    }

    // Fill (optional visibility)
    if (!map.getLayer(MARKET_FILL_LAYER_ID)) {
      map.addLayer({
        id: MARKET_FILL_LAYER_ID,
        type: "fill",
        source: MARKET_SOURCE_ID,
        paint: {
          "fill-color": "#23F1E0",
          "fill-opacity": 0, // keep outline-only (adjust if you want subtle fill e.g. 0.08)
        },
      });
    }

    // Outline
    if (!map.getLayer(MARKET_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: MARKET_OUTLINE_LAYER_ID,
        type: "line",
        source: MARKET_SOURCE_ID,
        paint: {
          "line-color": "#23F1E0",
          "line-width": 1.8,
        },
      });
    }

    // Label (market name with outline via halo)
    if (!map.getLayer(MARKET_LABEL_LAYER_ID)) {
      map.addLayer({
        id: MARKET_LABEL_LAYER_ID,
        type: "symbol",
        source: MARKET_LABEL_SOURCE_ID,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 14,
            11, 18,
            13, 22
          ],
          "text-max-width": 18,
          "text-anchor": "center",
          "text-justify": "center",
        },
        paint: {
          "text-color": "#ffffff",
          // "outline" for text:
          "text-halo-color": "#064a4b",
          "text-halo-width": 3,
        },
      });
    }
  }

  function fitToFeatureBounds(feature, { padding = 80, duration = 800 } = {}) {
    const bounds = new mapboxgl.LngLatBounds();

    const extendRing = (ring) => ring.forEach((c) => bounds.extend(c));

    const geom = feature.geometry;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach((ring) => extendRing(ring));
    } else if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) => poly.forEach((ring) => extendRing(ring)));
    } else {
      console.warn("[markets.js] Unsupported geometry:", geom.type);
      return;
    }

    map.fitBounds(bounds, { padding, duration });
  }

  function setActiveMarket(marketId, { fit = true } = {}) {
    if (!MARKETS[marketId]) return;
    activeMarketId = marketId;

    // If style not ready yet, wait
    if (!map.isStyleLoaded()) {
      map.once("style.load", () => setActiveMarket(marketId, { fit }));
      return;
    }

    ensureMarketLayers();

    // Update active data
    map.getSource(MARKET_SOURCE_ID)?.setData(getActiveMarketFeature());
    map.getSource(MARKET_LABEL_SOURCE_ID)?.setData(getActiveLabelFeatureCollection());

    if (fit) fitToFeatureBounds(getActiveMarketFeature());

    // optional active button styling
    document.querySelectorAll(".market-btn[data-market-id]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.marketId === marketId);
      btn.setAttribute("aria-selected", btn.dataset.marketId === marketId ? "true" : "false");
    });
  }

  function bindMarketButtons() {
    const container = document.querySelector(".market-buttons");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".market-btn[data-market-id]");
      if (!btn) return;
      setActiveMarket(btn.dataset.marketId, { fit: true });
    });
  }

  // Expose if you ever want inline onclick:
  window.setActiveMarket = setActiveMarket;

  // Map events
  map.on("style.load", () => {
    ensureMarketLayers();
    setActiveMarket(activeMarketId, { fit: false });
  });

  map.on("load", () => {
    ensureMarketLayers();
    setActiveMarket(activeMarketId, { fit: true });
  });

  // DOM ready for buttons
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindMarketButtons);
  } else {
    bindMarketButtons();
  }
})();
