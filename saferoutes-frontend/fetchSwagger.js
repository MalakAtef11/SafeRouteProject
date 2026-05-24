const fs = require('fs');
fetch("http://localhost:5029/swagger/v1/swagger.json")
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync('swagger.json', JSON.stringify(data, null, 2));
    console.log("Swagger saved");
  })
  .catch(err => console.error(err));
