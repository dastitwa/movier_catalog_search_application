import * as fs from 'fs';
import csv from 'csv-parser';
import { Logger } from '@nestjs/common';

export class CsvReaderService {
  private readonly logger = new Logger(
    CsvReaderService.name,
  );

  async waitForFile(
    filePath: string,
    retries = Number(
      process.env.INGESTION_RETRIES ?? 5,
    ),
    delayMs = Number(
      process.env.INGESTION_RETRY_DELAY_MS ??
        3000,
    ),
  ): Promise<void> {
    for (
      let attempt = 1;
      attempt <= retries;
      attempt++
    ) {
      if (fs.existsSync(filePath)) {
        this.logger.log(
          `CSV found: ${filePath}`,
        );

        return;
      }

      this.logger.warn(
        `CSV not found (${attempt}/${retries}): ${filePath}`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delayMs),
      );
    }

    throw new Error(
      `CSV file not found after ${retries} retries: ${filePath}`,
    );
  }

  async readCsv(
    filePath: string,
  ): Promise<Record<string, string>[]> {
    await this.waitForFile(filePath);

    this.logger.log(
      `Reading CSV file: ${filePath}`,
    );

    return new Promise((resolve, reject) => {
      const rows: Record<
        string,
        string
      >[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rows.push(data);
        })
        .on('end', () => {
          this.logger.log(
            `Loaded ${rows.length} rows from ${filePath}`,
          );

          resolve(rows);
        })
        .on('error', (error) => {
          this.logger.error(
            `Failed to read ${filePath}`,
            error,
          );

          reject(error);
        });
    });
  }
}