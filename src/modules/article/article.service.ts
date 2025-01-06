import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types, isValidObjectId } from 'mongoose';
import { Article } from './schema/article.schema';
import { CreateArticleDto } from 'src/common/dto/createArticle.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private readonly _ArticleModel: Model<Article>,
  ) {}

  async create(
    userId: string,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    try {
      const author = new Types.ObjectId(userId);
      const article = new this._ArticleModel({
        ...createArticleDto,
        author,
      });
      return await article.save();
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: string, page = 1, limit = 10) {
    console.log('ff', userId);
    const skip = (page - 1) * limit;
    const parsedUser = new Types.ObjectId(userId);
    console.log('parsed', isValidObjectId(userId));
    console.log('parsed', parsedUser);
    const [articles, total] = await Promise.all([
      this._ArticleModel
        .find({ author: parsedUser })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this._ArticleModel.countDocuments({ author: parsedUser }),
    ]);
    return { articles, total, page };
  }

  async findOne(id: string): Promise<Article> {
    console.log('gggg');
    const article = await this._ArticleModel.findById(id).lean().exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(
    id: string,
    updateData: Partial<CreateArticleDto>,
  ): Promise<Article> {
    const article = await this._ArticleModel
      .findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .exec();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async delete(id: string): Promise<void> {
    const result = await this._ArticleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Article not found');
    }
  }

  // Advanced queries
  async findByTags(tags: string[]): Promise<Article[]> {
    return this._ArticleModel
      .find({ tags: { $in: tags } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findByAuthor(author: string, status?: string): Promise<Article[]> {
    const query: FilterQuery<Article> = { author };
    if (status) {
      query.status = status;
    }
    return this._ArticleModel.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  async updateSection(
    articleId: string,
    sectionIndex: number,
    subHeading: string,
    content: string,
  ): Promise<Article> {
    const article = await this._ArticleModel.findById(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (sectionIndex >= article.sections.length) {
      throw new BadRequestException('Section index out of bounds');
    }

    article.sections[sectionIndex] = { subHeading, content };
    return article.save();
  }

  async addSection(
    articleId: string,
    section: { subHeading: string; content: string },
  ): Promise<Article> {
    const article = await this._ArticleModel.findById(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    article.sections.push(section);
    return article.save();
  }

  async removeSection(
    articleId: string,
    sectionIndex: number,
  ): Promise<Article> {
    const article = await this._ArticleModel.findById(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (sectionIndex >= article.sections.length) {
      throw new BadRequestException('Section index out of bounds');
    }

    article.sections.splice(sectionIndex, 1);
    return article.save();
  }
}
