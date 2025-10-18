import React, {useState, useEffect} from "react"
/* useState: gets data from backend, storing in state variable
             and rendering data on frontend
*/

function App() {

  const [data, setData] = useState([{}]); // initial state is empty array
  // date: actual variable
  // setData: function that updates variable

  useEffect(() => {
    fetch("/members").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  return (
    <div className="App">
      <h1>HackTX Flask-React App</h1>
    </div>
  )
}

export default App