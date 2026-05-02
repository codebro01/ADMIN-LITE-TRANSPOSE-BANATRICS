import { UserApprovalStatusType } from '@src/db';
import {
  driverCampaignApplicationData,
  driverWithdrawalData,
  installmentProofStatusData,
  kycResponseData,
  weeklyProofStatusData,
} from '../types/types';
import { ApprovalStatusType } from '@src/earning/dto/create-earning.dto';
import { DriverCampaignStatusType } from '@src/campaign/dto/create-driver-campaign.dto';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';
import { InstallmentProofStatusType } from '@src/installment-proofs/dto/update-installment-proof.dto';

export class EmailTemplate {
  getWelcomeTemplate(data: { name: string; email: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Banatrics!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>Thank you for joining us. We're excited to have you on board!</p>
              <p>Your account has been successfully created with email: <strong>${data.email}</strong></p>
              <a href="https://" class="button">Get Started</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignCreatedTemplate(data: {
    campaignName: string;
    packageType: string;
    startDate: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Campaign Created Successfully! 🚀</h1>
            </div>
            <div class="content">
              <h2>Campaign Details</h2>
              <div class="info-box">
                <p><strong>Campaign Name:</strong> ${data.campaignName}</p>
                <p><strong>Package Type:</strong> ${data.packageType.toUpperCase()}</p>
                <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
              </div>
              <p>Your campaign is now under review. We'll notify you once it's approved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignApprovedTemplate(data: {
    campaignName: string;
    campaignId: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Campaign Approved!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Great News!</h2>
              <p>Your campaign <strong>"${data.campaignName}"</strong> has been approved and is now live!</p>
              <a href="https://banatrics.com/business/campaigns/${data.campaignId}" style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                View Campaign
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetTemplate(data: { resetCode: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Here is your OTP:</p>
            <a style="display: inline-block; padding: 12px 24px; background: #111111ff; color: white; text-decoration: none; margin: 20px 0;">
${data.resetCode}            </a>
            <p>This code will expire in 15 Minutes</p>
            <p><small>If you didn't request this, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(data: {
    verificationCode: string;
    name: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${data.name},</p>
            <p>Use the OTP Below to verify your email</p>
            <h1 style="display: inline-block; padding: 12px 24px; background: #0e0e0fff; color: white; text-decoration: none; margin: 20px 0;">
              ${data.verificationCode}
            </h1>
            <p><small>If you didn't create an account, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getInvoiceTemplate(data: {
    invoiceNo: string;
    campaignTitle: string;
    startDate: string;
    endDate: string;
    amountPaid: number;
    noOfDrivers: number;
    invoiceStatus: string;
    packageType: string;
    campaignStatus: string;
  }): string {
    // console.log(data.invoiceStatus)
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: #2c3e50; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .invoice-id { color: #ecf0f1; font-size: 14px; margin-top: 10px; }
          .content { padding: 30px 20px; }
          .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; text-align: right; }
          .amount-section { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .amount-label { font-size: 14px; color: #666; margin-bottom: 8px; }
          .amount-value { font-size: 32px; font-weight: bold; color: #2e7d32; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-paid { background: #4CAF50; color: white; }
          .status-pending { background: #FF9800; color: white; }
          .status-failed { background: #f44336; color: white; }
          .status-active { background: #2196F3; color: white; }
          .status-completed { background: #4CAF50; color: white; }
          .status-paused { background: #9E9E9E; color: white; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reciept from Banatrics</h1>
            <h3 class="invoice-id">Invoice No  #${data.invoiceNo}</h3>
          </div>
          
          <div class="content">
            <h2>Campaign Receipt</h2>
            <p>Thank you for your business! Below are the details of your campaign</p>
            
            <div class="amount-section">
              <div class="amount-label">Amount Paid</div>
              <div class="amount-value">₦${data.amountPaid.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <div class="invoice-details">
              <div class="detail-row">
                <span class="detail-la'bel">Campaign Title</span>
                <span class="detail-value">: ${data.campaignTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Package Type</span>
                <span class="detail-value">: ${data.packageType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Drivers</span>
                <span class="detail-value">: ${data.noOfDrivers}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Date</span>
                <span class="detail-value">: ${new Date(data.startDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">End Date</span>
                <span class="detail-value">: ${new Date(data.endDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invoice Status</span>
                <span class="detail-value">
                  <span class="status-badge status-${data.invoiceStatus?.toLowerCase()}">: ${data.invoiceStatus}</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Campaign Status</span>
                <span class="detail-value">
                  <span class="status-badge status-${data.campaignStatus.toLowerCase()}">: ${data.campaignStatus}</span>
                </span>
              </div>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you have any questions about this invoice, please contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated invoice notification.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getRejectedCampaignTemplate(data: {
    campaignName: string;
    packageType: string;
    createdAt: string;
    rejectionReason?: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: #c0392b; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { color: #f5b7b1; font-size: 14px; margin-top: 10px; }
          .content { padding: 30px 20px; }
          .alert-section { background: #fdecea; border-left: 4px solid #f44336; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alert-section p { margin: 0; color: #c0392b; font-weight: 600; }
          .campaign-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; text-align: right; }
          .reason-section { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .reason-label { font-size: 14px; font-weight: 600; color: #e65100; margin-bottom: 8px; }
          .reason-text { color: #555; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Rejected</h1>
            <p>Notification from Banatrics</p>
          </div>

          <div class="content">
            <h2>Your Campaign Was Not Approved</h2>
            <p>We're sorry to inform you that your campaign did not meet our requirements at this time.</p>

            <div class="alert-section">
              <p>⚠ This campaign has been rejected and will not go live.</p>
            </div>

            <div class="campaign-details">
              <div class="detail-row">
                <span class="detail-label">Campaign Name</span>
                <span class="detail-value">: ${data.campaignName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Package Type</span>
                <span class="detail-value">: ${data.packageType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submitted On</span>
                <span class="detail-value">: ${new Date(data.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            ${
              data.rejectionReason
                ? `
            <div class="reason-section">
              <div class="reason-label">Reason for Rejection</div>
              <div class="reason-text">${data.rejectionReason}</div>
            </div>
            `
                : ''
            }

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              You can review the feedback above, make the necessary changes, and resubmit your campaign. 
              If you believe this is an error or need further clarification, please contact our support team.
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated campaign notification.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  // getWithdrawalStatusTemplate(data: driverWithdrawalData): string {
  //   const isSuccess = data.status === ApprovalStatusType.APPROVED;

  //   return `
  //   <!DOCTYPE html>
  //   <html>
  //     <body>
  //       <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
  //         <div style="background: ${isSuccess ? '#4CAF50' : '#F44336'}; color: white; padding: 20px; text-align: center;">
  //           <h1>${isSuccess ? 'Withdrawal Successful!' : 'Withdrawal Failed'}</h1>
  //         </div>
  //         <div style="padding: 20px; background: #f9f9f9;">
  //           <h2>${isSuccess ? 'Your money is on the way!' : 'Something went wrong'}</h2>
  //           <p>
  //             ${
  //               isSuccess
  //                 ? `Your withdrawal of <strong>₦${data.amount}</strong> has been processed successfully. Kindly allow a few minutes for the funds to reflect in your bank account.`
  //                 : `Your withdrawal of <strong>₦${data.amount}</strong> could not be completed. Your balance has been refunded. Please try again or contact support if the issue persists.`
  //             }
  //           </p>
  //           <div style="background: white; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e0e0e0;">
  //             <p style="margin: 0; color: #666;">Amount</p>
  //             <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: ${isSuccess ? '#4CAF50' : '#F44336'};">₦${data.amount}</p>
  //             <p style="margin: 8px 0 0; color: #666;">Status</p>
  //             <p style="margin: 4px 0 0; font-weight: bold; color: ${isSuccess ? '#4CAF50' : '#F44336'};">
  //               ${isSuccess ? 'Successful' : 'Failed'}
  //             </p>
  //           </div>
  //           ${
  //             !isSuccess
  //               ? `<a href="mailto:support@banatrics.com" style="display: inline-block; padding: 12px 24px; background: #F44336; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
  //                   Contact Support
  //                 </a>`
  //               : ''
  //           }
  //         </div>
  //         <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
  //           <p>If you did not initiate this withdrawal, please contact support immediately.</p>
  //         </div>
  //       </div>
  //     </body>
  //   </html>
  // `;
  // }

  getKycVerificationTemplate(data: kycResponseData): string {
    const isApproved = data.status === UserApprovalStatusType.APPROVED;

    return `
  <!DOCTYPE html>
  <html>
    <body>
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: ${isApproved ? '#4CAF50' : '#FF9800'}; color: white; padding: 20px; text-align: center;">
          <h1>${isApproved ? 'KYC Verification Approved! 🎉' : 'KYC Verification Pending'}</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>${isApproved ? 'Congratulations! You are fully verified.' : 'Your documents are under review'}</h2>
          <p>
            ${
              isApproved
                ? `Great news! Your identity verification has been completed successfully. You now have full access to all platform features.`
                : `We have received your KYC documents and they are currently being reviewed. This process can take up to 24–48 hours. You will be notified once a decision has been made.`
            }
          </p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <p style="margin: 0; color: #666;">Verification Status</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: ${isApproved ? '#4CAF50' : '#FF9800'};">
              ${isApproved ? 'Approved' : '⏳ Pending Review'}
            </p>
          </div>
          ${
            !isApproved
              ? `<a href="mailto:support@banatrics.com" style="display: inline-block; padding: 12px 24px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                  Contact Support
                </a>`
              : ''
          }
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>If you did not submit any verification documents, please contact support immediately.</p>
        </div>
      </div>
    </body>
  </html>
`;
  }

  getCampaignDesignReadyTemplate(data: { campaignName: string }): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: #2c3e50; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; text-align: center; }
          .success-icon { font-size: 60px; margin-bottom: 20px; }
          .message { font-size: 16px; color: #555; margin: 20px 0; }
          .campaign-name { font-weight: bold; color: #2c3e50; }
          .button { display: inline-block; padding: 14px 35px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Design Ready</h1>
          </div>

          <div class="content">
            <div class="success-icon">🎨</div>
            <h2>Congratulations!</h2>
            <p class="message">
              Your campaign design for <span class="campaign-name">"${data.campaignName}"</span> 
              has been completed. Please review it and take action.
            </p>
            <a href="#" class="button">Review Design</a>
            <p style="font-size: 13px; color: #999;">
              You can approve or disapprove the design from your dashboard.
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getWithdrawalStatusTemplate(data: driverWithdrawalData): string {
    const isApproved = data.status === ApprovalStatusType.APPROVED;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: ${isApproved ? '#2e7d32' : '#c0392b'}; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          .message { font-size: 16px; color: #555; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: ${isApproved ? '#2e7d32' : '#c0392b'}; margin: 10px 0; }
          .detail-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; }
          .reason-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .reason-label { font-weight: 600; color: #e65100; margin-bottom: 5px; }
          .reason-text { color: #555; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Withdrawal ${isApproved ? 'Approved' : 'Rejected'}</h1>
          </div>

          <div class="content">
            <h2>${isApproved ? 'Great News!' : 'Withdrawal Not Approved'}</h2>

            <p class="message">
              Your withdrawal request for the campaign 
              <strong>"${data.campaignName}"</strong> has been 
              <strong>${isApproved ? 'approved' : 'rejected'}</strong>.
            </p>

            <div class="amount">
              ₦${data.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Campaign</span>
                <span class="detail-value">${data.campaignName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">₦${data.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">${isApproved ? '✅ Approved' : '❌ Rejected'}</span>
              </div>
            </div>

            ${
              data.reason
                ? `
            <div class="reason-box">
              <div class="reason-label">Reason</div>
              <div class="reason-text">${data.reason}</div>
            </div>
            `
                : ''
            }

            <p style="font-size: 13px; color: #999; margin-top: 20px;">
              ${
                isApproved
                  ? 'Your funds will be transferred to your account shortly.'
                  : 'If you have any questions, please contact our support team.'
              }
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getCampaignApplicationStatusTemplate(
    data: driverCampaignApplicationData,
  ): string {
    const isApproved = data.status === DriverCampaignStatusType.APPROVED;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: ${isApproved ? '#2e7d32' : '#c0392b'}; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          .message { font-size: 16px; color: #555; margin: 20px 0; }
          .campaign-title { font-size: 22px; font-weight: bold; color: ${isApproved ? '#2e7d32' : '#c0392b'}; margin: 10px 0; }
          .detail-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; }
          .reason-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .reason-label { font-weight: 600; color: #e65100; margin-bottom: 5px; }
          .reason-text { color: #555; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Application ${isApproved ? 'Approved' : 'Rejected'}</h1>
          </div>

          <div class="content">
            <div class="icon">${isApproved ? '🎉' : '😔'}</div>

            <h2>${isApproved ? "Congratulations, You're In!" : 'Application Not Approved'}</h2>

            <p class="message">
              ${
                isApproved
                  ? `You have been approved to partake in the campaign`
                  : `Your application for the campaign`
              }
              <br />
              <span class="campaign-title">"${data.campaignName}"</span>
              <br />
              ${isApproved ? 'Get ready to hit the road!' : 'has been rejected.'}
            </p>

            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Campaign</span>
                <span class="detail-value">${data.campaignName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Applicant</span>
                <span class="detail-value">${data.driverName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">${isApproved ? '✅ Approved' : '❌ Rejected'}</span>
              </div>
              ${
                data.startDate
                  ? `
              <div class="detail-row">
                <span class="detail-label">Campaign Start Date</span>
                <span class="detail-value">${data.startDate}</span>
              </div>
              `
                  : ''
              }
            </div>

            ${
              !isApproved && data.reason
                ? `
            <div class="reason-box">
              <div class="reason-label">Reason for Rejection</div>
              <div class="reason-text">${data.reason}</div>
            </div>
            `
                : ''
            }

            <p style="font-size: 13px; color: #999; margin-top: 20px;">
              ${
                isApproved
                  ? 'Further details about the campaign will be communicated to you. Welcome aboard!'
                  : 'If you believe this is a mistake or need further clarification, please contact our support team.'
              }
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getWeeklyProofStatusTemplate(data: weeklyProofStatusData): string {
    const isApproved = data.status === WeeklyProofStatus.APPROVED;
    const isRejected = data.status === WeeklyProofStatus.REJECTED;

    const headerColor = isApproved
      ? '#2e7d32'
      : isRejected
        ? '#e65100'
        : '#c0392b';
    const accentColor = isApproved
      ? '#2e7d32'
      : isRejected
        ? '#e65100'
        : '#c0392b';

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: ${headerColor}; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.85; }
          .content { padding: 30px 20px; text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          .message { font-size: 16px; color: #555; margin: 20px 0; }
          .week-badge {
            display: inline-block;
            background: ${accentColor}18;
            color: ${accentColor};
            border: 1.5px solid ${accentColor}44;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .detail-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; }
          .reason-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .reason-label { font-weight: 600; color: #e65100; margin-bottom: 5px; }
          .reason-text { color: #555; font-size: 14px; }
          .flagged-box { background: #fbe9e7; border-left: 4px solid #e65100; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .flagged-label { font-weight: 600; color: #bf360c; margin-bottom: 5px; }
          .flagged-text { color: #555; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">

          <div class="header">
            <h1>Weekly Proof ${isApproved ? 'Approved' : 'Rejected'}</h1>
          </div>

          <div class="content">

            <div class="icon">${isApproved ? '✅' : '❌'}</div>


            <h2>
              ${isApproved ? 'Proof Verified!' : 'Proof Not Accepted'}
            </h2>

            <p class="message">
              ${
                isApproved
                  ? `Your weekly proof submission for <strong>"${data.campaignName}"</strong> has been reviewed and <strong>approved</strong>. Keep up the great work!`
                  : `Your weekly proof submission for <strong>"${data.campaignName}"</strong> has been reviewed and was <strong>not accepted</strong> for this week.`
              }
            </p>

            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Campaign</span>
                <span class="detail-value">${data.campaignName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Driver</span>
                <span class="detail-value">${data.driverName}</span>
              </div>
            
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                  ${isApproved ? '✅ Approved' : '❌ Rejected'}
                </span>
              </div>
            </div>

            ${
              isRejected && data.rejectionReason
                ? `
            <div class="flagged-box">
              <div class="flagged-label">🚩 Flag Reason</div>
              <div class="flagged-text">${data.rejectionReason}</div>
            </div>
            `
                : ''
            }

            ${
              !isApproved && !isRejected && data.rejectionReason
                ? `
            <div class="reason-box">
              <div class="reason-label">Reason for Rejection</div>
              <div class="reason-text">${data.rejectionReason}</div>
            </div>
            `
                : ''
            }

            <p style="font-size: 13px; color: #999; margin-top: 20px;">
              ${
                isApproved
                  ? 'Your submission has been logged. Keep the sticker visible and in good condition for upcoming weekly submissions.'
                  : 'Please ensure your proof photo is clear, well-lit, and shows the sticker fully visible on your vehicle before resubmitting.'
              }
            </p>

          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>

        </div>
      </body>
    </html>
  `;
  }

  getInstallmentProofStatusTemplate(data: installmentProofStatusData): string {
    const isApproved = data.status === InstallmentProofStatusType.APPROVED;
    const isRejected = data.status === InstallmentProofStatusType.REJECTED;

    const headerColor = isApproved ? '#2e7d32' : '#c0392b';
    const accentColor = isApproved ? '#2e7d32' : '#c0392b';

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: ${headerColor}; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.85; }
          .content { padding: 30px 20px; text-align: center; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          .message { font-size: 16px; color: #555; margin: 20px 0; }
          .status-badge {
            display: inline-block;
            background: ${accentColor}18;
            color: ${accentColor};
            border: 1.5px solid ${accentColor}44;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .detail-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; }
          .reason-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .reason-label { font-weight: 600; color: #e65100; margin-bottom: 5px; }
          .reason-text { color: #555; font-size: 14px; }
          .pending-box { background: #e3f2fd; border-left: 4px solid #1565c0; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
          .pending-label { font-weight: 600; color: #0d47a1; margin-bottom: 5px; }
          .pending-text { color: #555; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">

          <div class="header">
            <h1>Installation Proof ${isApproved ? 'Approved' : 'Rejected'}</h1>
            <p>Campaign: ${data.campaignName}</p>
          </div>

          <div class="content">

            <div class="icon">${isApproved ? '✅' : '❌'}</div>

            <div class="status-badge">
              ${isApproved ? '✅ Approved' : '❌ Rejected'}
            </div>

            <h2>
              ${
                isApproved
                  ? 'Sticker Installation Verified!'
                  : 'Installation Proof Not Accepted'
              }
            </h2>

            <p class="message">
              ${
                isApproved
                  ? `Your sticker installation proof for <strong>"${data.campaignName}"</strong> has been reviewed and <strong>approved</strong>. You're officially on the road for this campaign!`
                  : `Your sticker installation proof for <strong>"${data.campaignName}"</strong> has been reviewed and was <strong>not accepted</strong>.`
              }
            </p>

            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Campaign</span>
                <span class="detail-value">${data.campaignName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Driver</span>
                <span class="detail-value">${data.driverName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submitted On</span>
                <span class="detail-value">${new Date(data.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                  ${isApproved ? '✅ Approved' : '❌ Rejected'}
                </span>
              </div>
            </div>


            ${
              isRejected && data.rejectionReason
                ? `
            <div class="reason-box">
              <div class="reason-label">Reason for Rejection</div>
              <div class="reason-text">${data.rejectionReason}</div>
            </div>
            `
                : ''
            }

            <p style="font-size: 13px; color: #999; margin-top: 20px;">
              ${
                isApproved
                  ? 'Remember to submit your weekly proof every week to keep your earnings active. Good luck out there!'
                  : 'Please ensure the sticker is properly placed on your vehicle and the photo is clear and well-lit before resubmitting.'
              }
            </p>

          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Banatrics. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>

        </div>
      </body>
    </html>
  `;
  }
}
