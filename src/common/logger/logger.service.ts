import {
    Injectable,
    Logger,
  } from '@nestjs/common';
  
  @Injectable()
  export class AppLogger extends Logger {
    logExecutionTime(
      operation: string,
      time: number,
    ): void {
      this.log(
        `${operation} completed in ${time.toFixed(2)}ms`,
      );
    }
  }