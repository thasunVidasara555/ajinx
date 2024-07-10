import { useState } from 'react';

const ErrorAlert = (props) => {
  const [showAlert, setShowAlert] = useState(true); // State to control alert visibility

  const alertStyle = {
    borderRadius: '0.5rem',
    border: '2px solid #EF4444',
    backgroundColor: '#FEE2E2',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '3%',
    fontFamily: 'circular-book',
  };

  return (
    <div role="alert" style={alertStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444' }}>
      <ion-icon name="alert-circle" style={{ fontSize: '1.25rem' }} ></ion-icon>
        <strong style={{ fontWeight: '500' }}>Something went wrong</strong>
      </div>
      
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#EF4444' }}>
        {props.error}
      </p>
    </div>
  );
};

export default ErrorAlert;
