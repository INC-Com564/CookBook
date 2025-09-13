import React, { useState } from 'react';
import { createItem, updateItem } from './dynamo';
import './App.scss';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { initialize } from '@iterable/web-sdk';


function App() {
  React.useEffect(() => {
    initialize({ apiKey: 'YOUR_API_KEY' });
  }, []);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [recipeToUpdate, setRecipeToUpdate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState({});
  const [open, setOpen] = useState(false);

// ---------------------------------------------------------------------------//

  const handleOpen = (recipe = null) => {
    if (recipe) {
      setRecipeToUpdate(recipe);
      setRecipeName(recipe.recipeName);
      setIngredients(recipe.ingredients.join(', '));
      setIsEditing(true);
    } else {
      setRecipeToUpdate(null);
      setRecipeName('');
      setIngredients('');
      setIsEditing(false);
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setRecipeToUpdate(null);
    setRecipeName('');
    setIngredients('');
    setIsEditing(false);
  };

  const saveRecipe = async (event) => {
    event.preventDefault();
    if (isEditing && recipeToUpdate) {
      const updatedRecipe = {
        ...recipeToUpdate,
        recipeName: recipeName,
        ingredients: ingredients.split(',').map(item => item.trim()),
      };
      try {
        await updateItem('Recipies', { Cake: updatedRecipe.Cake }, {
          recipeName: updatedRecipe.recipeName,
          ingredients: updatedRecipe.ingredients
        });
        setRecipes(prevRecipes => prevRecipes.map(r => r.Cake === updatedRecipe.Cake ? updatedRecipe : r));
        console.log('Recipe updated:', updatedRecipe);
      } catch (error) {
        console.error('Failed to update item in DynamoDB:', error);
      }
    } else {
      
      const newRecipe = {
        Cake: Date.now().toString(), 
        recipeName: recipeName,
        ingredients: ingredients.split(',').map(item => item.trim()),
      };
      try {
        await createItem('Recipies', newRecipe);
        setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
        console.log('Recipe saved:', newRecipe);
      } catch (error) {
        console.error('Failed to create item in DynamoDB:', error);
      }
    }
    handleClose();
  };
   const handleDelete = async (Cake) => {
     setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.Cake !== Cake));
   };


  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

// --------------------------------------------------------------------------------------//

  return (
    <>
      <title>Recipe Book</title>
      <div className="card">
        <h1>Recipe Book</h1>
        <form onSubmit={saveRecipe} className="mb-3 text-center p-2 rounded">
          <input
            type="text"
            placeholder="Enter recipe name..."
            value={recipeName}
            onChange={e => setRecipeName(e.target.value)}
            className="form-control mb-2"
            required
          />
          <br />
          <textarea
            placeholder="Enter ingredients (comma separated)..."
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            className="form-control mb-2"
            required
          />
          <br />
          <button type="submit" className="btn btn-primary">Add Recipe</button>
        </form>
      </div >
// ---------------------------------------------------------------------------------//
      <section>
        <h2>Recipe List</h2>
        {recipes.length === 0 ? (
          <p>No recipes added yet.</p>
        ) : (
          <div className="recipe-list">
            {recipes.map((recipeObject) => (
              <div key={recipeObject.Cake} className="recipe-item">
                <h3>{recipeObject.recipeName}</h3>
                <p>Ingredients: {recipeObject.ingredients.join(', ')}</p>
                <Button color="primary" variant="outlined" onClick={() => handleOpen(recipeObject)} style={{marginRight: '0.5rem'}}>Update</Button>
                <Button color="error" variant="outlined" onClick={() => handleDelete(recipeObject.Cake)} style={{marginTop: '0.5rem'}}>Delete</Button>
              </div>
            ))}
          </div>
        )}
        
<Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={style}>
    <Typography id="modal-modal-title" variant="h6" component="h2">
    </Typography>
    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
      {}
    </Typography>
    <form onSubmit={saveRecipe} className="mb-3 text-center p-2 rounded">
      <input
        type="text"
        placeholder="Enter recipe name..."
        value={recipeName}
        onChange={e => setRecipeName(e.target.value)}
        className="form-control mb-2"
        required
      />
      <textarea
        placeholder="Enter ingredients (comma separated)..."
        value={ingredients}
        onChange={e => setIngredients(e.target.value)}
        className="form-control mb-2"
        required
      />
  <button type="submit" className="btn btn-primary">{isEditing ? 'Update Recipe' : 'Add Recipe'}</button>
    </form>
  </Box>
</Modal>
      </section>
    </>
  );

}
export default App;