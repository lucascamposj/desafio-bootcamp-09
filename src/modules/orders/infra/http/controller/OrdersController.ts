import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;
    const findOrderService = container.resolve(CreateOrderService);

    const order = await findOrderService.execute({ customer_id, products });
    return response.json(order);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const createOrderService = container.resolve(FindOrderService);

    const order = await createOrderService.execute({ id });
    return response.json(order);
  }
}
