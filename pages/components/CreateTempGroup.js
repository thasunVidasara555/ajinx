// components/CreateTempGroup.js
import React, { useState } from 'react';
import styles from '../../styles/Home.module.css';
import { database1, ref, push } from '../firebase';
import Header from './Header';
import Input from './Input';
import Error from './Error';
import Button from './Button';
import GroupCreated from './GroupCreated';

function CreateTempGroup({setState}) {
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
      if (adminName && groupName && adminPassword.length >= 8) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }, 100);
  }

  function handleCreateGroup() {
    function createGroup({ adminName, groupName, adminPassword }) {
      const groupData = { adminName, adminPassword, groupName };
      try {
        push(ref(database1, 'groups'), groupData);
        return '';
      } catch (error) {
        return error.message;
      }
    }
    if (isCreating) {
      return;
    }
    if (!adminName) {
      setError('Admin name cannot be empty and must not contain any special characters');
      setIsError(true);
      return;
    }
    if (!groupName) {
      setError('Group name cannot be empty and must not contain * > - /');
      setIsError(true);
      return;
    }
    if (adminPassword.length < 8) {
      setError('Admin password must contain at least 8 characters');
      setIsError(true);
      return;
    }
    setIsCreating(true);
    setIsButtonDisabled(true);
    const result = createGroup({ adminName, groupName, adminPassword });
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
  }

  return (
    <div className={styles.getStarted}>
      <Header content={'SearchCreateGroupsToggle'} setState={setState}/>
      <h1>Create Your Room</h1>
      <Input name="groupName" placeholder='eg. Friends' value={groupName} onChange={handleCreateRoomInputs} />
      <Input name="adminName" placeholder='eg. Steven' value={adminName} onChange={handleCreateRoomInputs} />
      <Input name="adminPassword" placeholder='Enter your password' value={adminPassword} onChange={handleCreateRoomInputs} />
      {isError ? <Error error={error} /> : null}
      {!isGroupCreated && <Button disabled={isButtonDisabled} onClick={handleCreateGroup} content={isCreating ? 'Creating your group' : 'Create'} />}
      {isGroupCreated && <GroupCreated />}
    </div>
  );
}

export default CreateTempGroup;
