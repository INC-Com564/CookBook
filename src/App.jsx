import { useState } from 'react';
// Assuming the createItem function is defined in './dynamo.js'
import { createItem } from './dynamo';
import './App.scss';

function App() {
  // State variables for the form inputs, matching the pet example's structure
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  // Add a state to store the list of recipes, similar to the `pets` state
  const [recipes, setRecipes] = useState([]);

  // Adapt the handleAddPet function to handle adding recipes
  const saveRecipe = async (event) => {
    // Prevents the page from reloading on form submission
    event.preventDefault();

    // Create a new recipe object from the form's state
    const newRecipe = {
      Id: Date.now().toString(), // Generate a unique ID
      recipeName: recipeName,
      ingredients: ingredients.split(',').map(item => item.trim()), // Split and clean the ingredient string
    };

    console.log(newRecipe);

    try {
      // Call a database function to save the new recipe, assuming `createItem` works with DynamoDB
      await createItem('RecipeBookTable', newRecipe);
      // Update the local state to include the new recipe, similar to `setPets`
      setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
      console.log('Recipe saved to DynamoDB.');
    } catch (error) {
      console.error('Failed to create item in DynamoDB:', error);
    }

    // Clear the form fields after submission
    setRecipeName('');
    setIngredients('');
  };

  return (
    <>
      <title>Recipe Book</title>
      <div className="card">
        <h1>Recipe Book</h1>
        <form onSubmit={e => { e.preventDefault(); saveRecipe(); }} className="mb-3 text-center p-2 rounded">
          <input
            type="text"
            placeholder="Enter recipe name"
            value={recipeName}
            onChange={e => setRecipeName(e.target.value)}
            className="form-control mb-2"
            required
          />
          <textarea
            placeholder="Enter ingredients"
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            className="form-control mb-2"
            required
          />
          <button type="submit" className="btn btn-primary">Add Recipe</button>
        </form>
      </div>
    </>
  );
}

export default App;