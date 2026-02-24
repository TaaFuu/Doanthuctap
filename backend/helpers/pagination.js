module.exports = (objectPagination,query,countProduct)=>{
    if(query.page){
        objectPagination.currentPage = parseInt(query.page);
    }
    objectPagination.skip = (objectPagination.currentPage-1)*objectPagination.limitPage;

    
    
    const totalPage=Math.ceil(countProduct/objectPagination.limitPage);
    objectPagination.totalPage=totalPage;
    return objectPagination;
}
