'use client';
import React, { forwardRef } from 'react';
import { Panel } from "../ui/Panel";

/**
 * RemoteGrid Component
 * Container for displaying remote participant video streams
 */
export const RemoteGrid = forwardRef(function RemoteGrid(props, ref) {
  return (
    <Panel 
      title="Remote Participants" 
      className="min-h-[300px] hover-lift"
      variant="default"
      headerClassName="transform -rotate-1 bg-wash-blue"
    >
      <div 
        ref={ref} 
        className="remote-grid-container flex flex-wrap gap-6"
      >
        {/* 
           The children are added imperatively by the `useWebRtc` or `page.js` logic.
           We need to ensure they are styled correctly.
        */}
        <style jsx global>{`
          /* Target the dynamically created wrappers inside the grid */
          .remote-grid-container > div {
            flex: 0 0 calc(50% - 12px) !important; /* 2 items per row */
            width: auto !important;
            max-width: none !important;
            margin-bottom: 0 !important;
            min-height: 300px;
            aspect-ratio: 16/9;
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            background-color: var(--color-paper) !important;
            border: 3px dashed var(--color-ink) !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 4px 4px 0px var(--color-ink) !important;
            transition: transform 0.2s;
          }
          
          .remote-grid-container > div:hover {
            transform: scale(1.02);
            z-index: 10;
          }
          
          .remote-grid-container video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          @media (max-width: 768px) {
            .remote-grid-container > div {
              flex: 0 0 100% !important;
            }
          }
        `}</style>
      </div>
      <div className="text-center text-gray-400 mt-8 italic opacity-60 font-comic">
        Waiting for viewers to join...
      </div>
    </Panel>
  );
});