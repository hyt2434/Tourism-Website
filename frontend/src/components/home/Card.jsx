import React from 'react';

export default function Card({ children, className = '', hover = true }) {
  return (
    <div
      className={`
        rounded-xl bg-white dark:bg-gray-900 shadow-md dark:shadow-sm
        ${hover ? 'transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
