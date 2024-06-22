// src/services/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../queue/redis.service';

@Injectable()
export class EmailService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = this.configService.get<string>('SENDINBLUE_API_KEY');

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
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
    console.log('Email queued successfully');
  }

  async processEmailQueue() {
    const emailData = await this.redisService.popFromQueue('email_queue');
    if (emailData) {
      const { to, subject, text, html, sender } = JSON.parse(emailData);
      await this.sendEmail(to, subject, text, html, sender);
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
      console.log('Email sent successfully. MessageId:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
