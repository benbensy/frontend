import { MyPromise } from '@/promise'

describe('promise', () => {
  it('test promise', () => {
    const promise = new MyPromise((resolve) => {
      resolve(6)
    })

    console.log(promise)
  })
})
