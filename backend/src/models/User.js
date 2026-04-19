const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 200,
      default: '',
    },
    // Linked platform handles
    platforms: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
      codechef: { type: String, default: '' },
      hackerrank: { type: String, default: '' },
      atcoder: { type: String, default: '' },
    },
    // Cached stats (refreshed periodically)
    cachedStats: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastFetched: {
      type: Date,
      default: null,
    },
    // Streak tracking
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastSolvedDate: { type: Date, default: null },
    },
    // Goals
    goals: [
      {
        title: String,
        target: Number,
        current: { type: Number, default: 0 },
        platform: String,
        difficulty: String,
        deadline: Date,
        createdAt: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false },
      },
    ],
    // Bookmarked problems
    bookmarks: [
      {
        platform: String,
        problemId: String,
        title: String,
        difficulty: String,
        url: String,
        tags: [String],
        addedAt: { type: Date, default: Date.now },
      },
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: Total Problems Solved (from cachedStats) ────────────────────────
userSchema.virtual('totalSolved').get(function () {
  const stats = this.cachedStats;
  if (!stats) return 0;
  let total = 0;
  if (stats.leetcode?.totalSolved) total += stats.leetcode.totalSolved;
  if (stats.codeforces?.totalSolved) total += stats.codeforces.totalSolved;
  if (stats.codechef?.totalSolved) total += stats.codechef.totalSolved;
  return total;
});

// ─── Pre-save: Hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Method: Compare passwords ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: Safe user data (no password) ─────────────────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
