import express from 'express';
// const { sendInstructions, addUser } = require('../../mail');
import { OBJECT, STRING, OPTIONAL } from 'namebase-types';
import { verifyName } from '../../hnsAPI';
import config from '../../../config';
import { createSubdomain } from '../../hnsAPI';

import db from '../../models';
const { Op } = db.Sequelize;

const router = express.Router();
export default router;

import Errors from '../../../utils/errors';
import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();
const parser = (object) => (req, res, next) => {
  object(req.body);
  return next();
};

router.get('/users', async (req, res) => {
  try {
    const publicKey = req.query.publicKey;
    const rawUsers = await db.Users.findAll({
      attributes: ['username'],
      where: {
        public_key: publicKey,
      },
    });
    const usernames = rawUsers.map(user => user.username);

    res.send({ success: true, usernames });
  } catch (error) {
    res.status(400).send({ error: '', message: error.message });
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await db.Users.findOne({
      where: {
        username,
      },
    });

    const verified = !!user.public_key;

    res.send({ success: true, user, verified });
  } catch (error) {
    res.status(400).send({ error: '', message: error.message });
  }
});

router.get('/subreddit/:name/address', async (req, res) => {
  try {
    const name = req.params.name;
    const subreddit = await db.Subreddits.findOne({
      attributes: ['public_key', 'name'],
      where: { name },
    });

    res.send({
      success: true,
      address: { publicKey: subreddit.public_key, dataKey: subreddit.name },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: '', message: error.message });
  }
});

router.get('/subreddit/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const subreddit = await db.Subreddits.findOne({
      where: {
        name,
        public_key: {
          [Op.ne]: null,
        },
      },
    });

    let posts;
    let parsedPosts;
    if (subreddit) {
      posts = await db.Posts.findAll({
        attributes: {
          include: [
            [
              db.Sequelize.fn('COUNT', db.Sequelize.col('Upvote.id')),
              'upvotes',
            ],
          ],
        },
        where: { subreddit: subreddit.id },
        include: [
          {
            model: db.Upvotes,
            attributes: [],
          },
          {
            model: db.Users,
            attributes: ['public_key', 'username'],
          },
        ],
        group: ['Posts.id', 'User.id'],
        order: [
          ['created_at', 'DESC'],
        ],
      });

      parsedPosts = posts.map(post => {
        return {
          username: post.User.username,
          text: post.text,
          address: {
            publicKey: post.User.public_key,
            dataKey: post.User.username,
            index: post.index,
          },
          upvotes: post.dataValues.upvotes,
          created_at: post.created_at,
        };
      });
    }

    res.send({ success: true, subreddit, posts: parsedPosts });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: '', message: error.message });
  }
});

router.get('/subreddit', async (req, res) => {
  try {
    const subreddits = await db.Subreddits.findAll({});

    const parsedSubreddits = subreddits.map(subreddit => {
      return {
        name: subreddit.name,
        address: {
          publicKey: subreddit.public_key,
          dataKey: subreddit.name,
        },
        created_at: subreddit.created_at,
      };
    });

    res.send({ success: true, subreddits: parsedSubreddits });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: '', message: error.message });
  }
});

router.get('/tlds', async (req, res) => {
  res.send({ success: true, tlds: [config.domain] });
});

router.post('/register/subreddit', parser(OBJECT({
  name: STRING,
  bucketName: STRING,
})), async (req, res) => {
  try {
    const { bucketName } = req.body;
    const subredditName = req.body.name;
    const name = `reddit-r-${subredditName}`;

    const verifiedSubreddit = await db.Subreddits.findOne({
      where: {
        name,
        public_key: {
          [Op.ne]: null,
        },
      },
    });
    const pendingSubreddit = await db.Subreddits.findOne({
      where: {
        name,
        bucket_name: bucketName,
        public_key: {
          [Op.eq]: null,
        },
      },
    });
    if (verifiedSubreddit) {
      throw Errors.NameIsVerified(name);
    }
    if (pendingSubreddit) {
      throw Errors.NameIsPendingVerification(name);
    }

    const publicKey = await verifyName(name, bucketName);
    if (!publicKey) {
      await db.Subreddits.create({
        name,
        bucket_name: bucketName,
      });
    } else {
      await db.Subreddits.create({
        name,
        bucket_name: bucketName,
        public_key: publicKey,
      });
    }

    res.send({ success: true, verified: !!publicKey });
  } catch (error) {
    res.status(400).send({ error: 'NAME_REGISTERED', message: error.message });
  }
});

router.post('/new-username', jsonParser, async (req, res) => {
  try {
    const { username, publicKey } = req.body;

    const fullUsername = `${username}.${config.domain}`;
    const bucketName = `${fullUsername}-bucket`;

    const user = await db.Users.findOne({
      where: {
        username: fullUsername,
      },
    });
    if (user) {
      throw Errors.UsernameIsTaken(fullUsername);
    }
    const response = await createSubdomain(username, publicKey);

    if (response.success) {
      await db.Users.create({
        username: fullUsername,
        bucket_name: bucketName,
        public_key: publicKey,
        email: 'placeholder',
      });
    } else {
      throw Errors.UsernameIsTaken(fullUsername);
    }

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: '', message: error.message });
  }
});


router.post('/register', jsonParser, async (req, res) => {
  try {
    const { username } = req.body;

    const bucketName = `${username}-bucket`;

    const verifiedUser = await db.Users.findOne({
      where: {
        username,
        public_key: {
          [Op.ne]: null,
        },
      },
    });
    const pendingUser = await db.Users.findOne({
      where: {
        username,
        bucket_name: bucketName,
        public_key: {
          [Op.eq]: null,
        },
      },
    });
    if (verifiedUser) {
      throw Errors.NameIsVerified(name);
    }
    if (pendingUser) {
      throw Errors.NameIsPendingVerification(name);
    }

    const publicKey = await verifyName(username, bucketName);
    if (!publicKey) {
      await db.Users.create({
        username,
        bucket_name: bucketName,
        email: 'placeholder',
      });
    } else {
      await db.Users.create({
        username,
        bucket_name: bucketName,
        public_key: publicKey,
        email: 'placeholder',
      });
    }

    res.send({ success: true, verified: !!publicKey });
  } catch (error) {
    res.status(400).send({
      error: 'USERNAME_REGISTERED',
      message: error.message,
    });
  }
});

router.post('/referrals/reserve', parser(OBJECT({
  username: STRING,
  email: STRING,
  referralCodeInput: OPTIONAL(STRING),
})), async (req, res) => {
  try {
    const { username, email, referralCodeInput } = req.body;

    const user = await db.Users.findOne({ where: { username } });
    if (user) {
      throw new Error(`Username "${username}" is taken`);
    }

    const code = await db.sequelize.transaction(async t => {
      const User = await db.Users.create({
        username,
        email,
      }, { transaction: t });

      const ReferralCode = await db.ReferralCodes.create({
        user_id: User.id,
      }, { transaction: t });

      if (referralCodeInput) {
        const referralCode = await db.ReferralCodes.findOne({
          where: {
            code: referralCodeInput,
          },
        }, { transaction: t });
        if (!referralCode) {
          throw new Error('Referral code doesn\'t exist');
        }

        await db.Referrals.create(
          { referrer_user: referralCode.user_id, referred_user: User.id },
          { transaction: t },
        );
      }
      /*
      addUser(User.mail_id, email, username);
      sendInstructions(User.mail_id, email, username);
      */
      return ReferralCode.code;
    });


    res.send({ success: true, referralCode: code });

  } catch (error) {
    res.status(400).send({ error: 'USERNAME_TAKEN', message: error.message });
  }
});
