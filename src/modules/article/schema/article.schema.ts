import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ArticleStatus } from 'src/common/enum/articleStatus.enum';
interface Section {
  subHeading: string;
  content: string;
}

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  mainHeading: string;

  @Prop({ required: true })
  intro: string;

  @Prop({
    type: [
      {
        subHeading: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    default: [],
  })
  sections: Section[];

  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  author: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: String,
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ author: 1, status: 1 });
