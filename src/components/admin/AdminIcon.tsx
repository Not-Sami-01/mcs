import React from 'react';

/** Compact brand mark for the admin navigation. */
export default function AdminIcon() {
  return (
    <span className="mcs-brand mcs-brand--icon">
      <span aria-hidden="true" className="mcs-brand__mark">
        <svg fill="none" viewBox="0 0 32 32">
          <path
            d="M16 3.5 27 8v7.2c0 6.4-4.6 11-11 13.3-6.4-2.3-11-6.9-11-13.3V8l11-4.5Z"
            fill="currentColor"
          />
          <path
            d="M11 16.2 14.6 20l6.6-8"
            stroke="#c9f27a"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
      </span>
      <span className="mcs-brand__name">MCS</span>
    </span>
  );
}
