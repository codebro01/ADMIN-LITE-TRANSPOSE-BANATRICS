import { Inject, Injectable } from '@nestjs/common';
import { businessOwnerTable, driverTable, userTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
// import { driverTable } from '@src/db';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db/users')>,
  ) {}

  async findUserByEmail(email: string) {
    const [user] = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.email, email));

    return user;
  }
  async findDriverById(userId: string) {
    const [user] = await this.DbProvider.select()
      .from(driverTable)
      .where(eq(driverTable.userId, userId));

    return user;
  }
  async findBusinessOwnerById(userId: string) {
    const [user] = await this.DbProvider.select()
      .from(businessOwnerTable)
      .where(eq(businessOwnerTable.userId, userId));

    return user;
  }

  async updateUserRefreshToken(userId: string, token: string | null) {
    const updateUserToken = await this.DbProvider.update(userTable)
      .set({ refreshToken: token })
      .where(eq(userTable.id, userId));

    return updateUserToken;
  }


}
