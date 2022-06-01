const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

async function markAsFavorite(user_name, recipe_id){
    await DButils.execQuery(`INSERT INTO favorite_recipes VALUES ('${user_name}',${recipe_id})`);
}

async function getFavoriteRecipes(user_name){
    const favorites = await DButils.execQuery(`SELECT recipe_id FROM favorite_recipes WHERE user_name=='${user_name}'`);
    const recipes = [];
    for(let i = 0; i < favorites.length; i++) {
        recipes.push(await recipes_utils.getRecipeDetails(favorites[i]));
    }
    return favorites;
}

async function getLastWatchedRecipes(user_name){
    const lastWatched = await DButils.execQuery(`SELECT recipe_id FROM user_view_recipes WHERE username=='${user_name}' ORDER BY view_time DESC`)
    const recipes = [];
    for(let i = 0; i < lastWatched.length; i++) {
        recipes.push(await recipes_utils.getRecipeDetails(lastWatched[i]));
    }
    return recipes;
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getLastWatchedRecipes = getLastWatchedRecipes;
