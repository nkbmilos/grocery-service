import { NodeModel } from '../models/node.model';

export async function getDescendantNodeIds(nodeId: string): Promise<string[]> {
    const descendants: string[] = [];

    async function recurse(currentId: string) {
        const children = await NodeModel.find({ parent: currentId }).select('_id').lean();
        for (const child of children) {
            descendants.push(child._id.toString());
            await recurse(child._id.toString());
        }
    }

    await recurse(nodeId);
    return descendants;
}
