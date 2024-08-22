async function restoreOptions() {
  const config = await browser.storage.sync.get();

  document.querySelector("#notion_api_key").value = config.notion_api_key ?? "";
  document.querySelector("#database_id").value = config.database_id ?? "";
}

function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    notion_api_key: document.querySelector("#notion_api_key").value,
    database_id: document.querySelector("#database_id").value,
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
