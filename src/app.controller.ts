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

  // @Get('profiles')
  // async filter(
  //   @Query('gender') gender: string,
  //   @Query('country_id') country_id: string,
  //   @Query('age_group') age_group: string,
  // ) {
  //   return this.appService.GetAllProfileWithOptionalFilters(
  //     gender,
  //     country_id,
  //     age_group,
  //   );
  // }

  @Get('profiles')
  async filter(
    // @Query('gender') gender: string,
    // @Query('country_id') country_id: string,
    // @Query('age_group') age_group: string,
    // @Query('min_age') min_age: number,
    // @Query('max_age') max_age: number,
    // @Query('min_gender_probability') min_gender_probability: number,
    // @Query('min_country_probability') min_country_probability: number,
    @Query() query: FetchProfilesDto,
  ) {
    return this.appService.GetAllProfileWithOptionalFilters(
      query,
      // query.gender,
      // query.country_id,
      // query.age_group,
      // query.min_age,
      // query.max_age,
      // query.min_gender_probability,
      // query.min_country_probability,
      // query.sort_by,
      // query.order,
      // query.page,
      // query.limit,
    );
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
