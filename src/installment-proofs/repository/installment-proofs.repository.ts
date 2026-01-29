import { Inject, Injectable } from '@nestjs/common';
import { installmentProofTable, campaignTable } from '@src/db';
import { UpdateInstallmentProofDto } from '@src/installment-proofs/dto/update-installment-proof.dto';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class InstallmentProofRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async getCampaignInstallmentProof(campaignId: string, userId: string) {
    const installmentProof = await this.DbProvider.select({
      id: installmentProofTable.id,
      campaignId: installmentProofTable.campaignId,
      userId: installmentProofTable.userId,
      backview: installmentProofTable.backview,
      statusType: installmentProofTable.statusType,
      rejectionReason: installmentProofTable.rejectionReason,
      createdAt: installmentProofTable.createdAt,
      updatedAt: installmentProofTable.updatedAt,
      campaignTitle: campaignTable.campaignName,
    })
      .from(installmentProofTable)
      .where(
        and(
          eq(installmentProofTable.campaignId, campaignId),
          eq(installmentProofTable.userId, userId),
        ),
      )
      .leftJoin(campaignTable, eq(campaignTable.id, campaignId));

    return installmentProof;
  }
  async updateCampaignInstallmentProof(data: UpdateInstallmentProofDto, campaignId: string, userId: string) {
    const installmentProof = await this.DbProvider.update(installmentProofTable)
      .set(data)
      .where(
        and(
          eq(installmentProofTable.campaignId, campaignId),
          eq(installmentProofTable.userId, userId),
        ),
      )

    return installmentProof;
  }
}
