import { useEffect, useRef } from "react";
export function useSwipe({
  onSwipe,
  threshold = 30,
  preventScroll = true
}) {
  const ref = useRef(null);
  const touchStart = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };
    const handleTouchMove = (e) => {
      if (!touchStart.current || !preventScroll) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      if (Math.hypot(dx, dy) > 10) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };
    const handleTouchEnd = (e) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          onSwipe(dx > 0 ? "right" : "left");
        } else {
          onSwipe(dy > 0 ? "down" : "up");
        }
      }
      touchStart.current = null;
    };
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipe, threshold, preventScroll]);
  return ref;
}
