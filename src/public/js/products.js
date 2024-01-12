document.addEventListener('DOMContentLoaded', () => {
    //Select the button by its class
    const addProductButtons = document.querySelectorAll('.addProductCart')

    //Add an event listener to the button
    addProductButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Product successfully added')
        })
    })
})
