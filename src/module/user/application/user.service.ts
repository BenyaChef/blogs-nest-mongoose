import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from '../dto/create.user.dto';
import bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';
import { UserRepository } from '../infrastructure/user.repository';
import { UserQueryRepository } from '../infrastructure/user.query.repository';
import { RegistrationDto } from "../../auth/dto/registration.dto";
import { randomUUID } from "crypto";

@Injectable()
export class UserService {
  constructor(
    protected userRepository: UserRepository,
    protected userQueryRepository: UserQueryRepository,
  ) {}

  async createUser(createDto: CreateUserDto) {
    const passwordHash = await this.generatorHash(createDto.password);
    const newUser = await User.createUser(createDto, passwordHash);
    newUser.emailInfo.isConfirmed = true;
    newUser.emailInfo.confirmationCode = null;
    return this.userRepository.createUser(newUser);
  }

  async registrationUser(createDto: RegistrationDto) {
    const passwordHash = await this.generatorHash(createDto.password);
    const newUser = await User.createUser(createDto, passwordHash);
    return this.userRepository.createUser(newUser);
  }

  async confirmationUserEmail(code: string) {
    const user = await this.userQueryRepository.findUserByEmailRecoveryCode(code)
    if(!user) throw new BadRequestException('codeIsNotExists')
    if(user.emailInfo.isConfirmed) throw new BadRequestException('codeAlreadyIsConfirm')
    await this.userRepository.updateConfirmationStatus(user.id)
  }

  async recoveryPassword(userId: string) {
    const newRecoveryCode = randomUUID();
    return this.userRepository.recoveryPassword(userId, newRecoveryCode);
  }

  async assignNewPassword(newPassword: string, userId: string) {
    const newPasswordHash = await this.generatorHash(newPassword)
    return this.userRepository.assignNewPassword(userId, newPasswordHash)
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.userRepository.deleteUser(userId);
  }

  private async generatorHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
