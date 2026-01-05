import { PushNotificationType } from './push-notification-types.enum';

export interface NotificationContent {
  title: string;
  body: string;
}

export const notificationContent: Record<PushNotificationType, NotificationContent> = {
  [PushNotificationType.ONBOARDING_COMPLETED]: {
    title: 'Welcome! Onboarding Complete',
    body: 'Your account has been successfully set up. Start your journey with us!',
  },
  [PushNotificationType.DOCUMENT_APPROVED]: {
    title: 'Document Approved',
    body: 'Great news! Your document has been approved. You can now continue using our services.',
  },
  [PushNotificationType.DOCUMENT_REJECTED]: {
    title: 'Document Requires Attention',
    body: 'Your document submission needs some adjustments. Please review and resubmit.',
  },
  [PushNotificationType.RIDE_REQUESTED]: {
    title: 'New Ride Request',
    body: 'You have a new ride request. Tap to view details.',
  },
  [PushNotificationType.RIDE_ACCEPTED]: {
    title: 'Ride Accepted',
    body: 'Your ride request has been accepted. Your driver is on the way!',
  },
  [PushNotificationType.RIDE_REJECTED]: {
    title: 'Ride Request Declined',
    body: 'Unfortunately, your ride request was declined. Please try again.',
  },
  [PushNotificationType.RIDE_CANCELLED]: {
    title: 'Ride Cancelled',
    body: 'Your ride has been cancelled. We hope to serve you again soon.',
  },
  [PushNotificationType.RIDE_STARTED]: {
    title: 'Ride Started',
    body: 'Your ride has begun. Enjoy your journey!',
  },
  [PushNotificationType.RIDE_COMPLETED]: {
    title: 'Ride Completed',
    body: 'Your ride has been completed. Thank you for using our service!',
  },
  [PushNotificationType.REVIEW_RECEIVED]: {
    title: 'New Review Received',
    body: 'You have received a new review from a passenger.',
  },
  [PushNotificationType.DRIVER_VERIFIED]: {
    title: 'Account Verified',
    body: 'Congratulations! Your driver account has been verified. You can now accept ride requests.',
  },
  [PushNotificationType.MESSAGE]: {
    title: 'New Message',
    body: 'You have a new message. Tap to view.',
  },
  [PushNotificationType.NEW_MESSAGE]: {
    title: 'New Message',
    body: 'You have a new message. Tap to view.',
  },
  [PushNotificationType.WALLET_TRANSACTION]: {
    title: 'Wallet Transaction',
    body: 'A transaction has been processed in your wallet. Tap to view details.',
  },
};

