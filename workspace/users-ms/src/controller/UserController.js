import { User } from "../model/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

export class UserController{
    static async findAll(req, res){
        try{
            const users = await User.findAll({attributes:{exclude:['password']}});
            const usersAndPosts = await Promise.all(
                users.map(async(user)=>{
                    try{ 
                        const response = await axios.get(`${process.env.POST_SERVICE_URL}/posts/user/${user.id}`);

                        const posts = response.data.post;

                        return {
                            user,
                            posts
                        }
                    }catch(error){
                        console.log(`Error: ${error.message}`);
                        return {
                            user,
                            posts: []
                        }
                    }
                })
            );
            res.status(200).json({users: usersAndPosts});
        }catch(error){
            res.status(500).json({message: error.message});
        }
    }

    static async save(req, res){
        try{
            const {username, password} = req.body;
            const hashPassword = await bcrypt.hash(password, 10);
            const user = await User.create({username, password:hashPassword});
            const result = user.get({plain: true});
            delete result.password;
            res.status(201).json({user: result});
        }catch(error){
            res.status(500).json({message: error.message});
        }
    }

    static async findUserByName(req, res){
        try{
            const {username} = req.params;
            const user = await User.findOne({where:{username}});
            res.status(200).json({user});
        }catch(error){
            res.status(500).json({message: error.message});
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ where: { username } });
            const JWT_SECRET = process.env.JWT_SECRET;

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const passwordValid = await bcrypt.compare(password, user.password);

            if (!passwordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}