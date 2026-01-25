import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from '../utils/emailService';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, role, instruments, experience, location, instrument } = registerDto;

    // Normalize instruments into always an array
    const instrumentList = Array.isArray(instruments)
      ? instruments
      : instruments
      ? [instruments]
      : instrument
      ? [instrument] // support older front-end
      : [];

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        instruments: instrumentList,
        experience: experience || '',
        location: location || '',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instruments: true,
      },
    });

    // Create JWT token
    const token = this.jwtService.sign(
      { id: newUser.id, role: newUser.role },
      { expiresIn: '7d' },
    );

    return {
      message: 'User registered successfully',
      token,
      user: newUser,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password.');
    }

    // Create token
    const token = this.jwtService.sign(
      { id: user.id, role: user.role },
      { expiresIn: '7d' },
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        instruments: user.instruments,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: "If an account with that email exists, we've sent password reset instructions.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration (1 hour from now)
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires,
      },
    });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

    let resetUrl;
    if (frontendUrl.startsWith('musiconthego://') || frontendUrl.startsWith('exp://')) {
      resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    } else if (frontendUrl.startsWith('http://') || frontendUrl.startsWith('https://')) {
      resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    } else {
      resetUrl = `musiconthego://reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    }

    // Send email
    try {
      await sendPasswordResetEmail(email, resetToken, resetUrl);
      console.log('✅ Password reset email successfully sent to:', email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
    }

    return {
      message: "If an account with that email exists, we've sent password reset instructions.",
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, email, newPassword } = resetPasswordDto;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired reset token. Please request a new password reset.',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: '',
        resetPasswordExpires: new Date(0), // Set to epoch to ensure it's always expired
      },
    });

    // Send confirmation email
    try {
      await sendPasswordResetConfirmation(email);
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
    }

    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
