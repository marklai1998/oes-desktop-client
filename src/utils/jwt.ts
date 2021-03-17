// File: ./lib/utils.js
import jsonwebtoken from "jsonwebtoken";
import { PureUser } from "../models/user";
import { dayjs } from "./dayjs";

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
export const issueJWT = (user: PureUser) => {
  const _id = user._id;
  const expiresIn = "2 days";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: expiresIn,
  });

  return {
    token: signedToken,
    expires: dayjs().add(2, "days").toISOString(),
  };
};
