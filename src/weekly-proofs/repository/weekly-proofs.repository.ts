import { Injectable, Inject } from '@nestjs/common';
import {
  campaignTable,
  driverTable,
  userTable,
  weeklyProofInsertType,
  weeklyProofTable,
} from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, count, eq, gte, max } from 'drizzle-orm';
import {
  QueryWeeklyProofDto,
  WeekQueryType,
} from '@src/weekly-proofs/dto/query-weekly-proofs.dto';
import { getWeek } from 'date-fns';
import { WeeklyProofStatus } from '@src/weekly-proofs/dto/create-weekly-proof.dto';

@Injectable()
export class WeeklyProofsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async weeklyProofDashboardCards() {
    const [[totalDrivers], [accepted], [pendingReview], [flagged]] =
      await Promise.all([
        this.DbProvider.select({
          total: count(),
        }).from(weeklyProofTable),
        this.DbProvider.select({
          total: count(),
        })
          .from(weeklyProofTable)
          .where(eq(weeklyProofTable.statusType, 'approved')),
        this.DbProvider.select({
          total: count(),
        })
          .from(weeklyProofTable)
          .where(eq(weeklyProofTable.statusType, 'pending_review')),
        this.DbProvider.select({
          total: count(),
        })
          .from(weeklyProofTable)
          .where(eq(weeklyProofTable.statusType, 'flagged')),
      ]);

    return {
      totalDrivers,
      accepted,
      pendingReview,
      flagged,
    };
  }

  async queryAllWeeklyProofs(query: QueryWeeklyProofDto) {
    const limit = query.limit || 20;
    const page = query.page || 1;
    const offset = (page - 1) * limit;
    const conditions = [];

    if (query.status)
      conditions.push(eq(weeklyProofTable.statusType, query.status));
    if (query.campaignId)
      conditions.push(eq(weeklyProofTable.campaignId, query.campaignId));
    if (query.week === WeekQueryType.CURRENT_WEEK) {
      const currentWeek = getWeek(new Date());

      conditions.push(gte(weeklyProofTable.weekNumber, currentWeek));
    }
    if (query.week === WeekQueryType.LAST_WEEK) {
      const lastWeek = getWeek(new Date()) - 1;

      conditions.push(gte(weeklyProofTable.weekNumber, lastWeek));
    }
    if (query.week === WeekQueryType.TWO_WEEKS_AGO) {
      const twoWeeksAgo = getWeek(new Date()) - 2;

      conditions.push(gte(weeklyProofTable.weekNumber, twoWeeksAgo));
    }

    const weeklyProofs = await this.DbProvider.select({
      firstname: driverTable.firstname,
      lastname: driverTable.lastname,
      driverId: weeklyProofTable.userId, 
      campaignId: weeklyProofTable.campaignId, 
      backview: weeklyProofTable.backview, 
      id: weeklyProofTable.id,
      campaignTitle: campaignTable.campaignName,
      week: weeklyProofTable.createdAt,
      proofsCount: count(weeklyProofTable.userId),
      status: weeklyProofTable.statusType,
      lastSubmitted: max(weeklyProofTable.createdAt),
      weeklyProofId: weeklyProofTable.id,
    })
      .from(weeklyProofTable)
      .leftJoin(driverTable, eq(driverTable.userId, weeklyProofTable.userId))
      .leftJoin(
        campaignTable,
        eq(campaignTable.id, weeklyProofTable.campaignId),
      )
      .where(and(...conditions))
      .groupBy(
        weeklyProofTable.userId,
        weeklyProofTable.campaignId,
        driverTable.firstname,
        driverTable.lastname,
        campaignTable.campaignName,
        weeklyProofTable.createdAt,
        weeklyProofTable.statusType,
        weeklyProofTable.id,
      )
      .limit(limit)
      .offset(offset);

    return weeklyProofs;
  }

  async weeklyProofDetails(weeklyProofId: string, userId: string) {
    const weeklyProof = await this.DbProvider.select({})
      .from(userTable)
      .where(
        and(
          eq(weeklyProofTable.userId, userId),
          eq(weeklyProofTable.id, weeklyProofId),
        ),
      );

    return weeklyProof;
  }

  async approveOrRejectWeeklyProof(
    data: Pick<weeklyProofInsertType, 'statusType' | 'comment'> & {weeklyProofId: string},
    campaignId: string,
    userId: string,
  ) {
    
    const [weeklyProof] = await this.DbProvider.update(weeklyProofTable)
      .set({
        statusType: data.statusType,
        comment: data.comment,
      })
      .where(
        and(
          eq(weeklyProofTable.campaignId, campaignId),
          eq(weeklyProofTable.userId, userId),
          eq(weeklyProofTable.id, data.weeklyProofId),
        ),
      )
      .returning();

      console.log('weekProof', weeklyProof)

    return weeklyProof;
  }

  async listDriverWeeklyProofs(userId: string) {
    const weeklyProofs = await this.DbProvider.select()
      .from(weeklyProofTable)
      .where(eq(weeklyProofTable.userId, userId));

    return weeklyProofs;
  }

  async campaignAllWeeklyProofs(campaignId: string) {
    const weeklyProofs = await this.DbProvider.select({
      id: weeklyProofTable.id,
      campaignId: weeklyProofTable.campaignId,
      userId: weeklyProofTable.userId,
      backview: weeklyProofTable.backview,
      comment: weeklyProofTable.comment,
      month: weeklyProofTable.month,
      weekNumber: weeklyProofTable.weekNumber,
      year: weeklyProofTable.year,
      statusType: weeklyProofTable.statusType,
      rejectionReason: weeklyProofTable.rejectionReason,
      createdAt: weeklyProofTable.createdAt,
      updatedAt: weeklyProofTable.updatedAt,
      campaignTitle: campaignTable.campaignName,
    })
      .from(weeklyProofTable)
      .where(eq(weeklyProofTable.campaignId, campaignId))
      .leftJoin(campaignTable, eq(campaignTable.id, campaignId));

    return weeklyProofs;
  }
  async getAllApprovedWeeklyProofsForCampaign(campaignId: string, userId: string) {
    const [weeklyProofs] = await this.DbProvider.select({
      total: count()
    })
      .from(weeklyProofTable)
      .where(
        and(
          eq(weeklyProofTable.campaignId, campaignId),
          eq(weeklyProofTable.userId, userId),
          eq(weeklyProofTable.statusType, WeeklyProofStatus.APPROVED),
        ),
      )

    return weeklyProofs;
  }
}
