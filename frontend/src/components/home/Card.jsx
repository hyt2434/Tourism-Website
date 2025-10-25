import React from 'react';

export default function Card({ children, className = '', hover = true }) {
  return (
    <div
      className={`
        rounded-xl bg-white shadow-md
        ${hover ? 'transition-shadow duration-300 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
