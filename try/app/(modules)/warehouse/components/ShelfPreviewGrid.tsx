import React from "react";

export interface ShelfPreviewGridProps {
  shelves: { code: string; tone: string }[];
}

/** Renders the mini rack visualization showing shelf utilization levels. */
export function ShelfPreviewGrid({ shelves }: ShelfPreviewGridProps) {
  if (shelves.length === 0) {
    return (
      <div className="p-3 text-muted" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '1rem' }}>
        No shelf data from API.
      </div>
    );
  }

  return (
    <>
      {[4, 3, 2, 1].map((level) => (
        <div className="warehouse-rack-mini-level" key={level}>
          <span>Level {level}</span>
          <div>
            {shelves.slice((4 - level) * 2, (4 - level) * 2 + 2).map((shelf) => (
              <i className={`warehouse-rack-mini-shelf ${shelf.tone}`} key={shelf.code}>
                {shelf.code}
              </i>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
