const redis = require('redis');

class CacheService {
  #client;

  constructor() {
    this.#client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });
    this.#client.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
    this.#client.connect();
  }

  async set(key, value, expirationInSeconds = 3600) {
    await this.#client.set(key.toString(), value.toString(), {
      EX: expirationInSeconds,
    });
  }

  async get(key) {
    const result = await this.#client.get(key);

    if (result === null) throw new Error('Cache tidak ditemukan');

    return result;
  }

  delete(key) {
    return this.#client.del(key);
  }
}

module.exports = CacheService;
