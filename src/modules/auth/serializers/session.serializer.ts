import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { SessionUserDto } from '../dto/session-user.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(
    user: SessionUserDto,
    done: (err: Error | null, user?: { id: string }) => void,
  ): void {
    try {
      const payload = { id: user.id };
      done(null, payload);
    } catch (error) {
      done(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async deserializeUser(
    payload: { id: string },
    done: (err: Error | null, user?: SessionUserDto) => void,
  ) {
    try {
      const user = await this.authService.deserializeUser({ id: payload.id });
      done(null, user);
    } catch (error) {
      done(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
