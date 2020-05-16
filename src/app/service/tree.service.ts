import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject, merge, combineLatest } from "rxjs";
import { map, scan } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { TreeNode } from '../model/TreeNode';
import { Tree } from '../model/Tree';

const SKINS: string[] = ["meteorite", "starship", "robot", "alien", "planet", "moon", "satellite"];

enum TreeNodeActionsTypes {
  ADD_TREE_NODE = 'Add tree node', 
  ADD_TREE_NODES = 'Add tree nodes', 
  DELETE_TREE_NODE = 'Delete tree nodes', 
  SELECT_TREE_NODE = 'Select tree node', 
  DESELECT_TREE_NODES = 'Deselect tree nodes', 
}; 

class AddTreeNodeAction {
  readonly type = TreeNodeActionsTypes.ADD_TREE_NODE
  constructor(public payload: TreeNode) {}
}

class DeleteTreeNodeAction {
  readonly type = TreeNodeActionsTypes.DELETE_TREE_NODE
  constructor(public payload: number) {}
}

class AddTreeNodesAction {
  readonly type = TreeNodeActionsTypes.ADD_TREE_NODES
  constructor(public payload: TreeNode[]) {}
}

class SelectTreeNodeAction {
  readonly type = TreeNodeActionsTypes.SELECT_TREE_NODE
  constructor(public payload: number) {}
}

class DeselectTreeNodesAction {
  readonly type = TreeNodeActionsTypes.DESELECT_TREE_NODES
}

type TreeNodeActions = AddTreeNodeAction | DeleteTreeNodeAction | AddTreeNodesAction | SelectTreeNodeAction | DeselectTreeNodesAction; 


@Injectable({
  providedIn: "root"
})
export class TreeService {
  constructor(private http: HttpClient) {}

  // INTERFACE ///////////////////////////////////////////////////////////////

  addTreeNode$: BehaviorSubject<{id: string, x: number, y: number, skin: string}> = new BehaviorSubject({id: 'toto', x: 3, y: 4, skin: "robot"}); 
  deleteTreeNode$: Subject<number>;
  selectTreeNode$: BehaviorSubject<number> = new BehaviorSubject(null); 

  // ACTIONS
  addTreeNodeAction$ : Observable<AddTreeNodeAction> = this.addTreeNode$.pipe(
    map((nodeDescription)=>{
      return new AddTreeNodeAction({
          id: nodeDescription.id, 
          position: {x: nodeDescription.x, y: nodeDescription.y}, 
          skin: nodeDescription.skin
        }
      )
    })
  );

  treeNodeActions$ = merge(this.addTreeNodeAction$);

  treeNodes$: Observable<{[prop: string]: TreeNode}> = this.treeNodeActions$.pipe(
    scan( (acc : {[prop: string]: TreeNode}, curr: TreeNodeActions)=>{
      let clonedTreeNodes = JSON.parse(JSON.stringify(acc)); 
      switch (curr.type){
        case TreeNodeActionsTypes.ADD_TREE_NODE:           
          clonedTreeNodes[curr.payload.id]={position: curr.payload.position, skin: curr.payload.skin}; 
          return clonedTreeNodes; 
        default: return clonedTreeNodes; 
      }
    }, {})
  ); 

  tree$ : Observable<Tree> = combineLatest(this.treeNodes$).pipe(
    map( (treeNodes)=>{
      return {
        nodes: treeNodes[0], 
        links: [], 
        selectedNode: null
      }
    })
  );  

}
