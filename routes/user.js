var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_name) {
    DButils.execQuery("SELECT user_name FROM users")
      .then((users) => {
        if (users.find((x) => x.user_name === req.session.user_name)) {
          req.user_name = req.session.user_name;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post("/favorites", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_name, recipe_id);
    res.status(201).send("The Recipe successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get("/favorites", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    let favorite_recipes = {};
    const recipes_ids = await user_utils.getFavoriteRecipesIds(user_name);
    const results = await recipe_utils.getRecipesPreview(recipes_ids);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/last_watched", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const lastWatchedIds = await user_utils.getLastWatchedRecipesIds(user_name);
    const lastWatched = await recipe_utils.getRecipesPreview(lastWatchedIds);
    res.status(200).send(lastWatched);
  } catch (error) {
    next(error);
  }
});

router.get("/my_recipes", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const myRecipes = await user_utils.getMyRecipes(user_name);
    res.status(200).send(myRecipes);
  } catch (error) {
    next(error);
  }
});

router.get("/my_recipe/:recipe_id", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const myRecipes = await user_utils.getRecipe(
      user_name,
      req.params.recipe_id
    );
    console.log(myRecipes)
    res.status(200).send(myRecipes);
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .send("My recipe id: " + req.params.recipe_id + " not found!");
  }
});

router.get("/my_family_recipe/:recipe_id", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const myRecipes = await user_utils.getFamilyRecipe(
      user_name,
      req.params.recipe_id
    );
    res.status(200).send(myRecipes);
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .send("Family recipe id: " + req.params.recipe_id + " not found!");
  }
});

router.get("/my_family_recipes", async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    const myRecipes = await user_utils.getMyFamilyRecipes(user_name);
    res.status(200).send(myRecipes);
  } catch (error) {
    next(error);
  }
});

router.post("/add_recipe", upload.single("image"), async (req, res, next) => {
  try {
    const user_name = req.session.user_name;
    let recipe_details = {
      title: req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.file.path,
      popularity: 0,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      servings: req.body.servings,
    };
    await user_utils.addRecipeToDb(user_name, recipe_details);
    res.status(201).send("The Recipe successfully saved to storage");
  } catch (error) {
    console.error(error);
    res.status(400).send("Some parameters are missing");
  }
});

router.get("/download", function (req, res) {
  const file = req.query.image;
  res.download(file, req.query.image);
});

module.exports = router;
