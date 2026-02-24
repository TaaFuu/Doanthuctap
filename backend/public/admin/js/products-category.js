//Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
    const formDelete = document.querySelector("#form-delete-item");
    const path = formDelete.getAttribute("data-path");
    buttonsDelete.forEach(buttonDele => {
        buttonDele.addEventListener("click", () => {
            const isConFirm = confirm("Bạn muốn xóa mục này!");
            if (isConFirm) {
                const id = buttonDele.getAttribute("data-id");
                const action = `${path}/${id}?_method=DELETE`;
                formDelete.action = action;
                formDelete.submit();
            }
        })
    });
}
//End Delete Item