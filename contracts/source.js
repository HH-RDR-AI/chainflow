const camundaURL = "https://demo:demo@chainflow-engine.dexguru.biz/engine-rest/process-definition/key"

const definitionId = args[0]
const data = args[1]

console.log(`Sending HTTP request to ${camundaURL}/${definitionId}/start`)

const startRequest = Functions.makeHttpRequest({
    url: `${camundaURL}/${definitionId}/start`,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
})

// Execute the API request (Promise)
const startResponse = await startRequest

if (startResponse.error) {
console.error(startResponse.error)
throw Error("Request failed, try checking the params provided")
}

console.log(startResponse)

const reqData = startResponse.data

// Gives the whole response from the request
console.log(reqData)

return Functions.encodeString(reqData)