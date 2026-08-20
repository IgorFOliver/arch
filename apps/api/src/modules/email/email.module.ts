import { Module } from '@nestjs/common';
import { EMAIL_PORT } from './domain/email.port';
import { ResendEmailService } from './infrastructure/resend-email.service';

@Module({
  providers: [{ provide: EMAIL_PORT, useClass: ResendEmailService }],
  exports: [EMAIL_PORT],
})
export class EmailModule {}
