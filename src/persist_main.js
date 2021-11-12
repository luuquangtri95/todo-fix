function getAllLiElement() {
  return document.querySelectorAll("ul#todo__list > li");
}

function isMatchStatus(liElement, filterStatus) {
  return filterStatus === "all" || liElement.dataset.status === filterStatus;
}
function isMatchSearch(liElement, searchTerm) {
  if (!searchTerm) searchTerm = "";
  if (searchTerm === "") return true;

  const title = liElement.querySelector("p.todo__heading");

  return title.textContent.toLowerCase().includes(searchTerm.toLowerCase());
}

function isMatch(liElement, params) {
  return (
    isMatchStatus(liElement, params.get("status")) &&
    isMatchSearch(liElement, params.get("searchTerm"))
  );
}

function handleFilterChange(filterName, filterValue) {
  // ! UPDATE query params
  const url = new URL(window.location);

  url.searchParams.set(filterName, filterValue);

  window.history.pushState({}, "", url);

  const todoElements = getAllLiElement();

  for (const liElement of todoElements) {
    const needToShow = isMatch(liElement, url.searchParams);

    liElement.hidden = !needToShow;
  }
}

function initFormSearchTodo(params) {
  const formSearchTodo = document.getElementById("formSearchTodo");

  if (!formSearchTodo) return;

  if (params.get("searchTerm")) {
    formSearchTodo.value = params.get("searchTerm");
  }

  formSearchTodo.addEventListener("input", () => {
    handleFilterChange("searchTerm", formSearchTodo.value || "");
  });
}

function initFormFilterTodo(params) {
  const formFilterTodo = document.getElementById("formFilterTodo");

  if (!formFilterTodo) return;

  if (params.get("status")) {
    formFilterTodo.value = params.get("status");
  }

  formFilterTodo.addEventListener("change", () => {
    handleFilterChange("status", formFilterTodo.value || "all");
  });
}

(() => {
  const params = new URLSearchParams(window.location.search);

  if (!window.location.search) {
    params.set("searchTerm", "");
    params.set("status", "all");

    const url = window.location.href + "?" + params.toString();
    history.pushState({}, "", url);
  }

  initFormSearchTodo(params);
  initFormFilterTodo(params);
})();
