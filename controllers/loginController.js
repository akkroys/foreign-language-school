import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';

const registerView = (req, res) => {
    res.render("signUp", {
    });
}

const loginView = (req, res) => {

    res.render("login", {
    });
}

const registerUser = (req, res) => {
    const { lastName, firstName, middleName, email, password } = req.body;
    // if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    //     return res.status(400).json({ error: 'Неверный формат электронной почты' });
    // }
    console.log('req', req.body);
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }
    User.findByEmail(email, (error, results) => {
        if (error) {
            console.error('Error checking existing user:', error);
            return res.status(500).json({ error: 'Произошла ошибка на сервере' });
        }

        if (results !== null) {
            return res.status(400).json({ error: 'Пользователь с таким адресом электронной почты уже существует' });
        }

        bcrypt.hash(password, 10, (hashError, hashedPassword) => {
            if (hashError) {
                return res.status(500).json({ error: 'Произошла ошибка при шифровании пароля' });
            }

            const newUser = new User({ lastName, firstName, middleName, email, password: hashedPassword });
            newUser.createUser((saveError, savedUser) => {
                if (saveError) {
                    console.error('Error creating user:', saveError);
                    return res.status(500).json({ error: 'Произошла ошибка при создании пользователя' });
                }

                console.log('User created successfully');
                // res.status(201).send('User created successfully');
                res.redirect('/login');
            });
        });
    });
};


const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Error authenticating user:', err);
            return res.status(500).json({ error: 'Ошибка аутентификации на сервере' });
        }

        if (!user) {
            console.warn('Invalid credentials');
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) {
                console.error('Error logging in user:', loginErr);
                return res.status(500).json({ error: 'Ошибка при входе в систему' });
            }
            console.log('User logged in successfully');

            return res.redirect('/dashboard');
        });
    })(req, res, next);
};

export { registerView, loginView, registerUser, loginUser };