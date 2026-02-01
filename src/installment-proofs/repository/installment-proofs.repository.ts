import { Inject, Injectable } from '@nestjs/common';
import { installmentProofTable, campaignTable, driverTable } from '@src/db';
import { UpdateInstallmentProofDto } from '@src/installment-proofs/dto/update-installment-proof.dto';
import { and, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class InstallmentProofRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async getCampaignInstallmentProof(campaignId?: string, userId?: string) {
    const conditions = [];

    if (campaignId)
      conditions.push(eq(installmentProofTable.campaignId, campaignId));
    if (userId) conditions.push(eq(installmentProofTable.userId, userId));

    let query = this.DbProvider.select({
      id: installmentProofTable.id,
      firstName: driverTable.firstname, 
      lastName: driverTable.lastname, 
      campaignId: installmentProofTable.campaignId,
      userId: installmentProofTable.userId,
      backview: installmentProofTable.backview,
      statusType: installmentProofTable.statusType,
      rejectionReason: installmentProofTable.rejectionReason,
      createdAt: installmentProofTable.createdAt,
      updatedAt: installmentProofTable.updatedAt,
      campaignTitle: campaignId
        ? campaignTable.campaignName
        : sql`NULL`.as('campaignTitle'),
    })
      .from(installmentProofTable)
      .where(and(...conditions)).leftJoin(driverTable, eq(driverTable.userId, installmentProofTable.userId));

    if (campaignId) {
      query = query.leftJoin(
        campaignTable,
        eq(campaignTable.id, installmentProofTable.campaignId),
      );
    }

    const installmentProof = await query;

    return installmentProof;
  }
  async updateCampaignInstallmentProof(
    data: UpdateInstallmentProofDto,
    campaignId: string,
    userId: string,
  ) {
    const installmentProof = await this.DbProvider.update(installmentProofTable)
      .set(data)
      .where(
        and(
          eq(installmentProofTable.campaignId, campaignId),
          eq(installmentProofTable.userId, userId),
        ),
      ).returning();

    return installmentProof;
  }
}
