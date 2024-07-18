// src/services/email/email.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../queue/redis.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private readonly logger = new Logger(EmailService.name);
  private isProcessing = false;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = this.configService.get<string>('SENDINBLUE_API_KEY');

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async onModuleInit() {
    await this.startListeningQueue();
  }

  private async startListeningQueue() {
    try {
      await this.redisService.waitForConnection();
      const subscriber = this.redisService.getSubscriber();
      if (!subscriber) {
        throw new Error('Redis subscriber is not available');
      }

      await subscriber.subscribe('email_queue_channel');

      subscriber.on('message', async (channel) => {
        if (channel === 'email_queue_channel' && !this.isProcessing) {
          await this.processEmailQueue();
        }
      });

      this.logger.log('Started listening to email queue channel');
    } catch (error) {
      this.logger.error(`Failed to start listening to queue: ${error.message}`, error.stack);
    }
  }

  async queueEmail(to: string, subject: string, text: string, html?: string) {
    const emailData = {
      to,
      subject,
      text,
      html,
      sender: {
        name: this.configService.get<string>('EMAIL_SENDER_NAME'),
        email: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
      },
    };

    await this.redisService.pushToQueue(
      'email_queue',
      JSON.stringify(emailData),
    );
    await this.redisService.publish('email_queue_channel', 'new_email');
    this.logger.log(`Email queued successfully for ${to}`);
  }

  async processEmailQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.logger.log('Started processing email queue');

    try {
      while (true) {
        const emailData = await this.redisService.popFromQueue('email_queue');
        if (!emailData) {
          break;
        }

        try {
          const { to, subject, text, html, sender } = JSON.parse(emailData);
          this.logger.log(`Processing email for ${to}`);
          await this.sendEmail(to, subject, text, html, sender);
          this.logger.log(`Email sent successfully to ${to}`);
        } catch (error) {
          this.logger.error(
            `Error processing email: ${error.message}`,
            error.stack,
          );
        }
      }
    } finally {
      this.isProcessing = false;
      this.logger.log('Finished processing email queue');
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    sender?: { name: string; email: string },
  ) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = text;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = sender || {
      name: this.configService.get<string>('EMAIL_SENDER_NAME'),
      email: this.configService.get<string>('EMAIL_SENDER_ADDRESS'),
    };

    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(
        `Email sent successfully. MessageId: ${result.messageId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
