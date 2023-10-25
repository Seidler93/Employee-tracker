const inquirer = require('inquirer');
const mysql = require('mysql2');
const employee = require('./routes/employee');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'sqluser',
    password: 'password',
    database: 'staff_db'
  },
  console.log(`Connected to the staff_db database.`)
);

const departments = [];
const roles = [];
const employees = [];
let employeeList;
let departmentDataArray;
let roleDataArray;
let employeeDataArray;

function getData() {
  db.query('SELECT * FROM department', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      return console.error(err);
    } else {
      departmentDataArray = results;
      results.forEach(department => departments.push(department.department_name));
    }
  }) 
  db.query('SELECT * FROM role', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      return console.error(err);
    } else {
      roleDataArray = results;
      results.forEach(role => roles.push(role.title))
    }
  })
  db.query('SELECT * FROM employee', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      return console.error(err);
    } else {
      employeeDataArray = results;
      results.forEach(employee => employees.push(`${employee.first_name} ${employee.last_name}`));
      const ids = [] 
      employeeDataArray.forEach(employee => ids.push(employee.id));
      employeeList = employees.map((name, index) => `${name}, Id: ${ids[index]}`)
    }
  })
}

function init () {
  getData()
  return inquirer
    .prompt([
      {
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Add Department', 'Add Employee', 'Add Role', 'Update Department', "Update Employee", 'Update Role', 'View All Departments', 'View All Employees', 'View All Roles', 'Remove Department', 'Remove Employee', 'Remove Role','Quit' ],
        name: 'option'
      }
    ])
    .then(({option}) => {
      switch (option) {
        case 'Add Department':
          addDepartment()
          break;
        case 'Add Employee':
          addEmployee()
          break;
        case 'Add Role':
          addRole()
          break;
        case 'Update Department':
          updateDepartment()
          break;
        case 'Update Employee':
          updateEmployee()
          break;
        case 'Update Role':
          updateRole()
          break;
        case 'View All Departments':
          console.table(departmentDataArray)
          init()
          break;
        case 'View All Employees':
          console.table(employeeDataArray)
          init()
          break;
        case 'View All Roles':
          console.table(roleDataArray)
          init()
          break;
        case 'Remove Department':
          removeDepartment()
          break;
        case 'Remove Employee':
          removeEmployee()
          break;
        case 'Remove Role':
          removeRole()
          break;
        default:
      }
    })
}

init();

function addDepartment() {
  return inquirer
  .prompt([
    {
      type: 'input',
      message: 'Please enter the name of the department',
      name: 'departmentName',
    },
  ])
  .then(({ departmentName }) => {
    console.log(`Adding department: ${departmentName}`);

    const sql = 'INSERT INTO department (department_name) VALUES (?)';
    db.query(sql, departmentName, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log(results);
      }
    })
    getDepartments()
  })
}

function removeDepartment() {
  const departments = []
  db.query('SELECT department_name FROM department', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      console.error(err);
    } else {
      results.forEach(department => {
        departments.push(department.department_name);
      });
      inquirer
        .prompt([
          {
            type: 'list',
            message: 'Which department would you like to remove?',
            choices: departments, 
            name: 'removeDep',
          },
        ])
        .then(({ removeDep }) => {
          console.log(`Removing department: ${removeDep}`);

          const sql = 'DELETE FROM department WHERE department_name = ?';
          db.query(sql, removeDep, function (err, results) {
            if (err) {
              console.error(err);
              init()
            } else {
              console.log('Department removed.');
              init()
            }
          });
        });
    }
  });
}

