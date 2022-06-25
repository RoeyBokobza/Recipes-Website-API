var express = require("express");
const { user } = require("pg/lib/defaults");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/details/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.status(200).send(recipe);
    if (req.session && req.session.user_name) {
      user_utils.markAsWatched(req.session.user_name, req.params.recipeId);
    }
  } catch (error) {
    console.error(error);
    res.status(404).send("Recipe id: " + req.params.recipe_id + " not found!");
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const randoms = await recipes_utils.getRandomThreeRecipes();
    if (randoms === "failure") {
      throw { status: 404, message: "random recipes not found" };
    }
    res.status(200).send(randoms);
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.searchRecipesByName(req.query.title, req.query.number, req.query.cuisine, req.query.diet, req.query.intolerances);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
