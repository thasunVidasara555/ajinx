// components/Header.js
import React from 'react';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';
import logo from '../../logo.svg';
import SearchCreateGroupsToggle from './SearchCreateGroupsToggle'

function Header({content, setState}) {
  return (
    <div className={styles.Header}>
      <Image src={logo} alt="Logo" />
      <h4>Ajinx</h4>
      {content === 'SearchCreateGroupsToggle' && <SearchCreateGroupsToggle onClick={() => setState('searchGroups')}/>}
    </div>
  );
}

export default Header;
