# loopback-benchmark-mysql

Inspiring from [loopback-benchmark-mysql](https://github.com/strongloop-community/loopback-benchmark-mongodb).

## setup mysql
```
create database loopback_benchmarks;
use loopback_benchmarks;
create table if not exists Todo(
  id INT(11) NOT NULL AUTO_INCREMENT,
  content VARCHAR(45),
  PRIMARY KEY (id)
);
```