function updateDepartment() {
  const departments = []
  let departmentsArray;
  db.query('SELECT * FROM department', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      console.error(err);
    } else {
      departmentsArray = results
      results.forEach(department => {
        departments.push(department.department_name);
      });
      inquirer
        .prompt([
          {
            type: 'list',
            message: 'Which department would you like to update?',
            choices: departments, 
            name: 'updateDep',
          },
          {
            type: 'input',
            message: 'What would you like to change the name too?',
            name: 'newName',
          },
        ])
        .then((update) => {
          console.log(`Updating department: ${update.updateDep}`);

          let params;
          const sql = 'UPDATE department SET department_name=? WHERE id=?';

          console.log(departmentsArray);

          for (let index = 0; index < results.length; index++) {
            const element = departmentsArray[index].department_name;
            if (element === update.updateDep) {
              params = [update.newName, departmentsArray[index].id]  
            }
          }           
          console.log(params);
          db.query(sql, params, (err, results) => {
            if (err) {
              console.error(err);
            } else {
              console.log('Department updated successfully.');
              getDepartments()
            }
          })
        })
    }
  })
}

function addEmployee() {
  const positions = [];
  let positionsArray;
  const employees = ['N/A'];
  let employeesArray;
  let params;
  let roleId;

  db.query('SELECT * FROM role', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      console.error(err);
    } else {
      positionsArray = results
      results.forEach(role => positions.push(role.title))
      db.query('SELECT * FROM employee', function (err, results) {
        if (err) {
          // Handle the error, e.g., return an error response
          console.error(err);
        } else {
          employeesArray = results
          results.forEach(employee => employees.push(`${employee.first_name} ${employee.last_name}`))       

            inquirer
              .prompt([
                {
                  type: 'input',
                  message: 'First name?',
                  name: 'firstName',
                },
                {
                  type: 'input',
                  message: 'Last name?',
                  name: 'lastName',
                },
                {
                  type: 'list',
                  message: 'Choose a role',
                  choices: positions,
                  name: 'position',
                },
                {
                  type: 'list',
                  message: 'choose a manager',
                  choices: employeeList,
                  name: 'manager',
                },
              ])
              .then((employee) => {
                // console.log(employee);
                console.log(`Adding employee: ${employee.firstName} ${employee.lastName}`);

                const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';

                for (let index = 0; index < positionsArray.length; index++) {
                  const element = positionsArray[index].title
                  if (element === employee.position) {
                    roleId = positionsArray[index].id
                  }
                }   

                for (let index = 0; index < employeesArray.length; index++) {
                  const element = `${employeesArray[index].first_name} ${employeesArray[index].last_name}`
                  if (employee.manager === 'N/A') {
                    params = [employee.firstName, employee.lastName, roleId, null]                    
                  } else if (element === employee.manager) {
                      params = [employee.firstName, employee.lastName, roleId, employeesArray[index].id]
                    }  
                }
                  console.log(params);
                  
                  db.query(sql, params, function (err, results) {
                    if (err) {
                      console.log(err);
                  } else {
                    console.log(results);
                  }
                })
                getEmployees()
              })
        }
      })
    }
  })
}

function removeEmployee() {
  const employees = []
  let employeesArray;
  db.query('SELECT * FROM employee', function (err, results) {
    if (err) {
      // Handle the error, e.g., return an error response
      console.error(err);
    } else {
      employeesArray = results;
      results.forEach(employee => {
        employees.push(`${employee.first_name} ${employee.last_name}`);
      });
      inquirer
        .prompt([
          {
            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: employees, 
            name: 'removeEmp',
          },
        ])
        .then((employee) => {
          console.log(`Removing employee: ${employee.removeEmp}`);

          const sql = 'DELETE FROM employee WHERE id = ?';
          let params;

          for (let index = 0; index < employeesArray.length; index++) {
            const element = `${employeesArray[index].first_name} ${employeesArray[index].last_name}`;
            if (element === employee.removeEmp) {
              params = [employeesArray[index].id]
            }            
          }

          db.query(sql, params, function (err, results) {
            if (err) {
              console.error(err);
              init()
            } else {
              console.log('Employee removed.');
              getEmployees()
            }
          });
        });
    }
  });
}

