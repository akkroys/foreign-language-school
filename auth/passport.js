import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import UserModel from '../models/userModel.js';

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    UserModel.findByEmail(email, (error, results) => {
        if (error) {
            return done(error);
        }

        // if (results.length === 0) {
        //     return done(null, false, { message: 'Incorrect email.' });
        // }

        const user = results;
        console.log('user to login', user.email);
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return done(err);
            }
            if (result) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.findUserById(id, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    });
});

export default passport;
