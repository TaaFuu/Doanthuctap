// //Button Status
// const buttonStatus=document.querySelectorAll("[button-status]");

// if(buttonStatus.length>0){
//     let url=new URL(window.location.href);
    
//     buttonStatus.forEach((item)=>{
//         item.addEventListener("click",()=>{
//             const status=item.getAttribute("button-status");
            
//             if(status){
//                 url.searchParams.set("status",status);
//             }else{
//                 url.searchParams.delete("status");
//             }

//             window.location.href=url.href;
//         });
//     })
// }
// End Button Status


// //formSearch
// const formSearch=document.querySelector("#form-search");
// //console.log(formSearch);
// if(formSearch){
//     let url= new URL(window.location.href);
//     formSearch.addEventListener("submit",(e)=>{
//         e.preventDefault();
//         const keyword=e.target.elements.keyword.value;
//         //console.log(keyword);  

//         if(keyword){
//              url.searchParams.set("keyword",keyword);
//         }else{
//             url.searchParams.delete("keyword");
//         }

//         window.location.href=url.href;
//     });
// }
// //End formSearch

//Pagination
// const button_pagination=document.querySelectorAll("[button-pagination]");
// if(button_pagination){
//     let url = new URL(window.location.href);
// for (const item of button_pagination) {
//     item.addEventListener("click",()=>{
//         const page=item.getAttribute("button-pagination");
//         url.searchParams.set("page",page);

//         window.location.href=url.href;
//     })
// }
// }
// End Pagination

//Show Alert
const showAlert=document.querySelector("[show-alert]");
if(showAlert){
    const time=parseInt(showAlert.getAttribute("data-time"));
    const closeAlert=showAlert.querySelector("[close-alert]");

    setTimeout(()=>{

        showAlert.classList.add("alert-hidden");
    },time);

    closeAlert.addEventListener("click",()=>{
        showAlert.classList.add("alert-hidden");
    })
}
//End Show Alert

