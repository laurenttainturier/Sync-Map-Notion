async function saveToNotionAndRedirect(tab) {
  const propertyValues = await executeInTab(tab, getNotionPropertiesFromTab);
  const response = await saveToNotion(propertyValues);
  await redirectToNotion(response);
}

async function executeInTab(tab, script) {
  const scriptResult = await browser.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    func: script,
  });

  return scriptResult[0].result;
}

function getNotionPropertiesFromTab() {
  return {
    name: document.querySelector("h1.fontTitleLarge").innerText,
    location: window.location.href,
  };
}

async function saveToNotion(propertyValues) {
  const config = await browser.storage.sync.get();
  const notion_api_key = config.notion_api_key;
  const database_id = config.database_id;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Notion-Version", "2022-02-22");
  myHeaders.append("Authorization", `Bearer ${notion_api_key}`);

  const raw = JSON.stringify({
    "parent": {
      "database_id": database_id
    },
    "properties": {
      "Localisation": {"url": propertyValues.location},
      "Nom": {"title": [{"text": {"content": propertyValues.name}}]}
    }
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
    mode: 'cors',
  };

  return fetch("https://api.notion.com/v1/pages/", requestOptions)
    .then(response => response.json())
    .catch(error => console.error(error));
}

async function redirectToNotion(response) {
  const redirectUrl = response.url;

  if (!redirectUrl) {
    console.error(response);
  }

  await browser.tabs.create({
    url: response.url,
    active: true,
  });
}

browser.pageAction.onClicked.addListener(saveToNotionAndRedirect);