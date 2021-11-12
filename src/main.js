function isMatch(liElement, params) {
  return (
    isMatchStatus(liElement, params.get("status")) &&
    isMatchSearch(liElement, params.get("searchTerm"))
  );
}

function isMatchStatus(liElement, filterStatus) {
  return filterStatus === "all" || liElement.dataset.status === filterStatus;
}
function isMatchSearch(liElement, searchTerm) {
  if (searchTerm === "") return true;

  const title = liElement.querySelector("p.todo__heading");

  return title.textContent.toLowerCase().includes(searchTerm.toLowerCase());
}

function createLiElement(todo, params) {
  if (!todo) return null;

  const templateLiElement = document.getElementById("templateLiElement");
  if (!templateLiElement) return null;

  const liElement = templateLiElement.content.firstElementChild.cloneNode(true);

  liElement.dataset.id = todo.id;
  liElement.dataset.status = todo.status;

  // update title
  const titleElement = liElement.querySelector("p.todo__heading");
  if (!titleElement) return;

  titleElement.textContent = todo.title;

  liElement.hidden = !isMatch(liElement, params);
  //? render status li element
  const currStatus = liElement.dataset.status;

  //! update new class for div element
  const divClass = liElement.querySelector(".todo");
  const newClass =
    currStatus === "pending" ? "alert-secondary" : "alert-success";

  divClass.classList.remove("alert-secondary", "alert-success");
  divClass.classList.add(newClass);

  /**
   * attach all buttons: edit, remove, done
   */

  // ! CHANGE STATUS
  const markAsDoneBtn = liElement.querySelector("button.mark-as-done");

  //render text and class for btn first times
  const newText = currStatus === "pending" ? "Finish" : "Reset";
  const newClassBtn = currStatus === "pending" ? "btn-success" : "btn-dark";

  markAsDoneBtn.textContent = newText;
  markAsDoneBtn.classList.remove("btn-dark", "btn-success");
  markAsDoneBtn.classList.add(newClassBtn);

  if (markAsDoneBtn) {
    markAsDoneBtn.addEventListener("click", () => {
      const currStatus = liElement.dataset.status;
      const newStatus = currStatus === "pending" ? "completed" : "pending";

      /**
       * TODO: update status localstorage onclick
       */

      const todoList = getItemLocalStorage();
      const index = todoList.findIndex((x) => x.id === todo.id);
      todoList[index].status = newStatus;

      //! UPDATE local
      setItemLocalstorage(todoList);

      //click change
      liElement.dataset.status = newStatus;

      const divClass = liElement.querySelector(".todo");
      const newClass =
        currStatus === "pending" ? "alert-success" : "alert-secondary";

      divClass.classList.remove("alert-secondary", "alert-success");
      divClass.classList.add(newClass);

      //! update button text
      const newText = currStatus === "pending" ? "Reset" : "Finish";
      const newClassBtn = currStatus === "pending" ? "btn-dark" : "btn-success";
      markAsDoneBtn.textContent = newText;
      markAsDoneBtn.classList.remove("btn-dark", "btn-success");
      markAsDoneBtn.classList.add(newClassBtn);
    });
  }

  // ! REMOVE
  const removeBtn = liElement.querySelector("button.remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      //btn click remove li element
      const todoList = getItemLocalStorage();
      const newTodo = todoList.filter((x) => x.id !== todo.id);

      //update localstorage
      setItemLocalstorage(newTodo);

      liElement.remove();
    });
  }

  // !EDIT
  const editBtn = liElement.querySelector("button.edit");
  editBtn.addEventListener("click", () => {
    const todoList = getItemLocalStorage();
    const todoItem = todoList.find((x) => x.id === todo.id);

    formUpdateTodo(todoItem);
  });

  return liElement;
}

