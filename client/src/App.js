import React, {useState, useEffect} from "react"

/* useState: gets data from backend, storing in state variable
             and rendering data on frontend
*/


function App() {
  const [data, setData] = useState({}); // initial state is empty object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const numRecipes = document.getElementById("numRecipes").value;
    setFile(selectedFile);
    
    // Optional: Create FormData if you want to send it to the backend
    const formData = new FormData();
    formData.append('myFile', selectedFile);
    formData.append('numRecipes', numRecipes);
    sendFileToBackend(formData);
    // You can now use this formData to send to your backend
    // Example: sendFileToBackend(formData);
  };

  function sendFileToBackend(formData){
    fetch("/upload", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log("File uploaded successfully:", data);
    })
    .catch(error => {
      console.error("Error uploading file:", error);
    });
  }

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
      <div>
        <h2>File Upload</h2>
        <input 
          type="file" 
          id="myFile" 
          name="myFile" 
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
        <input></input>
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