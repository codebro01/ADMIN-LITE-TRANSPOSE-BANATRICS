import { Injectable } from '@nestjs/common';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { weeklyProofInsertType } from '@src/db';
import { getWeek, getYear } from 'date-fns';

@Injectable()
export class WeeklyProofsService {
  constructor(
    private readonly weeklyProofsRepository: WeeklyProofsRepository,
  ) {}
  async create(data: Omit<weeklyProofInsertType, 'userId'>, userId: string) {
    const now = new Date()
    const weeklyProof = await this.weeklyProofsRepository.create(
      { ...data, weekNumber: getWeek(now), year: getYear(now) },
      userId,
    );

    return weeklyProof;
  }

  async findAllByUserId(userId: string) {
    const weeklyProof =
      await this.weeklyProofsRepository.findAllByUserId(userId);
    return weeklyProof;
  }

  async findOneByUserId(weeklyProofId: string, userId: string) {
    const weeklyProof = await this.weeklyProofsRepository.findOneByUserId(
      weeklyProofId,
      userId,
    );

    return weeklyProof;
  }

  async update(
    data: Partial<Omit<weeklyProofInsertType, 'userId'>>,
    weeklyProofId: string,
    userId: string,
  ) {
    const weeklyProof = await this.weeklyProofsRepository.update(
      {...data, updatedAt: new Date()},
      weeklyProofId,
      userId,
    );
    return weeklyProof;
  }

  remove(id: string) {
    return `This action removes a #${id} weeklyProof`;
  }
}
