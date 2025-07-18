import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { reviewController } from './ratings.controller';



const reviewRouter = express.Router();

reviewRouter
  .post(
    '/create-review-rating',
    auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
    // validateRequest(videoValidation.VideoSchema),
    reviewController.createReview,
  )
  .get('/', reviewController.getReviewByCustomer)
  .get('/:id', reviewController.getSingleReview)
  .patch('/:id', auth(USER_ROLE.TASKER), reviewController.updateSingleReview)
  .delete('/:id', auth(USER_ROLE.TASKER), reviewController.deleteSingleReview);

export default reviewRouter;
