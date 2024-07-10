// components/CreateTempGroup.js
import React, { useState } from 'react';
import styles from '../../styles/Home.module.css';
import { database1, ref, push } from '../../lib/firebase';
import { set } from 'firebase/database';
import Header from './Header';
import Input from './Input';
import Error from './Error';
import Button from './Button';
import GroupCreated from './GroupCreated';

function CreateTempGroup({setState, prevState, setPrevState,userId}) {
  const [adminName, setAdminName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGroupCreated, setIsGroupCreated] = useState(false);


  function handleCreateRoomInputs(event) {
    const { id, value } = event.target;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    switch (id) {
      case 'adminName':
        setAdminName(sanitizedValue);
        break;
      case 'groupName':
        setGroupName(value.replace(/[^a-zA-Z0-9 ]/g, ''));
        break;
      case 'adminPassword':
        setAdminPassword(sanitizedValue);
        break;
    }
    // Check if all inputs are valid
    setTimeout(() => {
      console.log(userId);
      if (userId != '' && userId != null && userId != undefined){
        setIsButtonDisabled(false);
      }else{
        if (adminName && groupName && adminPassword.length >= 8) {
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
        }
      }
      
    }, 100);
  }

  async function handleCreateGroup() {
    async function createGroup({ adminName, groupName, adminPassword }) {

      let adminId;

if (userId) {
  adminId = userId;
} else {
  const userRef = ref(database1, `users`);
  const newUserRef = push(userRef);
  await set(newUserRef, { username: adminName });
  localStorage.setItem('username', adminName);
  localStorage.setItem('usernameId', newUserRef.key);
  adminId = newUserRef.key;
}

const groupData = { adminId, adminPassword, groupName };


      try {
        await push(ref(database1, 'groups'), groupData);
        return '';
      } catch (error) {
        return error.message;
      }
    }

  
    if (isCreating) {
      return;
    } 
    
    if (!groupName) {
      setError('Group name cannot be empty and must not contain * > - /');
      setIsError(true);
      return;
    }
    if (userId != '' && userId != null && userId != undefined){
      setAdminName(userId)
    }else{
      
      if (!adminName) {
        setError('Admin name cannot be empty and must not contain any special characters');
        setIsError(true);
        return;
      }
    }

    if (adminPassword.length < 8) {
      setError('Admin password must contain at least 8 characters');
      setIsError(true);
      return;
    }
    
  
    setIsCreating(true);
    setIsButtonDisabled(true);
  
    const result = await createGroup({ adminName, groupName, adminPassword });
  
    if (result !== '') {
      setIsError(true);
      setError(result);
      setIsCreating(false);
      setIsButtonDisabled(false);
      return;
    }
  
    setError('');
    setIsError(false);
    setIsGroupCreated(true);
    setIsCreating(false);
    setIsButtonDisabled(false);
  }
  
  return (
    <div className={styles.getStarted}>
      <Header content={'SearchCreateGroupsToggle'} setState={setState} prevState={prevState} setPrevState={setPrevState}/>
      <h1>Create Your Room</h1>
      <Input name="groupName" placeholder='eg. Friends' value={groupName} onChange={handleCreateRoomInputs} />
      {(!userId) && <Input name="adminName" placeholder='eg. Steven' value={adminName} onChange={handleCreateRoomInputs} />}

      <Input name="adminPassword" placeholder='Enter your password' value={adminPassword} onChange={handleCreateRoomInputs} />
      {isError ? <Error error={error} /> : null}
      {!isGroupCreated && <Button disabled={isButtonDisabled} onClick={handleCreateGroup} content={isCreating ? 'Creating your group' : 'Create'} />}
      {isGroupCreated && <GroupCreated />}
    </div>
  );
}

export default CreateTempGroup;
