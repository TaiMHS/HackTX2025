import React, {useState} from "react"

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [numRecipes, setNumRecipes] = useState(1);

  // Debug effect to monitor data changes
  React.useEffect(() => {
    console.log("Data state changed:", data);
  }, [data]);

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
        fetchRecipes();
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

  async function fetchRecipes() {
    try {
      console.log("Fetching recipes...");
      const response = await fetch("/create_recipe");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      let json = await response.json();
      console.log("Raw response:", json);
      
      // If it's a string (JSON), parse it
      if (typeof json === 'string') {
        try {
          json = JSON.parse(json);
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      }
      
      // Ensure we have an array of recipes
      const recipes = Array.isArray(json) ? json : [json];
      console.log("Processed recipes:", recipes);
      
      // Validate recipe structure before setting state
      const validRecipes = recipes.filter(recipe => 
        recipe && 
        typeof recipe === 'object' &&
        recipe.name &&
        Array.isArray(recipe.ingredients) &&
        Array.isArray(recipe.steps)
      );
      
      console.log("Valid recipes:", validRecipes);
      setData(validRecipes);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError(error.message);
      setLoading(false);
    }
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
      ) : data && data.length > 0 ? (
        data.map((recipe, i) => {
          console.log(`Rendering recipe ${i}:`, recipe);
          if (!recipe) {
            console.log("Invalid recipe at index", i);
            return null;
          }
          return (
            <div key={i}>
              <h3>Recipe {i + 1}: {recipe.name}</h3>
              <h4>Ingredients:</h4>
              <ul>
                {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
              <h4>Steps:</h4>
              <ol>
                {recipe.steps && recipe.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          );
        })
      ) : (
        <p>No recipes found. Upload an image to start!</p>
      )}
    </div>
  );
}

export default App;