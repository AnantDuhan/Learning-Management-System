import { Response } from "express";
import { redis } from "../config/redis";

// get user by id
export const getUserById = async (id: string, res: Response) => {
    const userJSON = await redis.get(id);

    if (userJSON) {
        const user = JSON.parse(userJSON);
        res.status(200).json({
            success: true,
            user
        });
    };
}
