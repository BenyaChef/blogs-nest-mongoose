import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UnauthorizedException
} from "@nestjs/common";
import { PasswordRecoveryDto } from "../dto/password.recovery.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthService } from "../application/auth.service";
import { Response } from "express";
import { UserAgent } from "../../../decorators/user.agent.decorator";
import { RegistrationDto } from "../dto/registration.dto";
import { RegistrationEmailResendingDto } from "../dto/registration.email.resending.dto";
import { ConfirmationCodeDto } from "../dto/confirmation.code.dto";

// @SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginUser(loginDto, ip, userAgent);
    if (!result) throw new UnauthorizedException();

    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true, });
    return { accessToken: result.accessToken };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() registrationDto: RegistrationDto) {
    return await this.authService.registrationUser(registrationDto);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() resendingEmailDto: RegistrationEmailResendingDto) {
   return this.authService.registrationResendingEmail(resendingEmailDto.email);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationRegistration(@Body() confirmationCodeDto: ConfirmationCodeDto) {
    return this.authService.confirmationRegistration(confirmationCodeDto.code)
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() recoveryDto: PasswordRecoveryDto) {
    return true
  }
}
