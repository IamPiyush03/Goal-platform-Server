const { Router } = require('express');
const auth = require('../middlewares/auth');
const { createGoal, listGoals, getGoal, updateGoal, deleteGoal, toggleMilestone } = require('../controllers/goals.controller');

const router = Router();

router.post('/', auth, createGoal);
router.get('/', auth, listGoals);
router.get('/:id', auth, getGoal);
router.put('/:id', auth, updateGoal);
router.patch('/:id/milestones', auth, toggleMilestone); // New route for toggling milestones
router.delete('/:id', auth, deleteGoal);

module.exports = router;


