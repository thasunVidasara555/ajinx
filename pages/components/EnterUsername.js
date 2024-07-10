import React, { useState, useRef, useEffect } from "react";
import styles from '../../styles/Home.module.css';
import { database1 } from "@/lib/firebase";
import { ref, set, push } from "firebase/database";

const EnterUsername = (props) => {
  const  {setUsername, setUserId, setPopup} = props;
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const storedId = localStorage.getItem('usernameId');
        if (storedId) {
            setValue(localStorage.getItem('username'))
        }
    }, []);

    const saveUsername = async () => {
        if (value.trim() === '') return;
        if (localStorage.getItem('username') == value) {
          setPopup('');
          setUsername(localStorage.getItem('username'));
            setUserId( localStorage.getItem('usernameId'));
          return;
        };
        try {
          const userRef = ref(database1, `users`);
      const newUserRef = push(userRef);
      await set(newUserRef, { username: value });
      localStorage.setItem('username', value);
      localStorage.setItem('usernameId', newUserRef.key);
            const userRefRoom = ref(database1, `groups/${props.groupId}/members/${newUserRef.key}`);
            await set(userRefRoom, { username: value });
            setUsername(value);
            setUserId(newUserRef.key);
            setPopup('')
        } catch (e) {
            console.error("Error saving username: ", e);
        }
    };

    const overlayStyle = {
      zIndex: 1100,
      position: 'absolute',
      width: '100%',
      height: '100vh',
      background: '#00000082',
      backdropFilter: 'blur(9px)'
  };

    return (
        <div style={overlayStyle}>
          <div className={styles.EnterUsername} onClick={() => inputRef.current.focus()}>
            <ion-icon name="person"></ion-icon>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px', width: '87%' }}>
                <span style={{ fontFamily: 'circular-medium', color: '#858585', fontSize: '14px' }}>Username</span>
                <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <button onClick={saveUsername}><ion-icon name="chevron-forward"></ion-icon></button>
        </div>
        </div>
    );
};

export default EnterUsername;
