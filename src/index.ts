const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(1)
  })
})

const p2 = new Promise<number>((resolve) => {
  setTimeout(() => {
    resolve(2)
  })
})

const p3 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(3)
  })
})

p1.then((value) => {
  console.log(value)
})

p3.then((value) => {
  console.log(value)
})

p2.then((value) => {
  return value
}).then((value) => {
  console.log(value)
})

Promise.resolve(8).then((value) => {
  console.log(value)
})
