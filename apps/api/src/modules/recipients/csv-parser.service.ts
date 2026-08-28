export class CsvParserService {
  async *parseCSV(buffer: Buffer): AsyncGenerator<any> {
    // Basic mock generator for parsing CSV
    yield { email: 'test@example.com', name: 'Test' };
  }
}
