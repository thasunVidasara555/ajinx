// components/GroupCreated.js
import React from 'react';
import styles from '../../styles/Home.module.css';
import Button from './Button';

function GroupCreated() {
  return (
    <div>
      <span style={{ color: '#3bb756' }}>Group created successfully</span>
      <div className={styles.buttons}>
        <Button content={'Join group'} />
        <Button content={'Copy URL'} />
      </div>
    </div>
  );
}

export default GroupCreated;
