import React from "react"
import styles from '../../styles/Home.module.css';
import { useState } from 'react';


const SearchCreateGroupsToggle = (props) => {
    
    return (
      <div className={styles.toggleButtons} onClick={props.onClick}>
        
        <ion-icon
          name="search-outline"
        ></ion-icon>
        <p>Discover</p>
      </div>
    );
  };

export default SearchCreateGroupsToggle;
