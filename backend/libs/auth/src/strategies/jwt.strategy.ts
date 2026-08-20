import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'fallback_secret_key_for_dev',
      ),
    });
  }

  async validate(payload: any) {
    // The payload is what we signed in auth.service.ts
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    // We attach this to the Express Request object automatically
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
