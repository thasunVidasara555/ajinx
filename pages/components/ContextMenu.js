import { useEffect, useRef } from 'react';
import styles from '../../styles/Home.module.css'


const ContextMenu = ({ x, y, show, options, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!show) {
    return null;
  }

  return (
    <ul
      ref={menuRef}
      className={styles.contextMenu}
      style={{ top: y, left: x }}
    >
      {options.map((option, index) => (
        <li key={index} onClick={() => option.onClick()}>
          {option.label}
        </li>
      ))}
    </ul>
  );
};

export default ContextMenu;
