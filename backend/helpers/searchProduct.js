module.exports =(query)=>{
    const object={
        key:"",
        regex:""
    }
    if(query.keyword){
        object.key=query.keyword;
        const regex= new RegExp(object.key,"i");   
        object.regex=regex;  
    }
    return object;
}