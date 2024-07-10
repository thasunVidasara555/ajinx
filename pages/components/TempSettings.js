import React, {useState, useEffect} from "react"
import styles from '../../styles/Home.module.css';
import { getDatabase, onValue, get, ref, query, orderByChild, equalTo,set } from "firebase/database";
import { database1 } from "../../lib/firebase";

const TempSettings = ({ setState, setTempRoom,setPrevState, setTempRoomPSWD, username, setUsername, userId }) => {
  const [recentGroups, setRecentGroups] = useState([]);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [error, setError] = useState('');
  const [isError, setIsError] = useState(false);
  const [adminNames, setAdminNames] = useState({});
  const [cache, setCache] = useState({});
  const [enterUsername, setEnterUsername] = useState(false);
  const [tempUsername,setTempUsername] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {

        const groupsRef = ref(database1, 'groups');
        const groupsQuery = query(groupsRef, orderByChild('adminId'), equalTo(userId));
        const groupsSnapshot = await get(groupsQuery);

        if (groupsSnapshot.exists()) {
          const groupsData = groupsSnapshot.val();
          const groupsArray = Object.keys(groupsData).map(key => ({
            id: key,
            ...groupsData[key]
          }));
          setCreatedGroups(groupsArray);
        }
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    };

    fetchData();
  }, [userId]);
  useEffect(() => {
    const storedRecentGroups = JSON.parse(localStorage.getItem('recentGroups')) || [];
    setRecentGroups(storedRecentGroups);
  }, []);
  

  function handleRoomClicked(id){
    const groupRef = ref(database1, `groups/${id}`);
  
    get(groupRef).then((snapshot) => {
      if (snapshot.exists()) {
        setTempRoom(id);
        const groupKey = snapshot.key;
        console.log(groupKey);
const groupData = { id: groupKey, ...snapshot.val() };
        const recentGroups = JSON.parse(localStorage.getItem('recentGroups')) || [];
        function groupExists(groupId) {
          return recentGroups.some(group => group.id === groupId);
        }
        
        // Assuming groupData is the new group to be added
        if (!groupExists(groupData.id)) {
          recentGroups.push(groupData);
          localStorage.setItem('recentGroups', JSON.stringify(recentGroups));
        }
      if (groupData.password) {
        setState('enterRoomPassword');
        setPrevState('searchGroups');
        return;
      }
      setTempRoomPSWD('null')
        setState('inARoom');
      } else {
        alert("Group does not exist.");
        setIsError(true)
      }
    }).catch((error) => {
        setIsError(true)
        alert(error.message)
    });
  }

async  function  handleUsernameSave(){
    if (!tempUsername || tempUsername == ''){
      return;
    }
        const ouserRefRoom = ref(database1, `users/${userId}`);
    await set(ouserRefRoom, { username: tempUsername });
    setTempUsername();
    setEnterUsername(false);
    setUsername(tempUsername);
    localStorage.setItem('username', tempUsername)
  }
  useEffect(() => {
    const fetchAdminNames = async () => {
      const names = { ...cache };

      const adminPromises = recentGroups.map(group => {
        const adminId = group.adminId;
        if (names[adminId]) {
          return Promise.resolve({ adminId, username: names[adminId] });
        }
        const adminRef = ref(database1, `users/${adminId}`);
        return get(adminRef).then(snapshot => ({
          adminId,
          username: snapshot.exists() ? snapshot.val().username : 'Unknown'
        }));
      });

      const adminData = await Promise.all(adminPromises);
      adminData.forEach(({ adminId, username }) => {
        names[adminId] = username;
      });

      setAdminNames(names);
      setCache(names);
    };

    fetchAdminNames();
  }, [recentGroups]);

    return (
      
        <div className={styles.tempSettings}>
            <div className={styles.controls}>
                <h1>Ajinx</h1>
            <ion-icon name="add-sharp" style={{fontSize:'22px'}} onClick={()=>setState('createRoom')}></ion-icon>
            <ion-icon name="search" style={{fontSize:'19px'}} onClick={()=>{setState('searchGroups');setPrevState('tempSettings')}}></ion-icon>
            <ion-icon name="pencil-sharp" style={{fontSize:'18px'}} onClick={()=> setEnterUsername(true)}></ion-icon>
            </div>
            <div className={styles.header} style={{width:enterUsername === true && '100%',padding:enterUsername === true && '13px',background:enterUsername === true && 'rgb(16 16 16)', borderRadius:enterUsername === true && '15px'}}>
                <ion-icon name="person"></ion-icon>
                {enterUsername == true ? <div style={{display:'flex',flexDirection:'column', width:'100%'}}>
                  <input  placeholder="Username" value={tempUsername ? tempUsername : username} onInput={(e)=>setTempUsername(e.target.value)}/>
                  <div style={{display:'flex',gap:'10px',marginLeft:'auto'}}>
                  <button onClick={()=> {setEnterUsername(false);setTempUsername()}}>Cancel</button>
                  <button onClick={() => handleUsernameSave()}>Save</button>
                  </div>
                </div> : <h4>{username}</h4>}
            </div>

            <div className={styles.roomsCate}>
                <span>Recents <b>{recentGroups.length}</b></span>
                {recentGroups.length > 0 ? (
            recentGroups.map(group => (
              <li key={group.id} onClick={()=> handleRoomClicked(group.id)}>
                <div className={styles.icon}><ion-icon name="people-outline"></ion-icon></div>
                <div className={styles.group}>
                  <b>{group.groupName}</b>
                  <b>{group.adminId === userId ? 'You' : adminNames[group.adminId] || 'Loading...'}</b>
                </div>
              </li>
            ))
          ) : (
            <p>No groups found</p>
          )}
            </div>

            <div className={styles.roomsCate}>
                <span>You own <b>{createdGroups.length}</b></span>
                {createdGroups.length > 0 ? (
            createdGroups.map(group => (
              <li key={group.id} onClick={()=> handleRoomClicked(group.id)}>
                <div className={styles.icon}><ion-icon name="people-outline"></ion-icon></div>
                <div className={styles.group}>
                  <b>{group.groupName}</b>
                  <b>{group.adminPassword}</b>
                </div>
              </li>
            ))
          ) : (
            <p>No groups found</p>
          )}
            </div>


        </div>
    )
};

export default TempSettings;
