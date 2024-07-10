import React from "react"
import styles from '../../styles/Home.module.css'

const AccountShow = ({setState}) => {
  return (
    <div onClick={()=> setState('tempSettings')} className={styles.accountShow}>
      <span>Vidasara</span>
    </div>
  )
};

export default AccountShow;
