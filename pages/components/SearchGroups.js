import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { database1 } from "../firebase";
import styles from '../../styles/Home.module.css';
import Button from "./Button";

const SearchGroups = ({ setState }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className={styles.searchGroups}>
      <div className={styles.buttons}>
        <Button content='Groups'/>
        <Button content='Founders'/>
      </div>
      <div className={styles.inputCollege}>
        <input placeholder="Search" value={searchQuery} onChange={handleSearch} />
        <ion-icon name="close-outline" onClick={() => setState('createRoom')}></ion-icon>
      </div>
      {isLoading ? (
        <span>Loading...</span>
      ) : error ? (
        <span>{error}</span>
      ) : (
        <ul className={styles.groupsSearchResults}>
          {filteredGroups.length > 0 ? (
            filteredGroups.map(group => (
              <li key={group.id}>
                <div className={styles.icon}><ion-icon name="people-outline"></ion-icon></div>
                <div className={styles.group}>
                  <b>{group.groupName}</b>
                  <b>{group.adminName}</b>
                </div>
              </li>
            ))
          ) : (
            <span>No groups named "{searchQuery}" found</span>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchGroups;
