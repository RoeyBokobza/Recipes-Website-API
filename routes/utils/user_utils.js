const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`INSERT INTO FavoriteRecipes VALUES ('${username}',${recipe_id})`);
}

async function getFavoriteRecipes(username){
    const favorites = await DButils.execQuery(`SELECT recipe_id FROM FavoriteRecipes WHERE username=='${username}'`);
    const recipes = [];
    for(let i = 0; i < length(favorites); i++) {
        recipes.push(await recipes_utils.getRecipeDetails(favorites[i]));
    }
    return favorites;
}

async function getLastWatchedRecipes(username){
    const lastWatched = await DButils.execQuery(`SELECT recipe_id FROM user_view_recipes WHERE username=='${username}' ORDER BY view_time DESC`)
    const recipes = [];
    for(let i = 0; i < length(lastWatched); i++) {
        recipes.push(await recipes_utils.getRecipeDetails(lastWatched[i]));
    }
    return recipes;
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getLastWatchedRecipes = getLastWatchedRecipes;
