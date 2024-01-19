import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { EditableUserFields, PublicUser, User } from '@common/models/user';
import { USER_TABLE } from '@app/constants/services-constants/database-const';
import { TypeOfId } from '@common/types/id';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { USER_NOT_FOUND } from '@app/constants/services-errors';
import { StatusCodes } from 'http-status-codes';

@Service()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    userToPublicUser(user: User): PublicUser {
        return {
            username: user.username,
            avatar: user.avatar,
            email: user.email,
        };
    }

    async editUser(idUser: TypeOfId<User>, fields: EditableUserFields): Promise<void> {
        const fieldsToUpdate: EditableUserFields = {};

        // We pick each fields individually to make sure the client doesn't send invalid fields.
        if (fields.avatar) fieldsToUpdate.avatar = fields.avatar;
        if (fields.username) fieldsToUpdate.username = fields.username;

        if (Object.keys(fieldsToUpdate).length > 0) await this.table.where({ idUser }).update(fieldsToUpdate);
    }

    async getUserById(idUser: TypeOfId<User>): Promise<User> {
        const user = await this.table.where({ idUser }).select('*').first();

        if (!user) throw new HttpException(USER_NOT_FOUND, StatusCodes.NOT_FOUND);

        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.table.where({ email }).select('*').first();

        if (!user) throw new HttpException(USER_NOT_FOUND, StatusCodes.NOT_FOUND);

        return user;
    }

    async getPublicUserById(idUser: TypeOfId<User>): Promise<PublicUser> {
        return this.userToPublicUser(await this.getUserById(idUser));
    }

    private get table() {
        return this.databaseService.knex<User>(USER_TABLE);
    }
}
