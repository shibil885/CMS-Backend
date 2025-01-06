import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseIntPipe,
  Res,
  Req,
} from '@nestjs/common';
import { CreateArticleDto } from 'src/common/dto/createArticle.dto';
import { ArticleService } from './article.service';
import { Request, Response } from 'express';
import { ApiResponse } from 'src/util/response.util';
import { successResponse } from 'src/common/enum/successResponse.enum';
import { Article } from './schema/article.schema';

@Controller('articles')
export class ArticleController {
  constructor(private readonly _articleService: ArticleService) {}
  @Get('')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    const result = await this._articleService.findOne(id);
    const response = ApiResponse.successResponse(
      successResponse.SINGLE_ARTICLE,
      result,
      HttpStatus.OK,
    );
    return res.json(response);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    const result = await this._articleService.create(
      req['user']._id,
      createArticleDto,
    );
    const response = ApiResponse.successResponse(
      successResponse.ARTICLE_CREATED,
      result,
      HttpStatus.CREATED,
    );
    return res.json(response);
  }

  @Get('findAll')
  async findAllArticles(
    @Res() res: Response,
    @Req() req: Request,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit', new ParseIntPipe()) limit: number,
  ) {
    try {
      const result = await this._articleService.findAll(
        req['user']._id,
        page,
        limit,
      );
      const response = ApiResponse.successResponse<Article[]>(
        successResponse.ALL_ARTICLES,
        result.articles,
        HttpStatus.OK,
        { page: result.page, total: result.total },
      );
      return res.json(response);
    } catch (error) {
      console.error('Error occurred while fetching articles:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: Partial<CreateArticleDto>,
  ) {
    return {
      statusCode: HttpStatus.OK,
      data: await this._articleService.update(id, updateArticleDto),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this._articleService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article deleted successfully',
    };
  }

  @Post(':id/sections')
  async addSection(
    @Param('id') id: string,
    @Body() section: { subHeading: string; content: string },
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      data: await this._articleService.addSection(id, section),
    };
  }

  @Put(':id/sections/:sectionIndex')
  async updateSection(
    @Param('id') id: string,
    @Param('sectionIndex', ParseIntPipe) sectionIndex: number,
    @Body() section: { subHeading: string; content: string },
  ) {
    return {
      statusCode: HttpStatus.OK,
      data: await this._articleService.updateSection(
        id,
        sectionIndex,
        section.subHeading,
        section.content,
      ),
    };
  }

  @Delete(':id/sections/:sectionIndex')
  async removeSection(
    @Param('id') id: string,
    @Param('sectionIndex', ParseIntPipe) sectionIndex: number,
  ) {
    return {
      statusCode: HttpStatus.OK,
      data: await this._articleService.removeSection(id, sectionIndex),
    };
  }

  @Get('by-tags')
  async findByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',');
    return {
      statusCode: HttpStatus.OK,
      data: await this._articleService.findByTags(tagArray),
    };
  }

  @Get('by-author/:author')
  async findByAuthor(
    @Param('author') author: string,
    @Query('status') status?: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      data: await this._articleService.findByAuthor(author, status),
    };
  }
}
