import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Crear usuario
export const register = async (req: Request, res: Response) => {
    try {
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const email = req.body.email;
        const passwordHash = req.body.password_hash;

        //validacion contraseña
        if (passwordHash.length < 7 || passwordHash.length > 12) {
            return res.status(400).json({
                success: false,
                message: "The password must be between 7 and 12 caracteres"
            })
        }

        //validacion email
        const validEmail = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        if (!validEmail.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Format email invalid"
            })
        }

        //validar si el email ya está registrado
        const emailUser = await User.findOne({
            where: { email: email }
        })

        if (emailUser) {
            return res.status(400).json({
                success: false,
                message: "You are already registered"
            })
        }

        const passwordEncrypted = bcrypt.hashSync(passwordHash, 8);

        const newUser = await User.create({

            first_name: firstName,
            last_name: lastName,
            email: email,
            password_hash: passwordEncrypted,
            role: {
                id: 1
            }

        }).save()

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User cant be register",
            error: error
        })
    }
}

//Login
export const login = async (req: Request, res: Response) => {
    try {

        const email = req.body.email;
        const passwordHash = req.body.password_hash;

        //validacion
        if (!email || !passwordHash) {
            return res.status(404).json({
                success: false,
                message: "Email and password are needed"
            })
        }

        const user = await User.findOne(
            {
                where: {
                    email: email
                },
                relations: {
                    role: true
                },
                select: {
                    id: true,
                    first_name:true,
                    email: true,
                    password_hash: true,
                    role: {
                        id: true,
                        name: true
                    }
                }
            }
        )

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email or password invalid"
            })
        }

        const isValidPassword = bcrypt.compareSync(passwordHash, user.password_hash)

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: "Email or password invalid",
            })
        }

        //crear token
        const token = jwt.sign(
            {
                userId: user.id,
                roleName: user.role.name,
                firstName: user.first_name
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "2h"
            }
        )

        res.status(201).json({
            success: true,
            message: "User logged",
            token: token

        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User cant be logged",
            error: error
        })
    }
}