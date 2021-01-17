var appData = {
  gasData: {}
};

chrome.alarms.create('fetch_gas_price', {
  "periodInMinutes": 2
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "standard",
  }, function (items) {
    const gasPrice = appData.gasData[items.gasPriceOption].satVb;
    chrome.browserAction.setBadgeText({
      text: String(gasPrice)
    });
  });
}

function getProviderUrl(provider) {
  switch (provider) {
    case 'mempoolspace':
      return "https://mempool.space/api/v1/fees/recommended";
      break;
    case 'bitcoinfees':
      return "https://bitcoinfees.earn.com/api/v1/fees/recommended";
      break;
    case 'blockchaininfo':
      return "https://api.blockchain.info/mempool/fees";
      break;
  }
}

function fetchGasPrice() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      provider: "mempoolspace",
    }, function (items) {
      const url = getProviderUrl(items.provider);

      fetch(url).then((res) => {
          return res.json()
        })
        .then(data => {
          // Store the current data for the popup page
          appData.gasData = parseApiData(data, items.provider);
          // Update badge
          updateBadge();

          // Resolve promise on success
          resolve();
        })
        .catch((error) => {
          reject();
        });
    });
  });
}

// Create a consistent structure for data so we can use multiple providers
function parseApiData(apiData, provider) {
  if (provider === "mempoolspace") {
    return {
      "slow": {
        "satVb": parseInt(apiData.hourFee),
        "wait": "Low priority"
      },
      "standard": {
        "satVb": parseInt(apiData.halfHourFee),
        "wait": "Medium priority"
      },
      "fast": {
        "satVb": parseInt(apiData.fastestFee),
        "wait": "High priority"
      }
    }
  }

  if (provider === "bitcoinfees") {
    return {
      "slow": {
        "satVb": parseInt(apiData.hourFee),
        "wait": "Low priority"
      },
      "standard": {
        "satVb": parseInt(apiData.halfHourFee),
        "wait": "Medium priority"
      },
      "fast": {
        "satVb": parseInt(apiData.fastestFee),
        "wait": "High priority"
      }
    }
  }

  if (provider === "blockchaininfo") {
    return {
      "slow": {
        "satVb": parseInt(apiData.limits.min),
        "wait": "Low priority"
      },
      "standard": {
        "satVb": parseInt(apiData.regular),
        "wait": "Medium priority"
      },
      "fast": {
        "satVb": parseInt(apiData.priority),
        "wait": "High priority"
      }
    }
  }

}

fetchGasPrice(); // Initial fetch