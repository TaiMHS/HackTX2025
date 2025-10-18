import React, {useState, useEffect} from "react"

/* useState: gets data from backend, storing in state variable
             and rendering data on frontend
*/


function App() {


  const [data, setData] = useState({}); // initial state is empty object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/members")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>HackTX Flask-React App</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{color: 'red'}}>Error: {error}</p>
      ) : data.recipe && data.recipe.length > 0 ? (
        data.recipe.map((recipe, i) => (
          <p key={i}>{recipe}</p>
        ))
      ) : (
        <p>No members found.</p>
      )}
    </div>
  );
}

export default App