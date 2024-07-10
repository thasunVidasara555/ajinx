import React, { useState } from "react"
import Button from "./Button";
import styles from '../../styles/Home.module.css';
import Error from "./Error";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { database1 } from "../../lib/firebase";

const EnterRoomPassword = ({setTempRoomPSWD, tempRoom, setState, prevState, groupName}) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('');
  

  function hadnlePasswordInput(event){
    const value = event.target.value;
    setPassword(value);
  }

  

  function handlePasswordSubmit(){
    setError('')
    const groupRef = ref(database1, `groups/${tempRoom}`);

    get(groupRef).then((snapshot) => {
        const groupData = snapshot.val();
      if (groupData.password == password) {
        setTempRoomPSWD(password)
          setState('inARoom')
      }else{
        setError('Try again!')
      }
    }).catch((error) => {
        setError(error.message)
    });
    
  }
  return (
    <div className={styles.EnterRoomPassword}>
        <div className={styles.back} onClick={() => setState(prevState)}><ion-icon name="arrow-back-outline"></ion-icon>Back</div>
      <h1>Enter Password</h1>
      <h2>The room {groupName} is password protected</h2>
      <input placeholder="Password" value={password} onInput={hadnlePasswordInput}/>
      {error != '' && <Error error={error} style={{width:'100%', marginTop:0}}/>}
      <Button content='Join room' onClick={handlePasswordSubmit}/>
    </div>
  )
};

export default EnterRoomPassword;
