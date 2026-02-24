//Change Status
const buttonChangeStatus=document.querySelectorAll("[button-change-status]");
if(buttonChangeStatus.length>0){
    const formChangeStatus=document.querySelector("#form-change-status");
    const path=formChangeStatus.getAttribute("data-path");
    //console.log(path);

    buttonChangeStatus.forEach(button=>{
        button.addEventListener("click",()=>{
            const statusCurrent = button.getAttribute("data-status");
            const id=button.getAttribute("data-id");

            let statusChange = statusCurrent == "active" ? "inactive" : "active";

            // console.log(statusChange);
            // console.log(statusCurrent);
            // console.log(id);

            const action= path+ `/${statusChange}/${id}?_method=PATCH`;
            console.log(action);

            formChangeStatus.action=action;

            formChangeStatus.submit();
        })  
    })
}
//End Change Status


//CheckBox Multi
const checkBoxMulti=document.querySelector("[checkbox-multi]");
if(checkBoxMulti){
    const inputCheckAll=checkBoxMulti.querySelector("input[name='checkall']");
    const inputsId=checkBoxMulti.querySelectorAll("input[name='id']");
    inputCheckAll.addEventListener("click",()=>{
        if(inputCheckAll.checked){
            inputsId.forEach(input =>{
                input.checked=true;
            })
        }else{
            inputsId.forEach(input =>{
                input.checked=false;
            })
        }
    });

    inputsId.forEach( (input) =>{
            input.addEventListener("click",()=>{
                const countChecked=checkBoxMulti.querySelectorAll("input[name='id']:checked").length;

                if(countChecked == inputsId.length){
                    inputCheckAll.checked=true;
                }else{
                    inputCheckAll.checked=false;
                }
            })
        });
}
//End CheckBox Multi

//Form change Multi
const formChangeMulti=document.querySelector("[form-change-multi]");
//console.log(formChangeMulti);
if(formChangeMulti){
    formChangeMulti.addEventListener("submit",(e)=>{
        e.preventDefault();
        const checkBoxMulti=document.querySelector("[checkbox-multi]");
        const inputChecked=checkBoxMulti.querySelectorAll("input[name='id']:checked");

        const typeChange= e.target.elements.type.value;
        
        if(typeChange == "delete-all"){
            const isConFirm=confirm("Bạn có chắc muốn xóa những sản phẩm này !");

            if(!isConFirm){
                return;
            }
        }

        if(inputChecked.length>0){
            let ids=[];
            const inputsId=formChangeMulti.querySelector("input[name='ids']");
            inputChecked.forEach(input =>{
                const id= input.getAttribute("value");

                if(typeChange=="change-position"){
                    const position=input.closest("tr").querySelector("input[name='position']").value;
                    //console.log(`${id}-${position}`);
                    ids.push(`${id}-${position}`);
                }else{
                    ids.push(id);
                }


            });
            //console.log(ids.join(", "));
            inputsId.value=ids.join(", ");
            formChangeMulti.submit();
        }else{
            alert("Vui lòng chọn ít nhất một ô");
        }
    })
}
//End form change multi

//Delete Item
const buttonsDelete=document.querySelectorAll("[button-delete]");
if(buttonsDelete.length>0){
    const formDelete=document.querySelector("#form-delete-item");
    const path=formDelete.getAttribute("data-path");
    buttonsDelete.forEach(buttonDele =>{    
        buttonDele.addEventListener("click",()=>{
            const isConFirm=confirm("Bạn muốn xóa sản phẩm này!");

            if(isConFirm){
                const id=buttonDele.getAttribute("data-id");

                const action= `${path}/${id}?_method=DELETE`;
                formDelete.action=action;
                formDelete.submit();
            }
        })
    })
}
//End Delete Item


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

//Upload Image
const uploadImage=document.querySelector("[upload-image]");
// console.log(uploadImage);
if(uploadImage){
    const uploadImageInput=document.querySelector("[upload-image-input]");
    const uploadImagePreview=document.querySelector("[upload-image-preview]");
    uploadImageInput.addEventListener("change",(e)=>{
        console.log(e);
        const file=e.target.files[0];
        if(file){
            uploadImagePreview.src=URL.createObjectURL(file);

            const buttonDele=document.createElement("button");
            buttonDele.textContent="X";
            const previewContainer = uploadImagePreview.parentElement;
            previewContainer.style.position = "relative";
            previewContainer.appendChild(buttonDele);
            
            buttonDele.addEventListener("click",()=>{
                uploadImagePreview.src = "";
                uploadImageInput.value = "";
                buttonDele.remove(); 
            })
        }
    })
}
//End Upload Image

//Sort
const sort=document.querySelector("[sort]");
let url = new URL(window.location.href);
if(sort){
    const sortSelect=document.querySelector("[sort-select]");
    const sortClear=document.querySelector("[sort-clear]");
    //console.log(sortSelect);
    sortSelect.addEventListener("change",(e)=>{
        const value=e.target.value;
        const [sortKey,sortValue]=value.split("-");

        url.searchParams.set("sortKey",sortKey);
        url.searchParams.set("sortValue",sortValue);

        window.location.href=url.href;
    });
    sortClear.addEventListener("click",()=>{
        url.searchParams.delete("sortKey");
        url.searchParams.delete("sortValue");

        window.location.href=url.href;
    });

    //Thêm selected
    const sortKey=url.searchParams.get("sortKey");
    const sortValue=url.searchParams.get("sortValue");

    if(sortKey && sortValue){
        const stringSort=`${sortKey}-${sortValue}`;
        
        const optionSelected=sortSelect.querySelector(`option[value='${stringSort}']`);
        optionSelected.selected=true;
    }
    //End thêm selected

}
//End Sort
