import React, {useState, useEffect} from "react"

/* useState: gets data from backend, storing in state variable
             and rendering data on frontend
*/


function App() {
  const [data, setData] = useState({}); // initial state is empty object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [numRecipes, setNumRecipes] = useState(1);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile);
    
    // Optional: Create FormData if you want to send it to the backend
    const formData = new FormData();
    formData.append('myFile', selectedFile);
    formData.append('numRecipes', numRecipes);


    console.log("FormData prepared:", formData.get('myFile'));
    console.log("Number of Recipes:", formData.get('numRecipes'));
    sendFileToBackend(formData);
    fetchRecipes();
    // You can now use this formData to send to your backend
    // Example: sendFileToBackend(formData);
  };

  function sendFileToBackend(formData) {
    setLoading(true);
    fetch("/img_grab", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Upload failed");
        setLoading(false);
        return response.json(); // just a success message if works
      });
  }

  function fetchRecipes() {
    setLoading(true);
    fetch("/get_recipes")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        setLoading(false);
        return response.json();
      });
  }

  


    
  
  return (
    <div className="App">
      <h1>HackTX Flask-React App</h1>
      <div>
        <h2>File Upload</h2>
        <input 
          type="file" 
          id="myFile" 
          name="myFile" 
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
        <input type="range" id="numRecipes" name="numRecipes" min="1" max="10" defaultValue="1" />
        {file && (
          <p>Selected file: {file.name}</p>
        )}
      </div>
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