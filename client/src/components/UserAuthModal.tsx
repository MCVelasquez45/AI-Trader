// ✅ File: components/UserAuthModal.tsx

import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import UserAuthForm from './UserAuthForm';
import GoogleLoginButton from './GoogleLoginButton';

// 🎯 Props passed from parent to control modal visibility
interface UserAuthModalProps {
  show: boolean;       // ⬅️ Whether the modal is shown
  onClose: () => void; // ⬅️ Function to close modal
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ show, onClose }) => {
  const [isSignup, setIsSignup] = useState(false); // 🧭 Local toggle between SignIn/Join

  // 🔁 Toggle between signin and signup views
  const handleToggle = () => {
    setIsSignup(prev => !prev);
    console.log(`🔁 Toggled mode: ${!isSignup ? 'Join' : 'Sign In'}`);
  };

  // ✅ Log whenever modal opens or closes
  console.log(`📢 Auth Modal ${show ? 'Opened' : 'Closed'} | Mode: ${isSignup ? 'Join' : 'Sign In'}`);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      id="userAuthModal"
    >
      {/* 🔐 Modal Header */}
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">
          {isSignup ? 'Join AI-Trader' : 'Sign In to AI-Trader'}
        </Modal.Title>
      </Modal.Header>

      {/* 📋 Modal Body */}
      <Modal.Body>
        {/* 🧾 Auth form with correct "mode" prop */}
        <UserAuthForm mode={isSignup ? 'join' : 'signin'} onSuccess={onClose} />

        <hr className="my-4" />

        {/* 🌐 Google OAuth button */}
        <GoogleLoginButton />

        {/* 🔁 Toggle between SignIn and Join */}
        <div className="text-center mt-3">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Button variant="link" onClick={handleToggle}>
                Sign In
              </Button>
            </>
          ) : (
            <>
              Don’t have an account?{' '}
              <Button variant="link" onClick={handleToggle}>
                Join
              </Button>
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UserAuthModal;