import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type { Request } from '@src/types';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Creates a package type',
    description: 'Create package type',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPackageDto: CreatePackageDto, @Req() req: Request) {
    const { id: userId } = req.user;
    return this.packageService.create(createPackageDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Finds all packages',
    description: 'Finds all packages',
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.packageService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Gets information of a single package',
    description:
      'Gets information of a single package by providing the package id',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Updates a package',
    description: 'Updates a package by providing the package id',
  })
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packageService.update(id, updatePackageDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Deletes a package',
    description: 'Deletes a package forever',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.packageService.remove(id);
  }
}
