import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { database1 } from "../../lib/firebase";
import styles from '../../styles/Home.module.css';
import Button from "./Button";
import Error from './Error';


const SearchGroups = ({ setState, setTempRoom,setPrevState, setTempRoomPSWD,prevState }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isError, setIsError] = useState(false);
  const [adminNames, setAdminNames] = useState({});
  const [cache, setCache] = useState({});

  useEffect(() => {
    const groupsRef = ref(database1, 'groups');
    
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAllGroups(groupsArray);
        setFilteredGroups(groupsArray);
        setIsLoading(false);
      } else {
        setAllGroups([]);
        setFilteredGroups([]);
        setIsLoading(false);
      }
    }, (error) => {
      setError('Network error or server error');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query === '') {
      setFilteredGroups(allGroups);
    } else {
      const filtered = allGroups.filter(group =>
        group.groupName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(filtered.length > 0 ? filtered : []);
    }
  };

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
        setError("Group does not exist.");
        setIsError(true)
      }
    }).catch((error) => {
        setIsError(true)
        setError(error.message)
    });
  }

  useEffect(() => {
    const fetchAdminNames = async () => {
      const names = { ...cache };

      const adminPromises = filteredGroups.map(group => {
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
  }, [filteredGroups]);

  return (
    <div className={styles.searchGroups}>
      <div className={styles.buttons}>
        <Button content='Groups'/>
        <Button content='Founders'/>
      </div>
      <div className={styles.inputCollege}>
        <input placeholder="Search" value={searchQuery} onChange={handleSearch} />
        <ion-icon name="close-outline" onClick={() => {setState(prevState);}}></ion-icon>
      </div>
      {isLoading ? (
        <span>Loading...</span>
      ) : error ? (
        <span>{error}</span>
      ) : (
        <ul className={styles.groupsSearchResults}>
          {filteredGroups.length > 0 ? (
        filteredGroups.map(group => (
          <li key={group.id} onClick={() => handleRoomClicked(group.id)}>
            <div className={styles.icon}><ion-icon name="people-outline"></ion-icon></div>
            <div className={styles.group}>
              <b>{group.groupName}</b>
              <b>{adminNames[group.adminId] || 'Loading...'}</b>
            </div>
          </li>
        ))
      ) : (
        <span>No groups named "{searchQuery}" found</span>
      )}
        </ul>

      )}
        {isError ? <Error error={error} style={{width: 'calc(100% - 26px)',margin: '13px'}}/> : null}
    </div>
  );
};

export default SearchGroups;
