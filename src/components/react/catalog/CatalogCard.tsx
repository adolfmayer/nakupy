import { useDraggable } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import type React from 'react';
import type { JSX } from 'react';
import type { CatalogItem } from '../../../domain/types';

export interface CatalogCardProps {
  item: CatalogItem;
}

export function CatalogCard({ item }: CatalogCardProps): JSX.Element {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: { type: 'catalogItem' as const, catalogItemId: item.id },
    });

  const style: React.CSSProperties | undefined =
    transform == null
      ? undefined
      : { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` };

  const baseImagePath =
    item != null ? `/images/catalog/${item.id}` : undefined;
  const pngImageSrc =
    baseImagePath != null ? `${baseImagePath}.png` : undefined;
  const jpgImageSrc =
    baseImagePath != null ? `${baseImagePath}.jpg` : undefined;

  useEffect(() => {
    let cancelled = false;

    const resolveImage = async (): Promise<void> => {
      const tryUrl = async (
        url: string | undefined,
      ): Promise<string | undefined> => {
        if (url == null) return undefined;

        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) return url;
        } catch {
          // ignore and fall through to next candidate
        }

        return undefined;
      };

      const fromPng = await tryUrl(pngImageSrc);
      if (!cancelled && fromPng != null) {
        setResolvedSrc(fromPng);
        return;
      }

      const fromJpg = await tryUrl(jpgImageSrc);
      if (!cancelled && fromJpg != null) {
        setResolvedSrc(fromJpg);
        return;
      }

      if (!cancelled) {
        setResolvedSrc(item.imageUrl);
      }
    };

    void resolveImage();

    return () => {
      cancelled = true;
    };
  }, [item.imageUrl, jpgImageSrc, pngImageSrc]);

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={[
        'group relative aspect-4/5 overflow-hidden rounded-2xl text-left ring-1 transition',
        'ring-orange-400/25 bg-orange-500/15 hover:bg-orange-500/20',
        'touch-none select-none',
        isDragging ? 'opacity-70' : 'opacity-100',
      ].join(' ')}
      type="button"
      {...listeners}
      {...attributes}
    >
      <div className="absolute inset-0">
        {resolvedSrc != null ? (
          <>
            <img
              src={resolvedSrc}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/70 via-zinc-950/15 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-900/80" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-sm font-semibold leading-tight">{item.title}</div>
      </div>
    </button>
  );
}