// !!! form render data when edit button clicked
function formUpdateTodo(todo) {
  if (!todo) return;

  const formElement = document.getElementById("formId");
  const formInput = document.getElementById("formInput");
  const formCheckbox = document.getElementById("formCheckbox");

  if (!formElement || !formInput || !formCheckbox) return;

  formElement.dataset.id = todo.id;
  formInput.value = todo.title;

  todo.status === "completed"
    ? (formCheckbox.checked = true)
    : (formCheckbox.checked = false);
}

function renderTodoElements(todoList, ulElementId, params) {
  if (!Array.isArray(todoList) || todoList.length === 0) return;

  const ulElement = document.getElementById(ulElementId);
  if (!ulElement) return;

  for (const todo of todoList) {
    const liElement = createLiElement(todo, params);

    ulElement.appendChild(liElement);
  }
}

function setItemLocalstorage(newTodo) {
  return localStorage.setItem("todo_list", JSON.stringify(newTodo));
}

function getItemLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem("todo_list")) || [];
  } catch {
    return [];
  }
}

function handleSubmitForm(e) {
  e.preventDefault();

  /**
   * 2 mode: edit mode và add mode
   * TODO: edit mode: nếu có data-id thì edit mode
   * - khi submit xong thì delete data-id
   *
   * ! add mode: không có data-id
   */

  const formElement = document.getElementById("formId");
  const formInput = document.getElementById("formInput");
  const formCheckbox = document.getElementById("formCheckbox");

  if (!formCheckbox) return;
  if (!formInput) return;

  const status = formCheckbox.checked ? "completed" : "pending";

  const editMode = Boolean(formElement.dataset.id);

  if (editMode) {
    //edit mode

    const todoList = getItemLocalStorage();
    const todoItem = todoList.find(
      (x) => x.id.toString() === formElement.dataset.id
    );

    todoItem.status = status;
    todoItem.title = formInput.value;

    setItemLocalstorage(todoList);

    //render UI

    const liElement = document.querySelector(
      `ul#todo__list > li[data-id ="${formElement.dataset.id}"]`
    );
    const divClass = liElement.querySelector("div.todo");
    const titleElement = liElement.querySelector("p.todo__heading");
    const markAsDoneBtn = liElement.querySelector("button.mark-as-done");

    const currStatus = formCheckbox.checked;

    titleElement.textContent = formInput.value;

    if (currStatus) {
      divClass.classList.remove("alert-secondary");
      divClass.classList.add("alert-success");

      markAsDoneBtn.textContent = "Reset";
      markAsDoneBtn.classList.remove("btn-success");
      markAsDoneBtn.classList.add("btn-dark");
    } else {
      divClass.classList.remove("alert-success");
      divClass.classList.add("alert-secondary");

      markAsDoneBtn.textContent = "Finish";
      markAsDoneBtn.classList.remove("btn-dark");
      markAsDoneBtn.classList.add("btn-success");
    }

    // ! clear data-id form + clear data input
    delete formElement.dataset.id;
    formElement.reset();
  } else {
    //add mode

    if (formInput.value === "") return;

    const todoList = getItemLocalStorage();

    const newTodoItem = {
      id: Date.now(),
      title: formInput.value,
      status: status,
    };

    todoList.push(newTodoItem);

    setItemLocalstorage(todoList);

    //render UI

    const newLiElement = createLiElement(newTodoItem);
    const ulElement = document.getElementById("todo__list");
    ulElement.appendChild(newLiElement);

    //reset form
    formElement.reset();
  }
}

// main
(() => {
  const todoList = getItemLocalStorage();

  if (window.location.search === "") {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("searchTerm", "");
    newParams.set("status", "all");

    const url = window.location.href + "?" + newParams.toString();
    history.pushState({}, "", url);
  }

  const params = new URLSearchParams(window.location.search);

  renderTodoElements(todoList, "todo__list", params);

  const formElement = document.getElementById("formId");

  formElement.addEventListener("submit", handleSubmitForm);
})();
