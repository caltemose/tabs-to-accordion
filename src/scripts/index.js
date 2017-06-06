console.log('index.js')

const el = document.getElementById('msg')

const arr = [
    "Hi",
    "there"
]

const arr2 = [
    ...arr,
    "señorita!",
    "Javascript is working."
]

const msg = arr2.join(' ')

console.log(msg)
el.innerText = msg
