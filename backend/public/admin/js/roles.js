//Permissions
const tablePermissions=document.querySelector("[table-permissions]");
console.log(tablePermissions);
if(tablePermissions){
    let permissions=[];
    const buttonSubmit=document.querySelector("[button-submit]");
    //console.log(buttonSubmit);

    buttonSubmit.addEventListener("click",()=>{
        const rows=tablePermissions.querySelectorAll("[data-name]");
        //console.log(rows);

        rows.forEach((item)=>{
            const name=item.getAttribute("data-name"); 
            const inputs=item.querySelectorAll("input");

            //console.log(name);
            if(name=="id"){
                inputs.forEach((input)=>{
                    const id=input.value;
                    permissions.push({
                        id:id,
                        permissions:[],
                    })
                })
            }else{
                inputs.forEach((item,index)=>{
                    const checked=item.checked;

                    if(checked){
                        permissions[index].permissions.push(name);
                    }
                })
            }
        });
        //console.log(permissions);
        if(permissions.length>0){
        const formChangePermissions=document.querySelector("#form-change-permissions");
        const inputPermissions=formChangePermissions.querySelector("input[name='permissions']");
        inputPermissions.value=JSON.stringify(permissions);
        formChangePermissions.submit();
    }
    });
}
//End Permissions

//permissions data default
const dataRecords=document.querySelector("[data-records]");
if(dataRecords){
    const records=JSON.parse(dataRecords.getAttribute("data-records"));
    console.log(records);
    records.forEach((record,index)=>{
        const permissions=record.permissions;
        permissions.forEach(permission=>{
            const row=tablePermissions.querySelector(`[data-name="${permission}"]`);
            const input=row.querySelectorAll("input")[index];
            input.checked=true;
        })
    })
}
//end permissions data default
