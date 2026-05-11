import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  ExportToCSVDto,
  FetchProfilesDto,
  NaturalLanguageSearchQueryDto,
  PostRequestDTO,
} from './app.dto';
import type { Response } from 'express';
import { ProfileGuard } from './common/guard/profile.guard';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './common/guard/admin.guard';
import { IsActiveStatusGuard } from './common/guard/is_active_status.guard';

@UseGuards(ProfileGuard, AuthGuard, IsActiveStatusGuard)
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AdminGuard)
  @Post('profiles')
  async postRequest(@Body() postRequestBody: PostRequestDTO) {
    const name = postRequestBody.name;

    return this.appService.ProcessProfilePostRequestFunction(name);
  }

  @Get('profiles')
  async filter(@Query() query: FetchProfilesDto) {
    return this.appService.GetAllProfileWithOptionalFilters(query);
  }

  @Get('profiles/search')
  async QuerySearchFunction(@Query() query: NaturalLanguageSearchQueryDto) {
    console.log('profile/search was hit. Controller speaking here.');

    return this.appService.NaturalLanguageQueryService(
      query.q,
      query.page,
      query.limit,
    );
  }

  @UseGuards(AdminGuard)
  @Get('profiles/export')
  async ExportProfiles(@Query() query: ExportToCSVDto, @Res() res: Response) {
    return this.appService.HandleExportService(query, res);
  }

  @Get('profiles/:id')
  async fetchSingleProfile(@Param('id') id: string) {
    return this.appService.ProcessGetProfileUsingId(id);
  }

  @UseGuards(AdminGuard)
  @HttpCode(204)
  @Delete('profiles/:id')
  async deleteProfile(@Param('id') id: string) {
    await this.appService.DeleteProfileFunction(id);
  }
}
