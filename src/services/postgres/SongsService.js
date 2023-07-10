const { Pool } = require('pg');

class SongsService {
  #pool;

  constructor() {
    this.pool = new Pool();
  }
}

module.exports = SongsService;
