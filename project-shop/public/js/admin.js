const handleDeleteProductClick = (button) => {
    const productId = button.parentNode.querySelector('[name=id]').value;
    const csrf = button.parentNode.querySelector('[name=_csrf]').value;

    const productElement = button.closest('article');

    fetch(
        `/admin/product/${productId}`,
        {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        })
        .then(response => {
            productElement.parentNode.removeChild(productElement);
        })
        .catch(console.error);
};
