// components/Error.js
import React from 'react';
import styles from '../../styles/Home.module.css';

function Error({ error }) {
  return (
    <div className={styles.errorBox}>
      <ion-icon name="close-circle"></ion-icon>
      <span>{error}</span>
    </div>
  );
}

export default Error;
