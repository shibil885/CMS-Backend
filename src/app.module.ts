import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OtpModule } from './modules/otp/otp.module';
import { JwtModule } from '@nestjs/jwt';
import { ArticleModule } from './modules/article/article.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { CookieParserMiddlware } from './common/middleware/cookie-parser.middleware';
import { JwtTokenGenerator } from './util/jwtTokeGenerator.util';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.DATABASE_HOST ||
        ' mongodb+srv://rafacello885:shibil123@cluster0.wpqbu.mongodb.net/CMS-Project',
    ),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET }),
    UserModule,
    OtpModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtTokenGenerator],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddlware).forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'user/(.*)', method: RequestMethod.ALL },
        { path: 'otp/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
