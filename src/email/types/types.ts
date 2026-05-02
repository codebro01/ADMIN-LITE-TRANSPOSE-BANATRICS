import { DriverCampaignStatusType } from '@src/campaign/dto/create-driver-campaign.dto';
import { UserApprovalStatusType } from '@src/db';
import { ApprovalStatusType } from '@src/earning/dto/create-earning.dto';
import { InstallmentProofStatusType } from '@src/installment-proofs/dto/update-installment-proof.dto';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';

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
  // DRIVER_WITHDRAWAL = 'driver-withdrawal',
  KYC_APPLICATION = 'kyc-application',
  CREATE_CAMPAIGN_DESIGN = 'create-campaign-design',
  REJECT_CAMPAIGN = 'reject-campaign',
  APPROVE_REJECT_WITHDRAWAL = 'approve-reject-withdrawal', 
  DRIVER_CAMPAIGN_APPLICATION = 'driver-campaign-application',
  WEEKLY_PROOF_SUBMISSION = 'weekly-proof-submission', 
  INSTALLMENT_PROOF_SUBMISSION = 'installment-proof-submission'
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
  campaignName: string;
  amount: number;
  reason?: string;
  status: ApprovalStatusType;
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

export interface createCampaignDesignData {
  campaignName: string;
}

export interface driverCampaignApplicationData {
  status: DriverCampaignStatusType;
  campaignName: string;
  driverName: string;
  startDate?: string; // optional — show it if you have it
  reason?: string; // optional — only relevant for rejections
}

export interface weeklyProofStatusData {
  status: WeeklyProofStatus;
  campaignName: string;
  driverName: string;
  rejectionReason?: string; // optional for both rejected and flagged
}

export interface installmentProofStatusData {
  status:InstallmentProofStatusType;
  campaignName: string;
  driverName: string;
  submittedAt: string | Date;
  rejectionReason?: string;
}

export type EmailTemplateData =
  | WelcomeTemplateData
  | CampaignCreatedTemplateData
  | CampaignApprovedTemplateData
  | PasswordResetTemplateData
  | EmailVerificationTemplateData
  | driverWithdrawalData
  | kycResponseData
  | rejectCampaignData
  | driverCampaignApplicationData
  | weeklyProofStatusData
  | installmentProofStatusData
  | createCampaignDesignData;
