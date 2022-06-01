var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/details/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

router.get("/random",async (req,res,next)=>{
  try{
    const randoms = await recipes_utils.getRandomRecipes();
    // console.log(randoms);
    res.send(randoms.data);
  } catch(error){
    next(error);
  }
});

router.get("/search/:title",async (req,res,next)=>{
  try{
    const recipes = await recipes_utils.searchRecipesByName(req.params.title);
    // console.log(randoms);
    res.send(recipes.data);
  } catch(error){
    next(error);
  }
});

module.exports = router;
