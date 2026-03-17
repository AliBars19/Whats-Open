"use client";

import { useState, useEffect, useCallback } from "react";

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionState: PermissionState | null;
};

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permissionState: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionState: "granted",
        });
      },
      (error) => {
        let message = "Unable to get your location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location unavailable";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out";
        }
        setState((prev) => ({
          ...prev,
          error: message,
          loading: false,
          permissionState: error.code === error.PERMISSION_DENIED ? "denied" : prev.permissionState,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      setState((prev) => ({ ...prev, permissionState: result.state }));
      if (result.state === "granted") {
        requestLocation();
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }).catch(() => {
      setState((prev) => ({ ...prev, loading: false }));
    });
  }, [requestLocation]);

  return { ...state, requestLocation };
}
