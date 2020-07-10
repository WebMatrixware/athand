'use strict';

exports.checkForUser = `
SELECT EXISTS (
	SELECT users.user_id
	FROM users
	WHERE users.user_id = ?
) AS 'exists';
`;

exports.createUser = `
INSERT INTO users (user_login, user_email, user_hash)
	VALUES (?, ?, ?);
`;

exports.deleteUser = `
DELETE FROM users
	WHERE users.user_id = ?;
`;

exports.getUserDetails = `
SELECT users.user_id AS 'id'
	, users.user_login AS 'login'
	, users.user_email AS 'email'
	, users.emp_id AS 'employee'
	FROM users
	WHERE users.user_id = ?;
`;

exports.getUserHash = `
SELECT users.user_hash
	FROM users
	WHERE users.user_id = ?;
`;

exports.getUsersList = `
SELECT users.user_login AS 'login'
	, users.user_email AS 'email'
	, CONCAT(employees.emp_fname, ' ', employees.emp_lname) AS 'name'
	FROM users
	LEFT JOIN employees ON (users.emp_id = employees.emp_id);
`;