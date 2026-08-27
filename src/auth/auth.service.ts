import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (existingTenant) {
      throw new ConflictException('tenantSlug já está em uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug: dto.tenantSlug,
        },
      });

      const adminRole = await tx.role.create({
        data: {
          name: 'admin',
          tenantId: tenant.id,
        },
      });

      const permissions = await tx.permission.findMany();

      await tx.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: adminRole.id,
          permissionId: permission.id,
        })),
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          tenantId: tenant.id,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        user: {
          id: user.id,
          email: user.email,
        },
      };
    });
  }

  async login(dto: LoginDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant) {
      throw new UnauthorizedException('credenciais inválidas');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: dto.email,
          tenantId: tenant.id,
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
      },
    };
  }
}
