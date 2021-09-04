// eslint-disable-next-line @typescript-eslint/no-var-requires
const join = require('path').join;

/**
 * Define o diretório de entidades dinamicamente a partir do NODE_ENV, que deve
 * ser diferente quando executando a CLI do TypeOrm (NODE_ENV=migration), nesse
 * caso o diretório de entidades será o 'src' e será buscado por arquivos
 * TypeScript. Caso o NODE_ENV não seja 'migration' o diretório usado será o
 * dist e serão buscados arquivos JavaScript.
 *
 * @returns caminho de diretório das entidades
 */
function getEntitiesDir(): string {
  if (process.env.NODE_ENV === 'migration') {
    return join(__dirname, 'src', '**', 'entities', '*.entity.ts');
  } else {
    return join('dist', 'src', '**', 'entities', '*.entity.js');
  }
}
console.log(`Entidades em ${getEntitiesDir()}`);

module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [getEntitiesDir()],
  migrationsRun: true,
  cli: {
    migrationsDir: join('src', 'migrations'),
  },
  synchronize: true,
};
