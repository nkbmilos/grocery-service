import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
});

export const NodeModel = mongoose.model('Node', nodeSchema);
