// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Req,
//   Res,
//   UseGuards,
//   HttpStatus,
//   Query,
// } from '@nestjs/common';
// import { EarningService } from './earning.service';
// import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from '@src/auth/guards/roles.guard';
// import { Roles } from '@src/auth/decorators/roles.decorators';
// import { InitializeEarningDto } from '@src/earning/dto/initialize-earning.dto';
// import type { Response } from 'express';
// import type { Request } from '@src/types';
// import {  ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';

// @Controller('earning')
// export class EarningController {
//   constructor(private readonly earningService: EarningService) {}


//   // ! ===================================  admin section   ==============================

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Post('/initialize')
//  @ApiCookieAuth('access_token')
//   @ApiOperation({
//     description: 'Initialize withdrawal',
//     summary: 'Admin initialize withdrawal',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Withdrawal initialized',
//   })
//   async initializeEarnings(
//     @Body() body: InitializeEarningDto,
//     @Res() res: Response,
//   ) {
//     const earning = await this.earningService.initializePayout(body);
//     res.status(HttpStatus.OK).json({ message: 'success', data: earning });
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Patch('status/update/:userId')
//  @ApiCookieAuth('access_token')
//   @ApiOperation({
//     description: 'Update earning approved status',
//     summary: 'Update earning approved status',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Earning  approved status updated successfully',
//   })
//   async updateEarningApprovedStatus(
//     @Query('approved') approved: boolean,
//     @Param('userId') userId: string,
//     @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     // const { id: userId } = req.user;
//     const earning = await this.earningService.updateEarningApprovedStatus(
//       approved,
//       userId,
//     );
//     res.status(HttpStatus.OK).json({ message: 'success', data: earning });
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Get('list/unapproved')
//  @ApiCookieAuth('access_token')
//   @ApiOperation({
//     description: 'Admin lists and see all unapproved payouts',
//     summary: 'list all unapproved payouts',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Data fetched successfully',
//   })
//   async listAllUnapprovedEarnings(
//     @Query('approved') approved: boolean,
//     // @Req() req: Request,
//     @Res() res: Response,
//   ) {
//     const earning = await this.earningService.listAllUnapprovedEarnings();
//     res.status(HttpStatus.OK).json({ message: 'success', data: earning });
//   }


  
// }
