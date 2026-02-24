module.exports = (query)=>{
    let FilterStatus=[
        {
            name:"Tất cả",
            status:"",
            class:""
        },
        {
            name:"Hoạt Động ",
            status:"active",
            class:""
        },
        {
            name:"Dừng Hoạt Động",
            status:"inactive",
            class:""
        }
    ];
    if(query.status){
        const index=FilterStatus.findIndex(item=>
            item.status == query.status
        );
        FilterStatus[index].class="active";
    }else{
        const index=FilterStatus.findIndex(item=> item.status == "");
        FilterStatus[index].class="active";
    }
    return FilterStatus;
}