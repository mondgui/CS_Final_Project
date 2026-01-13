import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Welcome to MusicOnTheGo Backend API!';
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', message: 'Backend server is running' };
  }
}
