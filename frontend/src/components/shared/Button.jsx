import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  type = 'button',
  style = {},
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      style={style}
    >
      {children}
    </button>
  );
}
