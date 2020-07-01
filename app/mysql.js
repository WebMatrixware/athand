'use strict';

exports.getUsersList = `
SELECT users.user_login AS 'login'
	, users.user_email AS 'email'
	, CONCAT(employees.emp_fname, ' ', employees.emp_lname) AS 'name'
	FROM users
	LEFT JOIN employees ON (users.emp_id = employees.emp_id)
`;