import mongoose, {Document, Model} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'manager' | 'employee';
    node: mongoose.Types.ObjectId;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface IUserModel extends Model<IUserDocument> {
    hashPassword(password: string): Promise<string>;
}

const userSchema = new mongoose.Schema<IUserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['manager', 'employee'], required: true },
    node: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },
});

userSchema.methods.comparePassword = async function(this: IUserDocument, candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.hashPassword = async function(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

const UserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default UserModel;
