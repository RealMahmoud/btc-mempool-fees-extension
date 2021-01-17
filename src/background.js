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
    case 'mempool.space':
      return "https://mempool.space/api/v1/fees/recommended";
      break;
    case 'bitcoiner.live':
      return "https://bitcoiner.live/api/fees/estimates/latest";
      break;
    case 'blockchain.com':
      return "https://api.blockchain.com/mempool/fees";
      break;
  }
}

function fetchGasPrice() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      provider: "mempool.space",
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
  if (provider === "mempool.space") {
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

  if (provider === "bitcoiner.live") {
    return {
      "slow": {
        "satVb": parseInt(apiData.estimates["1440"].sat_per_vbyte),
        "wait": "Low priority"
      },
      "standard": {
        "satVb": parseInt(apiData.estimates["180"].sat_per_vbyte),
        "wait": "Medium priority"
      },
      "fast": {
        "satVb": parseInt(apiData.estimates["30"].sat_per_vbyte),
        "wait": "High priority"
      }
    }
  }

  if (provider === "blockchain.com") {
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