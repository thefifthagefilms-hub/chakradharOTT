"use client";

import ViewTracker from "./ViewTracker";

export default function MovieClientWrapper({ movieId }) {
  return <ViewTracker movieId={movieId} />;
}