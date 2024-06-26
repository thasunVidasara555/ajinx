// components/Button.js
import React from 'react';

function Button({ onClick, disabled, content }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}

export default Button;
