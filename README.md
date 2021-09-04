<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Descrição

Esse projeto demonstra o uso do Framework [Nest](https://nestjs.com/) em
conjunto com o Postgres e TypeOrm. Abaixo seguem alguns passos usados na
configurações deste projeto.

## Instalação do Nest

Inicialmente, atualize o NPM ou o Yarn e então instale o Nest globalmente na sua
máquina.

```
npm i -g nestjs
```

Agora o binário `nest` está instalado localmente e pode ser usado para gerar um
projeto inicial do Nest, usando o seguinte comando (substituindo o
`meu-projeto-nest` pelo nome do seu projeto).

```
nest new meu-projeto-nest
```

## Configurações iniciais do projeto

Por padrão o projeto criado possui algumas classes definidas com o nome de App
(`AppModule`, `AppService`, `AppController`). É possível executar a aplicação
que possui um endpoint que retorna um "Hello, World". Para eceutar a aplicação
em modo _watching_ use `npm run start:dev`.

### Container com o Postgres

Para automatizar a execução de um servidor SGBD do PostgreSQL, foi usado aqui o
Docker e Docker Compose. Foi criado um arquivo de configuração do Compose
(`docker-compose.yml`) contendo somente as definições de um serviço do postgres.
Dessa forma, é possui subir um banco de dados vazio com um simples
`docker-compose up`.

O conteúdo do `docker-compose.yml` inicial:

```yaml
version: '3'
services:
  school_db:
    image: postgres
    environment:
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=nestschool
    ports:
      - 5432:5432
```

### TypeORM

Tendo um meio de subir um banco de dados, vamos configurar o TypeOrm.

O Nest já fornece uma boa integração com o TypeOrm através de um pacote que
fornece um `TypeOrmModule`, então, instale-o junto com o próprio TypeOrm e o
pacote do Postgres:

```
npm i @nestjs/typeorm typeorm pg
```

O TypeOrm usa um arquivo de configuração para a conexão com o banco de dados
chamado de `ormconfig`. Aqui, como estamos usando TypeScript (usado pelo Nest
por padrão) criamos um `ormconfig.ts` com o seguinte conteúdo:

```ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'nesttestdb',
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrationsRun: true,
  cli: {
    migrationsDir: path.join('src', 'migrations'),
  },
  synchronize: true,
};
```
Esses são os campos básico de uma conexão de banco de dados usada na maioria dos
drivers de database do Node, então vamos atentar para alguns campos específicos:

* `entities`: uma lista de strings definindo os caminhos ondes estarão os
arquivos de entidades do banco de dados. Foi usado o `path.join` para gerar a
string de caminho independente de sistema de arquivos e o `__dirname` foi usado
aqui para que seja possível encontrar o diretório tanto nos arquivos TypeScript
quanto nos arquivos gerados pelo compando `build` que são criados no diretório
`./dist`.

* `migrationsRus`: uma flag que define se as _migrations_ devem ser executadas
quando a aplicação subir.

* `cli.migrationsDir`: diretório onde devem ser criadas as migrations.

* `synchronize`: uma flag que define se as classes de entidades e as tabelas do
banco devem estar sempre em acordância. **NÃO DEVE SER USADO TRUE EM PRODUÇÂO**.

Além disso, vamos criar um script no `package.json` para facilitar usar a `cli`
do TypeOrm. Primeiro instalamos o `cross-env` como dependência de
desenvolvimento para que possamos definir variáveis de ambiente nos scripts
(independente de plataforma), e então iremos definir o `NODE_ENV=migration`
no script do typeorm, assim todas as vezes que executarmos o typeorm usando o 
`npm run` iremos ter um ambiente específico e podemos usar isso para definir 
algumas configurações do TypeOrm.

```
npm install --save-dev cross-env
```

E no `package.json`:

```json
"typeorm": "cross-env NODE_ENV=migration node --require ts-node/register ./node_modules/typeorm/cli.js",
"migration:generate": "npm run typeorm migration:generate -- -n",
"migrations": "npm run typeorm migration:run"
```

Após isso, vamos voltar ao `ormconfig.ts` e adicionar um função que define o
diretório de entidades a partir de `NODE_ENV` atual, isso é útil para que
possamos executar a `cli` do TypeOrm usando os arquivos `*.ts` em `src` (sem
precisar de um `build` da aplicação).

```ts
// ormconfig.ts

function getEntitiesDir(): string {
  const ext = process.env.NODE_ENV === 'migration' ? 'ts':'js';
  const basePath = process.env.NODE_ENV === 'migration' ? __dirname:'dist';
  return path.join(basePath, 'src', '**', 'entities', `entity.${ext}`);
}

module.exports = {
  // ...
  entities: [getEntitiesDir()],
  // ...
};
```

O `TypeOrmModule` deve ser importado no `AppModule` (ou em outro módulo que você
queira que mantenha a conexão com o banco de dados). Então, no arquivo
`app.module.ts`, adicione o `TypeOrmModule` no campo de _imports_ do decorator.

```ts
//...

@Module({
  imports: [TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
Com isso a conexão com o banco de dados deve estar configurada, você pode testar
subindo o container do Postgres e então subindo a aplicação logo depois:

```
docker-compose up
npm run start:dev
```

e pode testar com a build da aplicação:

```
docker-compose up
npm run build
npm start
```

### Entidades e Migrations

Nessa aplicação de exemplo vamos criar uma API REST para tarefas que vamos
chamar de `tasks`. Podemos criar algumas classes usando a CLI do Nest:

```
nest g module tasks
nest g controller tasks
nest g service tasks
```

Dado que temos todas as classes relacionadas a Tasks (`TasksModule`,
`TasksController`, `TasksService`), vamos criar a nossa primeira entidade.
No diretório `src/tasks` que foi criado pelo Nest, foi criado um subdiretório
`entities` com o arquivo `task.entity.ts` que terá a classe que representa a
nossa entidade de tarefa.

Uma versão simples (inicial) da entidade Task:

```ts
@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 128 })
  description: string;

  @Column({ length: 32 })
  owner: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

Depois adicione essa classe na importação do TypeOrm no `TasksModule`.

```ts
// tasks.module.ts
// ...
imports: [TypeOrmModule.forFeature([Task])],
// ...
```

Com isso em mão temos que gerar uma migration para que quando a aplicação for
inciada ela faça as alterações no banco de dados. Para criar uma migration,
usamos a CLI do TypeOrm através do script `migration:generate` que criamos no
`package.json`.

Depois de ter criado a entidade, use:

```
npm run migration:generate CreateTableTask
```


## License

Nest is [MIT licensed](LICENSE).
