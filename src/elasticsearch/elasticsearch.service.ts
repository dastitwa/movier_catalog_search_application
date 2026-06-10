import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  Client,
  ClientOptions,
} from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    ElasticsearchService.name,
  );

  private readonly client: Client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const clientOptions: ClientOptions = {
      node:
        this.configService.get<string>(
          'ELASTICSEARCH_NODE',
        ) ?? 'https://localhost:9200',

      auth: {
        username:
          this.configService.get<string>(
            'ELASTICSEARCH_USERNAME',
          ) ?? '',
        password:
          this.configService.get<string>(
            'ELASTICSEARCH_PASSWORD',
          ) ?? '',
      },

      tls: {
        rejectUnauthorized: false,
      },

      maxRetries: 3,

      requestTimeout: 10000,

      sniffOnStart: false,
    };

    this.client = new Client(
      clientOptions,
    );
  }

  private async waitForElasticsearch(): Promise<void> {
    const maxAttempts = 5;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        const response =
          await this.client.cluster.health();

        this.logger.log(
          `Elasticsearch connected successfully. Status: ${response.status}`,
        );

        return;
      } catch (error) {
        const delay = Math.min(
          1000 * Math.pow(2, attempt),
          10000,
        );

        this.logger.warn(
          `Elasticsearch unavailable. Retry ${attempt}/${maxAttempts} in ${delay}ms`,
        );

        if (attempt === maxAttempts) {
          throw error;
        }

        await new Promise(
          (resolve) =>
            setTimeout(resolve, delay),
        );
      }
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.waitForElasticsearch();
    } catch (error) {
      this.logger.error(
        'Failed to connect Elasticsearch after retries',
        error,
      );

      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();

    this.logger.log(
      'Elasticsearch connection closed',
    );
  }

  getClient(): Client {
    return this.client;
  }

  private handleElasticsearchError(
    operation: string,
    error: unknown,
  ): never {
    this.logger.error(
      `Elasticsearch ${operation} failed`,
      error instanceof Error
        ? error.stack
        : JSON.stringify(error),
    );

    throw new ServiceUnavailableException(
      'Search service temporarily unavailable',
    );
  }

  async indexExists(
    index: string,
  ): Promise<boolean> {
    try {
      return await this.client.indices.exists({
        index,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'indexExists',
        error,
      );
    }
  }

  async createIndex(
    index: string,
    mapping: Record<string, any>,
  ) {
    try {
      return await this.client.indices.create({
        index,
        mappings: mapping,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'createIndex',
        error,
      );
    }
  }

  async deleteIndex(
    index: string,
  ) {
    try {
      return await this.client.indices.delete({
        index,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'deleteIndex',
        error,
      );
    }
  }

  async getIndex(
    index: string,
  ) {
    try {
      return await this.client.indices.get({
        index,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'getIndex',
        error,
      );
    }
  }

  async search(
    index: string,
    body: Record<string, any>,
  ) {
    try {
      const safeBody = {
        ...body,
      };

      delete safeBody.index;

      return await this.client.search({
        index,
        ...safeBody,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'search',
        error,
      );
    }
  }

  async bulk(
    operations: Record<string, any>[],
  ) {
    try {
      return await this.client.bulk({
        refresh: true,
        operations,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'bulk',
        error,
      );
    }
  }

  async count(
    index: string,
  ) {
    try {
      return await this.client.count({
        index,
      });
    } catch (error) {
      this.handleElasticsearchError(
        'count',
        error,
      );
    }
  }

  async health() {
    try {
      return await this.client.cluster.health();
    } catch (error) {
      this.handleElasticsearchError(
        'health',
        error,
      );
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.ping();

      return true;
    } catch (error) {
      this.logger.error(
        'Elasticsearch ping failed',
        error instanceof Error
          ? error.stack
          : JSON.stringify(error),
      );

      return false;
    }
  }
}