import { Router } from "express";
const v1Router = Router();
v1Router.get("/", (req,res) => {
  res.send("Hello, World!");
  console.log("from v1")
});
export default v1Router;