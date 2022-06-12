const { NText } = require("mssql");
const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

async function markAsFavorite(user_name, recipe_id) {
    await DButils.execQuery(`INSERT INTO favorite_recipes VALUES ('${user_name}',${recipe_id})`);
}

async function markAsWatched(user_name, recipe_id) {
    await DButils.execQuery(`INSERT INTO user_view_recipes VALUES ('${user_name}',${recipe_id}, '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`);
}

async function getMyRecipes(user_name) {
    let myRecipes = await DButils.execQuery(`SELECT * FROM user_recipes WHERE user_name='${user_name}'`);
    if (myRecipes.length > 0) {
        myRecipes = extractPreviewRecipesData(myRecipes);
    }
    return myRecipes;
}


async function getMyFamilyRecipes(user_name) {
    let myRecipes = await DButils.execQuery(`SELECT * FROM user_family_recipes WHERE user_name='${user_name}'`);
    if (myRecipes.length > 0) {
        myRecipes = extractPreviewRecipesData(myRecipes);
    }
    return myRecipes;
}

async function getRecipeIngredients(id) {
    let ingredientsFromDb = await DButils.execQuery(`SELECT * FROM recipes_ingredients WHERE recipe_id='${id}'`);
    let ingredients = [];
    for (let i = 0; i < ingredientsFromDb.length; i++) {
        ingredients.push(ingredientsFromDb[i].ingredient);
    }
    return ingredients;
}

async function getRecipe(user_name, id) {
    let myRecipe = await DButils.execQuery(`SELECT * FROM user_recipes WHERE user_name='${user_name}' AND id=${id}`);
    myRecipe.ingredients = await getRecipeIngredients(myRecipe[0].id);
    return myRecipe;
}

async function getFamilyRecipe(user_name, id) {
    let myRecipe = await DButils.execQuery(`SELECT * FROM user_family_recipes WHERE user_name='${user_name}' AND id=${id}`);
    myRecipe.ingredients = await getRecipeIngredients(myRecipe[0].id);
    return myRecipe;
}

async function getFavoriteRecipesIds(user_name) {
    const favorites = await DButils.execQuery(`SELECT recipe_id FROM favorite_recipes WHERE user_name='${user_name}'`);
    const recipes = [];
    for (let i = 0; i < favorites.length; i++) {
        recipes.push(favorites[i].recipe_id);
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
    await DButils.execQuery(`INSERT INTO user_recipes(user_name, title, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree, instructions, servings) VALUES ('${user_name}', '${recipe.title}', ${recipe.readyInMinutes}, '${recipe.image}', ${recipe.popularity}, ${recipe.vegan}, ${recipe.vegetarian}, ${recipe.glutenFree}, '${recipe.instructions}', ${recipe.servings})`);
    res = await DButils.execQuery(`SELECT MAX(id) AS id FROM user_recipes`);
    recipe.id = res[0].id;
    for (let i = 0; i < recipe.ingredients.length; i++) {
        ingredient = recipe.ingredients[i].replace("'", "''");
        await DButils.execQuery(`INSERT INTO recipes_ingredients VALUES (${recipe.id}, '${ingredient}')`);
    }
}

const extractPreviewRecipesData = (recipes) => {
    const reducedNonRelevance = [];
    for (let i = 0; i < recipes.length; i++) {
        let { id, title, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree } = recipes[i];
        reducedNonRelevance.push({
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: popularity,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        });
    }
    return reducedNonRelevance;
}

exports.addRecipeToDb = addRecipeToDb;
exports.getMyRecipes = getMyRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipesIds = getFavoriteRecipesIds;
exports.getLastWatchedRecipesIds = getLastWatchedRecipesIds;
exports.markAsWatched = markAsWatched
exports.getMyFamilyRecipes = getMyFamilyRecipes;
exports.getRecipe = getRecipe;
exports.getFamilyRecipe = getFamilyRecipe;