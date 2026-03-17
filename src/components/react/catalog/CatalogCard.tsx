import { useDraggable } from '@dnd-kit/core';
import type React from 'react';
import type { CatalogItem } from '../../../domain/types';

export interface CatalogCardProps {
  item: CatalogItem;
}

export function CatalogCard({ item }: CatalogCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: { type: 'catalogItem' as const, catalogItemId: item.id },
    });

  const style: React.CSSProperties | undefined =
    transform == null
      ? undefined
      : { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` };

  const localImageSrc = `/images/catalog/${item.id}.png`;

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
        <img
          src={localImageSrc}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          onError={(e) => {
            // If local PNG is missing, fall back to the seed imageUrl once
            if (e.currentTarget.src.includes(localImageSrc)) {
              e.currentTarget.src = item.imageUrl;
            } else {
              e.currentTarget.style.display = 'none';
            }
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950/70 via-zinc-950/15 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-sm font-semibold leading-tight">{item.title}</div>
      </div>
    </button>
  );
}
