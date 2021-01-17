const options = {
  'provider': ''
};

chrome.storage.sync.get({
  'provider': 'mempoolspace'
}, (items)=>{
  options.provider = items.provider;
  renderOptions();
});

function renderOptions(){
  let providersHtml = 
    `<li data-provider="mempoolspace" class="js-provider ${options.provider == 'mempoolspace' ? 'active':''}">Mempool Space ${options.provider == 'mempoolspace' ? '✓':''}</li>
    <li data-provider="bitcoinfees" class="js-provider ${options.provider == 'bitcoinfees' ? 'active':''}">bitcoin fees ${options.provider == 'bitcoinfees' ? '✓':''}</li>
    <li data-provider="blockchaininfo" class="js-provider ${options.provider == 'blockchaininfo' ? 'active':''}">blockchain info ${options.provider == 'blockchaininfo' ? '✓':''}</li>`;

  document.getElementsByClassName('js-providers')[0].innerHTML = DOMPurify.sanitize(providersHtml);
  addClickListeners();
}

function selectProvider(option) {
  // Curry function with option
  return function(e){
    options.provider = option;
    chrome.storage.sync.set({
      'provider': option
    });

    renderOptions();

    chrome.runtime.getBackgroundPage(backgroundPage=>{
      backgroundPage.fetchGasPrice();
    }); 
  };
}

function addClickListeners() {
  // Add click listeners
  let elements = document.getElementsByClassName('js-provider');
  for(let i=0; i<elements.length; i++) {
    const element = elements[i];
    // Select option when clicked
    element.addEventListener('click', selectProvider(element.dataset.provider));
  }
}