var appData = {
  gasData: {}
};

chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 3
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "standard",
  }, function(items) {
    const gasPrice = appData.gasData[items.gasPriceOption].gwei;
    chrome.browserAction.setBadgeText({text: String(gasPrice)});
  });
}

function getProviderUrl(provider) {
  switch(provider) {
    case 'ethgasstation':
      return "https://ethgasstation.info/api/ethgasAPI.json?api-key=d216b81e8ed8f5c8a82744be99b22b2d1757098f40df3c2ea5bb40b3912b";
      break;
    case 'gasnow':
      return "https://www.gasnow.org/api/v3/gas/price?utm_source=EthGasPriceExtension";
      break;
  }
}

function fetchGasPrice() {
  chrome.storage.sync.get({
    provider: "ethgasstation",
  }, function(items) {
    const url = getProviderUrl(items.provider);

    return fetch(url)
      .then((res) => {return res.json()})
      .then(data => {
        // Store the current data for the popup page
        appData.gasData = parseApiData(data, items.provider);
        // Update badge
        updateBadge();
      });
  });
  

  // const url = "https://gasprice-proxy.herokuapp.com/"; // Firefox Proxy
  // return fetch(url)
  //   .then((res) => {return res.json()})
  //   .then(data => {
  //     // Store the current data for the popup page
  //     appData.gasData = data;
  //     // Update badge
  //     updateBadge();
  //   });
}

// Create a consistent structure for data so we can use multiple providers
function parseApiData(apiData, provider) {
  if(provider === "ethgasstation") {
    return {
      "slow": {
        "gwei": parseInt(apiData.safeLow, 10)/10,
        "wait": apiData.safeLowWait
      },
      "standard": {
        "gwei": parseInt(apiData.average, 10)/10,
        "wait": apiData.avgWait
      },
      "fast": {
        "gwei": parseInt(apiData.fast, 10)/10,
        "wait": apiData.fastWait
      },
      "rapid": {
        "gwei": parseInt(apiData.fastest, 10)/10,
        "wait": apiData.fastestWait
      }
    }
  }

  if(provider === "gasnow") {
    return {
      "slow": {
        "gwei": Math.floor(parseInt(apiData.data.slow, 10)/1000000000),
      },
      "standard": {
        "gwei": Math.floor(parseInt(apiData.data.standard, 10)/1000000000),
      },
      "fast": {
        "gwei": Math.floor(parseInt(apiData.data.fast, 10)/1000000000),
      },
      "rapid": {
        "gwei": Math.floor(parseInt(apiData.data.rapid, 10)/1000000000),
      }
    }
  }
  
}

fetchGasPrice(); // Initial fetch