import express from "express"
import v1Router from './router/v1';
const app = express();
app.use("/v1", v1Router);
console.log("from index")

const PORT = 5000;  // Define a port for the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});