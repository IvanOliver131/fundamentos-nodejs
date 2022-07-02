const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

// importamos isso para aceitar receber um objeto JSON
app.use(express.json());

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
    return response.status(400).send("Usuário já existente");
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

app.listen(3333, () => { console.log("Server running in port 3333 🔥🚀") });