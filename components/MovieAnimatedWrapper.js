"use client";

import FadeIn from "./FadeIn";

export default function MovieAnimatedWrapper({ children, delay = 0 }) {
  return <FadeIn delay={delay}>{children}</FadeIn>;
}