import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Phone, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import { UserRole } from '@waka/shared';

export const SignInModal: React.FC = () => {
  const isOpen = useUIStore((state) => state.signInModalOpen);
  const setSignInModalOpen = useUIStore((state) => state.setSignInModalOpen);
  const onClose = () => setSignInModalOpen(false);

  const { sendPhoneVerificationCode, verifyPhoneCode, isAuthLoading, error } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setOtpCode('');
      setShowOTP(false);
      setLocalError(null);
    }
  }, [isOpen]);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with +234
    if (digits.startsWith('0')) {
      return `+234${digits.slice(1)}`;
    }
    
    // If doesn't start with +, add +234
    if (!phone.startsWith('+')) {
      return `+234${digits}`;
    }
    
    return phone;
  };

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setLocalError('Please enter a phone number');
      return;
    }

    setLocalError(null);
    
    try {
      const formattedPhone = formatPhoneNumber(phone);
      await sendPhoneVerificationCode(formattedPhone);
      setShowOTP(true);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setLocalError('Invalid code. Please enter the 6-digit verification code.');
      return;
    }

    setLocalError(null);

    try {
      await verifyPhoneCode(otpCode, UserRole.PASSENGER);
      onClose();
    } catch (error: any) {
      setLocalError(error.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleBackToPhone = () => {
    setShowOTP(false);
    setOtpCode('');
    setLocalError(null);
  };

  return (
    <>
      <div id="recaptcha-container" />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={showOTP ? 'Verify Code' : 'Sign In'}
        size="md"
      >
        {!showOTP ? (
          <div className="space-y-6">
            <div>
              <p className="text-textMuted mb-6">
                Enter your phone number to receive a verification code
              </p>
              <Input
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={20} />}
                error={localError || error || undefined}
              />
            </div>
            <Button
              onClick={handleSendCode}
              isLoading={isAuthLoading}
              className="w-full"
              disabled={!phone.trim()}
            >
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-textMuted mb-6">
                Enter the 6-digit code sent to {phone}
              </p>
              <Input
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                }}
                maxLength={6}
                error={localError || error || undefined}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBackToPhone}
                className="flex-1"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <Button
                onClick={handleVerifyCode}
                isLoading={isAuthLoading}
                className="flex-1"
                disabled={otpCode.length !== 6}
              >
                Verify Code
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

