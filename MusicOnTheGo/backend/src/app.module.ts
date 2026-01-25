import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { MessagesModule } from './messages/messages.module';
import { AvailabilityModule } from './availability/availability.module';
import { CommunityModule } from './community/community.module';
import { ResourcesModule } from './resources/resources.module';
import { ReviewsModule } from './reviews/reviews.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { PracticeModule } from './practice/practice.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AppController } from './app.controller';

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
    CommunityModule,
    ResourcesModule,
    ReviewsModule,
    InquiriesModule,
    PracticeModule,
    UploadModule,
    AdminModule,
    WebSocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
