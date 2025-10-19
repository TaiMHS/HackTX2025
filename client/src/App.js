import React, {useState} from "react"

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [numRecipes, setNumRecipes] = useState(1);

  const handleNumRecipesChange = (event) => {
    setNumRecipes(Number(event.target.value)); 
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    
    setFile(selectedFile);
    
    if (!selectedFile) {
        setData({});
        setError(null);
        return;
    }
    
    const formData = new FormData();
    formData.append('myFile', selectedFile);
    formData.append('numRecipes', numRecipes);

    setLoading(true);

    sendFileToBackend(formData)
      .then(() => {
        return fetchRecipes();
      })
      .catch((err) => {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  function sendFileToBackend(formData) {
    return fetch("/img_grab", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
            setLoading(false);
            throw new Error("Upload failed");
        }
        return response.json(); 
      });
  }

  function fetchRecipes() {
    return fetch("/create_recipe", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }

  return (
    <div className="App">
      <h1>HackTX Flask-React App</h1>
      <form>
        <div>
          <h2>File Upload</h2>
          <input 
            type="file" 
            id="myFile" 
            name="myFile" 
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
          />
          
          <br/>
          <label htmlFor="numRecipes">
            Number of Recipes: **{numRecipes}**
          </label>
          <input 
            type="range" 
            id="numRecipes" 
            name="numRecipes" 
            min="1" 
            max="10" 
            value={numRecipes} 
            onChange={handleNumRecipesChange} 
          />
          {file && (
            <p>Selected file: {file.name}</p>
          )}
        </div>
      </form>
      
      <hr/>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{color: 'red'}}>Error: {error}</p>
      ) : data.recipe && Array.isArray(data.recipe) && data.recipe.length > 0 ? (
        data.recipe.map((recipe, i) => (
          <p key={i}>**Recipe {i + 1}:** {recipe}</p> 
        ))
      ) : (
        <p>No recipes found. Upload an image to start!</p>
      )}
    </div>
  );
}

export default App;