import express from 'express';
import {
  getAllPosts,
  verifyUsers,
  verifySubreddits,
} from '../../crawler';

const adminRouter = express.Router();
export default adminRouter;

adminRouter.post('/crawler', async (req, res) => {
  try {
    getAllPosts();

    res.send({ success: true });
  } catch (error) {
    res.status(400).send({ error: '', message: error.message });
  }
});

adminRouter.post('/verify-users', async (req, res) => {
  try {
    verifyUsers();

    res.send({ success: true });
  } catch (error) {
    res.status(400).send({ error: '', message: error.message });
  }
});

adminRouter.post('/verify-subreddits', async (req, res) => {
  try {
    await verifySubreddits();

    res.send({ success: true });
  } catch (error) {
    res.status(400).send({ error: '', message: error.message });
  }
});
