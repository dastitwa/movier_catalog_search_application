import {
    Injectable,
    Logger,
  } from '@nestjs/common';
  
  import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
  
  import { MOVIES_INDEX } from '../movies/constants/index.constants';
  
  import { Movie } from '../movies/interfaces/movie.interface';
  
  @Injectable()
  export class BulkIndexService {
    private readonly logger =
      new Logger(
        BulkIndexService.name,
      );
  
    constructor(
      private readonly elasticsearchService: ElasticsearchService,
    ) {}
  
    async bulkIndex(
      movies: Movie[],
    ): Promise<void> {
      const batchSize = 500;
  
      for (
        let i = 0;
        i < movies.length;
        i += batchSize
      ) {
        const batch =
          movies.slice(
            i,
            i + batchSize,
          );
  
        const operations =
          batch.flatMap(
            (movie) => [
              {
                index: {
                  _index:
                    MOVIES_INDEX,
                  _id: movie.id,
                },
              },
              movie,
            ],
          );
  
        const response =
          await this.elasticsearchService.bulk(
            operations,
          );
  
          if (response.errors) {
            this.logger.error(
              `Batch ${
                i / batchSize + 1
              } contains indexing errors`,
            );
          
            const failedItems =
              response.items.filter(
                (item: any) =>
                  item.index?.error,
              );
          
            this.logger.error(
              JSON.stringify(
                failedItems.slice(0, 5),
                null,
                2,
              ),
            );
          
            continue;
          }
  
        this.logger.log(
          `Indexed ${
            Math.min(
              i + batchSize,
              movies.length,
            )
          } / ${
            movies.length
          } movies`,
        );
      }
    }
  }