function updateEmployee() {
  let employeeToUpdate;
  inquirer
  .prompt([
    {
      type: 'list',
      message: 'Select an employee to update:',
      choices: employeeList,
      name: 'employeeToUpdate',
    },

  ])
    .then((employee) => {
      employeeToUpdate = employee.employeeToUpdate;
      const updatedEmployees = employeeList.filter((employee) => employee !== employeeToUpdate)
      inquirer
        .prompt([
          {
            type: 'input',
            message: 'Enter the updated first name:',
            name: 'updatedFirstName',
          },
          {
            type: 'input',
            message: 'Enter the updated last name:',
            name: 'updatedLastName',
          },
          {
            type: 'list',
            message: 'Pick a new role',
            choices: roles,
            name: 'updatedRole',
          },
          {
            type: 'list',
            message: 'Choose a manager',
            choices: updatedEmployees,
            name: 'updatedManager',
          },
        ])
          .then((updatedEmployeeInfo) => {
            console.log(updatedEmployeeInfo);
            let newRole = roleDataArray.filter((role) => role.title === updatedEmployeeInfo.updatedRole)
            const newManagerIdString = updatedEmployeeInfo.updatedManager.match(/\d+/g);
            const newManageId = newManagerIdString.map(number => parseInt(number, 10));
            const employeeIdString = employeeToUpdate.match(/\d+/g);
            const employeeId = employeeIdString.map(number => parseInt(number, 10));
            let params = [updatedEmployeeInfo.updatedFirstName, updatedEmployeeInfo.updatedLastName, newRole[0].id, newManageId, employeeId];
            
            db.query('UPDATE employee SET first_name=?, last_name=?, role_id=?, manager_id=? WHERE id=?', params, (err, results) => {
              if (err) {
                console.error(err);
              } else {
                console.log('Employee updated successfully.');
                init()
              }
        })
          })    
    })
}

function addRole() {
  return inquirer
  .prompt([
    {
      type: 'input',
      message: 'Enter the title of the role:',
      name: 'title',
    },
    {
      type: 'number',
      message: 'Enter the salary for the role:',
      name: 'salary',
    },
    {
      type: 'list',
      message: 'Choose a department',
      choices: departments,
      name: 'department',
    },
  ])
  .then((role) => {
    // Create an object with the role information
    const departmentObj = departmentDataArray.filter((department) => department.department_name === role.department)
    const params = [role.title, role.salary, departmentObj[0].id];
    db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', params, function (err, results) {
          if (err) {
            console.log(err);
          } else {
            console.log('Role succesfully added');
            init()
          }          
        });    
  });
}

function removeRole() {
  return inquirer
  .prompt([
    {
      type: 'list',
      message: 'Which role would you like to remove?',
      choices: roles,
      name: 'roleRemove',
    },
  ])
  .then(({roleRemove}) => {
    console.log(roleRemove);
    const param = roleDataArray.filter((role) => role.title === roleRemove);
    db.query('DELETE FROM role WHERE id = ?', param[0].id,  function (err, results) {
          if (err) {
            res.statusMessage(400).json({err: err})
          } else if (!results.affectedRows) {
            console.log({message: 'Id not found'});
          } else {
            console.log('Role successfully removed')
            init()
          }
        })
  })
}

function updateRole() {
  let roleToUpdate;
  return inquirer
  .prompt([
    {
      type: 'list',
      message: 'Which role would you like to update?',
      choices: roles,
      name: 'roleUpdate',
    },
  ])
  .then(({roleUpdate}) => {
    roleToUpdate = roleUpdate;
    inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter the updated role title:',
        name: 'newTitle',
      },
      {
        type: 'number',
        message: 'Enter the updated salary:',
        name: 'newSalary',
      },
      {
        type: 'list',
        message: 'Pick a new department',
        choices: departments,
        name: 'newDepartment',
      },
    ])
    .then ((response) => {
      const roleId = roleDataArray.filter((role) => role.title === roleToUpdate)
      const departmentId = departmentDataArray.filter((department) => department.department_name === response.newDepartment);
      const params = [response.newTitle, response.newSalary, departmentId[0].id, roleId[0].id]
      console.log(roleId);
      db.query('UPDATE role SET title=?, salary=?, department_id=? WHERE id=?', params,  function (err, results) {
        if (err) {
          console.log(err);
        } else if (!results.affectedRows) {
          console.log({message: 'Id not found'});
          init()
        } else {
          console.log('Role successfully updated')
          init()
        }
      })
    })
  })
}