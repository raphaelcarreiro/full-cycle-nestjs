import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { SequelizeModule } from '@nestjs/sequelize';
import Order from './orders/entities/order.entity';
import { join } from 'path';
import { AccountsModule } from './accounts/accounts.module';
import Account from './accounts/entities/account.entity';

@Module({
  imports: [
    OrdersModule,
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      host: join(__dirname, 'database.sqlite'),
      models: [Order, Account],
      autoLoadModels: true,
    }),
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
