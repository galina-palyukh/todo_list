// let a1 = [0,1,2];
// // let a2 = [3,4,5];
// // let a = ["a1", "a2"];
// //
// // for(const el of a){
// //     console.log(el);
// // }

let arr = [
    {name: "Alex",
        age: 22},
    {name: "Robert",
        age: 30},
];

if(arr.every(obj => obj.age > 18)){
    console.log("Все совершеннолетние");
}

// arr.forEach(obj => console.log(obj.name === 'Max'));
// console.log("Есть несовершеннолетние");



//
// let page = arr[indexActiveItemIndex + 1].querySelector(".pagination__link");
// console.log(page);


// link.classList.add("_active");

// let lastRow = page * paginationShowRows;
// let firstRow = lastRow -  paginationShowRows;
//
// tableBody.innerHTML = "";
// dynamicDateArr.slice(firstRow,lastRow).forEach(el => addTableRow(el));