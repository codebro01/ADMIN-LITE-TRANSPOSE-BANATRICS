import { PaymentStatusType, UserApprovalStatusType } from '@src/db';

export interface EmailJobData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;

}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  CAMPAIGN_CREATED = 'campaign-created',
  CAMPAIGN_APPROVED = 'campaign-approved',
  CAMPAIGN_REJECTED = 'campaign-rejected',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  CAMPAIGN_INVOICE = 'campaign-invoice',
  DRIVER_WITHDRAWAL = 'driver-withdrawal',
  KYC_APPLICATION = 'kyc-application',
  REJECT_CAMPAIGN = 'reject-campaign'
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WelcomeTemplateData {
  name: string;
  email: string;
}

export interface CampaignCreatedTemplateData {
  campaignName: string;
  packageType: string;
  startDate: string;
}

export interface CampaignApprovedTemplateData {
  campaignName: string;
  campaignId: string;
}

export interface PasswordResetTemplateData {
  resetCode: string;
}

export interface CampaignInvoiceTempleteData {
  invoiceNo: string;
  campaignTitle: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  noOfDrivers: number;
  invoiceStatus: string;
  packageType: string;
  campaignStatus: string;
}

export interface EmailVerificationTemplateData {
  verificationCode: string;
  name: string;
}
export interface driverWithdrawalData {
  amount: string;
  status: PaymentStatusType;
}
export interface kycResponseData {
  status: UserApprovalStatusType;
}

export interface rejectCampaignData {
  campaignName: string;
  packageType: string;
  rejectionReason?: string;
  createdAt: string;
}

export type EmailTemplateData =
  | WelcomeTemplateData
  | CampaignCreatedTemplateData
  | CampaignApprovedTemplateData
  | PasswordResetTemplateData
  | EmailVerificationTemplateData
  | driverWithdrawalData
  | kycResponseData
  | rejectCampaignData;
