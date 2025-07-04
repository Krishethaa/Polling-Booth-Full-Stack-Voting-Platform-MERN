// controllers/pollController.js
const Poll = require('../Model/pollModel.js');
const User = require('../Model/userModel.js');
const mongoose = require('mongoose');
const multer = require("multer");

// 1. CREATE POLL
const { v4: uuidv4 } = require('uuid'); // import uuid at the top

exports.createPoll = async (req, res) => {
  try {
    const { question, options, title, desc, expirationTime, createdBy,category } = req.body;

    // 1. Check for missing required fields
    if (!question || !options || !createdBy || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Check if createdBy is a valid user
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(400).json({ message: "Invalid createdBy user ID" });
    }

    // 3. Generate poll ID
    const pollId = uuidv4();

    // 4. Create the poll
    const newPoll = await Poll.create({
      poll_id: pollId,
      question,
      options,
      title,
      desc,
      expirationTime,
      createdBy,
      category
    });

    // 5. Add the poll to the user's created_polls list
    await User.findByIdAndUpdate(createdBy, {
      $push: { created_polls: newPoll._id }
    });

    // 6. Send response
    res.status(201).json({ message: "Poll created", data: newPoll });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// 2. GET ALL POLLS
// 2. GET ALL POLLS without Pagination
exports.getAllPolls = async (req, res) => {
  try {
    const now = new Date();

    // Fetch all polls
    const polls = await Poll.find({})
      .populate('createdBy', 'user_name');

    // Check if polls exist
    if (polls.length === 0) {
      return res.status(404).json({ message: "No polls found" });
    }

    // Update expired polls to status 'closed'
    const updates = polls.map(async (poll) => {
      if (poll.expirationTime && poll.expirationTime <= now && poll.status === "open") {
        poll.status = "closed";
        poll.isActive = false;
        await poll.save();
      }
      return poll;
    });

    // Wait for all updates to complete
    const updatedPolls = await Promise.all(updates);

    res.status(200).json({
      message: "Polls retrieved",
      data: updatedPolls,
    });
  } catch (err) {
    console.error("Error fetching polls:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// 3. GET POLL BY ID
exports.getPollById = async (req, res) => {
    try {
        const { id } = req.params;
        const poll = await Poll.findById(id).populate('createdBy').populate('voters').populate('likers');
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }
        res.status(200).json({ message: "Poll found", data: poll });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 4. UPDATE POLL
exports.updatePoll = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            question,
            options,
            title,
            desc,
            expirationTime,
            isActive,
            status,
            winner,
            category
        } = req.body;

        const updateObj = {};
        if (question) updateObj.question = question;
        if (options) updateObj.options = options;
        if (title) updateObj.title = title;
        if (desc) updateObj.desc = desc;
        if (expirationTime) updateObj.expirationTime = expirationTime;
        if (typeof isActive === 'boolean') updateObj.isActive = isActive;
        if (status) updateObj.status = status;
        if (winner) updateObj.winner = winner;
        if (category) updateObj.category = category;

        const updatedPoll = await Poll.findByIdAndUpdate(id, updateObj, { new: true });

        if (!updatedPoll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        res.status(200).json({ message: "Poll updated", data: updatedPoll });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 5. DELETE POLL
exports.deletePollById = async (req, res) => {
  try {
    const pollId = req.params.id;

    // 1. Find the poll (to get the user who created it)
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const userId = poll.createdBy;

    // 2. Delete the poll
    await Poll.findByIdAndDelete(pollId);

    // 3. Remove poll reference from user's created_polls array
    await User.findByIdAndUpdate(userId, {
      $pull: { created_polls: pollId }
    });

    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting poll', error });
  }
};

// 6. DELETE ALL POLLS — For development/testing only!
exports.deleteAllPolls = async (req, res) => {
  try {
    await Poll.deleteMany({});
    res.status(200).json({ message: "All polls deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// controllers/pollController.js

// 7. GET POLLS CREATED BY A SPECIFIC USER
exports.getPollsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch polls created by this user
    const polls = await Poll.find({ createdBy: userId });

    if (polls.length === 0) {
      return res.status(404).json({ message: 'No polls found for this user' });
    }

    res.status(200).json({
      message: 'Polls created by user retrieved successfully',
      data: polls
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// VOTE POLL:
exports.votePoll = async (req, res) => {
  try {
    const { pollId, optionId, userId } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const alreadyVoted = poll.voters.includes(userId);

    if (alreadyVoted) {
      // Find the option the user voted for by option.voters array
      let votedOptionIndex = null;

      for (let i = 0; i < poll.options.length; i++) {
        if (poll.options[i].voters.includes(userId)) {
          votedOptionIndex = i;
          break;
        }
      }

      if (votedOptionIndex !== null) {
        // Remove vote
        poll.options[votedOptionIndex].count = Math.max(0, poll.options[votedOptionIndex].count - 1);
        poll.options[votedOptionIndex].voters = poll.options[votedOptionIndex].voters.filter(id => id.toString() !== userId);
      }

      poll.voters = poll.voters.filter(id => id.toString() !== userId);
      poll.total_votes = Math.max(0, poll.total_votes - 1);

      await User.findByIdAndUpdate(userId, {
        $pull: { voted_polls: pollId }
      });

      await poll.save();

      return res.status(200).json({ success: true, message: "Vote removed (unvoted)", poll });
    }

    // New vote
    const selectedOption = poll.options.find(opt => opt._id.toString() === optionId);
    if (!selectedOption) return res.status(400).json({ message: 'Option not found in poll' });

    selectedOption.count += 1;
    selectedOption.voters.push(userId);

    poll.voters.push(userId);
    poll.total_votes += 1;

    await poll.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { voted_polls: pollId }
    });

    res.status(200).json({ success: true, message: "Vote added", poll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



//COMMENTED POLLS
// COMMENTED POLLS (without needing separate Comment model)
exports.commentPoll = async (req, res) => {
  try {
    const { pollId, userId, commentText } = req.body;

    // Validate required fields
    if (!pollId || !userId || !commentText) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Fetch the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Fetch user to get username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create embedded comment object
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      userName: user.user_name || 'Anonymous',
      text: commentText,
      createdAt: new Date()
    };

    // Push the new comment into poll.comments array
    poll.comments.push(newComment);
    await poll.save();

    // Add pollId to user's commented_polls array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { commented_polls: pollId }
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Comment added',
      comment: newComment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Like or unlike a poll
exports.likePoll = async (req, res) => {
  try {
    const pollId = req.params.id;      // from URL
    const { userId } = req.body;       // from body

    // ❗ Check if userId is provided
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId in request body'
      });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // ❗ Check if poll is expired
    const now = new Date();
    if (new Date(poll.expirationTime) < now) {
      return res.status(403).json({
        success: false,
        message: 'Poll has expired. You cannot like or unlike it.'
      });
    }

    const userAlreadyLiked = poll.likers.some(id => id?.toString() === userId?.toString());

    if (userAlreadyLiked) {
      // Unlike
      poll.likers = poll.likers.filter(id => id?.toString() !== userId?.toString());
      poll.total_likes = Math.max(0, poll.total_likes - 1);

      await User.findByIdAndUpdate(userId, {
        $pull: { liked_polls: pollId }
      });

      await poll.save();

      return res.status(200).json({ success: true, message: 'Poll unliked', poll });
    } else {
      // Like
      poll.likers.push(userId);
      poll.total_likes += 1;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { liked_polls: pollId }
      });

      await poll.save();

      return res.status(200).json({ success: true, message: 'Poll liked', poll });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET VOTED POLLS BY USER ID
exports.getVotedPollsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('voted_polls');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.voted_polls
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

//get polls by question
// GET /api/polls/by-question?searchText=best programming

exports.searchPollByQuestion = async (req, res) => {
  try {
    const searchText = req.query.searchText;

    if (!searchText || searchText.trim() === '') {
      return res.status(400).json({ message: 'Search text is required' });
    }

    const polls = await Poll.find({
      question: { $regex: searchText, $options: 'i' }  // partial match
    });

    if (polls.length === 0) {
      return res.status(404).json({ message: 'No matching polls found' });
    }

    res.status(200).json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET POLLS BY CATEGORY
exports.getPollsByCategory = async (req, res) => {
    const category = req.params.category;

    try {
        const polls = await Poll.find({ category });
        if (polls.length === 0) {
            return res.status(404).json({ message: "No polls found in this category" });
        }

        res.status(200).json({ message: "Polls retrieved", data: polls });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.replyToComment = async (req, res) => {
  try {
    const { pollId, parentCommentId, userId, replyText } = req.body;

    if (!pollId || !parentCommentId || !userId || !replyText) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create reply object outside so it's accessible after recursion
    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      userName: user.user_name || 'Anonymous',
      text: replyText,
      createdAt: new Date(),
      likers: [],
      replies: []
    };

    // Recursive function to find parent comment and push reply
    const addReply = (comments) => {
      for (let comment of comments) {
        if (comment._id.toString() === parentCommentId) {
          comment.replies.push(newReply);
          return true;
        } else if (comment.replies?.length) {
          if (addReply(comment.replies)) return true;
        }
      }
      return false;
    };

    const success = addReply(poll.comments);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Parent comment not found' });
    }

    await poll.save();

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      reply: newReply
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Like or unlike a comment
exports.likeComment = async (req, res) => {
    try {
        const { pollId, commentId, userId } = req.body;

        if (!pollId || !commentId || !userId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }

        let likeStatus = false; // true = liked, false = unliked
        let updatedLikesCount = 0;

        // Recursive function to like/unlike a comment
        const toggleLike = (comments) => {
            for (let comment of comments) {
                if (comment._id.toString() === commentId) {
                    const index = comment.likers.findIndex(id => id.toString() === userId);
                    if (index === -1) {
                        comment.likers.push(userId); // Like
                        likeStatus = true;
                    } else {
                        comment.likers.splice(index, 1); // Unlike
                        likeStatus = false;
                    }
                    updatedLikesCount = comment.likers.length; // Updated like count
                    return true;
                } else if (comment.replies?.length) {
                    if (toggleLike(comment.replies)) return true; // Search in nested replies
                }
            }
            return false;
        };

        const success = toggleLike(poll.comments);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        await poll.save();

        res.status(200).json({
            success: true,
            message: likeStatus ? 'Comment liked successfully' : 'Comment unliked successfully',
            commentId,
            likedByUser: likeStatus,
            likesCount: updatedLikesCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. GET ADVANCED TRENDING POLLS WITH SCORE
exports.getTrendingPollsAdvanced = async (req, res) => {
    try {
        const now = new Date();

        // Update expired polls before fetching trending
        const polls = await Poll.find({});

        const updates = polls.map(async (poll) => {
            if (poll.expirationTime && poll.expirationTime <= now && poll.status === "open") {
                poll.status = "closed";
                poll.isActive = false;
                await poll.save();
            }
            return poll;
        });

        await Promise.all(updates);

        // Aggregate trending polls based on a trending score
        const trendingPolls = await Poll.aggregate([
            { $match: { status: 'open' } }, // Only active polls
            {
                $addFields: {
                    trendingScore: { $add: [ { $multiply: ["$total_votes", 2] }, "$total_likes" ] }
                }
            },
            { $sort: { trendingScore: -1 } }, // Sort by trending score descending
            { $limit: 10 } // Top 10 trending polls
        ]);

        if (trendingPolls.length === 0) {
            return res.status(404).json({ message: "No trending polls found" });
        }

        res.status(200).json({ message: "Trending polls retrieved successfully", data: trendingPolls });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


