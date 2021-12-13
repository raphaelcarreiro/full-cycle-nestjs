import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountStorageService } from 'src/accounts/account-storage/account-storage.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import Order from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    private accountStorageService: AccountStorageService,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    return this.orderModel.create({
      ...createOrderDto,
      account_id: this.accountStorageService.account.id,
    });
  }

  findAll() {
    return this.orderModel.findAll({
      where: {
        account_id: this.accountStorageService.account.id,
      },
    });
  }

  findOne(id: string) {
    return this.orderModel.findByPk(id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    order.update(updateOrderDto);

    return order;
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    order.destroy();
  }
}
