import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.product.count();
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({ where: { id, available: true } });

    if (!product) {
      // throw new NotFoundException(`Product with id: ${id} not found`);
      throw new RpcException({
        message: `Product with id: ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);
    return this.product.update({ where: { id }, data: data });
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.product.delete({ where: { id } });
    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }

  async validateProduct(ids: number[]) {
    ids = Array.from(new Set(ids)); // Remove duplicates
    const products = await this.product.findMany({
      where: { id: { in: ids }, available: true },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products are not available',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
