import { Request, Response } from "express";
import { User } from "../models/User";


//VER TODOS LOS USUARIOS
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find(
            {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                }
            }
        )

        res.status(200).json({
            success: true,
            message: "users retrieved successfully",
            data: users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "It is not possible to recover the users",
            error: error
        })
    }
}


//VER PERFIL USUARIO
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        
        const userId = req.tokenData.userId;

        const userProfile = await User.findOneBy(
            {
                id: userId
            }
        )

        if (!userProfile) {
            return res.status(400).json({
                success: false,
                message: "User not found ",

            })
        }

        res.status(200).json({
            success: true,
            message: "User retrieved",
            data: userProfile
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User cant be retrieved",
            error: error
        })
    }
}


//MODIFICAR DATOS PERFIL
export const updateProfile = async (req: Request, res: Response) => {
    try {

        //recuperar data
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const email = req.body.email;

        //validaciones
        if (!firstName) {
            return res.status(404).json({
                success: false,
                message: "First name is needed"
            })
        }

        if (!lastName) {
            return res.status(404).json({
                success: false,
                message: "Last name is needed"
            })
        }

        if (!email) {
            return res.status(404).json({
                success: false,
                message: "Email is needed"
            })
        }

        const userUpdate = await User.update(
            {
                id: req.tokenData.userId
            },
            {
                first_name: firstName,
                last_name: lastName,
                email: email
            }
        )

        res.status(200).json({
            success: true,
            message: "User update",
            date: userUpdate
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User cant be update",
            error: error
        })
    }
}