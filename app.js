document.addEventListener("DOMContentLoaded", function () {        const body = document.querySelector("body");        const table = document.querySelector(".table-todo");        const tableHead = document.querySelector(".table-todo thead");        const tableBody = document.querySelector(".table-todo tbody");        const addWrap = document.querySelector(".todo-header__add-box");        const addBtn = document.querySelector(".box-add__btn");        const addInput = document.querySelector(".box-add__field");        const filterOptions = document.querySelector(".select-sort-task");        const commonInputStatus = document.querySelector(".table-todo__status-common-input");        const btnRemoveAllTasks = document.querySelector(".todo-header__btn-remove-all");        addInput.addEventListener("focus", function () {            addWrap.classList.add("_focus");        });        addInput.addEventListener("blur", function () {            addWrap.classList.remove("_focus");        });        //pagination        const paginationNav = document.querySelector(".todo__pagination");        const paginationList = document.querySelector(".todo__pagination>ul");        //localStorage        let taskCommonStatus = JSON.parse((localStorage.getItem("taskCommonStatusKey")) || false);        let dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey")) || [];        //END localStorage        let paginationPageSize = 5; //сколько отображаем сначала for pagination        let paginationPagesLength = Math.ceil(dynamicDataArr.length / paginationPageSize);        if (dynamicDataArr.length !== 0) {            table.style.display = "table";            paginationNav.style.display = "flex";            createPagination(dynamicDataArr);            setPage(1, dynamicDataArr);        }        // PAGINATION        function createPagination(array) {            createPaginationItem(array,"Prev");            for (let i = 1; i <= Math.ceil(array.length / paginationPageSize); i++) {                createPaginationItem(array, i);            }            createPaginationItem(array,"Next");        }        function createPaginationItem(array, content) {            let paginationItem = document.createElement("li");            paginationItem.classList.add("pagination__item");            paginationList.appendChild(paginationItem);            let paginationLink = document.createElement("a");            paginationLink.setAttribute("href", "#");            paginationLink.classList.add("pagination__link");            paginationItem.appendChild(paginationLink);            paginationLink.innerText = content;            paginationLink.addEventListener("click", (e) => {                const el = e.target;                if (paginationList.querySelector("li:first-child>a") === el) {                    let activePage = paginationList.querySelector("a._active").textContent;                    setPage(+activePage - 1, array);                } else if (paginationList.querySelector("li:last-of-type>a") === el) {                    let activePage = paginationList.querySelector("a._active").textContent;                    setPage(+activePage + 1, array);                } else {                    setPage(el.innerText, array);                }            })        }        function getCurrentPage() {            return +paginationList.querySelector("a._active").textContent;        }        function setPage(page, array) {            if (paginationList.querySelector("a._active")) {                paginationList.querySelector("a._active").classList.remove("_active");            }            let items = paginationList.querySelectorAll(".pagination__item");            items[page].querySelector(".pagination__link").classList.add("_active");            let linkPrev = paginationList.querySelector("li:first-child>a").classList;            let linkNext = paginationList.querySelector("li:last-of-type>a").classList;            (+page === 1) ? linkPrev.add("_disabled") : linkPrev.remove("_disabled");            (+page === items.length - 2) ? linkNext.add("_disabled") : linkNext.remove("_disabled");            let lastRow = page * paginationPageSize;            let firstRow = lastRow - paginationPageSize;            tableBody.innerHTML = "";            array.slice(firstRow, lastRow).forEach(el => addTableRow(el));        }        //END PAGINATION        let defineSortingByText = true;        let defineSortingByDate = true;        tableHead.addEventListener("click", function (e) {            const el = e.target;            const type = el.getAttribute("datatype");            if (el.nodeName !== "TH" || type === null) return;            const index = el.cellIndex;            sortTable(index, type);        });        function sortTable(indexVariable, typeVariable) {            if (typeVariable === "text") {                if (defineSortingByText) {                    dynamicDataArr.sort((a, b) => a.title.localeCompare(b.title));                    defineSortingByText = false;                } else {                    dynamicDataArr.sort((a, b) => b.title.localeCompare(a.title));                    defineSortingByText = true;                }            } else if (typeVariable === "date") {                if (defineSortingByDate) {                    dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(a.date) - fromDateAndTimeToMilliseconds(b.date));                    defineSortingByDate = false;                } else {                    dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(b.date) - fromDateAndTimeToMilliseconds(a.date));                    defineSortingByDate = true;                }            }            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));            [...tableBody.childNodes].forEach(el => el.remove());            dynamicDataArr.forEach(el => addTableRow(el));        }        addBtn.addEventListener("click", onclickAddTaskButton);        addInput.addEventListener("keypress", function (keyEvent) {            if (keyEvent.key === "Enter") {                onclickAddTaskButton();            }        });        filterOptions.addEventListener("change", filterTasks);        function filterTasks() {            tableBody.innerHTML = "";            let nedeedRows;            if (this.value === "completed") {                nedeedRows = dynamicDataArr.filter(el => el.status);            } else if (this.value === "active") {                nedeedRows = dynamicDataArr.filter(el => !el.status);            } else {                nedeedRows = dynamicDataArr;            }            nedeedRows.forEach(el => addTableRow(el));            paginationList.innerHTML = "";            paginationPagesLength = Math.ceil(nedeedRows.length / paginationPageSize);            createPagination(nedeedRows);            setPage(1, nedeedRows);        }        btnRemoveAllTasks.addEventListener("click", removeAllTasks);        function removeAllTasks() {            let rows = tableBody.querySelectorAll(".table-todo__row");            for (const tr of rows) {                tr.remove();            }            dynamicDataArr.length = 0;            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));            table.style.display = "none";            paginationNav.style.display = "none";        }        function addTableRow(rowVariable) {            let row = document.createElement("tr");            row.classList.add("table-todo__row");            tableBody.appendChild(row);            let cellStatus = document.createElement("td");            cellStatus.classList.add("table-todo__cell");            row.appendChild(cellStatus);            let boxStatus = document.createElement("div");            boxStatus.classList.add("table-todo__status");            cellStatus.appendChild(boxStatus);            let labelStatus = document.createElement("label");            labelStatus.classList.add("checkbox");            // labelStatus.classList.add("table-todo__status-label");            boxStatus.appendChild(labelStatus);            let inputStatus = document.createElement("input");            inputStatus.classList.add("table-todo__status-input", "checkbox__input");            labelStatus.appendChild(inputStatus);            let textStatus = document.createElement("span");            textStatus.classList.add("checkbox__text");            labelStatus.appendChild(textStatus);            inputStatus.setAttribute("type", "checkbox");            inputStatus.checked = rowVariable.status;            inputStatus.addEventListener("change", doneTask);            if (rowVariable.status === true) row.classList.add("_done");            //for common checkbox status            commonInputStatus.checked = taskCommonStatus;            //end for common checkbox status            let cellTitle = document.createElement("td");            cellTitle.classList.add("table-todo__cell");            row.appendChild(cellTitle);            let boxTitle = document.createElement("div");            boxTitle.classList.add("table-todo__title");            cellTitle.appendChild(boxTitle);            boxTitle.innerText = rowVariable.title;            let cellDate = document.createElement("td");            cellDate.classList.add("table-todo__cell");            row.appendChild(cellDate);            let boxDate = document.createElement("div");            boxDate.classList.add("table-todo__date");            cellDate.appendChild(boxDate);            boxDate.textContent = rowVariable.date;            let actions = document.createElement("td");            actions.classList.add("table-todo__cell");            actions.innerHTML = '<div class="table-todo__actions"><a href ="#" class="table-todo__btn table-todo__btn-remove"><i class="fa-solid fa-xmark"></i></a><a href ="#" class="table-todo__btn table-todo__btn-edit"><i class="fa-solid fa-pencil"></i></a></div>';            row.appendChild(actions);            let removeBtn = actions.querySelector(".table-todo__btn-remove");            removeBtn.addEventListener("click", removeTask);            let editBtn = actions.querySelector(".table-todo__btn-edit");            editBtn.addEventListener("click", editTask);        }        function onclickAddTaskButton(e) {            if (e) {                e.preventDefault();            }            let value = addInput.value.trim();            let optionsDate = {                year: 'numeric',                month: '2-digit',                day: '2-digit'            };            let dateString = new Date().toLocaleDateString("en-GB", optionsDate);            let timeString = new Date().toLocaleTimeString("en-GB");            let date = dateString + " " + timeString;            let status = false;            if (value !== "") {                if (table.style.display !== "table") {                    table.style.display = "table";                }                let rowObj = {                    status: status,                    title: value,                    date: date,                };                addTableRow(rowObj);                filterTasks.call(filterOptions);                commonInputStatus.checked = false;                taskCommonStatus = false;                localStorage.setItem('taskCommonStatusKey', JSON.stringify(taskCommonStatus));                dynamicDataArr.push(rowObj);                localStorage.setItem('rowsKey', JSON.stringify(dynamicDataArr));                document.querySelector(".box-add__field").value = "";            }            paginationList.innerHTML = "";            // console.log(paginationPagesLength);            paginationPagesLength = Math.ceil(dynamicDataArr.length / paginationPageSize);            // console.log(paginationPagesLength);            // console.log(dynamicDataArr.length);            createPagination(dynamicDataArr);            let lastRow;            if (paginationList.querySelector("a._active")) {                let activePage = paginationList.querySelector("a._active").textContent;                setPage(activePage, dynamicDataArr);                lastRow = activePage * paginationPageSize;            } else {                console.log("the first");                setPage(1, dynamicDataArr);                lastRow = paginationPageSize;                paginationNav.style.display = "flex";            }            let firstRow = lastRow - paginationPageSize;            tableBody.innerHTML = "";            dynamicDataArr.slice(firstRow, lastRow).forEach(el => addTableRow(el));        }        function doneTask(e) {            const row = this.closest("tr");            this.checked === true ? row.classList.add("_done") : row.classList.remove("_done");            const indexRowOnPage = [...tableBody.childNodes].indexOf(row);            const currentPage = getCurrentPage();            const indexRowInArray = ((currentPage-1)*paginationPageSize) + indexRowOnPage;            dynamicDataArr[indexRowInArray].status = this.checked;            if (dynamicDataArr.some(el => el.status === false)) {                commonInputStatus.checked = false;                taskCommonStatus = false;            } else if (dynamicDataArr.every(el => el.status === true)) {                commonInputStatus.checked = true;                taskCommonStatus = true;            }            localStorage.setItem('taskCommonStatusKey', JSON.stringify(taskCommonStatus));            localStorage.setItem('rowsKey', JSON.stringify(dynamicDataArr));        }        function removeTask(e) {            e.preventDefault();            let row = this.closest("tr");            let rowsList = tableBody.childNodes;            let indexRow = [...rowsList].indexOf(row);            row.remove();            dynamicDataArr.splice(indexRow, 1);            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));            if ([...rowsList].every(el => el.classList.contains('_done'))) {                commonInputStatus.checked = true;                taskCommonStatus = true;            }            localStorage.setItem("taskCommonStatusKey", JSON.parse(taskCommonStatus));            if (dynamicDataArr.length === 0) {                table.style.display = "none";            }        }        let popupEdit = document.querySelector(".edit-task-popup");        let editPopupBtnSubmit = document.querySelector(".edit-task-popup__btn-submit");        let editPopupBtnCancel = document.querySelector(".edit-task-popup__btn-cancel");        let editPopupBtnClose = document.querySelector(".edit-task-popup__btn-close");        let editPopupField = document.querySelector(".edit-task-popup__field");        let editPopupOverlay = document.querySelector(".edit-task-popup .popup__overlay");        let editButtonClicked;        function editTask(e) {            e.preventDefault();            editButtonClicked = this;            let row = editButtonClicked.closest("tr");            let title = row.querySelector(".table-todo__title").innerHTML;            openEditPopup(title);        }        editPopupBtnSubmit.addEventListener("click", editTaskSaveState);        editPopupField.addEventListener("keypress", (e) => {            if (e.key === "Enter") {                editTaskSaveState();            }        });        function editTaskSaveState() {            let row = editButtonClicked.closest("tr");            let rowsList = tableBody.childNodes;            let indexRow = [...rowsList].indexOf(row);            dynamicDataArr[indexRow].title = editPopupField.value;            row.querySelector(".table-todo__title").innerHTML = editPopupField.value;            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));            closeEditPopup();        }        editPopupBtnCancel.addEventListener("click", closeEditPopup);        editPopupBtnClose.addEventListener("click", closeEditPopup);        function openEditPopup(title) {            popupEdit.classList.add("_open");            body.style.overflowY = "hidden";            editPopupField.value = title;            body.style.paddingRight = "15px";        }        function closeEditPopup() {            popupEdit.classList.remove("_open");            body.style.overflowY = "auto";            body.style.paddingRight = null;        }        editPopupOverlay.addEventListener("click", closeEditPopup);        // for all checkboxes        commonInputStatus.addEventListener("click", () => {            // tableBody.innerHTML = "";            // dynamicDataArr.forEach(el => addTableRow(el));            // console.log(dynamicDataArr);            // let rows = [...tableBody.querySelectorAll("tr")];            let rowsList = [...tableBody.childNodes];            if (commonInputStatus.checked === true) {                rowsList.filter(el => !el.classList.contains("_done")).forEach((el) => {                    el.querySelector(".table-todo__status input").checked = true;                    el.classList.add("_done");                    let indexRow = rowsList.indexOf(el);                    dynamicDataArr[indexRow].status = true;                    taskCommonStatus = true;                })            } else {                rowsList.filter(el => el.classList.contains("_done")).forEach((el, i) => {                    el.querySelector(".table-todo__status input").checked = false;                    el.classList.remove("_done");                    let indexRow = rowsList.indexOf(el);                    dynamicDataArr[indexRow].status = false;                    taskCommonStatus = false;                });            }            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));            localStorage.setItem("taskCommonStatusKey", JSON.stringify(taskCommonStatus));        });        function fromDateAndTimeToMilliseconds(date) {            const dateArr = date.split(" "); // ['04/09/2023', '12:39:46'] Разбить строку на дату и время            const datePartsArr = dateArr[0].split("/"); // ['04', '09', '2023'] Разбить дату на день, месяц и год            const timePartsArr = dateArr[1].split(":"); // ['12', '39', '46']  Разбить время на часы, минуты и секунды            date = new Date(datePartsArr[2], datePartsArr[1] - 1, datePartsArr[0], timePartsArr[0], timePartsArr[1], timePartsArr[2]);            return date.getTime();        }    });