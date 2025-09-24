-- tạo database
CREATE DATABASE testdb;

-- connect into DB 
\c testdb;

-- create table timestamp
CREATE TABLE time_test(
    id SERIAL PRIMARY KEY, 
    ts_with_tz TIMESTAMP WITH TIME ZONE,
    ts_without_tz TIMESTAMP WITHOUT TIME ZONE
);