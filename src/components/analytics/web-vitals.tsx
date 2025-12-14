"use client";

import { useReportWebVitals } from "next/web-vitals";

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
  }
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === "production") {
      // You can send metrics to your analytics service
      // Example: analytics.track(metric.name, metric.value);
      
      // For Google Analytics 4
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", metric.name, {
          value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        });
      }
    }
  });

  return null;
}
