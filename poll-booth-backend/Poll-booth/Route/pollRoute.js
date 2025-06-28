const express = require('express');
const router = express.Router();
const {
    createPoll,
    getAllPolls,
    getPollById,
    updatePoll,
    deletePollById,
    deleteAllPolls,
    getPollsByUserId,
    likePoll,
    votePoll,
    getVotedPollsByUserId,
    commentPoll,
    searchPollByQuestion,
    getPollsByCategory,
    replyToComment,
    likeComment,
    getTrendingPollsAdvanced
} = require('../Controller/pollController.js');

const {protect} = require('../Controller/userController.js')

// 1. CREATE POLL
router.post('/create',protect, createPoll);
// 2. GET ALL POLLS
router.get('/getall',protect, getAllPolls);
// 3. GET POLL BY ID
router.get('/getById/:id',protect, getPollById);
// 4. UPDATE POLL
router.put('/update/:id',protect, updatePoll);
// 5. DELETE POLL
router.delete('/deletePollById/:id',protect, deletePollById);
// 6. DELETE ALL POLLS
router.delete('/deleteall',protect, deleteAllPolls);
//7. GET POLLS CREATED BY A SPECIFIC USER
router.get('/getPollsByUserId/:userId',protect, getPollsByUserId);
// 8. LIKE POLL
router.put('/like/:id',protect, likePoll);
//Vote Poll
router.put('/vote',protect, votePoll);
//Get polls by user ID
router.get('/getVotedPollsByUserId/:userId',protect, getVotedPollsByUserId);


//Comment Poll
router.post('/comment',protect, commentPoll);
//Reply to Comment
router.post('/reply',protect, replyToComment);
//Like Comment
router.post('/like-comment',protect, likeComment);


//Search Poll by Question
router.get('/by-question',protect, searchPollByQuestion);
//Get Polls by Category
router.get('/category/:category',protect, getPollsByCategory);
//Get Trending Polls Advanced
router.get('/trending',protect, getTrendingPollsAdvanced);

module.exports = router;