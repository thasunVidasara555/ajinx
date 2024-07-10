// pages/index.js
import React, { useId, useState } from 'react';
import { useEffect } from 'react';
import CreateTempGroup from './components/CreateTempGroup';
import SearchCreateGroupsToggle from './components/SearchCreateGroupsToggle'
import SearchGroups from './components/SearchGroups';
import BaseChat from './components/BaseChat';
import EnterRoomPassword from './components/EnterRoomPassword';
import EnterUsername from './components/EnterUsername';
import { getDatabase, ref, onValue, get } from "firebase/database";
import { database1 } from "../lib/firebase";
import ErrorAlert from './components/ErrorAlert';
import ContextMenu from './components/ContextMenu';
import TempSettings from './components/TempSettings';
import AccountShow from './components/AccountShow';

export default function Home() {

  const [groupName, setGroupName] = useState("");
  const [state, setState] = React.useState('createRoom');
  const [messages, setMessages] = useState([]);

  const [popup, setPopup] = useState('')
  const [prevState, setPrevState] = useState('')
  const [tempRoom, setTempRoom] = useState('');
  const [tempRoomPSWD, setTempRoomPSWD] = useState('');
  const [error, setError] = useState('');
  const [errorF, setErrorF] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [replyItem, setReplyItem] = useState({});
  const [deleteMsg, setDeleteMsg] = useState('');
  const [editMsg, setEditMsg] = useState('');

  useEffect(()=>{
    if (localStorage.getItem('username') !== '' && localStorage.getItem('username') !== undefined && localStorage.getItem('username') != null){
      setState('tempSettings');
      setUsername(localStorage.getItem('username'));
      setUserId(localStorage.getItem('usernameId'));
    }
  },[])


  useEffect(() => {
    if (tempRoom) {
      const groupRef = ref(database1, `groups/${tempRoom}`);
      get(groupRef).then((snapshot) => {
        if (snapshot.exists()) {
          const groupData = snapshot.val();
          setGroupName(groupData.groupName);
        }
      })
    }
  }, [tempRoom]);

  useEffect(() => {
    console.log('State changed:', state);
    console.log('Room changed:', tempRoom);
  }, [state, tempRoom]);

  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    messageId: null,
  });

  const handleContextMenu = (event, messageId) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      messageId: messageId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleReply = () => {
    const replyMessage = messages.find((msg) => msg.id === contextMenu.messageId);
  setReplyItem(replyMessage);
    handleCloseContextMenu();
  };

  const handleEdit = () => {
    setEditMsg(contextMenu.messageId);
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    setDeleteMsg(contextMenu.messageId);
    handleCloseContextMenu();
  };

  const options = [
    { label: 'Reply', onClick: handleReply },
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ];


  return (
    <div>
      {popup === 'enterUsername' && <EnterUsername groupId={tempRoom} setUserId={setUserId} setUsername={setUsername} setPopup={setPopup}/>}
      {state === 'createRoom' ? <CreateTempGroup userId={userId} state='createRoom' setPrevState={setPrevState} setState={setState} prevState={prevState}/> : null}
      {state === 'searchGroups' && <SearchGroups setTempRoomPSWD={setTempRoomPSWD} setState={setState} setTempRoom={setTempRoom} setPrevState={setPrevState} prevState={prevState}/>}
      {state === 'inARoom' && <BaseChat editMsg={editMsg} setEditMsg={setEditMsg} deleteMsg={deleteMsg} setDeleteMsg={setDeleteMsg} messages={messages} setMessages={setMessages} replyItem={replyItem} setReplyItem={setReplyItem} onContextMenu={handleContextMenu} userId={userId} username={username} setPopup={setPopup} tempRoom={tempRoom} groupName={groupName} tempRoomPSWD={tempRoomPSWD} />}
      {state === 'enterRoomPassword' && <EnterRoomPassword tempRoom={tempRoom} groupName={groupName} setTempRoomPSWD={setTempRoomPSWD} setState={setState} prevState={prevState} />}
      {state === 'syserr' && <ErrorAlert error={error}/>}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        show={contextMenu.show}
        options={options}
        onClose={handleCloseContextMenu}
      />
      {state === 'tempSettings' && <TempSettings userId={userId} username={username} setUsername={setUsername} setTempRoomPSWD={setTempRoomPSWD} setState={setState} setTempRoom={setTempRoom} setPrevState={setPrevState} />}
      {username && userId && state !='tempSettings' && <AccountShow setState={setState}/>}
    </div>
  );
}
