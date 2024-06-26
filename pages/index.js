// pages/index.js
import React from 'react';
import { useEffect } from 'react';
import CreateTempGroup from './components/CreateTempGroup';
import SearchCreateGroupsToggle from './components/SearchCreateGroupsToggle'
import SearchGroups from './components/SearchGroups';

export default function Home() {
  const [state, setState] = React.useState('createRoom');
  useEffect(() => {
    console.log('State changed:', state);
  }, [state]);
  return (
    <div>
      {state === 'createRoom' ? <CreateTempGroup setState={setState}/> : null} 
      {state === 'searchGroups' && <SearchGroups setState={setState}/>}
    </div>
  );
}
