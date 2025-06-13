import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import UserModel from '../models/user.model';
import { NodeModel } from '../models/node.model';

const initDb = async () => {
    await mongoose.connect('mongodb://localhost:27017/grocery-service-db');

    await NodeModel.deleteMany({});
    await UserModel.deleteMany({});

    const serbia = new NodeModel({ name: 'Serbia' });
    await serbia.save();

    const vojvodina = new NodeModel({ name: 'Vojvodina', parent: serbia._id });
    const gradBeograd = new NodeModel({ name: 'Grad Beograd', parent: serbia._id });
    await NodeModel.insertMany([vojvodina, gradBeograd]);

    const severnobacki = new NodeModel({ name: 'Severnobački okrug', parent: vojvodina._id });
    const juznobacki = new NodeModel({ name: 'Južnobački okrug', parent: vojvodina._id });
    await NodeModel.insertMany([severnobacki, juznobacki]);

    const subotica = new NodeModel({ name: 'Subotica', parent: severnobacki._id });
    await subotica.save();
    const radnja1 = new NodeModel({ name: 'Radnja 1', parent: subotica._id });
    await radnja1.save();

    const noviSad = new NodeModel({ name: 'Novi Sad', parent: juznobacki._id });
    await noviSad.save();
    const detelinara = new NodeModel({ name: 'Detelinara', parent: noviSad._id });
    const liman = new NodeModel({ name: 'Liman', parent: noviSad._id });
    await NodeModel.insertMany([detelinara, liman]);

    const radnja2 = new NodeModel({ name: 'Radnja 2', parent: detelinara._id });
    const radnja3 = new NodeModel({ name: 'Radnja 3', parent: detelinara._id });
    await NodeModel.insertMany([radnja2, radnja3]);

    const radnja4 = new NodeModel({ name: 'Radnja 4', parent: liman._id });
    const radnja5 = new NodeModel({ name: 'Radnja 5', parent: liman._id });
    await NodeModel.insertMany([radnja4, radnja5]);

    const noviBeograd = new NodeModel({ name: 'Novi Beograd', parent: gradBeograd._id });
    const vracar = new NodeModel({ name: 'Vračar', parent: gradBeograd._id });
    await NodeModel.insertMany([noviBeograd, vracar]);

    const bezanija = new NodeModel({ name: 'Bežanija', parent: noviBeograd._id });
    await bezanija.save();
    const radnja6 = new NodeModel({ name: 'Radnja 6', parent: bezanija._id });
    await radnja6.save();

    const neimar = new NodeModel({ name: 'Neimar', parent: vracar._id });
    const crveniKrst = new NodeModel({ name: 'Crveni Krst', parent: vracar._id });
    await NodeModel.insertMany([neimar, crveniKrst]);

    const radnja7 = new NodeModel({ name: 'Radnja 7', parent: neimar._id });
    await radnja7.save();
    const radnja8 = new NodeModel({ name: 'Radnja 8', parent: crveniKrst._id });
    const radnja9 = new NodeModel({ name: 'Radnja 9', parent: crveniKrst._id });
    await NodeModel.insertMany([radnja8, radnja9]);

    const hashedPassword = await bcrypt.hash('admin', 10);

    await UserModel.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'manager',
        node: serbia._id,
    });

    console.log('Database initialized successfully with full hierarchy.');
    process.exit();
};

initDb().catch((err) => {
    console.error('Error initializing DB:', err);
    process.exit(1);
});
