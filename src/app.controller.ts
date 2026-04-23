import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  FetchProfilesDto,
  NaturalLanguageSearchQueryDto,
  PostRequestDTO,
} from './app.dto';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('profiles')
  async postRequest(@Body() postRequestBody: PostRequestDTO) {
    const name = postRequestBody.name;

    return this.appService.ProcessPostRequestFunction(name);
  }

  @Get('profiles')
  async filter(@Query() query: FetchProfilesDto) {
    return this.appService.GetAllProfileWithOptionalFilters(query);
  }

  @Get('profiles/search')
  async QuerySearchFunction(@Query() query: NaturalLanguageSearchQueryDto) {
    console.log('profile/search was hit.  Controller speaking here.');

    return this.appService.NaturalLanguageQueryService(
      query.q,
      query.page,
      query.limit,
    );
  }

  @Get('profiles/:id')
  async fetchSingleProfile(@Param('id') id: string) {
    return this.appService.ProcessGetProfileUsingId(id);
  }

  @HttpCode(204)
  @Delete('profiles/:id')
  async deleteProfile(@Param('id') id: string) {
    this.appService.DeleteProfileFunction(id);
  }
}
