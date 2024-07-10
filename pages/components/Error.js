// components/Error.js
import React from 'react';
import styles from '../../styles/Home.module.css';

function Error({ error, style }) {
  return (
    <div className={styles.errorBox} style={style}>
      <ion-icon name="close-circle"></ion-icon>
      <span>{error}</span>
    </div>
  );
}

export default Error;
