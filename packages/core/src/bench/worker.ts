type Data = {
  min: number
  max: number
  avg: number
}

// Guard to send data to the main thread
const send = (data: Data) => {
  postMessage(data)
}
