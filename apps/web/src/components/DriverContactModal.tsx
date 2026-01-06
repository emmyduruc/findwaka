import React from 'react';
import { Phone, MessageCircle, ExternalLink, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { useUIStore } from '../stores/ui';
import { useChatStore } from '../stores/chat';
import { useNavigate } from 'react-router-dom';

export const DriverContactModal: React.FC = () => {
  const navigate = useNavigate();
  const selectedDriver = useUIStore((state) => state.selectedDriver);
  const setSelectedDriver = useUIStore((state) => state.setSelectedDriver);
  const { getOrCreateConversation } = useChatStore();

  if (!selectedDriver) return null;

  const handleCall = () => {
    if (selectedDriver.phone) {
      window.open(`tel:${selectedDriver.phone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (selectedDriver.phone) {
      const cleanPhone = selectedDriver.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleChat = async () => {
    try {
      // userId is now included in the API response
      const userId = selectedDriver.userId;
      if (!userId) {
        console.error('User ID not available for this driver');
        return;
      }
      const conversationId = await getOrCreateConversation(userId);
      setSelectedDriver(null);
      navigate('/messages');
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  return (
    <Modal
      isOpen={!!selectedDriver}
      onClose={() => setSelectedDriver(null)}
      title="Contact Driver"
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={selectedDriver.photoUrl} name={selectedDriver.displayName} size="xl" />
          <div>
            <h3 className="text-xl font-semibold text-textPrimary">{selectedDriver.displayName}</h3>
            <p className="text-textMuted">{selectedDriver.communityHome}</p>
            {selectedDriver.distanceText && (
              <p className="text-sm text-textMuted">{selectedDriver.distanceText}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {selectedDriver.phone && (
            <>
              <Button
                variant="outline"
                onClick={handleCall}
                className="w-full justify-start"
              >
                <Phone size={20} className="mr-3" />
                Call {selectedDriver.phone}
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="w-full justify-start"
              >
                <ExternalLink size={20} className="mr-3" />
                WhatsApp
              </Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={handleChat}
            className="w-full justify-start"
          >
            <MessageCircle size={20} className="mr-3" />
            Chat in App
          </Button>
        </div>
      </div>
    </Modal>
  );
};

