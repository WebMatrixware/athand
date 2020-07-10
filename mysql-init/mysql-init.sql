CREATE SCHEMA athand;

CREATE TABLE athand.users (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_login VARCHAR(120) NOT NULL,
  user_email VARCHAR(120) NOT NULL,
  user_hash VARCHAR(161) NOT NULL,
  emp_id BIGINT
);

CREATE TABLE athand.employees (
  emp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  emp_fname VARCHAR(20),
  emp_lname VARCHAR(20),
  emp_dob DATE,
  emp_startdate DATE,
  bu_id BIGINT
);

CREATE TABLE athand.business_units (
  bu_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  bu_name VARCHAR(20),
  bu_manager_emp_id BIGINT
);

CREATE TABLE athand.time_types (
  time_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  time_type_name VARCHAR(120)
);

CREATE TABLE athand.transactions (
  transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_timestamp TIMESTAMP,
  emp_id BIGINT NOT NULL,
  request_id BIGINT NOT NULL,
  transaction_type_id BIGINT NOT NULL,
  time_type_id BIGINT NOT NULL,
  transaction_value DECIMAL
);

CREATE TABLE athand.requests (
  request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_startdate DATE,
  request_starttime TIME,
  request_enddate DATE,
  request_endtime TIME,
  status_type_id BIGINT NOT NULL,
  request_notes TEXT,
  request_type_id BIGINT NOT NULL,
  emp_id BIGINT NOT NULL
);

CREATE TABLE athand.transaction_types (
  transaction_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_type_name VARCHAR(40),
  transaction_type_action TINYTEXT
);

CREATE TABLE athand.sessions (
  session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  session_start DATETIME CURRENT_TIMESTAMP
);

CREATE TABLE athand.status_types (
  status_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  status_type_name VARCHAR(40),
  status_type_description TINYTEXT
);

CREATE TABLE athand.request_tyeps (
  request_tyep_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_type_name VARCHAR(40),
  request_type_description TINYTEXT
);