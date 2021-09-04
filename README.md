<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="180" alt="Nest Logo" /></a>

  <a href='https://typeorm.io/'>
    <img src='https://raw.githubusercontent.com/typeorm/typeorm/master/resources/logo_big.png' width='160'/>
  </a>
</p>

Esse projeto demonstra o uso do Framework [Nest](https://nestjs.com/) em
conjunto com o Postgres e TypeOrm. Abaixo seguem alguns passos usados nas
configurações deste projeto para o TypeOrm.

## Sumário

* [Instalação do Nest](#Instalação-do-Nest)
* [Configurações iniciais do projeto](#Configurações-iniciais-do-projeto)
  - [Container com o Postgres](#Container-com-o-Postgres)
  - [TypeORM](#TypeORM)
  - [Entidades e Migrations](#Entidades-e-Migrations)

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
