import { TreeNode } from "./TreeNode";

export interface Tree{
    nodes: {
        [prop: string] : TreeNode
    },
    links: {from: string, to: string}[];
    selectedNode: string; 
}