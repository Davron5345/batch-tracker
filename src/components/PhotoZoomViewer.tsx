"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

const MIN = 1;
const MAX = 4;
const STEP = 0.25;

export function PhotoZoomViewer({ src, alt = "", className }: Props) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const zoomIn = () => setScale((s) => Math.min(MAX, +(s + STEP).toFixed(2)));
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(MIN, +(s - STEP).toFixed(2));
      if (next === MIN) setOffset({ x: 0, y: 0 });
      return next;
    });
  };
  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (scale <= 1) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: offset.x,
        origY: offset.y,
      };
    },
    [offset.x, offset.y, scale]
  );

  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current?.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setOffset({
      x: drag.current.origX + dx,
      y: drag.current.origY + dy,
    });
  }, []);

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current?.active) return;
    drag.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const pct = Math.round(scale * 100);

  return (
    <div className={`photo-zoom ${className || ""}`}>
      <div
        className="photo-zoom__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="photo-zoom__img"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        />
      </div>

      <div className="photo-zoom__controls" role="toolbar" aria-label="Масштаб фото">
        <button
          type="button"
          className="photo-zoom__btn"
          onClick={zoomOut}
          disabled={scale <= MIN}
          aria-label="Отдалить"
          title="Отдалить"
        >
          −
        </button>
        <button
          type="button"
          className="photo-zoom__btn photo-zoom__btn--label"
          onClick={reset}
          aria-label="Сбросить масштаб"
          title="Сбросить"
        >
          {pct}%
        </button>
        <button
          type="button"
          className="photo-zoom__btn"
          onClick={zoomIn}
          disabled={scale >= MAX}
          aria-label="Приблизить"
          title="Приблизить"
        >
          +
        </button>
      </div>
    </div>
  );
}
