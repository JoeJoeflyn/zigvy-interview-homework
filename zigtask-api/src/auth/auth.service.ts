import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'lib/prisma';
import { LoginDto, RegisterDto } from './auth.dto';

const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async generateTokens(payload: any) {
    // Generate both access and refresh tokens in parallel
    const [accessToken, refreshToken] = await Promise.all([
      // Standard access token with default expiration
      this.jwtService.signAsync(payload),
      // Refresh token with custom expiration from environment variables
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async registerUser(data: RegisterDto) {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    // Create new user in the database
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      email: user.email,
      message: 'User registered successfully',
    };
  }

  async loginUser(data: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    // Verify password matches the stored hash
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(data.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens for the authenticated user
    const payload = { sub: user.id, email: user.email };
    const tokens = await this.generateTokens(payload);

    return {
      ...tokens,
      message: 'Login successful',
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify the refresh token is valid
    const payload = await this.jwtService.verifyAsync(refreshToken);

    // Check if user still exists
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens with updated expiration
    const newPayload = { sub: user.id, email: user.email };
    const tokens = await this.generateTokens(newPayload);

    return {
      ...tokens,
      message: 'Token refreshed successfully',
    };
  }
}
