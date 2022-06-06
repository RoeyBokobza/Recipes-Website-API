var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_name) {
    DButils.execQuery("SELECT user_name FROM users").then((users) => {
      if (users.find((x) => x.user_name === req.session.user_name)) {
        req.user_name = req.session.user_name;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_name, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
  } catch (error) {
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_name);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.get('/last_watched', async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const lastWatchedIds = await user_utils.getLastWatchedRecipesIds(user_name);
    const lastWatched = await recipe_utils.getRecipesPreview(lastWatchedIds);
    res.status(200).send(lastWatched);
  } catch (error) {
    next(error);
  }
})

router.get('/my_recipes', async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const myRecipes = await user_utils.getMyRecipes(user_name);
    res.status(200).send(myRecipes);
  } catch (error) {
    next(error);
  }
})

router.post('/add_recipe', async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    let recipe_details = {
      title: req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.body.image,
      popularity: 0,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      ingredients: req.body.ingredients.list,
      instructions: req.body.instructions,
      servings: req.body.servings
    }
    await user_utils.addRecipeToDb(user_name, recipe_details);
    res.status(200).send("The Recipe successfully saved to storage");
  } catch (error) {
    next(error);
  }
})



module.exports = router;
