create database dindin;

create table usuarios(
id serial primary key,
  nome text not null,
  email text not null unique,
  senha text not null
);

create table categorias(id  serial primary key,
descricao text not null)


create table transacoes (
id serial primary key,
descricao text not null,
valor integer not null,
data date not null,
categoria_id integer not null references  categorias(id),
usuario_id integer not null references  usuarios(id),
tipo text not null)

 
INSERT INTO categorias (descricao) VALUES
  ('Alimentação'),
  ('Assinaturas'),
  ('Casa'),
  ('Mercado'),
  ('Cuidados'),
  ('Educação'),
  ('Família'),
  ('Lazer'),
  ('Pets'),
  ('Presentes'),
  ('Roupas'),
  ('Saúde'),
  ('Transporte'),
  ('Salário'),
  ('Vendas'),
  ('Outras receitasn/a'),
  ('Outras despesas n/a.');