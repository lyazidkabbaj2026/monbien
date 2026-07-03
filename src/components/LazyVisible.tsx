"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Ne monte ses enfants (ex. une carte Leaflet) que lorsque le bloc approche
 * du viewport — le JS lourd ne bloque jamais le LCP.
 */
export function LazyVisible({
  children,
  placeholder,
  className = "",
  rootMargin = "400px",
}: {
  children: ReactNode;
  placeholder?: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder}
    </div>
  );
}
