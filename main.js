
let mealsState = []
let user = {}
let ruta = 'login' //login, register y order
const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
    
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)
    
    //Escuchador de eventos
    element.addEventListener('click', () => {
        //Al hacer clik sobre el elemento se agrega una select al html 
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id   

    })
    return element    

} 

const renderOrder = (order, meals) => {
    const meal = meals.find( meal =>  meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`)
    return element
}

const inicializaFormulario = () => {
     //Buscamos el elemento por el id
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
    e.preventDefault()
    const submit = document.getElementById('submit')
    submit.setAttribute('disabled', true)
    const mealId = document.getElementById('meals-id')
    const mealIdValue =  mealId.value
        //Es la negacioón
    if (!mealIdValue){
    alert('Debe seleccionar un plato')
    submit.removeAttribute('disabled')
    return
    }

    const order = {
    meal_id: mealIdValue,
    user_id: user._id,
    }

    fetch('https://serverless-nelsonf2019.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                //'Access-Control-Allow-Origin': '*',
               // 'Access-Control-Allow-Credentials': true,
            },
             //Body no recibe objetoS de javascript sino un string
            body: JSON.stringify(order)
        }).then(x => x.json())    
            .then(respuesta => {
            const renderedOrder = renderOrder(respuesta, mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })
    }
}

const inicializaDatos = () => {

        //el api de fetch nos permite obtener rutas url
        fetch('https://serverless-nelsonf2019.vercel.app/api/meals')
        //En este caso nosotros pedimos una respuesta y es devueta como objeto por eso es json
        .then(response => response.json())
        .then(data => {
            mealsState = data
            const mealsList = document.getElementById('meals-list')
            const submit = document.getElementById('submit')
            const listItems = data.map(renderItem)//nos devuelve un arreglo
            mealsList.removeChild(mealsList.firstElementChild)//Remueve el elemento de cargando... cuando se cargan los datos
            listItems.forEach(element => mealsList.appendChild(element))
            //REMOVEMOS EL ATRIBUTO DISABLE PARA HABILITAR EL BOTON CUANDO 
            //SE CARGUE TODO POR COMPLETO
            submit.removeAttribute('disabled')
            fetch('https://serverless-nelsonf2019.vercel.app/api/orders')
            .then(response => response.json())
            .then(ordersData => {
                const ordersList = document.getElementById('orders-list')   
                const listOrders = ordersData.map(orderData => renderOrder(orderData, data))
                ordersList.removeChild(ordersList.firstElementChild) 
                listOrders.forEach(element => ordersList.appendChild(element)) 
                //submit.removeAttribute('disabled')
                
            })
        })

}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token){ 
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    rednerLogin()
}
const renderOrders = () => {
    const ordersView = document.getElementById('Orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicializaDatos()
}
const rednerLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        fetch('https://serverless-nelsonf2019.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',   
        },
        body: JSON.stringify({ email, password })   //Body no recibe objetoS de javascript sino un string  
        }).then(x => x.json())
            .then(respuesta => {
                localStorage.setItem('token', respuesta.token)
                ruta = 'orders'
                return respuesta.token
            })
            .then(x => {
            return fetch('https://serverless-nelsonf2019.vercel.app/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',  
                        authorization: token,
                    },
                })
            })
            .then(x => x.json)
            .then(fetchedUser => {
                localStorage.setItem('user', JSON.stringify(fetchedUser))
                user = fetchedUser
                renderOrders()
            })
    } //body: JSON.stringify({ email: 'ciaociaopizzeria@piza.com', password: '123456' })
}
window.onload = () => {
    renderApp()    

}
