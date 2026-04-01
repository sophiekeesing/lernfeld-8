import { app } from "./app.js";

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Trainify auth server running at http://localhost:${PORT}`);
});
