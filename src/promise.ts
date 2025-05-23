type MyPromiseState = 'pending' | 'fulfilled' | 'rejected'

type ResolveFunc<T> = (value: T | PromiseLike<T>) => void
type RejectFunc = (reason?: unknown) => void
type Executor<T> = (resolve: ResolveFunc<T>, reject: RejectFunc) => void

type OnFulfilled<T, TResult> = ((value: T) => TResult | PromiseLike<TResult>) | null | undefined
type OnRejected<TResult> = ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined

interface MyPromiseLike<T> {
  then: <TResult1 = T, TResult2 = never>(
    onFulfilled?: OnFulfilled<T, TResult1>,
    onRejected?: OnRejected<TResult2>
  ) => MyPromise<TResult1 | TResult2>
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

function isMyPromiseLike<T = unknown>(value: unknown): value is MyPromiseLike<T> {
  return isObject(value) && 'then' in value && isFunction(value.then)
}

export class MyPromise<T> {
  static readonly PENDING = 'pending' as const
  static readonly FULFILLED = 'fulfilled' as const
  static readonly REJECTED = 'rejected' as const

  private state: MyPromiseState = MyPromise.PENDING
  private result: T | undefined
  private onFulfilledCallbacks: Array<() => void> = []
  private onRejectedCallbacks: Array<() => void> = []

  constructor(executor: Executor<T>) {
    try {
      executor(this.resolve.bind(this), this.reject.bind(this))
    }
    catch (error) {
      this.reject(error)
    }
  }

  resolve(value: T | PromiseLike<T>) {
    if (this.state !== MyPromise.PENDING)
      return

    if (isMyPromiseLike<T>(value)) {
      value.then(this.resolve.bind(this), this.reject.bind(this))
      return
    }

    this.state = MyPromise.FULFILLED
    this.result = value as T
    this.onFulfilledCallbacks.forEach(cb => cb())
  }

  reject(reason?: unknown) {
    if (this.state !== MyPromise.PENDING)
      return
    this.state = MyPromise.REJECTED
    this.result = reason as T
    this.onRejectedCallbacks.forEach(cb => cb())
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: OnFulfilled<T, TResult1>,
    onRejected?: OnRejected<TResult2>,
  ): MyPromise<TResult1 | TResult2> {
    const onFulfilledFn = isFunction(onFulfilled)
      ? onFulfilled
      : (value: T) => value as unknown as TResult1

    const onRejectedFn = isFunction(onRejected)
      ? onRejected
      : (reason: unknown) => { throw reason }

    return new MyPromise<TResult1 | TResult2>((resolve, reject) => {
      const handleFulfilled = () => {
        queueMicrotask(() => {
          try {
            const result = onFulfilledFn(this.result as T)
            if (isMyPromiseLike<TResult1>(result)) {
              result.then(resolve, reject)
            }
            else {
              resolve(result)
            }
          }
          catch (error) {
            reject(error)
          }
        })
      }

      const handleRejected = () => {
        queueMicrotask(() => {
          try {
            const result = onRejectedFn(this.result as unknown)
            if (isMyPromiseLike<TResult2>(result)) {
              result.then(resolve, reject)
            }
            else {
              resolve(result as TResult2)
            }
          }
          catch (error) {
            reject(error)
          }
        })
      }

      if (this.state === MyPromise.PENDING) {
        this.onFulfilledCallbacks.push(handleFulfilled)
        this.onRejectedCallbacks.push(handleRejected)
      }
      else if (this.state === MyPromise.FULFILLED) {
        handleFulfilled()
      }
      else {
        handleRejected()
      }
    })
  }

  catch<TResult = never>(
    onRejected?: OnRejected<TResult>,
  ): MyPromise<T | TResult> {
    return this.then(undefined, onRejected)
  }

  finally(onFinally?: (() => void) | null): MyPromise<T> {
    return this.then(
      (value) => {
        onFinally?.()
        return value
      },
      (reason) => {
        onFinally?.()
        throw reason
      },
    )
  }

  static resolve<T>(value: T | PromiseLike<T>): MyPromise<Awaited<T>> {
    if (value instanceof MyPromise) {
      return value as MyPromise<Awaited<T>>
    }
    return new MyPromise<Awaited<T>>((resolve) => {
      resolve(value as Awaited<T>)
    })
  }

  static reject<T = never>(reason?: unknown): MyPromise<T> {
    return new MyPromise((_, reject) => reject(reason))
  }
}
