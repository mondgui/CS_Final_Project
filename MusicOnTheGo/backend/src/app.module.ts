import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { MessagesModule } from './messages/messages.module';
import { AvailabilityModule } from './availability/availability.module';
import { PracticeModule } from './practice/practice.module';
import { ResourcesModule } from './resources/resources.module';
import { CommunityModule } from './community/community.module';
import { ReviewsModule } from './reviews/reviews.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    MessagesModule,
    AvailabilityModule,
    PracticeModule,
    ResourcesModule,
    CommunityModule,
    ReviewsModule,
    InquiriesModule,
    AdminModule,
    UploadModule,
  ],
  providers: [ChatGateway],
})
export class AppModule {}
