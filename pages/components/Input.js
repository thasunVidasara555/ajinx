// components/Input.js
import React from 'react';
import styles from '../../styles/Home.module.css';

function Input({ name, placeholder, value, onChange }) {
  const labels = {
    groupName: 'Room Name',
    adminName: 'Admin Name',
    adminPassword: 'Admin Password',
  };

  return (
    <div>
      {name ? <span>{labels[name]}</span> : null}
      <input
        className={styles.input}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        id={name}
      />
    </div>
  );
}

export default Input;
