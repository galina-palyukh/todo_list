import { ConfirmPopup } from "./ConfirmPopup.js";

document.addEventListener("DOMContentLoaded", function () {

	// VARIABLES:
	const body = document.querySelector("body");
	const table = document.querySelector(".table-todo");
	const tableHead = document.querySelector(".table-todo thead");
	const tableBody = document.querySelector(".table-todo tbody");

	const addWrap = document.querySelector(".todo-header__add-form");
	const addBtn = document.querySelector(".form-add__btn");
	const addInput = document.querySelector(".form-add__field");
	const filterOptions = document.querySelector(".select-filter-task");

	const commonInputStatus = document.querySelector(".table-todo__status-common-input");
	const btnRemoveAllTasks = document.querySelector(".todo-header__btn-remove-all");

	//pagination
	const paginationNav = document.querySelector(".todo__pagination");
	const paginationList = document.querySelector(".todo__pagination>ul");
	const paginationPageSize = 5; //сколько отображаем сначала for pagination
	//END pagination

	const thSortList = tableHead.querySelectorAll(".table-todo__header[datatype]");

	//edit
	const popupEdit = document.querySelector(".edit-task-popup");
	const editPopupBtnSubmit = document.querySelector(".edit-task-popup__btn-submit");
	const editPopupBtnCancel = document.querySelector(".edit-task-popup__btn-cancel");
	const editPopupBtnClose = document.querySelector(".edit-task-popup__btn-close");
	const editPopupField = document.querySelector(".edit-task-popup__field");
	const editPopupOverlay = document.querySelector(".edit-task-popup .popup__overlay");

	let editButtonClicked;
	//END edit

	//remove all
	// const removeAllBtn = document.querySelector(".todo-header__btn-remove-all");
	// const removeAllPopup = document.querySelector(".confirmation-remove-all-popup");
	// const removeAllPopupBtnSubmit = document.querySelector(".confirmation-remove-all-popup__btn-submit");
	// const removeAllPopupBtnCancel = document.querySelector(".confirmation-remove-all-popup__btn-cancel");
	// const removeAllPopupBtnClose = document.querySelector(".confirmation-remove-all-popup__btn-close");
	// const removeAllPopupOverlay = document.querySelector(".confirmation-remove-all-popup .popup__overlay");

	//END remove all

	//localStorage
	const dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey")) || [];
	//END localStorage

	//END VARIABLES


	if (dynamicDataArr.length !== 0) {
		table.style.display = "table";
		paginationNav.style.display = "flex";

		setPage(1, dynamicDataArr);
	}

	//LISTENERS:

	btnRemoveAllTasks.addEventListener("click", () => {
		const removeAllTaskPopup = new ConfirmPopup("Title", "Are you sure you want to remove all tasks?", "Cancel", "OK", removeAllTasks);
		removeAllTaskPopup.open();
	})

	addBtn.addEventListener("click", onclickAddTaskButton);
	addInput.addEventListener("focus", () => addWrap.classList.add("_focus"));
	addInput.addEventListener("blur", () => addWrap.classList.remove("_focus"));

	addInput.addEventListener("keypress", function (keyEvent) {
		if (keyEvent.key === "Enter") {
			onclickAddTaskButton(keyEvent);
		}
	});

	editPopupBtnSubmit.addEventListener("click", editTaskSaveState);

	editPopupField.addEventListener("keypress", (e) => {
		console.log(e);
		if (e.key === "Enter") {
			editTaskSaveState();
		}
	});

	editPopupBtnCancel.addEventListener("click", closeEditPopup);
	editPopupBtnClose.addEventListener("click", closeEditPopup);
	editPopupOverlay.addEventListener("click", closeEditPopup);


	commonInputStatus.addEventListener("click", setCommonStatus);

	filterOptions.addEventListener("change", () => setPage(1, filterAndSortTask(dynamicDataArr)));


	// removeAllBtn.addEventListener("click", openPopup(removeAllPopup));
	// //FIXME  
	// removeAllPopupBtnSubmit.addEventListener("click", function() {
	// 	removeAllTasks();
	// 	closePopup(removeAllPopup);
	// }); 

	// removeAllPopupBtnClose.addEventListener("click", closePopup(removeAllPopup));
	// removeAllPopupBtnCancel.addEventListener("click", closePopup(removeAllPopup));
	// removeAllPopupOverlay.addEventListener("click", closePopup(removeAllPopup));


	//END LISTENERS

	//FUNCTIONS:
	//pagination 
	function createPagination(array) {
		paginationList.innerHTML = "";

		createPaginationItem(array, "Prev");
		for (let i = 1; i <= Math.ceil(array.length / paginationPageSize); i++) {
			createPaginationItem(array, i);
		}
		createPaginationItem(array, "Next");
	}

	function createPaginationItem(array, content) {
		const paginationItem = document.createElement("li");
		paginationItem.classList.add("pagination__item");
		paginationList.appendChild(paginationItem);

		const paginationLink = document.createElement("a");
		paginationLink.setAttribute("href", "#");
		paginationLink.classList.add("pagination__link");
		paginationLink.innerText = content;
		paginationItem.appendChild(paginationLink);

		paginationLink.addEventListener("click", (e) => {
			const el = e.target;

			if (paginationList.querySelector("li:first-child>a") === el) {
				setPage(getCurrentPage() - 1, array);

			} else if (paginationList.querySelector("li:last-of-type>a") === el) {
				setPage(getCurrentPage() + 1, array);

			} else {
				setPage(el.innerText, array);
			}

		})
	}

	function getCurrentPage() {
		const activePage = paginationList.querySelector("a._active");

		if (activePage && typeof (+activePage.textContent) === "number") {
			return +activePage.textContent

		} else {
			return 1;
		}

	}

	function setPage(page, array) {

		paginationNav.style.display = array.length !== 0 ? "flex" : "none";

		createPagination(array);

		if (paginationList.querySelector("a._active")) {
			paginationList.querySelector("a._active").classList.remove("_active");
		}

		const items = paginationList.querySelectorAll(".pagination__item");

		items[page].querySelector(".pagination__link").classList.add("_active");

		const linkPrev = paginationList.querySelector("li:first-child>a").classList;

		const linkNext = paginationList.querySelector("li:last-of-type>a").classList;

		(page === 1) ? linkPrev.add("_disabled") : linkPrev.remove("_disabled");
		(page === items.length - 2) ? linkNext.add("_disabled") : linkNext.remove("_disabled");

		const lastRow = page * paginationPageSize;
		const firstRow = lastRow - paginationPageSize;
		tableBody.innerHTML = "";

		const slicedArray = array.slice(firstRow, lastRow);
		slicedArray.forEach(el => addTableRow(el));

		checkCommonStatus(slicedArray);
	}
	//END pagination

	//add new Task

	function formatDate(date) {
		const optionsDate = {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		};

		const dateString = date.toLocaleDateString("en-GB", optionsDate);
		const timeString = date.toLocaleTimeString("en-GB");

		return dateString + " " + timeString;
	}

	function onclickAddTaskButton(e) {
		e.preventDefault();
		const value = addInput.value.trim();
		const status = false;
		const uniqueId = Math.random().toString(36).substring(2, 8);

		if (value !== "") {
			if (table.style.display !== "table") {
				table.style.display = "table";
			}
			const rowObj = {
				status: status,
				title: value,
				date: formatDate(new Date()),
				id: "id_" + uniqueId
			};

			filterOptions.value = "all";

			dynamicDataArr.push(rowObj);
			localStorage.setItem('rowsKey', JSON.stringify(dynamicDataArr));

			addInput.value = "";

			setPage(1, filterAndSortTask(dynamicDataArr));



		}
	}


	function addTableRow(rowVariable) {

		const row = document.createElement("tr");
		row.classList.add("table-todo__row");
		row.setAttribute("id", rowVariable.id);

		tableBody.appendChild(row);

		const cellStatus = document.createElement("td");
		cellStatus.classList.add("table-todo__cell");
		row.appendChild(cellStatus);
		const boxStatus = document.createElement("div");
		boxStatus.classList.add("table-todo__status");
		cellStatus.appendChild(boxStatus);

		const labelStatus = document.createElement("label");
		labelStatus.classList.add("checkbox");
		boxStatus.appendChild(labelStatus);

		const inputStatus = document.createElement("input");
		inputStatus.classList.add("table-todo__status-input", "checkbox__input");
		labelStatus.appendChild(inputStatus);

		const textStatus = document.createElement("span");
		textStatus.classList.add("checkbox__text");
		labelStatus.appendChild(textStatus);

		inputStatus.setAttribute("type", "checkbox");
		inputStatus.checked = rowVariable.status;
		inputStatus.addEventListener("change", doneTask);

		if (rowVariable.status === true) row.classList.add("_done");

		const cellTitle = document.createElement("td");
		cellTitle.classList.add("table-todo__cell");
		row.appendChild(cellTitle);
		const boxTitle = document.createElement("div");
		boxTitle.classList.add("table-todo__title");
		cellTitle.appendChild(boxTitle);
		boxTitle.innerText = rowVariable.title;

		const cellDate = document.createElement("td");
		cellDate.classList.add("table-todo__cell");
		row.appendChild(cellDate);
		const boxDate = document.createElement("div");
		boxDate.classList.add("table-todo__date");
		cellDate.appendChild(boxDate);
		boxDate.textContent = rowVariable.date;

		const actions = document.createElement("td");
		actions.classList.add("table-todo__cell");
		actions.innerHTML = '<div class="table-todo__actions"><a href ="#" class="table-todo__btn table-todo__btn-remove"><i class="fa-solid fa-xmark"></i></a><a href ="#" class="table-todo__btn table-todo__btn-edit"><i class="fa-solid fa-pencil"></i></a></div>';
		row.appendChild(actions);

		const removeBtn = actions.querySelector(".table-todo__btn-remove");


		removeBtn.addEventListener("click", (e) => {
			const removeTaskConfirmPopup = new ConfirmPopup("Title", `Are you sure you want to remove the task: «${boxTitle.innerHTML}»?`, "Cancel", "OK", function() {
				removeTask.call(removeBtn, e);
			});
			removeTaskConfirmPopup.open();
		});

		const editBtn = actions.querySelector(".table-todo__btn-edit");

		editBtn.addEventListener("click", editTask);
	}
	//END add new Task


	//edit Task
	function editTask(e) {
		e.preventDefault();

		editButtonClicked = this;
		const row = editButtonClicked.closest("tr");
		const title = row.querySelector(".table-todo__title").innerHTML;
		openEditPopup(title);

	}

	function findIndexOFTaskById(el) {
		const rowEditedTask = el.closest("tr");
		const idTask = rowEditedTask.id;
		const indexRow = dynamicDataArr.findIndex(el => el.id === idTask);
		return indexRow;
	}


	function editTaskSaveState() {
		dynamicDataArr[findIndexOFTaskById(editButtonClicked)].title = editPopupField.value;
		localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));

		setPage(getCurrentPage(), filterAndSortTask(dynamicDataArr));
		closeEditPopup();
	}



	function openEditPopup(title) {
		popupEdit.classList.add("_open");
		body.style.overflowY = "hidden";
		editPopupField.value = title;
		// body.style.paddingRight = "15px";
	}
	function closeEditPopup() {
		popupEdit.classList.remove("_open");
		body.style.overflowY = "auto";
		// body.style.paddingRight = null;

	}
	//END edit Task


	//remove Task
	function removeTask(e) {
		e.preventDefault();

		dynamicDataArr.splice(findIndexOFTaskById(this), 1);
		localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));

		if (dynamicDataArr.length === 0) {
			table.style.display = "none";
			paginationNav.style.display = "none";
			return;
		}

		const rows = [...tableBody.childNodes];
		if (rows.length === 0) {
			setPage(getCurrentPage() - 1, filterAndSortTask(dynamicDataArr));
		} else {
			setPage(getCurrentPage(), filterAndSortTask(dynamicDataArr));
		}


	}
	//END remove Task

	//remove all Tasks
	function removeAllTasks() {
		table.style.display = "none";
		dynamicDataArr.length = 0;
		localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));
		setPage(1, dynamicDataArr);

	}
	//END remove all Tasks


	//done Task
	function doneTask() {
		const row = this.closest("tr");
		this.checked === true ? row.classList.add("_done") : row.classList.remove("_done");

		dynamicDataArr[findIndexOFTaskById(this)].status = this.checked;
		localStorage.setItem('rowsKey', JSON.stringify(dynamicDataArr));

		setPage(getCurrentPage(), filterAndSortTask(dynamicDataArr));
	}
	//END done Task


	//common status

	function setCommonStatus() {
		const rowsList = [...tableBody.childNodes];

		function toggleStatus(status) {
			rowsList.forEach((el) => {
				(status === true) ? el.classList.add("_done") : el.classList.remove("_done");
				el.querySelector(".table-todo__status input").checked = status;
				dynamicDataArr[findIndexOFTaskById(el)].status = status;
			})
		}

		commonInputStatus.checked === true ? toggleStatus(true) : toggleStatus(false);

		toggleStatus(commonInputStatus.checked);

		localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));

		setPage(getCurrentPage(), filterAndSortTask(dynamicDataArr));

	}

	function checkCommonStatus(array) {

		if (array.length === 0) {
			commonInputStatus.disabled = true;
			commonInputStatus.checked = false;
			return;
		};

		commonInputStatus.checked = array.every(obj => obj.status === true) ? true : false;
	}

	//END common status


	// sorting 
	thSortList.forEach(th => th.addEventListener("click", function () {
		const obj = getCurrentSort();
		let typeSort = obj.typeSort;

		//меняем всем, кроме нажатого эл, иконки на дыфелт using method setThSortState
		const thSortListUnclickedEl = [...thSortList].filter(el => el !== th);
		thSortListUnclickedEl.forEach(el => setThSortState(el, "default"));
		//END меняем всем, кроме нажатого эл, иконки на дыфелт

		const nextState = getNextSortState(typeSort);
		setThSortState(th, nextState);

		setPage(1, filterAndSortTask(dynamicDataArr));
	}));


	function getNextSortState(state) {
		const states = ["asc", "desc", "default"];
		const index = states.indexOf(state);
		return states.length - 1 !== index ? states[index + 1] : states[0];
	}

	function setThSortState(th, state) {
		setSortIconState(state, th.querySelector(".table-todo__header-sort-arrow i"));
		th.setAttribute("sort-order", state);
	}

	function setSortIconState(sortOrder, iconVariable) {
		iconVariable.classList.toggle("fa-sort-up", sortOrder === "asc");
		iconVariable.classList.toggle("fa-sort-down", sortOrder === "desc");
		iconVariable.classList.toggle("fa-sort", sortOrder === "default");
	}

	function getCurrentSort() {
		const thList = tableHead.querySelectorAll("th");
		const thSortList = tableHead.querySelectorAll(".table-todo__header[datatype]");//only th that can be sorted
		const typesSort = ["asc", "desc"];
		const sortedEl = [...thSortList].filter(el => typesSort.includes(el.getAttribute("sort-order")));

		const indexSortedEl = [...thList].indexOf(sortedEl[0]);

		let activeSort;

		if (sortedEl.length !== 0) {
			activeSort = {
				el: thList[indexSortedEl],
				type: thList[indexSortedEl].getAttribute("datatype"),
				typeSort: thList[indexSortedEl].getAttribute("sort-order"),
			}
		} else {
			const firstElWithSort = [...thList].find(el => el.getAttribute("sort-order") === "default")
			activeSort = {
				el: firstElWithSort,
				type: firstElWithSort.getAttribute("datatype"),
				typeSort: "default",
			}
		}
		return activeSort;
	}
	//END sorting


	//filter
	function getCurrentFilter() {
		return filterOptions.value;
	}
	//END filter


	//sorting and filtering
	function filterAndSortTask(array) {
		const currentFilter = getCurrentFilter();
		let readyArray = [...array];

		//filter
		if (currentFilter === "completed") {
			readyArray = array.filter(el => el.status === true);

		} else if (currentFilter === "active") {
			readyArray = array.filter(el => el.status === false);
		}


		//sort
		const currentSort = getCurrentSort();

		if (currentSort.type === "text") {

			if (currentSort.typeSort === "asc") {
				readyArray.sort((a, b) => a.title.localeCompare(b.title));

			} else if (currentSort.typeSort === "desc") {
				readyArray.sort((a, b) => b.title.localeCompare(a.title));
			}
		} else if (currentSort.type === "date") {
			if (currentSort.typeSort === "asc") {
				readyArray.sort((a, b) => fromDateAndTimeToMilliseconds(a.date) - fromDateAndTimeToMilliseconds(b.date));

			} else if (currentSort.typeSort === "desc") {
				readyArray.sort((a, b) => fromDateAndTimeToMilliseconds(b.date) - fromDateAndTimeToMilliseconds(a.date));
			}
		}
		return readyArray;

	}
	//END sorting and filtering


	// general functions


	function fromDateAndTimeToMilliseconds(date) {
		const dateArr = date.split(" "); // ['04/09/2023', '12:39:46'] Разбить строку на дату и время
		const datePartsArr = dateArr[0].split("/"); // ['04', '09', '2023'] Разбить дату на день, месяц и год
		const timePartsArr = dateArr[1].split(":"); // ['12', '39', '46']  Разбить время на часы, минуты и секунды
		date = new Date(datePartsArr[2], datePartsArr[1] - 1, datePartsArr[0], timePartsArr[0], timePartsArr[1], timePartsArr[2]);
		return date.getTime();
	}

});