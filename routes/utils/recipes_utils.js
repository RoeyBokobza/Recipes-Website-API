const axios = require("axios");
const { response } = require("express");
const res = require("express/lib/response");
const api_domain = "https://api.spoonacular.com/recipes";

const failMes = "failure"


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    }).catch(function (error) {
        return error;
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    try {
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, instructions, servings } = recipe_info.data;
        const ingredients = extractIngredients(extendedIngredients);
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            ingredients: ingredients,
            instructions: instructions,
            servings: servings
        }
    } catch (err) {
        console.error(err);
        return failMes;
    }
}

async function getRandomRecipes() {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: 10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    try {
        let previewData = extractPreviewRecipesData(response.data.recipes);
        return previewData;
    } catch (err) {
        console.error(err);
        return failMes;
    }

}

async function getRandomThreeRecipes() {
    const randomRecipes = await getRandomRecipes();
    const filteredRandomRecipes = randomRecipes.filter((element) => (element.instructions != "") && element.image != "");
    if (filteredRandomRecipes.length < 3) {
        return getRandomThreeRecipes();
    }
    return [filteredRandomRecipes[0], filteredRandomRecipes[1], filteredRandomRecipes[2]]
}

async function searchRecipesByName(title, number = 5, cuisine, diet, intolerances) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: title,
            apiKey: process.env.spooncular_apiKey,
            addRecipeInformation: true,
            number: number,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerances
        }
    });
    return extractPreviewRecipesData(response.data.results);
}

async function getRecipesPreview(recipeIds) {
    const response = await axios.get(`${api_domain}/informationBulk`, {
        params: {
            ids: recipeIds.join(),
            apiKey: process.env.spooncular_apiKey,
            includeNutrition: false
        }
    });
    return extractPreviewRecipesData(response.data);
}


const extractPreviewRecipesData = (recipes) => {
    const reducedNonRelevance = [];
    for (let i = 0; i < recipes.length; i++) {
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipes[i];
        reducedNonRelevance.push({
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        });
    }
    return reducedNonRelevance;
}
const extractIngredients = (extendedIngredients) => {
    const ingredients = [];
    for (let i = 0; i < extendedIngredients.length; i++) {
        ingredients.push(extendedIngredients[i].original);
    }
    return ingredients;
}

// async function getRecipeAnalyzeSteps(recipe_id) {
//     const response = await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
//         params: {
//             apiKey: process.env.spooncular_apiKey,
//             stepBreakdown: true
//         }
//     });
//     return response.data
// }


// exports.getRecipeAnalyzeSteps = getRecipeAnalyzeSteps
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipesByName = searchRecipesByName;
exports.getRecipeDetails = getRecipeDetails;
exports.getRandomThreeRecipes = getRandomThreeRecipes;