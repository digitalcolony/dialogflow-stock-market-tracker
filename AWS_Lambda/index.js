var https = require("https");

exports.handler = (event, context, callback) => {
  console.log(event);
  console.log(event.result.parameters);

  const action = event.result.action;

  if (action != "input.getStockPrice") {
    callback(null, buildChatResponse("I'm sorry, I don't know this"));
    return;
  }
  const parameters = event.result.parameters;
  var companyName = parameters["company_name"];
  var priceType = parameters["price_type"];
  var date = parameters["date"];

  getStockPrice(companyName, priceType, date, callback);
};

function buildChatResponse(chat) {
  return { speech: chat, displayText: chat };
}

function getStockPrice(companyName, priceType, date, callback) {
  console.log("In function getStockPrice");
  console.log("Company name:", companyName);
  console.log("Price Type:", priceType);
  console.log("Date:", date);

  var tickerMap = {
    apple: "AAPL",
    amazon: "AMZN",
    facebook: "FB",
    google: "GOOG",
    ibm: "IBM",
    microsoft: "MSFT"
  };

  var priceMap = {
    opening: "opening_price",
    closing: "closing_price",
    maximum: "high_price",
    high: "high_price",
    "high price": "high_price",
    low: "low_price",
    "low price": "low_price",
    minimum: "low_price"
  };

  var stockTicker = tickerMap[companyName.toLowerCase()];
  var priceTypeCode = priceMap[priceType.toLowerCase()];

  var pathString = `/historical_data?ticker=${stockTicker}&item=${priceTypeCode}&start_date=${date}&end_date=${date}`;

  console.log("Path String:", pathString);

  var username = "--API-KEYS--";
  var password = "--API-KEYS--";

  var auth =
    "Basic " + new Buffer(username + ":" + password).toString("base64");

  var request = https.get(
    {
      host: "api.intrinio.com",
      path: pathString,
      headers: { Authorization: auth }
    },
    function(response) {
      var json = "";
      response.on("data", function(chunk) {
        console.log("Received JSON response:", chunk);
        json += chunk;
      });
      response.on("end", function() {
        var jsonData = JSON.parse(json);
        var stockPrice = jsonData.data[0].value;

        console.log("The stock price received:", stockPrice);

        var chat = `The ${priceType} price for ${companyName} on ${date} was ${stockPrice}.`;

        callback(null, buildChatResponse(chat));
      });
    }
  );
}
