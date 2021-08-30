const http = require("http");
const fs = require("fs");
const requests = require("requests");
const homeFile = fs.readFileSync("home.html", "utf-8"); //utf-8 to not get buffered data

const toCelcius = (f) => {
  return (f - 32) * (5 / 9);
};

const replaceVal = (file, newValue) => {
  let newData = file.replace("{%tempval%}", newValue.main.temp);
  newData = newData.replace("{%tempmax%}", newValue.main.temp_max);
  newData = newData.replace("{%tempmin%}", newValue.main.temp_min);
  newData = newData.replace("{%location%}", newValue.name);
  newData = newData.replace("{%country%}", newValue.sys.country);
  newData = newData.replace("{%tempStatus%}", newValue.weather[0].main);
  return newData;
};

const server = http.createServer((req, res) => {
  //when we visit on the home page "/" then this server will hit on this api
  //and generate data event and we get data in the form of chunks
  if (req.url === "/") {
    requests(
      "http://api.openweathermap.org/data/2.5/weather?q=Pune&appid=44fc23821b04f8c524cea122a843d8d9"
    )
      .on("data", (chunk) => {
        const data = JSON.parse(chunk);
        const arrData = [data];
        // console.log(arrData[0].main.temp);
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
        // console.log(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  }
});

server.listen(8000, "127.0.0.1"); //portNumber , localhost
