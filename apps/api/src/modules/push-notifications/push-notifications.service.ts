import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { getFirebaseApp } from '../../config/firebase.config';
import { User } from '../../entities/user.entity';
import { PushNotificationType } from './push-notification-types.enum';
import { notificationContent } from './push-notification-content';

export interface SendNotificationOptions {
  userId: string;
  type: PushNotificationType;
  data?: Record<string, any>;
  customTitle?: string;
  customBody?: string;
}

export interface SendNotificationToTokenOptions {
  token: string;
  type: PushNotificationType;
  data?: Record<string, any>;
  customTitle?: string;
  customBody?: string;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private messaging: admin.messaging.Messaging;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    try {
      const app = getFirebaseApp();
      this.messaging = admin.messaging(app);
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Messaging', error);
    }
  }

  /**
   * Send a push notification to a user by their user ID
   */
  async sendNotificationToUser(options: SendNotificationOptions): Promise<void> {
    const { userId, type, data = {}, customTitle, customBody } = options;

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        throw new Error(`User not found: ${userId}`);
      }

      
      const token = (user as any).pushNotificationToken;
      if (!token) {
        this.logger.warn(`No push notification token found for user: ${userId}`);
        return;
      }

      await this.sendNotificationToToken({
        token,
        type,
        data,
        customTitle,
        customBody,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Send a push notification to a specific FCM token
   */
  async sendNotificationToToken(options: SendNotificationToTokenOptions): Promise<void> {
    const { token, type, data = {}, customTitle, customBody } = options;

    try {
      const content = notificationContent[type];
      const title = customTitle || content.title;
      const body = customBody || content.body;

      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: {
          type,
          ...Object.keys(data).reduce((acc, key) => {
            acc[key] = String(data[key]);
            return acc;
          }, {} as Record<string, string>),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      this.logger.log(`Successfully sent notification ${type} to token. Message ID: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to token`, error);
      
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn(`Invalid or unregistered token. Token: ${token.substring(0, 20)}...`);
      }
      
      throw error;
    }
  }

  /**
   * Send push notifications to multiple users
   */
  async sendNotificationToMultipleUsers(
    userIds: string[],
    type: PushNotificationType,
    data?: Record<string, any>,
    customTitle?: string,
    customBody?: string,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = userIds.map(async (userId) => {
      try {
        await this.sendNotificationToUser({
          userId,
          type,
          data,
          customTitle,
          customBody,
        });
        success++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to send notification to user ${userId}`, error);
      }
    });

    await Promise.allSettled(promises);

    return { success, failed };
  }

  /**
   * Send push notifications to multiple FCM tokens
   */
  async sendNotificationToMultipleTokens(
    tokens: string[],
    type: PushNotificationType,
    data?: Record<string, any>,
    customTitle?: string,
    customBody?: string,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const content = notificationContent[type];
      const title = customTitle || content.title;
      const body = customBody || content.body;

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: {
          type,
          ...Object.keys(data || {}).reduce((acc, key) => {
            acc[key] = String(data[key]);
            return acc;
          }, {} as Record<string, string>),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);
      this.logger.log(
        `Sent ${response.successCount} notifications, ${response.failureCount} failed`,
      );

      return response;
    } catch (error) {
      this.logger.error('Failed to send notifications to multiple tokens', error);
      throw error;
    }
  }
}

