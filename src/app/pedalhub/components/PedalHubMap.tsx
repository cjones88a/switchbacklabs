"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { RouteInfo } from "../data/constants";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type PedalHubMapProps = {
  /** Route to draw; if null, show area overview */
  route: RouteInfo | null;
  /** Show user location dot and follow (uses browser geolocation) */
  showUserLocation?: boolean;
  className?: string;
};

export function PedalHubMap({
  route,
  showUserLocation = true,
  className = "",
}: PedalHubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Init map once
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-105.0844, 40.5853],
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (markerRef.current) markerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Request geolocation
  useEffect(() => {
    if (!showUserLocation || !navigator?.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocError(null);
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        if (mapRef.current) {
          if (!markerRef.current) {
            const el = document.createElement("div");
            el.className = "w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse";
            markerRef.current = new mapboxgl.Marker({ element: el })
              .setLngLat([lng, lat])
              .addTo(mapRef.current);
          } else {
            markerRef.current.setLngLat([lng, lat]);
          }
          if (!route) mapRef.current.setCenter([lng, lat]);
        }
      },
      () => setLocError("Location unavailable"),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [showUserLocation, route]);

  // Draw route and fit bounds
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (mapRef.current.getLayer("route-line")) {
      mapRef.current.removeLayer("route-line");
      mapRef.current.removeSource("route");
    }

    if (route && route.coordinates.length >= 2) {
      const coords = route.coordinates;
      mapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        },
      });
      mapRef.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#22c55e",
          "line-width": 4,
        },
      });

      const bounds = coords.reduce(
        (acc, [lng, lat]) => {
          acc.extend([lng, lat]);
          return acc;
        },
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    } else {
      mapRef.current.setCenter([-105.0844, 40.5853]);
      mapRef.current.setZoom(10);
    }
  }, [route, mapReady]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-600 ${className}`}
      >
        <p className="text-sm">
          Add <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to env for maps.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[280px] rounded-xl overflow-hidden" />
      {locError && (
        <p className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
          {locError}
        </p>
      )}
    </div>
  );
}
