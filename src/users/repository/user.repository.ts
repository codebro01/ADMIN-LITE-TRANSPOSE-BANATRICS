import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  userInsertType,
  userTable,
  adminTable,
  adminInsertType,
} from '@src/db/users';
import { eq, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async createUser(
    data: Pick<
      userInsertType,
      'email' | 'password' | 'phone' | 'role' | 'emailVerified'
    >,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.insert(userTable)
      .values({ ...data, emailVerified: true, role: ['admin'] })
      .returning();

    return user;
  }

  async createAdmin(data: adminInsertType, trx?: any) {
    const Trx = trx || this.DbProvider;
    const admin = await Trx.insert(adminTable).values(data).returning();
    return admin;
  }

  async updateAdmin(data: Pick<adminInsertType, 'fullName'>, userId: string) {
    const userIsExisting = await this.findUserById(userId);
    if (!userIsExisting) throw new NotFoundException('Invalid Request');
    const admin = await this.DbProvider.update(adminTable)
      .set({ ...data, userId,  updatedAt: new Date() })
      .where(eq(adminTable.userId, userId))
      .returning();

    return admin;
  }

  async findUserById(userId: string) {
    const user = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));
    return user;
  }

  async getAdminProfile(userId: string) {
    const [user, admin] = await Promise.all([
      this.DbProvider.select({ email: userTable.email })
        .from(userTable)
        .where(eq(userTable.id, userId)),
      this.DbProvider.select({ fullName: adminTable.fullName })
        .from(adminTable)
        .where(eq(adminTable.userId, userId)),
    ]);

    return { ...user, ...admin };
  }

  async findByEmailOrPhone(data: { email?: string; phone?: string }) {
    const condition = [];

    if (data.email) {
      condition.push(eq(userTable.email, data.email));
    }
    if (data.phone) {
      condition.push(eq(userTable.phone, data.phone));
    }
    const [user] = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
    })
      .from(userTable)
      .where(or(...condition));

    return user;
  }

  async updateUserToken(token: string, userId: string) {
    const [user] = await this.DbProvider.update(userTable)
      .set({ refreshToken: token })
      .where(eq(userTable.id, userId))
      .returning();

    return user;
  }

  async updateByUserId(
    data: Partial<userInsertType>,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable)
      .set(data)
      .where(eq(userTable.id, userId))
      .returning({
        id: userTable.id,
        email: userTable.email,
        phone: userTable.phone,
      });

    return user;
  }

  async getStoredPassword(userId: string) {
    const [storedPassword] = await this.DbProvider.select({
      password: userTable.password,
    })
      .from(userTable)
      .where(eq(userTable.id, userId));

    return storedPassword;
  }
}
