const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

// importamos isso para aceitar receber um objeto JSON express
app.use(express.json());

// Middleware
function verifyIfExistAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find(customer => customer.cpf === cpf);
  if (!customer) return response.status(400).json({ error: "Customer not found!"}); 
  request.customer = customer; // com isso temos acesso ao customer que foi verificado
  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') { 
      return acc + operation.amount; 
    } else { 
      return acc - operation.amount; 
    }
  }, 0);

  return balance;
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  const customerAlreadyExsits = customers.some((customer) => customer.cpf === cpf);
  if (customerAlreadyExsits) {
    return response.status(400).json({ error: "Customer already exists!" });
  }
  const id = uuidv4();

  customers.push({
    cpf,
    name,
    id,
    statement: [],
  });

  return response.status(201).send();
});

app.get("/statement", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }
  customer.statement.push(statementOperation);
  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { amount } = request.body;
  const balance = getBalance(customer.statement);
  if (balance < amount) return response.status(400).json({ error: "Insuficient funds!" });
  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  }
  customer.statement.push(statementOperation);
  return response.status(201).send();
});

app.get("/statement/date", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;
  const dateFormat = new Date(date + "00:00");
  const statement = customer.statement.filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString());
  if (!statement) return response.status(400).json({ error: "Statement not found!"});
  return response.json(customer.statement);
});

app.put("/account", verifyIfExistAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;
  customer.name = name;
  return response.send();
});

app.get("/account", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
});

app.delete("/account", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  customers.splice(customer, 1);
  return response.status(204).json(customers);
});

app.get("/balance", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  const balance = getBalance(customer.statement);
  const balanceFormat = balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return response.json({ 
    message: `Você possui ${balanceFormat} em sua conta`
  });
})

app.listen(3333, () => { console.log("Server running in port 3333 🔥🚀") });