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
    res.send(recipe);
    if (req.session && req.session.user_name) {
        user_utils.markAsWatched(req.session.user_name, req.params.recipeId);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/random",async (req,res,next)=>{
  try{
    const randoms = await recipes_utils.getRandomThreeRecipes();
    // console.log(randoms);
    res.send(randoms);
  } catch(error){
    next(error);
  }
});

router.get("/search",async (req,res,next)=>{
  try{
    const recipes = await recipes_utils.searchRecipesByName(req.query.title, req.query.number, req.query.cuisine, req.query.diet, req.query.intolerances);
    res.send(recipes);
  } catch(error){
    next(error);
  }
});

module.exports = router;
