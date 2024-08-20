import mongoose from "mongoose";
import UserStat from "./UserStat.js";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// create UserStat model
UserSchema.post("save", async function (doc, next) {
  const userStat = new UserStat({
    user: doc._id,
  });
  await userStat.save();
  next();
});

const User = mongoose.model("User", UserSchema);
export default User;
