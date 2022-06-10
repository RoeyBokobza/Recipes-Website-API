const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

async function markAsFavorite(user_name, recipe_id) {
    await DButils.execQuery(`INSERT INTO favorite_recipes VALUES ('${user_name}',${recipe_id})`);
}

async function markAsWatched(user_name, recipe_id) {
    await DButils.execQuery(`INSERT INTO user_view_recipes VALUES ('${user_name}',${recipe_id}, '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`);
}

async function getMyRecipes(user_name) {
    const myRecipes = await DButils.execQuery(`SELECT * FROM user_recipes WHERE user_name='${user_name}'`);
    for (let i = 0; i < myRecipes.length; i++) {
        myRecipes[i].ingredients = await getRecipeIngredients(myRecipes[i].title);
    }
    return myRecipes;
}

async function getRecipeIngredients(title) {
    let ingredientsFromDb = await DButils.execQuery(`SELECT * FROM recipes_ingredients WHERE recipe_title='${title}'`);
    let ingredients = [];
    for (let i = 0; i < ingredientsFromDb.length; i++) {
        ingredients.push(ingredientsFromDb[i].ingredient);
    }
    return ingredients;
}

async function getFavoriteRecipes(user_name) {
    const favorites = await DButils.execQuery(`SELECT recipe_id FROM favorite_recipes WHERE user_name='${user_name}'`);
    const recipes = [];
    console.log(favorites);
    for (let i = 0; i < favorites.length; i++) {
        recipes.push(await recipes_utils.getRecipeDetails(favorites[i].recipe_id));
    }
    return favorites;
}

async function getLastWatchedRecipesIds(user_name) {
    const lastWatched = await DButils.execQuery(`SELECT recipe_id FROM user_view_recipes WHERE user_name='${user_name}' ORDER BY view_time DESC`)
    const recipes = [];
    for (let i = 0; i < lastWatched.length; i++) {
        recipes.push(lastWatched[i].recipe_id);
    }
    return recipes;
}

async function addRecipeToDb(user_name, recipe) {
    recipe.instructions = recipe.instructions.replace("'", "''");
    recipe.image = recipe.image.replace(/\\/g, "\\\\");
    await DButils.execQuery(`INSERT INTO user_recipes VALUES ('${user_name}', '${recipe.title}', ${recipe.readyInMinutes}, '${recipe.image}', ${recipe.popularity}, ${recipe.vegan}, ${recipe.vegetarian}, ${recipe.glutenFree}, '${recipe.instructions}', ${recipe.servings})`);
    console.log(recipe.ingredients.length)
    for (let i = 0; i < recipe.ingredients.length; i++) {
        ingredient = recipe.ingredients[i].replace("'", "''");
        await DButils.execQuery(`INSERT INTO recipes_ingredients VALUES ('${recipe.title}', '${ingredient}')`);
    }
}

exports.addRecipeToDb = addRecipeToDb;
exports.getMyRecipes = getMyRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getLastWatchedRecipesIds = getLastWatchedRecipesIds;
exports.markAsWatched = markAsWatched
