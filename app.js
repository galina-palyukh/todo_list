document.addEventListener("DOMContentLoaded", function () {
        const body = document.querySelector("body");
        const table = document.querySelector(".table-todo");
        const tableHead = document.querySelector(".table-todo thead");
        const tableBody = document.querySelector(".table-todo tbody");

        const addWrap = document.querySelector(".todo-header__add-box");
        const addBtn = document.querySelector(".box-add__btn");
        const addInput = document.querySelector(".box-add__field");
        const filterOptions = document.querySelector(".select-filter-task");

   
        const commonInputStatus = document.querySelector(".table-todo__status-common-input");
        const btnRemoveAllTasks = document.querySelector(".todo-header__btn-remove-all");

        addInput.addEventListener("focus", function () {
            addWrap.classList.add("_focus");
        });
        

        addInput.addEventListener("blur", function () {
            addWrap.classList.remove("_focus");
        });

        //pagination
        const paginationNav = document.querySelector(".todo__pagination");
        const paginationList = document.querySelector(".todo__pagination>ul");

        //localStorage
        let dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey")) || [];
        //END localStorage

        let paginationPageSize = 5; //сколько отображаем сначала for pagination
        let paginationPagesLength = Math.ceil(dynamicDataArr.length / paginationPageSize);

        if (dynamicDataArr.length !== 0) {
            table.style.display = "table";
            paginationNav.style.display = "flex";
            createPagination(dynamicDataArr);
            setPage(1, dynamicDataArr);

            let rows = [...tableBody.childNodes];
            setCommonStatus(rows);
        }


        // PAGINATION
        function createPagination(array) {
            createPaginationItem(array, "Prev");

            for (let i = 1; i <= Math.ceil(array.length / paginationPageSize); i++) {
                createPaginationItem(array, i);
            }

            createPaginationItem(array, "Next");
        }


        function createPaginationItem(array, content) {
            let paginationItem = document.createElement("li");
            paginationItem.classList.add("pagination__item");
            paginationList.appendChild(paginationItem);

            let paginationLink = document.createElement("a");
            paginationLink.setAttribute("href", "#");
            paginationLink.classList.add("pagination__link");
            paginationLink.innerText = content;
            paginationItem.appendChild(paginationLink);

            paginationLink.addEventListener("click", (e) => {
                const el = e.target;

                if (paginationList.querySelector("li:first-child>a") === el) {
                    let activePage = paginationList.querySelector("a._active").textContent;
                    setPage(+activePage - 1, array);

                } else if (paginationList.querySelector("li:last-of-type>a") === el) {

                    let activePage = paginationList.querySelector("a._active").textContent;
                    setPage(+activePage + 1, array);

                } else {
                    setPage(el.innerText, array);
                }

                const rows = [...tableBody.childNodes];
                setCommonStatus(rows);
            })
        }


        function getCurrentPage() {
            const activePage = paginationList.querySelector("a._active");
            // alert(activePage.textContent);

            if (typeof (+activePage.textContent) === "number") {
                return +activePage.textContent

            } else {
                return 1;
            }

            // return !activePage ? 1 : activePage.textContent;
        }

        function setPage(page, array) {


            if (paginationList.querySelector("a._active")) {
                paginationList.querySelector("a._active").classList.remove("_active");
            }

            let items = paginationList.querySelectorAll(".pagination__item");

            items[page].querySelector(".pagination__link").classList.add("_active");

            let linkPrev = paginationList.querySelector("li:first-child>a").classList;

            let linkNext = paginationList.querySelector("li:last-of-type>a").classList;

            (+page === 1) ? linkPrev.add("_disabled") : linkPrev.remove("_disabled");
            (+page === items.length - 2) ? linkNext.add("_disabled") : linkNext.remove("_disabled");

            let lastRow = page * paginationPageSize;
            let firstRow = lastRow - paginationPageSize;
            tableBody.innerHTML = "";

            array.slice(firstRow, lastRow).forEach(el => addTableRow(el));
            // sortTable(type, sortArrowIcon);
        }

        //END PAGINATION


        let activeSort = null;


        let defineSortingByText = "default";
        let defineSortingByDate = "default";


        let thSortList = tableHead.querySelectorAll(".table-todo__header[datatype]");

        thSortList.forEach(item => item.addEventListener("click", function (e) {
            const clickedEl = e.target;
            const type = clickedEl.getAttribute("datatype");
            let sortArrowIcon = clickedEl.querySelector(".table-todo__header-sort-arrow i");

            //меняем всем, кроме нажатого эл, иконки на дыфелт
            const thSortListUnclickedEl = [...thSortList].filter(el => el !== clickedEl);

            let icons = [...thSortListUnclickedEl].map(el => el.querySelector(".table-todo__header-sort-arrow i"));

            [...icons].forEach(el => {
                el.classList.add("fa-sort");
                el.classList.remove("fa-sort-down");
                el.classList.remove("fa-sort-up");

            });

            // let thList = tableHead.querySelectorAll("th[datatype]");
            // console.log(thList);
            thSortList.forEach(el => el.setAttribute("sort-order", "default"));

            //END меняем всем, кроме нажатого эл, иконки на дыфелт

            if (item.getAttribute("datatype") === "text") {
                if (defineSortingByText === "default") {
                    defineSortingByText = "asc";

                } else if (defineSortingByText === "asc") {
                    defineSortingByText = "desc";


                } else if (defineSortingByText === "desc") {
                    defineSortingByText = "default";
                }


            } else if (item.getAttribute("datatype") === "date") {
                if (defineSortingByDate === "default") {
                    defineSortingByDate = "asc";
                } else if (defineSortingByDate === "asc") {
                    defineSortingByDate = "desc";
                } else if (defineSortingByDate === "desc") {
                    defineSortingByDate = "default";
                }
            }

            sortTable(type, sortArrowIcon, clickedEl);

            if (type === "text") {
                defineSortingByDate = "default";

            } else if (type === "date") {
                defineSortingByText = "default";
            } // ???


            filterTasks.call(filterOptions);

            // getCurrentSort(clickedEl, type);
            getCurrentSort();

            // paginationList.innerHTML = "";
            // paginationPagesLength = Math.ceil(dynamicDataArr.length / paginationPageSize);
            //
            // createPagination(dynamicDataArr);
            //
            // setPage(1, dynamicDataArr);

        }));


        function sortTable(typeVariable, iconVariable, clickedElVariable) {
            // debugger;

            if (typeVariable === "text") {

                if (defineSortingByText === "default") {
                    tableBody.innerHTML = "";
                    dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey"));
                    dynamicDataArr.forEach(el => addTableRow(el));
                    setSortIconState("default", iconVariable);
                    clickedElVariable.setAttribute("sort-order", "default");

                } else if (defineSortingByText === "asc") {
                    dynamicDataArr.sort((a, b) => a.title.localeCompare(b.title));
                    setSortIconState("asc", iconVariable);
                    clickedElVariable.setAttribute("sort-order", "asc");

                } else if (defineSortingByText === "desc") {
                    clickedElVariable.setAttribute("sort-order", "desc");
                    dynamicDataArr.sort((a, b) => b.title.localeCompare(a.title));
                    setSortIconState("desc", iconVariable);
                    clickedElVariable.setAttribute("sort-order", "desc");
                }


            } else if (typeVariable === "date") {
                if (defineSortingByDate === "default") {
                    tableBody.innerHTML = "";
                    dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey"));
                    dynamicDataArr.forEach(el => addTableRow(el));
                    setSortIconState("default", iconVariable);
                    clickedElVariable.setAttribute("sort-order", "default");

                } else if (defineSortingByDate === "asc") {
                    dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(a.date) - fromDateAndTimeToMilliseconds(b.date));
                    setSortIconState("asc", iconVariable);
                    clickedElVariable.setAttribute("sort-order", "asc");

                } else if (defineSortingByDate === "desc") {
                    dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(b.date) - fromDateAndTimeToMilliseconds(a.date));
                    setSortIconState("desc", iconVariable);
                    clickedElVariable.setAttribute("sort-order", "desc");
                }
            }


            // let sortOrder = clickedElVariable.getAttribute("sort-order");
            // console.log(sortOrder);
            //
            // activeSort = {
            //     el: [...thSortList].indexOf(clickedElVariable),
            //     type: clickedElVariable.getAttribute("datatype"),
            //     typeSort: sortOrder,
            // };
            //
            // console.log(activeSort);


            tableBody.innerHTML = "";
            dynamicDataArr.forEach(el => addTableRow(el));

        }

        function setSortIconState(sortOrder, iconVariable) {
            if (sortOrder === "asc") {
                iconVariable.classList.add("fa-sort-up");
                iconVariable.classList.remove("fa-sort-down");
                iconVariable.classList.remove("fa-sort");


            } else if (sortOrder === "desc") {
                iconVariable.classList.add("fa-sort-down");
                iconVariable.classList.remove("fa-sort-up");
                iconVariable.classList.remove("fa-sort");

            } else if (sortOrder === "default") {
                iconVariable.classList.add("fa-sort");
                iconVariable.classList.remove("fa-sort-down");
                iconVariable.classList.remove("fa-sort-up");

            }
        }


        getCurrentSort();

        function getCurrentSort() {
            let thList = tableHead.querySelectorAll("th");
            let thSortList = tableHead.querySelectorAll(".table-todo__header[datatype]");//only th that can be sorted

            let typesSort = ["asc", "desc"];

            let sortedEl = [...thSortList].filter(el => el.getAttribute("sort-order") === "asc" || el.getAttribute("sort-order") === "desc");
            console.log(sortedEl);
            let indexSortedEl = [...thList].indexOf(sortedEl[0]);

            // console.log( sortedEl);
            // console.log( indexSortedEl);
            // console.log( thList[indexSortedEl]);

            if (sortedEl.length !== 0) {
                 activeSort = {
                    el: thList[indexSortedEl],
                    type: thList[indexSortedEl].getAttribute("datatype"),
                    typeSort: thList[indexSortedEl].getAttribute("sort-order"),
                };
                // console.log(activeSort);
                return activeSort;
            } else {
                // console.log("null");
                return null;
            }
        }



        //     thSortList.forEach(elem => {
        //         let sortOrderValue = elem.getAttribute("sort-order");
        //         if (arr.includes(sortOrderValue)) {
        //
        //             activeSort = {
        //                 el: thList[indexSortedEl],
        //                 type: thList[indexSortedEl].getAttribute("datatype"),
        //                 typeSort: thList[indexSortedEl].getAttribute("sort-order"),
        //             };
        //
        //         } else {
        //             activeSort = null;
        //         }
        //     });
        //     console.log(activeSort);
        //     return activeSort;
        //
        // }




        function getCurrentFilter() {
            return filterOptions.value;
        }

        console.log(getCurrentFilter());




    function filterAndSortTask(array) {
        let currentFilter = getCurrentFilter();
        let readyArray = array;

        //filter
        if (currentFilter === "completed") {
            readyArray = array.filter(el => el.status === true);
            console.log(readyArray);
            // return;

        } else if (currentFilter === "active") {
            readyArray = array.filter(el => el.status === false);
            console.log(readyArray);
            // return;
        }


        //sort
        let currentSort = getCurrentSort();

        if (currentSort.type === "text") {

            if (defineSortingByText === "default") {
                tableBody.innerHTML = "";
                dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey"));
                dynamicDataArr.forEach(el => addTableRow(el));
                setSortIconState("default", iconVariable);
                clickedElVariable.setAttribute("sort-order", "default");

            } else if (defineSortingByText === "asc") {
                dynamicDataArr.sort((a, b) => a.title.localeCompare(b.title));
                setSortIconState("asc", iconVariable);
                clickedElVariable.setAttribute("sort-order", "asc");

            } else if (defineSortingByText === "desc") {
                clickedElVariable.setAttribute("sort-order", "desc");
                dynamicDataArr.sort((a, b) => b.title.localeCompare(a.title));
                setSortIconState("desc", iconVariable);
                clickedElVariable.setAttribute("sort-order", "desc");
            }


        } else if (typeVariable === "date") {
            if (defineSortingByDate === "default") {
                tableBody.innerHTML = "";
                dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey"));
                dynamicDataArr.forEach(el => addTableRow(el));
                setSortIconState("default", iconVariable);
                clickedElVariable.setAttribute("sort-order", "default");

            } else if (defineSortingByDate === "asc") {
                dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(a.date) - fromDateAndTimeToMilliseconds(b.date));
                setSortIconState("asc", iconVariable);
                clickedElVariable.setAttribute("sort-order", "asc");

            } else if (defineSortingByDate === "desc") {
                dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(b.date) - fromDateAndTimeToMilliseconds(a.date));
                setSortIconState("desc", iconVariable);
                clickedElVariable.setAttribute("sort-order", "desc");
            }
        }


        console.log(readyArray);
    }



    // function sortTable(typeVariable, iconVariable, clickedElVariable) {
        //     // debugger;
        //
        //     if (typeVariable === "text") {
        //
        //         if (defineSortingByText === "default") {
        //             tableBody.innerHTML = "";
        //             dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey"));
        //             dynamicDataArr.forEach(el => addTableRow(el));
        //             setSortIconState("default", iconVariable);
        //             clickedElVariable.setAttribute("sort-order", "default");
        //
        //         } else if (defineSortingByText === "asc") {
        //             dynamicDataArr.sort((a, b) => a.title.localeCompare(b.title));
        //             setSortIconState("asc", iconVariable);
        //             clickedElVariable.setAttribute("sort-order", "asc");
        //
        //         } else if (defineSortingByText === "desc") {
        //             clickedElVariable.setAttribute("sort-order", "desc");
        //             dynamicDataArr.sort((a, b) => b.title.localeCompare(a.title));
        //             setSortIconState("desc", iconVariable);
        //             clickedElVariable.setAttribute("sort-order", "desc");
        //         }
        //
        //
        //     } else if (typeVariable === "date") {
        //         if (defineSortingByDate === "default") {
        //             tableBody.innerHTML = "";
        //             dynamicDataArr = JSON.parse(localStorage.getItem("rowsKey"));
        //             dynamicDataArr.forEach(el => addTableRow(el));
        //             setSortIconState("default", iconVariable);
        //             clickedElVariable.setAttribute("sort-order", "default");
        //
        //         } else if (defineSortingByDate === "asc") {
        //             dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(a.date) - fromDateAndTimeToMilliseconds(b.date));
        //             setSortIconState("asc", iconVariable);
        //             clickedElVariable.setAttribute("sort-order", "asc");
        //
        //         } else if (defineSortingByDate === "desc") {
        //             dynamicDataArr.sort((a, b) => fromDateAndTimeToMilliseconds(b.date) - fromDateAndTimeToMilliseconds(a.date));
        //             setSortIconState("desc", iconVariable);
        //             clickedElVariable.setAttribute("sort-order", "desc");
        //         }
        //     }
        //
        //
        //     // let sortOrder = clickedElVariable.getAttribute("sort-order");
        //     // console.log(sortOrder);
        //     //
        //     // activeSort = {
        //     //     el: [...thSortList].indexOf(clickedElVariable),
        //     //     type: clickedElVariable.getAttribute("datatype"),
        //     //     typeSort: sortOrder,
        //     // };
        //     //
        //     // console.log(activeSort);
        //
        //
        //     tableBody.innerHTML = "";
        //     dynamicDataArr.forEach(el => addTableRow(el));
        //
        // }



        addBtn.addEventListener("click", onclickAddTaskButton);

        addInput.addEventListener("keypress", function (keyEvent) {
            if (keyEvent.key === "Enter") {
                onclickAddTaskButton();
            }
        });

        filterOptions.addEventListener("change", filterTasks);

        function filterTasks() {
            // debugger;

            let neededRows;

            if (this.value === "completed") {
                neededRows = dynamicDataArr.filter(el => el.status);

            } else if (this.value === "active") {
                neededRows = dynamicDataArr.filter(el => !el.status);

            } else {
                neededRows = dynamicDataArr;
            }

            const currentPage = getCurrentPage();

            paginationList.innerHTML = "";

            paginationPagesLength = Math.ceil(neededRows.length / paginationPageSize);

            createPagination(neededRows);

            setPage(currentPage, neededRows);

            const rows = [...tableBody.childNodes];
            setCommonStatus(rows);
        }


        btnRemoveAllTasks.addEventListener("click", removeAllTasks);

        function removeAllTasks() {
            let rows = tableBody.querySelectorAll(".table-todo__row");

            for (const tr of rows) {
                tr.remove();
            }

            dynamicDataArr.length = 0;
            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));
            table.style.display = "none";
            paginationNav.style.display = "none";
        }


        function addTableRow(rowVariable) {
            let row = document.createElement("tr");
            row.classList.add("table-todo__row");
            tableBody.appendChild(row);

            let cellStatus = document.createElement("td");
            cellStatus.classList.add("table-todo__cell");
            row.appendChild(cellStatus);
            let boxStatus = document.createElement("div");
            boxStatus.classList.add("table-todo__status");
            cellStatus.appendChild(boxStatus);

            let labelStatus = document.createElement("label");
            labelStatus.classList.add("checkbox");
            boxStatus.appendChild(labelStatus);


            let inputStatus = document.createElement("input");
            inputStatus.classList.add("table-todo__status-input", "checkbox__input");
            labelStatus.appendChild(inputStatus);

            let textStatus = document.createElement("span");
            textStatus.classList.add("checkbox__text");
            labelStatus.appendChild(textStatus);

            inputStatus.setAttribute("type", "checkbox");
            inputStatus.checked = rowVariable.status;
            inputStatus.addEventListener("change", doneTask);

            if (rowVariable.status === true) row.classList.add("_done");

            let cellTitle = document.createElement("td");
            cellTitle.classList.add("table-todo__cell");
            row.appendChild(cellTitle);
            let boxTitle = document.createElement("div");
            boxTitle.classList.add("table-todo__title");
            cellTitle.appendChild(boxTitle);
            boxTitle.innerText = rowVariable.title;

            let cellDate = document.createElement("td");
            cellDate.classList.add("table-todo__cell");
            row.appendChild(cellDate);
            let boxDate = document.createElement("div");
            boxDate.classList.add("table-todo__date");
            cellDate.appendChild(boxDate);
            boxDate.textContent = rowVariable.date;

            let actions = document.createElement("td");
            actions.classList.add("table-todo__cell");
            actions.innerHTML = '<div class="table-todo__actions"><a href ="#" class="table-todo__btn table-todo__btn-remove"><i class="fa-solid fa-xmark"></i></a><a href ="#" class="table-todo__btn table-todo__btn-edit"><i class="fa-solid fa-pencil"></i></a></div>';
            row.appendChild(actions);

            let removeBtn = actions.querySelector(".table-todo__btn-remove");
            removeBtn.addEventListener("click", removeTask);

            let editBtn = actions.querySelector(".table-todo__btn-edit");
            editBtn.addEventListener("click", editTask);
        }

        function onclickAddTaskButton(e) {
            // debugger;
            if (e) {
                e.preventDefault();
            }


            let value = addInput.value.trim();

            let optionsDate = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            };

            let dateString = new Date().toLocaleDateString("en-GB", optionsDate);
            let timeString = new Date().toLocaleTimeString("en-GB");

            let date = dateString + " " + timeString;
            let status = false;

            if (value !== "") {
                if (table.style.display !== "table") {
                    table.style.display = "table";
                }

                let rowObj = {
                    status: status,
                    title: value,
                    date: date,
                };

                addTableRow(rowObj);
                // filterTasks.call(filterOptions);

                filterOptions.value = "all";
                // console.log(filterOptions.value);

                commonInputStatus.checked = false;

                dynamicDataArr.push(rowObj);

                localStorage.setItem('rowsKey', JSON.stringify(dynamicDataArr));

                document.querySelector(".box-add__field").value = "";
            }


            paginationList.innerHTML = "";
            paginationPagesLength = Math.ceil(dynamicDataArr.length / paginationPageSize);
            createPagination(dynamicDataArr);


            let lastRow;

            if (paginationList.querySelector("a._active")) {
                let activePage = paginationList.querySelector("a._active").textContent;
                setPage(activePage, dynamicDataArr);
                lastRow = activePage * paginationPageSize;

            } else {
                // console.log("the first");
                setPage(1, dynamicDataArr);
                lastRow = paginationPageSize;
                paginationNav.style.display = "flex";
            }
            let firstRow = lastRow - paginationPageSize;

            tableBody.innerHTML = "";
            dynamicDataArr.slice(firstRow, lastRow).forEach(el => addTableRow(el));
        }

        function doneTask(e) {
            const row = this.closest("tr");
            this.checked === true ? row.classList.add("_done") : row.classList.remove("_done");


            const title = row.querySelector(".table-todo__title").innerHTML;
            const date = row.querySelector(".table-todo__date").innerHTML;

            const indexRow = dynamicDataArr.indexOf(dynamicDataArr.find(el => el.title === title && el.date === date));

            dynamicDataArr[indexRow].status = this.checked;

            const rows = [...tableBody.childNodes];
            setCommonStatus(rows);

            filterTasks.call(filterOptions);

            localStorage.setItem('rowsKey', JSON.stringify(dynamicDataArr));

        }

        function setCommonStatus(rows) {
            if (rows.every(el => el.classList.contains("_done"))) {
                commonInputStatus.checked = true;
            } else {
                commonInputStatus.checked = false;
            }

            // commonInputStatus.checked = rows.every(el => el.classList.contains("_done"));
        }

        function removeTask(e) {
            e.preventDefault();

            let rowClicked = this.closest("tr");
            const title = rowClicked.querySelector(".table-todo__title").innerHTML;
            const date = rowClicked.querySelector(".table-todo__date").innerHTML;

            const indexRow = dynamicDataArr.indexOf(dynamicDataArr.find(el => el.title === title && el.date === date));

            rowClicked.remove();
            dynamicDataArr.splice(indexRow, 1);

            const currentPage = getCurrentPage();

            if (dynamicDataArr.length === 0) {
                table.style.display = "none";
                paginationNav.style.display = "none";
            }

            let rows = [...tableBody.childNodes];
            console.log(rows);

            tableBody.innerHTML = "";
            dynamicDataArr.forEach(el => addTableRow(el));

            paginationList.innerHTML = "";

            createPagination(dynamicDataArr);

            if (rows.length === 0) {
                setPage(currentPage - 1, dynamicDataArr);

            } else {
                setPage(currentPage, dynamicDataArr);
            }

            //check common status after removing one Task
            setCommonStatus(rows);
            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));
        }


        let popupEdit = document.querySelector(".edit-task-popup");
        let editPopupBtnSubmit = document.querySelector(".edit-task-popup__btn-submit");
        let editPopupBtnCancel = document.querySelector(".edit-task-popup__btn-cancel");
        let editPopupBtnClose = document.querySelector(".edit-task-popup__btn-close");
        let editPopupField = document.querySelector(".edit-task-popup__field");
        let editPopupOverlay = document.querySelector(".edit-task-popup .popup__overlay");

        let editButtonClicked;

        function editTask(e) {
            e.preventDefault();
            editButtonClicked = this;
            let row = editButtonClicked.closest("tr");
            let title = row.querySelector(".table-todo__title").innerHTML;
            openEditPopup(title);
        }

        editPopupBtnSubmit.addEventListener("click", editTaskSaveState);

        editPopupField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                editTaskSaveState();
            }
        });

        function editTaskSaveState() {
            let rowClicked = editButtonClicked.closest("tr");
            const title = rowClicked.querySelector(".table-todo__title").innerHTML;
            const date = rowClicked.querySelector(".table-todo__date").innerHTML;

            const indexRow = dynamicDataArr.indexOf(dynamicDataArr.find(el => el.title === title && el.date === date));
            dynamicDataArr[indexRow].title = editPopupField.value;
            rowClicked.querySelector(".table-todo__title").innerHTML = editPopupField.value;
            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));
            closeEditPopup();
        }

        editPopupBtnCancel.addEventListener("click", closeEditPopup);
        editPopupBtnClose.addEventListener("click", closeEditPopup);


        function openEditPopup(title) {
            popupEdit.classList.add("_open");
            body.style.overflowY = "hidden";
            editPopupField.value = title;
            // body.style.paddingRight = "15px";
        }

        function closeEditPopup() {
            popupEdit.classList.remove("_open");
            body.style.overflowY = "auto";
            body.style.paddingRight = null;

        }

        editPopupOverlay.addEventListener("click", closeEditPopup);

        // for all checkboxes
        commonInputStatus.addEventListener("click", () => {

            let rowsList = [...tableBody.childNodes];

            if (commonInputStatus.checked === true) {
                rowsList.filter(el => !el.classList.contains("_done")).forEach((el) => {
                    el.querySelector(".table-todo__status input").checked = true;
                    el.classList.add("_done");

                    const title = el.querySelector(".table-todo__title").innerHTML;
                    const date = el.querySelector(".table-todo__date").innerHTML;
                    const indexRow = dynamicDataArr.indexOf(dynamicDataArr.find(el => el.title === title && el.date === date));

                    dynamicDataArr[indexRow].status = true;
                })

            } else {
                rowsList.filter(el => el.classList.contains("_done")).forEach((el, i) => {
                    el.querySelector(".table-todo__status input").checked = false;
                    el.classList.remove("_done");

                    const title = el.querySelector(".table-todo__title").innerHTML;
                    const date = el.querySelector(".table-todo__date").innerHTML;

                    const indexRow = dynamicDataArr.indexOf(dynamicDataArr.find(el => el.title === title && el.date === date));
                    dynamicDataArr[indexRow].status = false;
                });
            }

            filterTasks.call(filterOptions);

            localStorage.setItem("rowsKey", JSON.stringify(dynamicDataArr));

        });


        function fromDateAndTimeToMilliseconds(date) {
            const dateArr = date.split(" "); // ['04/09/2023', '12:39:46'] Разбить строку на дату и время
            const datePartsArr = dateArr[0].split("/"); // ['04', '09', '2023'] Разбить дату на день, месяц и год
            const timePartsArr = dateArr[1].split(":"); // ['12', '39', '46']  Разбить время на часы, минуты и секунды
            date = new Date(datePartsArr[2], datePartsArr[1] - 1, datePartsArr[0], timePartsArr[0], timePartsArr[1], timePartsArr[2]);
            return date.getTime();
        }


    }
);
