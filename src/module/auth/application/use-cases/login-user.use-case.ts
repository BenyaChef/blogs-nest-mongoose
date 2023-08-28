import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SessionService } from "../../../sessions/application/session.service";
import { TokenService } from "../jwt.service";

export class LoginUserCommand {
  constructor(public ip: string, public userAgent: string, public userId: string) {
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}
  async execute(command: LoginUserCommand): Promise<{ accessToken, refreshToken }> {
    const { accessToken, refreshToken } = await this.tokenService.createJwt(command.userId)
    await this.sessionService.createSession(command.ip, command.userAgent, command.userId, refreshToken)
    return {
      accessToken,
      refreshToken
    }
  }
}