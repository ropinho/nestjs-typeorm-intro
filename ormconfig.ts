// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'nestschool',
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrationsRun: true,
  cli: {
    migrationsDir: path.join('src', 'migrations'),
  },
  synchronize: true,
};
