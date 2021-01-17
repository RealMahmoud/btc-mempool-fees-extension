const options = {
  'provider': ''
};

chrome.storage.sync.get({
  'provider': 'mempool.space'
}, (items)=>{
  options.provider = items.provider;
  renderOptions();
});

function renderOptions(){
  let providersHtml = 
    `<li data-provider="mempool.space" class="js-provider ${options.provider == 'mempool.space' ? 'active':''}">mempool.space ${options.provider == 'mempool.space' ? '✓':''}</li>
    <li data-provider="bitcoiner.live" class="js-provider ${options.provider == 'bitcoiner.live' ? 'active':''}">bitcoiner.live ${options.provider == 'bitcoiner.live' ? '✓':''}</li>
    <li data-provider="blockchain.com" class="js-provider ${options.provider == 'blockchain.com' ? 'active':''}">blockchain.com ${options.provider == 'blockchain.com' ? '✓':''}</li>`;

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