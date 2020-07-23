import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found!', 400);
    }

    const productsFound = await this.productsRepository.findAllById(products);

    const orderProducts = products.map(product => {
      const productFound = productsFound.find(p => p.id === product.id);

      if (!productFound) {
        throw new AppError('Product does not exist', 400);
      }

      if (
        productFound.quantity <= 0 ||
        productFound.quantity < product.quantity
      ) {
        throw new AppError('Product quantity invalid.', 400);
      }

      return {
        product_id: productFound.id,
        price: productFound.price,
        quantity: product.quantity,
      };
    });

    await this.productsRepository.updateQuantity(products);

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });
    return order;
  }
}

export default CreateOrderService;
