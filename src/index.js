const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

// importamos isso para aceitar receber um objeto JSON
app.use(express.json());

// Middleware
function verifyIfExistAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find(customer => customer.cpf === cpf);
  if (!customer) return response.status(400).json({ error: "Customer not found!"}); 
  request.customer = customer; // com isso temos acesso ao customer que foi verificado
  return next();
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

app.listen(3333, () => { console.log("Server running in port 3333 🔥🚀") });