import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const products_ids = products.map(p => p.id);
    const productsFound = await this.ormRepository.find({
      id: In(products_ids),
    });

    return productsFound;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const products_ids = products.map(p => p.id);
    const productsToUpdate = await this.ormRepository.find({
      id: In(products_ids),
    });

    const productsUpdated = productsToUpdate.map(product => {
      const productUpdate = products.find(p => p.id === product.id);
      const newProduct = product;
      if (productUpdate) {
        newProduct.quantity -= productUpdate.quantity;
      }
      delete newProduct.created_at;
      delete newProduct.updated_at;

      return newProduct;
    });

    const productsReturn = await this.ormRepository.save(productsUpdated);

    return productsReturn;
  }
}

export default ProductsRepository;
