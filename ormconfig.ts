// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * Define o diretório de entidades dinamicamente a partir do NODE_ENV, que deve
 * ser diferente quando executando a CLI do TypeOrm (NODE_ENV=migration), nesse
 * caso o diretório de entidades será o 'src' e será buscado por arquivos
 * TypeScript. Caso o NODE_ENV não seja 'migration' o diretório usado será o
 * dist e serão buscados arquivos JavaScript.
 *
 * @returns caminho de diretório das entidades
 */
function getEntitiesDir() {
  if (process.env.NODE_ENV === 'migration') {
    return path.join(__dirname, 'src', '**', 'entities', '*.entity.ts');
  } else {
    return path.join('dist', 'src', '**', 'entities', '*.entity.js');
  }
}
console.log(`Entidades em ${getEntitiesDir()}`);

module.exports = [
  {
    type: 'postgres',
    host: 'localhost',
    port: 5431,
    username: 'postgres',
    password: 'postgres',
    database: 'nestintro_db_1',
    entities: [getEntitiesDir()],
    migrationsRun: true,
    synchronize: false,
    cli: {
      migrationsDir: path.join('src', 'migrations'),
    },
  },
  {
    name: 'albumsConnection',
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'nestintro_db_2',
    entities: ['dist/src/albums/entities/*.entity.js'],
    migrationsRun: true,
    synchronize: false,
    cli: {
      migrationsDir: path.join('src', 'albums', 'migrations'),
    },
  },
];
