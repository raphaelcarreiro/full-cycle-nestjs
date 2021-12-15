import { Inject, Injectable } from '@nestjs/common';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import { InjectModel } from '@nestjs/sequelize';
import { EmptyResultError } from 'sequelize';
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
    @Inject('KAFKA_PRODUCER')
    private kafkaProducer: Producer,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.orderModel.create({
      ...createOrderDto,
      account_id: this.accountStorageService.account.id,
    });

    this.kafkaProducer.send({
      topic: 'transactions',
      messages: [
        {
          key: 'transactions',
          value: JSON.stringify({
            ...createOrderDto,
            ...order,
          }),
        },
      ],
    });

    return order;
  }

  findAll() {
    return this.orderModel.findAll({
      where: {
        account_id: this.accountStorageService.account.id,
      },
    });
  }

  findOneUsingAccount(id: string) {
    return this.orderModel.findOne({
      where: {
        id,
        account_id: this.accountStorageService.account.id,
      },
      rejectOnEmpty: new EmptyResultError('Account with id or token not found'),
    });
  }

  findOne(id: string) {
    return this.orderModel.findByPk(id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const account = this.accountStorageService.account;

    const orderFinder = account ? this.findOneUsingAccount : this.findOne;

    const order = await orderFinder(id);

    order.update(updateOrderDto);

    return order;
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    order.destroy();
  }
}
