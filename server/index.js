const express = require('express');
const app = express();
const port = 3070;



app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})